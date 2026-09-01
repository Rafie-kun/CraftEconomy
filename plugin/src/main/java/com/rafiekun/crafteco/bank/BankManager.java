package com.rafiekun.crafteco.bank;

import com.rafiekun.crafteco.CraftEconomy;
import com.rafiekun.crafteco.account.Account;
import com.rafiekun.crafteco.economy.TransactionType;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.logging.Level;

public class BankManager {

    private final CraftEconomy plugin;

    public BankManager(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    // Deposit into savings
    public boolean deposit(UUID uuid, double amount) {
        if (amount <= 0) return false;

        Account account = plugin.getAccountManager().getAccount(uuid);
        if (account == null) return false;
        if (account.getBalance() < amount) return false;

        account.setBalance(account.getBalance() - amount);
        account.setSavings(account.getSavings() + amount);
        plugin.getAccountManager().saveAccount(account);

        plugin.getTransactionLogger().log(uuid, TransactionType.BANK_DEPOSIT, amount,
                account.getBalance(), "Savings deposit", null);
        return true;
    }

    // Withdraw from savings
    public boolean withdraw(UUID uuid, double amount) {
        if (amount <= 0) return false;

        Account account = plugin.getAccountManager().getAccount(uuid);
        if (account == null) return false;
        if (account.getSavings() < amount) return false;

        double maxBalance = plugin.getConfigManager().getMaxBalance();
        if (account.getBalance() + amount > maxBalance) return false;

        account.setSavings(account.getSavings() - amount);
        account.setBalance(account.getBalance() + amount);
        plugin.getAccountManager().saveAccount(account);

        plugin.getTransactionLogger().log(uuid, TransactionType.BANK_WITHDRAW, amount,
                account.getBalance(), "Savings withdrawal", null);
        return true;
    }

    // Apply interest to all savings
    public void applyInterest() {
        double rate = plugin.getConfigManager().getSavingsInterestRate();
        if (rate <= 0) return;

        String prefix = plugin.getDatabaseManager().prefix("accounts");
        String sql = String.format("SELECT * FROM %s WHERE savings > 0", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                UUID uuid = UUID.fromString(rs.getString("uuid"));
                double savings = rs.getDouble("savings");
                double interest = savings * rate;

                if (interest > 0.01) {
                    Account account = plugin.getAccountManager().getAccount(uuid);
                    if (account != null) {
                        account.setSavings(account.getSavings() + interest);
                        plugin.getAccountManager().saveAccount(account);

                        plugin.getTransactionLogger().log(uuid, TransactionType.BANK_INTEREST, interest,
                                account.getSavings(), "Savings interest (" + (rate * 100) + "%)", null);

                        // Notify online player
                        org.bukkit.entity.Player player = plugin.getServer().getPlayer(uuid);
                        if (player != null) {
                            plugin.getMessagesConfig().sendMessage(player, "bank-interest",
                                    "{amount}", String.format("%.2f", interest),
                                    "{currency}", plugin.getConfigManager().getCurrencyNamePlural(),
                                    "{account}", "Savings");
                        }
                    }
                }
            }
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to apply interest", e);
        }
    }

    // Create fixed deposit
    public boolean createFixedDeposit(UUID uuid, double amount, int termHours) {
        if (amount <= 0) return false;

        Account account = plugin.getAccountManager().getAccount(uuid);
        if (account == null) return false;
        if (account.getBalance() < amount) return false;
        if (account.getFixedDeposit() > 0) return false; // Already has one

        Double rate = plugin.getConfigManager().getFixedDepositRates().get(termHours);
        if (rate == null) return false;

        account.setBalance(account.getBalance() - amount);
        account.setFixedDeposit(amount);
        account.setFixedDepositTerm(termHours);
        account.setFixedDepositStart(System.currentTimeMillis());
        plugin.getAccountManager().saveAccount(account);

        return true;
    }

    // Withdraw fixed deposit (only after term ends)
    public boolean withdrawFixedDeposit(UUID uuid) {
        Account account = plugin.getAccountManager().getAccount(uuid);
        if (account == null) return false;
        if (account.getFixedDeposit() <= 0) return false;

        long elapsed = System.currentTimeMillis() - account.getFixedDepositStart();
        long termMillis = account.getFixedDepositTerm() * 60L * 60 * 1000;

        if (elapsed < termMillis) return false; // Term not yet complete

        double rate = plugin.getConfigManager().getFixedDepositRates()
                .getOrDefault(account.getFixedDepositTerm(), 0.0);
        double interest = account.getFixedDeposit() * rate * account.getFixedDepositTerm();
        double total = account.getFixedDeposit() + interest;

        double maxBalance = plugin.getConfigManager().getMaxBalance();
        if (account.getBalance() + total > maxBalance) return false;

        account.setBalance(account.getBalance() + total);
        account.setFixedDeposit(0);
        account.setFixedDepositTerm(0);
        account.setFixedDepositStart(0);
        plugin.getAccountManager().saveAccount(account);

        plugin.getTransactionLogger().log(uuid, TransactionType.BANK_WITHDRAW, total,
                account.getBalance(), "Fixed deposit matured (+interest)", null);
        return true;
    }

