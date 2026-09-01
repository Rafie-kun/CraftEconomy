package com.rafiekun.crafteco.commands;

import com.rafiekun.crafteco.CraftEconomy;
import com.rafiekun.crafteco.account.Account;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class BalanceCommand implements CommandExecutor {

    private final CraftEconomy plugin;

    public BalanceCommand(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        String currency = plugin.getConfigManager().getCurrencyNamePlural();

        if (args.length == 0) {
            // Own balance
            if (!(sender instanceof Player player)) {
                sender.sendMessage("§cOnly players can check their own balance.");
                return true;
            }

            Account account = plugin.getAccountManager().getOrCreateAccount(
                    player.getUniqueId(), player.getName());
            String balance = String.format("%.2f", account.getBalance());
            String savings = String.format("%.2f", account.getSavings());
            String total = String.format("%.2f", account.getTotalWealth());

            plugin.getMessagesConfig().sendMessage(player, "balance-self",
                    "{amount}", balance, "{currency}", currency);

            if (plugin.getConfigManager().isBankEnabled()) {
                player.sendMessage("§6Savings: §e" + savings + " " + currency);
            }
            player.sendMessage("§6Total wealth: §e" + total + " " + currency);

            // Show loan if any
            if (account.getLoanAmount() > 0) {
                String debt = String.format("%.2f", account.getTotalDebt());
                player.sendMessage("§cLoan debt: §e" + debt + " " + currency);
            }
        } else {
            // Other player's balance
            if (!sender.hasPermission("crafteco.balance.others")) {
                sender.sendMessage(plugin.getMessagesConfig().get("no-permission"));
                return true;
            }

            Player target = Bukkit.getPlayer(args[0]);
            if (target == null) {
                plugin.getMessagesConfig().sendMessage((Player) sender, "player-not-found",
                        "{player}", args[0]);
                return true;
            }

            Account account = plugin.getAccountManager().getOrCreateAccount(
                    target.getUniqueId(), target.getName());
            String balance = String.format("%.2f", account.getBalance());
            String name = target.getName();

            sender.sendMessage(plugin.getMessagesConfig().get("balance-other",
                    "{player}", name, "{amount}", balance, "{currency}", currency));
        }

        return true;
    }
}
