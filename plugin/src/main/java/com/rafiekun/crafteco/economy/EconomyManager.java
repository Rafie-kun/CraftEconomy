package com.rafiekun.crafteco.economy;

import com.rafiekun.crafteco.CraftEconomy;
import com.rafiekun.crafteco.account.Account;

import java.util.UUID;

public class EconomyManager {

    private final CraftEconomy plugin;

    public EconomyManager(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    public boolean has(UUID uuid, double amount) {
        Account account = plugin.getAccountManager().getAccount(uuid);
        return account != null && account.getBalance() >= amount;
    }

    public boolean has(String playerName, double amount) {
        UUID uuid = plugin.getServer().getOfflinePlayer(playerName).getUniqueId();
        return has(uuid, amount);
    }

    public double getBalance(UUID uuid) {
        Account account = plugin.getAccountManager().getAccount(uuid);
        return account != null ? account.getBalance() : 0;
    }

    public double getBalance(String playerName) {
        UUID uuid = plugin.getServer().getOfflinePlayer(playerName).getUniqueId();
        return getBalance(uuid);
    }

    public double getTotalWealth(UUID uuid) {
        Account account = plugin.getAccountManager().getAccount(uuid);
        return account != null ? account.getTotalWealth() : 0;
    }

    public DepositResult deposit(UUID uuid, double amount, String description) {
        if (amount <= 0) return DepositResult.INVALID_AMOUNT;

        Account account = plugin.getAccountManager().getAccount(uuid);
        if (account == null) return DepositResult.ACCOUNT_NOT_FOUND;

        double maxBalance = plugin.getConfigManager().getMaxBalance();
        if (account.getBalance() + amount > maxBalance) return DepositResult.MAX_BALANCE;

        account.setBalance(account.getBalance() + amount);
        plugin.getAccountManager().saveAccount(account);

        if (plugin.getConfigManager().isTransactionsEnabled()) {
            plugin.getTransactionLogger().log(uuid, TransactionType.DEPOSIT, amount,
                    account.getBalance(), description, null);
        }

        return DepositResult.SUCCESS;
    }

    public WithdrawResult withdraw(UUID uuid, double amount, String description) {
        if (amount <= 0) return WithdrawResult.INVALID_AMOUNT;

        Account account = plugin.getAccountManager().getAccount(uuid);
        if (account == null) return WithdrawResult.ACCOUNT_NOT_FOUND;

        if (account.getBalance() < amount) return WithdrawResult.INSUFFICIENT_FUNDS;

        account.setBalance(account.getBalance() - amount);
        plugin.getAccountManager().saveAccount(account);

        if (plugin.getConfigManager().isTransactionsEnabled()) {
            plugin.getTransactionLogger().log(uuid, TransactionType.WITHDRAW, amount,
                    account.getBalance(), description, null);
        }

        return WithdrawResult.SUCCESS;
    }

    public boolean transfer(UUID from, UUID to, double amount, String description) {
        if (amount <= 0) return false;
        if (from.equals(to)) return false;

        Account sender = plugin.getAccountManager().getAccount(from);
        Account receiver = plugin.getAccountManager().getAccount(to);

        if (sender == null || receiver == null) return false;
        if (sender.getBalance() < amount) return false;

        double maxBalance = plugin.getConfigManager().getMaxBalance();
        if (receiver.getBalance() + amount > maxBalance) return false;

        sender.setBalance(sender.getBalance() - amount);
        receiver.setBalance(receiver.getBalance() + amount);

        plugin.getAccountManager().saveAccount(sender);
        plugin.getAccountManager().saveAccount(receiver);

        if (plugin.getConfigManager().isTransactionsEnabled()) {
            plugin.getTransactionLogger().log(from, TransactionType.TRANSFER_OUT, amount,
                    sender.getBalance(), description + " -> " + receiver.getName(), to);
            plugin.getTransactionLogger().log(to, TransactionType.TRANSFER_IN, amount,
                    receiver.getBalance(), description + " <- " + sender.getName(), from);
        }

        return true;
    }

    public boolean setBalance(UUID uuid, double amount) {
        if (amount < 0) return false;

        Account account = plugin.getAccountManager().getAccount(uuid);
        if (account == null) return false;

        account.setBalance(amount);
        plugin.getAccountManager().saveAccount(account);

        if (plugin.getConfigManager().isTransactionsEnabled()) {
            plugin.getTransactionLogger().log(uuid, TransactionType.ADMIN_SET, amount,
                    account.getBalance(), "Admin set balance", null);
        }

        return true;
    }

    // Deposit result enum
    public enum DepositResult {
        SUCCESS, INVALID_AMOUNT, ACCOUNT_NOT_FOUND, MAX_BALANCE
    }

    // Withdraw result enum
    public enum WithdrawResult {
        SUCCESS, INVALID_AMOUNT, ACCOUNT_NOT_FOUND, INSUFFICIENT_FUNDS
    }
}
