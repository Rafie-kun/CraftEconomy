package com.rafiekun.crafteco.account;

import com.rafiekun.crafteco.CraftEconomy;

import java.sql.*;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Level;

public class AccountManager {

    private final CraftEconomy plugin;
    private final ConcurrentHashMap<UUID, Account> accountCache = new ConcurrentHashMap<>();

    public AccountManager(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    public Account getAccount(UUID uuid) {
        if (accountCache.containsKey(uuid)) {
            return accountCache.get(uuid);
        }
        return loadAccount(uuid);
    }

    public Account getAccount(String playerName) {
        UUID uuid = plugin.getServer().getOfflinePlayer(playerName).getUniqueId();
        return getAccount(uuid);
    }

    public Account getOrCreateAccount(UUID uuid, String name) {
        Account account = getAccount(uuid);
        if (account == null) {
            account = createAccount(uuid, name);
        }
        return account;
    }

    private Account createAccount(UUID uuid, String name) {
        double starting = plugin.getConfigManager().getStartingBalance();
        Account account = new Account(uuid, name, starting);
        accountCache.put(uuid, account);

        String prefix = plugin.getDatabaseManager().prefix("accounts");
        String sql = String.format("""
            INSERT INTO %s (uuid, name, balance, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        """, prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, uuid.toString());
            stmt.setString(2, name);
            stmt.setDouble(3, starting);
            stmt.setLong(4, System.currentTimeMillis());
            stmt.setLong(5, System.currentTimeMillis());
            stmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to create account for " + name, e);
        }

        // Check for first earnings advancement
        if (starting > 0) {
            org.bukkit.entity.Player player = plugin.getServer().getPlayer(uuid);
            if (player != null) {
                plugin.getMessagesConfig().sendMessage(player, "advancement-first-earnings");
            }
        }

        return account;
    }

    private Account loadAccount(UUID uuid) {
        String prefix = plugin.getDatabaseManager().prefix("accounts");
        String sql = String.format("SELECT * FROM %s WHERE uuid = ?", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, uuid.toString());
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                Account account = new Account(
                        uuid,
                        rs.getString("name"),
                        rs.getDouble("balance"),
                        rs.getDouble("savings"),
                        rs.getDouble("fixed_deposit"),
                        rs.getInt("fixed_deposit_term"),
                        rs.getLong("fixed_deposit_start"),
                        rs.getDouble("loan_amount"),
                        rs.getDouble("loan_interest"),
                        rs.getLong("loan_start"),
                        rs.getLong("created_at"),
                        rs.getLong("updated_at")
                );
                accountCache.put(uuid, account);
                return account;
            }
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to load account for " + uuid, e);
        }
        return null;
    }

    public void saveAccount(Account account) {
        accountCache.put(account.getUuid(), account);
        String prefix = plugin.getDatabaseManager().prefix("accounts");
        String sql = String.format("""
            UPDATE %s SET name = ?, balance = ?, savings = ?, fixed_deposit = ?,
            fixed_deposit_term = ?, fixed_deposit_start = ?, loan_amount = ?,
            loan_interest = ?, loan_start = ?, updated_at = ?
            WHERE uuid = ?
        """, prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, account.getName());
            stmt.setDouble(2, account.getBalance());
            stmt.setDouble(3, account.getSavings());
            stmt.setDouble(4, account.getFixedDeposit());
            stmt.setInt(5, account.getFixedDepositTerm());
            stmt.setLong(6, account.getFixedDepositStart());
            stmt.setDouble(7, account.getLoanAmount());
            stmt.setDouble(8, account.getLoanInterest());
            stmt.setLong(9, account.getLoanStart());
            stmt.setLong(10, System.currentTimeMillis());
            stmt.setString(11, account.getUuid().toString());
            stmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to save account for " + account.getName(), e);
        }
    }

    public void saveAll() {
        for (Account account : accountCache.values()) {
            saveAccount(account);
        }
    }

    public void removeFromCache(UUID uuid) {
        accountCache.remove(uuid);
    }

    public int getOnlineAccountCount() {
        return accountCache.size();
    }
}
