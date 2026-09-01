package com.rafiekun.crafteco.economy;

import com.rafiekun.crafteco.CraftEconomy;

import java.io.*;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.logging.Level;

public class TransactionLogger {

    private final CraftEconomy plugin;
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    public TransactionLogger(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    public void log(UUID uuid, TransactionType type, double amount, double balanceAfter,
                    String description, UUID targetUuid) {
        String prefix = plugin.getDatabaseManager().prefix("transactions");
        String sql = String.format("""
            INSERT INTO %s (uuid, type, amount, balance_after, description, target_uuid, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, uuid.toString());
            stmt.setString(2, type.name());
            stmt.setDouble(3, amount);
            stmt.setDouble(4, balanceAfter);
            stmt.setString(5, description);
            stmt.setString(6, targetUuid != null ? targetUuid.toString() : null);
            stmt.setLong(7, System.currentTimeMillis());
            stmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to log transaction", e);
        }

        // Log to file if enabled
        if (plugin.getConfigManager().isLogToFile()) {
            logToFile(uuid, type, amount, balanceAfter, description);
        }
    }

    public List<Transaction> getTransactions(UUID uuid, int limit) {
        List<Transaction> transactions = new ArrayList<>();
        String prefix = plugin.getDatabaseManager().prefix("transactions");
        String sql = String.format("SELECT * FROM %s WHERE uuid = ? ORDER BY timestamp DESC LIMIT ?", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, uuid.toString());
            stmt.setInt(2, limit);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                transactions.add(new Transaction(
                        rs.getInt("id"),
                        UUID.fromString(rs.getString("uuid")),
                        TransactionType.valueOf(rs.getString("type")),
                        rs.getDouble("amount"),
                        rs.getDouble("balance_after"),
                        rs.getString("description"),
                        rs.getString("target_uuid") != null ? UUID.fromString(rs.getString("target_uuid")) : null,
                        rs.getLong("timestamp")
                ));
            }
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to fetch transactions", e);
        }

        return transactions;
    }

    public List<Transaction> getTransactions(UUID uuid, int page, int perPage) {
        int offset = (page - 1) * perPage;
        List<Transaction> transactions = new ArrayList<>();
        String prefix = plugin.getDatabaseManager().prefix("transactions");
        String sql = String.format("SELECT * FROM %s WHERE uuid = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, uuid.toString());
            stmt.setInt(2, perPage);
            stmt.setInt(3, offset);
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                transactions.add(new Transaction(
                        rs.getInt("id"),
                        UUID.fromString(rs.getString("uuid")),
                        TransactionType.valueOf(rs.getString("type")),
                        rs.getDouble("amount"),
                        rs.getDouble("balance_after"),
                        rs.getString("description"),
                        rs.getString("target_uuid") != null ? UUID.fromString(rs.getString("target_uuid")) : null,
                        rs.getLong("timestamp")
                ));
            }
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to fetch transactions", e);
        }

        return transactions;
    }

    public int getTransactionCount(UUID uuid) {
        String prefix = plugin.getDatabaseManager().prefix("transactions");
        String sql = String.format("SELECT COUNT(*) FROM %s WHERE uuid = ?", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, uuid.toString());
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to count transactions", e);
        }
        return 0;
    }

    private void logToFile(UUID uuid, TransactionType type, double amount,
                           double balanceAfter, String description) {
        File logFile = new File(plugin.getConfigManager().getLogFile());
        logFile.getParentFile().mkdirs();

        try (FileWriter fw = new FileWriter(logFile, true);
             BufferedWriter bw = new BufferedWriter(fw)) {
            String date = dateFormat.format(new Date());
            String playerName = plugin.getServer().getOfflinePlayer(uuid).getName();
            bw.write(String.format("[%s] %s | %s | Amount: %.2f | Balance: %.2f | %s",
                    date, playerName, type.getDisplayName(), amount, balanceAfter, description));
            bw.newLine();
        } catch (IOException e) {
            plugin.getLogger().log(Level.WARNING, "Failed to write to transaction log file", e);
        }
    }

    // Transaction data class
    public static class Transaction {
        private final int id;
        private final UUID uuid;
        private final TransactionType type;
        private final double amount;
        private final double balanceAfter;
        private final String description;
        private final UUID targetUuid;
        private final long timestamp;

        public Transaction(int id, UUID uuid, TransactionType type, double amount,
                           double balanceAfter, String description, UUID targetUuid, long timestamp) {
            this.id = id;
            this.uuid = uuid;
            this.type = type;
            this.amount = amount;
            this.balanceAfter = balanceAfter;
            this.description = description;
            this.targetUuid = targetUuid;
            this.timestamp = timestamp;
        }

        public int getId() { return id; }
        public UUID getUuid() { return uuid; }
        public TransactionType getType() { return type; }
        public double getAmount() { return amount; }
        public double getBalanceAfter() { return balanceAfter; }
        public String getDescription() { return description; }
        public UUID getTargetUuid() { return targetUuid; }
        public long getTimestamp() { return timestamp; }

        public String getFormattedDate() {
            return dateFormat.format(new Date(timestamp));
        }
    }
}
