package com.rafiekun.crafteco.commands;

import com.rafiekun.crafteco.CraftEconomy;
import com.rafiekun.crafteco.bank.BankManager;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class BankCommand implements CommandExecutor {

    private final CraftEconomy plugin;

    public BankCommand(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command.");
            return true;
        }

        if (!plugin.getConfigManager().isBankEnabled()) {
            player.sendMessage("§cBanking is not enabled on this server.");
            return true;
        }

        if (args.length == 0) {
            showBankHelp(player);
            return true;
        }

        String currency = plugin.getConfigManager().getCurrencyNamePlural();

        switch (args[0].toLowerCase()) {
            case "deposit", "dep" -> handleDeposit(player, args, currency);
            case "withdraw", "wd" -> handleWithdraw(player, args, currency);
            case "balance", "bal" -> showBankBalance(player, currency);
            case "accounts" -> showAccounts(player, currency);
            case "loan" -> handleLoan(player, args, currency);
            case "repay" -> handleRepay(player, args, currency);
            default -> showBankHelp(player);
        }

        return true;
    }

    private void showBankHelp(Player player) {
        player.sendMessage("§6--- CraftEconomy Bank ---");
        player.sendMessage("§e/bank deposit <amount> §7- Deposit to savings");
        player.sendMessage("§e/bank withdraw <amount> §7- Withdraw from savings");
        player.sendMessage("§e/bank balance §7- Check bank balance");
        player.sendMessage("§e/bank accounts §7- List all accounts");
        if (plugin.getConfigManager().isLoanEnabled()) {
            player.sendMessage("§e/bank loan <amount> §7- Take a loan");
            player.sendMessage("§e/bank repay <amount> §7- Repay loan");
        }
    }

    private void handleDeposit(Player player, String[] args, String currency) {
        if (args.length < 2) {
            player.sendMessage("§cUsage: /bank deposit <amount>");
            return;
        }

        double amount;
        try {
            amount = Double.parseDouble(args[1]);
        } catch (NumberFormatException e) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        if (amount <= 0) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        // Cooldown check
        int cooldown = plugin.getConfigManager().getCooldown("bank-deposit");
        if (cooldown > 0) {
            // Simple cooldown implementation
        }

        boolean success = plugin.getBankManager().deposit(player.getUniqueId(), amount);
        if (success) {
            plugin.getMessagesConfig().sendMessage(player, "bank-deposit",
                    "{amount}", String.format("%.2f", amount),
                    "{currency}", currency,
                    "{account}", "Savings");
        } else {
            plugin.getMessagesConfig().sendMessage(player, "insufficient-funds",
                    "{amount}", String.format("%.2f", amount),
                    "{currency}", currency,
                    "{balance}", String.format("%.2f",
                            plugin.getEconomyManager().getBalance(player.getUniqueId())));
        }
    }

    private void handleWithdraw(Player player, String[] args, String currency) {
        if (args.length < 2) {
            player.sendMessage("§cUsage: /bank withdraw <amount>");
            return;
        }

        double amount;
        try {
            amount = Double.parseDouble(args[1]);
        } catch (NumberFormatException e) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        if (amount <= 0) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        boolean success = plugin.getBankManager().withdraw(player.getUniqueId(), amount);
        if (success) {
            plugin.getMessagesConfig().sendMessage(player, "bank-withdraw",
                    "{amount}", String.format("%.2f", amount),
                    "{currency}", currency,
                    "{account}", "Savings");
        } else {
            player.sendMessage("§cInsufficient savings balance.");
        }
    }

    private void showBankBalance(Player player, String currency) {
        var account = plugin.getAccountManager().getOrCreateAccount(
                player.getUniqueId(), player.getName());

        plugin.getMessagesConfig().sendMessage(player, "bank-balance",
                "{amount}", String.format("%.2f", account.getSavings()),
                "{currency}", currency,
                "{account}", "Savings");

        if (account.getFixedDeposit() > 0) {
            long remaining = (account.getFixedDepositStart() +
                    (long) account.getFixedDepositTerm() * 60 * 60 * 1000) - System.currentTimeMillis();
            String timeLeft = remaining > 0 ? formatTime(remaining) : "Matured!";
            player.sendMessage("§6Fixed Deposit: §e" + String.format("%.2f", account.getFixedDeposit()) +
                    " " + currency + " §7(" + timeLeft + ")");
        }

        if (account.getLoanAmount() > 0) {
            String debt = String.format("%.2f", account.getTotalDebt());
            player.sendMessage("§cLoan Debt: §e" + debt + " " + currency);
        }
    }

    private void showAccounts(Player player, String currency) {
        var account = plugin.getAccountManager().getOrCreateAccount(
                player.getUniqueId(), player.getName());

        player.sendMessage("§6--- Your Bank Accounts ---");
        player.sendMessage("§eSavings: §f" + String.format("%.2f", account.getSavings()) + " " + currency);

        if (account.getFixedDeposit() > 0) {
            player.sendMessage("§eFixed Deposit: §f" + String.format("%.2f", account.getFixedDeposit()) + " " + currency);
        }

        double total = account.getSavings() + account.getFixedDeposit();
        player.sendMessage("§6Total in bank: §e" + String.format("%.2f", total) + " " + currency);
    }

    private void handleLoan(Player player, String[] args, String currency) {
        if (!plugin.getConfigManager().isLoanEnabled()) {
            player.sendMessage("§cLoans are not enabled on this server.");
            return;
        }

        if (args.length < 2) {
            player.sendMessage("§cUsage: /bank loan <amount>");
            player.sendMessage("§7Max loan: §e" + String.format("%.2f", plugin.getConfigManager().getMaxLoanAmount()) + " " + currency);
            return;
        }

        double amount;
        try {
            amount = Double.parseDouble(args[1]);
        } catch (NumberFormatException e) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        BankManager.LoanResult result = plugin.getBankManager().takeLoan(player.getUniqueId(), amount);

        switch (result) {
            case SUCCESS -> {
                double rate = plugin.getConfigManager().getLoanInterestRate() * 100;
                plugin.getMessagesConfig().sendMessage(player, "loan-taken",
                        "{amount}", String.format("%.2f", amount),
                        "{currency}", currency,
                        "{interest}", String.format("%.1f", rate));
            }
            case ALREADY_HAS_LOAN -> player.sendMessage("§cYou already have an outstanding loan.");
            case AMOUNT_TOO_HIGH -> plugin.getMessagesConfig().sendMessage(player, "loan-max-reached");
            case INSUFFICIENT_COLLATERAL -> {
                double required = amount * (plugin.getConfigManager().getCollateralPercentage() / 100.0);
                plugin.getMessagesConfig().sendMessage(player, "loan-collateral-required",
                        "{amount}", String.format("%.2f", required),
                        "{currency}", currency);
            }
            default -> player.sendMessage("§cFailed to take loan: " + result);
        }
    }

    private void handleRepay(Player player, String[] args, String currency) {
        if (args.length < 2) {
            player.sendMessage("§cUsage: /bank repay <amount>");
            return;
        }

        double amount;
        try {
            amount = Double.parseDouble(args[1]);
        } catch (NumberFormatException e) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        BankManager.LoanResult result = plugin.getBankManager().repayLoan(player.getUniqueId(), amount);

        switch (result) {
            case SUCCESS -> plugin.getMessagesConfig().sendMessage(player, "loan-repaid",
                    "{amount}", String.format("%.2f", amount),
                    "{currency}", currency);
            case NO_LOAN -> player.sendMessage("§cYou don't have any outstanding loans.");
            case INSUFFICIENT_FUNDS -> plugin.getMessagesConfig().sendMessage(player, "insufficient-funds",
                    "{amount}", String.format("%.2f", amount),
                    "{currency}", currency,
                    "{balance}", String.format("%.2f",
                            plugin.getEconomyManager().getBalance(player.getUniqueId())));
            default -> player.sendMessage("§cFailed to repay loan: " + result);
        }
    }

    private String formatTime(long millis) {
        long seconds = millis / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        long days = hours / 24;

        if (days > 0) return days + "d " + (hours % 24) + "h";
        if (hours > 0) return hours + "h " + (minutes % 60) + "m";
        return minutes + "m " + (seconds % 60) + "s";
    }
}