    // Take a loan
    public LoanResult takeLoan(UUID uuid, double amount) {
        if (amount <= 0) return LoanResult.INVALID_AMOUNT;
        if (!plugin.getConfigManager().isLoanEnabled()) return LoanResult.DISABLED;

        Account account = plugin.getAccountManager().getAccount(uuid);
        if (account == null) return LoanResult.ACCOUNT_NOT_FOUND;
        if (account.getLoanAmount() > 0) return LoanResult.ALREADY_HAS_LOAN;
        if (amount > plugin.getConfigManager().getMaxLoanAmount()) return LoanResult.AMOUNT_TOO_HIGH;

        double maxBalance = plugin.getConfigManager().getMaxBalance();
        if (account.getBalance() + amount > maxBalance) return LoanResult.MAX_BALANCE;

        // Check collateral if required
        if (plugin.getConfigManager().isCollateralRequired()) {
            double required = amount * (plugin.getConfigManager().getCollateralPercentage() / 100.0);
            if (account.getBalance() < required) return LoanResult.INSUFFICIENT_COLLATERAL;
        }

        account.setBalance(account.getBalance() + amount);
        account.setLoanAmount(amount);
        account.setLoanInterest(plugin.getConfigManager().getLoanInterestRate());
        account.setLoanStart(System.currentTimeMillis());
        plugin.getAccountManager().saveAccount(account);

        plugin.getTransactionLogger().log(uuid, TransactionType.LOAN_TAKEN, amount,
                account.getBalance(), "Loan taken", null);
        return LoanResult.SUCCESS;
    }

    // Repay loan
    public LoanResult repayLoan(UUID uuid, double amount) {
        if (amount <= 0) return LoanResult.INVALID_AMOUNT;

        Account account = plugin.getAccountManager().getAccount(uuid);
        if (account == null) return LoanResult.ACCOUNT_NOT_FOUND;
        if (account.getLoanAmount() <= 0) return LoanResult.NO_LOAN;

        double totalDebt = account.getTotalDebt();
        double repayAmount = Math.min(amount, totalDebt);
        if (account.getBalance() < repayAmount) return LoanResult.INSUFFICIENT_FUNDS;

        account.setBalance(account.getBalance() - repayAmount);
        account.setLoanAmount(account.getLoanAmount() - repayAmount);

        if (account.getLoanAmount() <= 0) {
            account.setLoanAmount(0);
            account.setLoanInterest(0);
            account.setLoanStart(0);
        }

        plugin.getAccountManager().saveAccount(account);

        plugin.getTransactionLogger().log(uuid, TransactionType.LOAN_REPAID, repayAmount,
                account.getBalance(), "Loan repayment", null);
        return LoanResult.SUCCESS;
    }

    // Get all bank accounts for a player
    public List<BankAccount> getPlayerBankAccounts(UUID uuid) {
        List<BankAccount> accounts = new ArrayList<>();
        String prefix = plugin.getDatabaseManager().prefix("bank_accounts");
        String sql = String.format("SELECT * FROM %s WHERE uuid = ?", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, uuid.toString());
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                accounts.add(new BankAccount(
                        rs.getInt("id"),
                        uuid,
                        rs.getString("name"),
                        rs.getDouble("balance"),
                        rs.getString("type"),
                        rs.getDouble("interest_rate"),
                        rs.getLong("created_at"),
                        rs.getLong("updated_at")
                ));
            }
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to fetch bank accounts", e);
        }

        return accounts;
    }

    // Enums
    public enum LoanResult {
        SUCCESS, INVALID_AMOUNT, DISABLED, ACCOUNT_NOT_FOUND,
        ALREADY_HAS_LOAN, AMOUNT_TOO_HIGH, MAX_BALANCE,
        INSUFFICIENT_COLLATERAL, INSUFFICIENT_FUNDS, NO_LOAN
    }

    // Bank Account data class
    public static class BankAccount {
        private final int id;
        private final UUID uuid;
        private final String name;
        private double balance;
        private final String type;
        private final double interestRate;
        private final long createdAt;
        private long updatedAt;

        public BankAccount(int id, UUID uuid, String name, double balance, String type,
                           double interestRate, long createdAt, long updatedAt) {
            this.id = id;
            this.uuid = uuid;
            this.name = name;
            this.balance = balance;
            this.type = type;
            this.interestRate = interestRate;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public int getId() { return id; }
        public UUID getUuid() { return uuid; }
        public String getName() { return name; }
        public double getBalance() { return balance; }
        public void setBalance(double balance) { this.balance = balance; }
        public String getType() { return type; }
        public double getInterestRate() { return interestRate; }
        public long getCreatedAt() { return createdAt; }
        public long getUpdatedAt() { return updatedAt; }
    }
}
