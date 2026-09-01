package com.rafiekun.crafteco.commands;

import com.rafiekun.crafteco.CraftEconomy;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.HashMap;
import java.util.UUID;

public class PayCommand implements CommandExecutor {

    private final CraftEconomy plugin;
    private final HashMap<UUID, Long> cooldowns = new HashMap<>();

    public PayCommand(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command.");
            return true;
        }

        if (args.length < 2) {
            player.sendMessage("§cUsage: /pay <player> <amount>");
            return true;
        }

        // Cooldown check
        int cooldown = plugin.getConfigManager().getCooldown("pay");
        if (cooldown > 0) {
            Long lastUse = cooldowns.get(player.getUniqueId());
            if (lastUse != null) {
                long elapsed = (System.currentTimeMillis() - lastUse) / 1000;
                if (elapsed < cooldown) {
                    plugin.getMessagesConfig().sendMessage(player, "on-cooldown",
                            "{time}", String.valueOf((int)(cooldown - elapsed)));
                    return true;
                }
            }
        }

        // Parse target
        Player target = Bukkit.getPlayer(args[0]);
        if (target == null) {
            plugin.getMessagesConfig().sendMessage(player, "player-not-found",
                    "{player}", args[0]);
            return true;
        }

        if (target.getUniqueId().equals(player.getUniqueId())) {
            plugin.getMessagesConfig().sendMessage(player, "same-player",
                    "{currency}", plugin.getConfigManager().getCurrencyNamePlural());
            return true;
        }

        // Parse amount
        double amount;
        try {
            amount = Double.parseDouble(args[1]);
        } catch (NumberFormatException e) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return true;
        }

        if (amount <= 0) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return true;
        }

        // Execute transfer
        String currency = plugin.getConfigManager().getCurrencyNamePlural();
        boolean success = plugin.getEconomyManager().transfer(
                player.getUniqueId(), target.getUniqueId(), amount,
                "Player transfer");

        if (success) {
            cooldowns.put(player.getUniqueId(), System.currentTimeMillis());

            plugin.getMessagesConfig().sendMessage(player, "pay-sent",
                    "{amount}", String.format("%.2f", amount),
                    "{currency}", currency,
                    "{target}", target.getName());

            plugin.getMessagesConfig().sendMessage(target, "pay-received",
                    "{amount}", String.format("%.2f", amount),
                    "{currency}", currency,
                    "{player}", player.getName());
        } else {
            plugin.getMessagesConfig().sendMessage(player, "insufficient-funds",
                    "{amount}", String.format("%.2f", amount),
                    "{currency}", currency,
                    "{balance}", String.format("%.2f",
                            plugin.getEconomyManager().getBalance(player.getUniqueId())));
        }

        return true;
    }
}
