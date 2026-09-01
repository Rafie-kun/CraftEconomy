package com.rafiekun.crafteco.commands;

import com.rafiekun.crafteco.CraftEconomy;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class EcoCommand implements CommandExecutor {

    private final CraftEconomy plugin;

    public EcoCommand(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length < 3) {
            sender.sendMessage("§6--- CraftEconomy Admin ---");
            sender.sendMessage("§e/eco give <player> <amount> §7- Give money");
            sender.sendMessage("§e/eco take <player> <amount> §7- Take money");
            sender.sendMessage("§e/eco set <player> <amount> §7- Set balance");
            sender.sendMessage("§e/eco reset <player> §7- Reset to default");
            return true;
        }

        String action = args[0].toLowerCase();
        String playerName = args[1];
        Player target = Bukkit.getPlayer(playerName);

        if (target == null) {
            sender.sendMessage("§cPlayer '" + playerName + "' not found.");
            return true;
        }

        String currency = plugin.getConfigManager().getCurrencyNamePlural();

        switch (action) {
            case "give" -> {
                double amount = parseAmount(args[2]);
                if (amount <= 0) {
                    sender.sendMessage("§cInvalid amount.");
                    return true;
                }

                var result = plugin.getEconomyManager().deposit(target.getUniqueId(), amount,
                        "Admin gave " + sender.getName());
                if (result == com.rafiekun.crafteco.economy.EconomyManager.DepositResult.SUCCESS) {
                    plugin.getMessagesConfig().sendMessage((Player) sender, "eco-gave",
                            "{amount}", String.format("%.2f", amount),
                            "{currency}", currency,
                            "{player}", target.getName());
                    plugin.getMessagesConfig().sendMessage(target, "eco-gave",
                            "{amount}", String.format("%.2f", amount),
                            "{currency}", currency,
                            "{player}", sender.getName());
                } else {
                    sender.sendMessage("§cFailed to give money: " + result);
                }
            }
            case "take" -> {
                double amount = parseAmount(args[2]);
                if (amount <= 0) {
                    sender.sendMessage("§cInvalid amount.");
                    return true;
                }

                var result = plugin.getEconomyManager().withdraw(target.getUniqueId(), amount,
                        "Admin took " + sender.getName());
                if (result == com.rafiekun.crafteco.economy.EconomyManager.WithdrawResult.SUCCESS) {
                    plugin.getMessagesConfig().sendMessage((Player) sender, "eco-took",
                            "{amount}", String.format("%.2f", amount),
                            "{currency}", currency,
                            "{player}", target.getName());
                } else {
                    sender.sendMessage("§cFailed to take money: " + result);
                }
            }
            case "set" -> {
                double amount = parseAmount(args[2]);
                if (amount < 0) {
                    sender.sendMessage("§cAmount cannot be negative.");
                    return true;
                }

                boolean success = plugin.getEconomyManager().setBalance(target.getUniqueId(), amount);
                if (success) {
                    plugin.getMessagesConfig().sendMessage((Player) sender, "eco-set",
                            "{amount}", String.format("%.2f", amount),
                            "{currency}", currency,
                            "{player}", target.getName());
                } else {
                    sender.sendMessage("§cFailed to set balance.");
                }
            }
            case "reset" -> {
                double defaultBalance = plugin.getConfigManager().getStartingBalance();
                boolean success = plugin.getEconomyManager().setBalance(target.getUniqueId(), defaultBalance);
                if (success) {
                    plugin.getMessagesConfig().sendMessage((Player) sender, "eco-reset",
                            "{amount}", String.format("%.2f", defaultBalance),
                            "{currency}", currency,
                            "{player}", target.getName());
                } else {
                    sender.sendMessage("§cFailed to reset balance.");
                }
            }
            default -> sender.sendMessage("§cUnknown action. Use give, take, set, or reset.");
        }

        return true;
    }

    private double parseAmount(String input) {
        try {
            return Double.parseDouble(input);
        } catch (NumberFormatException e) {
            return -1;
        }
    }
}
