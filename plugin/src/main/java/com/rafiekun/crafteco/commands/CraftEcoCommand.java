package com.rafiekun.crafteco.commands;

import com.rafiekun.crafteco.CraftEconomy;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;

public class CraftEcoCommand implements CommandExecutor {

    private final CraftEconomy plugin;

    public CraftEcoCommand(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            showHelp(sender);
            return true;
        }

        switch (args[0].toLowerCase()) {
            case "reload" -> {
                if (!sender.hasPermission("crafteco.admin.reload")) {
                    sender.sendMessage(plugin.getMessagesConfig().get("no-permission"));
                    return true;
                }
                plugin.getConfigManager().reload();
                plugin.getMessagesConfig().reload();
                plugin.getMessagesConfig().sendMessage(
                        (org.bukkit.entity.Player) sender, "reload-success");
            }
            case "version", "ver" -> {
                String version = plugin.getDescription().getVersion();
                plugin.getMessagesConfig().sendMessage(
                        (org.bukkit.entity.Player) sender, "version",
                        "{version}", version);
            }
            case "help" -> showHelp(sender);
            default -> showHelp(sender);
        }

        return true;
    }

    private void showHelp(CommandSender sender) {
        sender.sendMessage("§6--- CraftEconomy Help ---");
        sender.sendMessage("§e/balance [player] §7- Check balance");
        sender.sendMessage("§e/pay <player> <amount> §7- Send money");
        sender.sendMessage("§e/bank <subcommand> §7- Banking");
        sender.sendMessage("§e/shop <subcommand> §7- Shops");
        sender.sendMessage("§e/transactions §7- View history");
        if (sender.hasPermission("crafteco.admin.eco")) {
            sender.sendMessage("§e/eco <give|take|set> §7- Admin commands");
        }
        if (sender.hasPermission("crafteco.admin.reload")) {
            sender.sendMessage("§e/crafteco reload §7- Reload config");
        }
    }
}
