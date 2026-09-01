package com.rafiekun.crafteco.hooks;

import com.rafiekun.crafteco.CraftEconomy;
import com.rafiekun.crafteco.account.Account;
import me.clip.placeholderapi.expansion.PlaceholderExpansion;
import org.bukkit.entity.Player;

public class PlaceholderHook extends PlaceholderExpansion {

    private final CraftEconomy plugin;

    public PlaceholderHook(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    @Override
    public String getIdentifier() {
        return "crafteco";
    }

    @Override
    public String getAuthor() {
        return "Rafie-kun";
    }

    @Override
    public String getVersion() {
        return plugin.getDescription().getVersion();
    }

    @Override
    public boolean persist() {
        return true;
    }

    @Override
    public String onPlaceholderRequest(Player player, String params) {
        if (player == null) return "";

        Account account = plugin.getAccountManager().getOrCreateAccount(
                player.getUniqueId(), player.getName());
        String currency = plugin.getConfigManager().getCurrencySymbol();

        return switch (params.toLowerCase()) {
            case "balance" -> String.format("%.2f", account.getBalance());
            case "balance_formatted" -> formatNumber(account.getBalance());
            case "balance_symbol" -> currency + String.format("%.2f", account.getBalance());
            case "savings" -> String.format("%.2f", account.getSavings());
            case "savings_formatted" -> formatNumber(account.getSavings());
            case "savings_symbol" -> currency + String.format("%.2f", account.getSavings());
            case "total_wealth" -> String.format("%.2f", account.getTotalWealth());
            case "total_wealth_formatted" -> formatNumber(account.getTotalWealth());
            case "total_wealth_symbol" -> currency + String.format("%.2f", account.getTotalWealth());
            case "loan" -> String.format("%.2f", account.getLoanAmount());
            case "loan_debt" -> String.format("%.2f", account.getTotalDebt());
            case "loan_debt_formatted" -> formatNumber(account.getTotalDebt());
            case "fixed_deposit" -> String.format("%.2f", account.getFixedDeposit());
            case "currency" -> plugin.getConfigManager().getCurrencyName();
            case "currency_plural" -> plugin.getConfigManager().getCurrencyNamePlural();
            case "currency_symbol" -> currency;
            case "has_loan" -> account.getLoanAmount() > 0 ? "true" : "false";
            case "has_savings" -> account.getSavings() > 0 ? "true" : "false";
            case "has_fixed_deposit" -> account.getFixedDeposit() > 0 ? "true" : "false";
            default -> null;
        };
    }

    private String formatNumber(double number) {
        if (number >= 1_000_000) {
            return String.format("%.1fM", number / 1_000_000);
        } else if (number >= 1_000) {
            return String.format("%.1fK", number / 1_000);
        } else {
            return String.format("%.2f", number);
        }
    }
}
