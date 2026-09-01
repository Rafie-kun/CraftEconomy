package com.rafiekun.crafteco.commands;

import com.rafiekun.crafteco.CraftEconomy;
import com.rafiekun.crafteco.economy.TransactionLogger;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.List;

public class TransactionsCommand implements CommandExecutor {

    private final CraftEconomy plugin;

    public TransactionsCommand(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command.");
            return true;
        }

        if (!plugin.getConfigManager().isTransactionsEnabled()) {
            player.sendMessage("§cTransaction history is not enabled.");
            return true;
        }

        Player target;
        int page = 1;

        if (args.length >= 2) {
            // /transactions <player> [page]
            if (!sender.hasPermission("crafteco.history.others")) {
                sender.sendMessage(plugin.getMessagesConfig().get("no-permission"));
                return true;
            }
            target = Bukkit.getPlayer(args[0]);
            if (target == null) {
                plugin.getMessagesConfig().sendMessage(player, "player-not-found",
                        "{player}", args[0]);
                return true;
            }
            try {
                page = Integer.parseInt(args[1]);
            } catch (NumberFormatException ignored) {}
        } else if (args.length == 1) {
            // /transactions [page]
            try {
                page = Integer.parseInt(args[0]);
                target = player;
            } catch (NumberFormatException e) {
                target = Bukkit.getPlayer(args[0]);
                if (target == null) {
                    plugin.getMessagesConfig().sendMessage(player, "player-not-found",
                            "{player}", args[0]);
                    return true;
                }
                if (!sender.hasPermission("crafteco.history.others")) {
                    sender.sendMessage(plugin.getMessagesConfig().get("no-permission"));
                    return true;
                }
            }
        } else {
            target = player;
        }

        int perPage = 7;
        List<TransactionLogger.Transaction> transactions = plugin.getTransactionLogger()
                .getTransactions(target.getUniqueId(), page, perPage);
        int totalTransactions = plugin.getTransactionLogger().getTransactionCount(target.getUniqueId());
        int maxPages = (int) Math.ceil((double) totalTransactions / perPage);

        String currency = plugin.getConfigManager().getCurrencyNamePlural();

        player.sendMessage("§6--- Transaction History (" + target.getName() + ") ---");

        if (transactions.isEmpty()) {
            plugin.getMessagesConfig().sendMessage(player, "tx-empty");
        } else {
            for (TransactionLogger.Transaction tx : transactions) {
                String entry = plugin.getMessagesConfig().get("tx-entry",
                        "{date}", tx.getFormattedDate(),
                        "{type}", tx.getType().getDisplayName(),
                        "{amount}", String.format("%.2f", tx.getAmount()),
                        "{currency}", currency,
                        "{description}", tx.getDescription() != null ? tx.getDescription() : "");
                player.sendMessage(entry);
            }
        }

        if (maxPages > 1) {
            plugin.getMessagesConfig().sendMessage(player, "tx-page",
                    "{current}", String.valueOf(page),
                    "{max}", String.valueOf(maxPages));
        }

        return true;
    }
}
