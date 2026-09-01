package com.rafiekun.crafteco.commands;

import com.rafiekun.crafteco.CraftEconomy;
import com.rafiekun.crafteco.shop.ShopManager;
import org.bukkit.Material;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.List;

public class ShopCommand implements CommandExecutor {

    private final CraftEconomy plugin;

    public ShopCommand(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player player)) {
            sender.sendMessage("§cOnly players can use this command.");
            return true;
        }

        if (!plugin.getConfigManager().isShopEnabled()) {
            player.sendMessage("§cShops are not enabled on this server.");
            return true;
        }

        if (args.length == 0) {
            showShopHelp(player);
            return true;
        }

        String currency = plugin.getConfigManager().getCurrencyNamePlural();

        switch (args[0].toLowerCase()) {
            case "create", "new" -> handleCreate(player, args, currency);
            case "remove", "delete" -> handleRemove(player, args);
            case "list", "ls" -> handleList(player, currency);
            case "buy" -> handleBuy(player, args, currency);
            case "info" -> handleInfo(player, args, currency);
            case "server" -> handleServerShops(player, currency);
            default -> showShopHelp(player);
        }

        return true;
    }

    private void showShopHelp(Player player) {
        player.sendMessage("§6--- CraftEconomy Shops ---");
        player.sendMessage("§e/shop create <material> <amount> <price> §7- Create a shop");
        player.sendMessage("§e/shop remove <id> §7- Remove a shop");
        player.sendMessage("§e/shop list §7- List your shops");
        player.sendMessage("§e/shop buy <id> §7- Buy from a shop");
        player.sendMessage("§e/shop info <id> §7- Shop details");
        if (plugin.getConfigManager().isServerShopsEnabled()) {
            player.sendMessage("§e/shop server §7- Browse server shops");
        }
    }

    private void handleCreate(Player player, String[] args, String currency) {
        if (args.length < 4) {
            player.sendMessage("§cUsage: /shop create <material> <amount> <price>");
            player.sendMessage("§7Example: /shop create diamond 1 100");
            return;
        }

        // Parse material
        Material material = Material.matchMaterial(args[1].toUpperCase());
        if (material == null || !material.isItem()) {
            player.sendMessage("§cUnknown material: " + args[1]);
            return;
        }

        // Parse amount
        int amount;
        try {
            amount = Integer.parseInt(args[2]);
        } catch (NumberFormatException e) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        if (amount <= 0 || amount > 64) {
            player.sendMessage("§cAmount must be between 1 and 64.");
            return;
        }

        // Parse price
        double price;
        try {
            price = Double.parseDouble(args[3]);
        } catch (NumberFormatException e) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        if (price <= 0) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        ShopManager.Shop shop = plugin.getShopManager().createShop(player, material, amount, price, -1);
        if (shop != null) {
            plugin.getMessagesConfig().sendMessage(player, "shop-created",
                    "{item}", material.name(),
                    "{amount}", String.valueOf(amount),
                    "{price}", String.format("%.2f", price),
                    "{currency}", currency);
        } else {
            player.sendMessage("§cFailed to create shop. Check shop limits.");
        }
    }

    private void handleRemove(Player player, String[] args) {
        if (args.length < 2) {
            player.sendMessage("§cUsage: /shop remove <id>");
            return;
        }

        int shopId;
        try {
            shopId = Integer.parseInt(args[1]);
        } catch (NumberFormatException e) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        boolean success = plugin.getShopManager().removeShop(shopId, player.getUniqueId());
        if (success) {
            plugin.getMessagesConfig().sendMessage(player, "shop-removed");
        } else {
            player.sendMessage("§cShop not found or you don't own it.");
        }
    }

    private void handleList(Player player, String currency) {
        List<ShopManager.Shop> shops = plugin.getShopManager().getPlayerShops(player.getUniqueId());

        if (shops.isEmpty()) {
            plugin.getMessagesConfig().sendMessage(player, "shop-list-empty");
            return;
        }

        player.sendMessage(plugin.getMessagesConfig().get("shop-list-header"));
        for (ShopManager.Shop shop : shops) {
            String entry = plugin.getMessagesConfig().get("shop-list-entry",
                    "{id}", String.valueOf(shop.getId()),
                    "{item}", shop.getItemType().name(),
                    "{amount}", String.valueOf(shop.getAmount()),
                    "{price}", String.format("%.2f", shop.getPrice()),
                    "{currency}", currency);
            player.sendMessage(entry);
        }
    }

    private void handleBuy(Player player, String[] args, String currency) {
        if (args.length < 2) {
            player.sendMessage("§cUsage: /shop buy <id>");
            return;
        }

        int shopId;
        try {
            shopId = Integer.parseInt(args[1]);
        } catch (NumberFormatException e) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        ShopManager.Shop shop = plugin.getShopManager().getShop(shopId);
        if (shop == null) {
            player.sendMessage("§cShop #" + shopId + " not found.");
            return;
        }

        if (shop.getStock() == 0) {
            plugin.getMessagesConfig().sendMessage(player, "shop-no-stock");
            return;
        }

        if (!plugin.getEconomyManager().has(player.getUniqueId(), shop.getPrice())) {
            plugin.getMessagesConfig().sendMessage(player, "shop-no-money");
            return;
        }

        boolean success = plugin.getShopManager().purchaseShop(player, shopId);
        if (success) {
            plugin.getMessagesConfig().sendMessage(player, "shop-bought",
                    "{item}", shop.getItemType().name(),
                    "{amount}", String.valueOf(shop.getAmount()),
                    "{price}", String.format("%.2f", shop.getPrice()),
                    "{currency}", currency);
        } else {
            player.sendMessage("§cFailed to purchase. Check your inventory.");
        }
    }

    private void handleInfo(Player player, String[] args, String currency) {
        if (args.length < 2) {
            player.sendMessage("§cUsage: /shop info <id>");
            return;
        }

        int shopId;
        try {
            shopId = Integer.parseInt(args[1]);
        } catch (NumberFormatException e) {
            plugin.getMessagesConfig().sendMessage(player, "invalid-amount");
            return;
        }

        ShopManager.Shop shop = plugin.getShopManager().getShop(shopId);
        if (shop == null) {
            player.sendMessage("§cShop #" + shopId + " not found.");
            return;
        }

        String owner = shop.isServerShop() ? "Server" :
                plugin.getServer().getOfflinePlayer(shop.getOwnerUuid()).getName();
        String stock = shop.getStock() < 0 ? "Unlimited" : String.valueOf(shop.getStock());

        player.sendMessage("§6--- Shop #" + shopId + " ---");
        player.sendMessage("§7Item: §f" + shop.getItemType().name() + " x" + shop.getAmount());
        player.sendMessage("§7Price: §e" + String.format("%.2f", shop.getPrice()) + " " + currency);
        player.sendMessage("§7Stock: §f" + stock);
        player.sendMessage("§7Owner: §f" + owner);
        player.sendMessage("§7Type: §f" + (shop.isServerShop() ? "Server Shop" : "Player Shop"));
    }

    private void handleServerShops(Player player, String currency) {
        if (!plugin.getConfigManager().isServerShopsEnabled()) {
            player.sendMessage("§cServer shops are not enabled.");
            return;
        }

        List<ShopManager.Shop> shops = plugin.getShopManager().getAllServerShops();

        if (shops.isEmpty()) {
            player.sendMessage("§7No server shops available.");
            return;
        }

        player.sendMessage("§6--- Server Shops ---");
        for (ShopManager.Shop shop : shops) {
            String stock = shop.getStock() < 0 ? "∞" : String.valueOf(shop.getStock());
            player.sendMessage("§e#" + shop.getId() + " §f" + shop.getItemType().name() +
                    " x" + shop.getAmount() + " §7@ §e" + String.format("%.2f", shop.getPrice()) +
                    " " + currency + " §7(Stock: " + stock + ")");
        }
    }
}
