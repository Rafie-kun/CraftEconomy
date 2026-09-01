package com.rafiekun.crafteco.shop;

import com.rafiekun.crafteco.CraftEconomy;
import com.rafiekun.crafteco.economy.TransactionType;
import org.bukkit.Material;
import org.bukkit.block.Block;
import org.bukkit.entity.Player;
import org.bukkit.inventory.ItemStack;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.logging.Level;

public class ShopManager {

    private final CraftEconomy plugin;

    public ShopManager(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    public Shop createShop(Player owner, Material material, int amount, double price, int stock) {
        if (!plugin.getConfigManager().isShopEnabled()) return null;
        if (!owner.hasPermission("crafteco.shop.create")) return null;

        int maxShops = plugin.getConfigManager().getMaxShopsPerPlayer();
        if (maxShops > 0 && getPlayerShopCount(owner.getUniqueId()) >= maxShops) return null;

        String prefix = plugin.getDatabaseManager().prefix("shops");
        String sql = String.format("""
            INSERT INTO %s (owner_uuid, item_type, amount, price, stock, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, owner.getUniqueId().toString());
            stmt.setString(2, material.name());
            stmt.setInt(3, amount);
            stmt.setDouble(4, price);
            stmt.setInt(5, stock);
            stmt.setLong(6, System.currentTimeMillis());
            stmt.executeUpdate();

            ResultSet keys = stmt.getGeneratedKeys();
            if (keys.next()) {
                int id = keys.getInt(1);
                return new Shop(id, owner.getUniqueId(), material, amount, price, stock, null, 0, 0, 0, false, System.currentTimeMillis());
            }
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to create shop", e);
        }
        return null;
    }

    public Shop createServerShop(Material material, int amount, double price) {
        String prefix = plugin.getDatabaseManager().prefix("shops");
        String sql = String.format("""
            INSERT INTO %s (owner_uuid, item_type, amount, price, stock, is_server_shop, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, "00000000-0000-0000-0000-000000000000");
            stmt.setString(2, material.name());
            stmt.setInt(3, amount);
            stmt.setDouble(4, price);
            stmt.setInt(5, -1); // Unlimited stock
            stmt.setBoolean(6, true);
            stmt.setLong(7, System.currentTimeMillis());
            stmt.executeUpdate();

            ResultSet keys = stmt.getGeneratedKeys();
            if (keys.next()) {
                int id = keys.getInt(1);
                return new Shop(id, UUID.fromString("00000000-0000-0000-0000-000000000000"),
                        material, amount, price, -1, null, 0, 0, 0, true, System.currentTimeMillis());
            }
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to create server shop", e);
        }
        return null;
    }

    public boolean removeShop(int shopId, UUID requester) {
        Shop shop = getShop(shopId);
        if (shop == null) return false;
        if (!shop.isServerShop() && !shop.getOwnerUuid().equals(requester)) return false;

        String prefix = plugin.getDatabaseManager().prefix("shops");
        String sql = String.format("DELETE FROM %s WHERE id = ?", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, shopId);
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to remove shop", e);
            return false;
        }
    }

    public boolean purchaseShop(Player buyer, int shopId) {
        Shop shop = getShop(shopId);
        if (shop == null) return false;
        if (shop.getStock() == 0) return false;

        if (!plugin.getEconomyManager().has(buyer.getUniqueId(), shop.getPrice())) return false;

        // Deduct money
        plugin.getEconomyManager().withdraw(buyer.getUniqueId(), shop.getPrice(),
                "Bought " + shop.getItemType() + " x" + shop.getAmount() + " from shop #" + shopId);

        // Apply tax
        double tax = plugin.getConfigManager().getTaxRate();
        if (tax > 0 && !shop.isServerShop()) {
            double taxAmount = shop.getPrice() * tax;
            plugin.getEconomyManager().deposit(shop.getOwnerUuid(), shop.getPrice() - taxAmount,
                    "Shop sale (after tax) #" + shopId);
        } else if (!shop.isServerShop()) {
            plugin.getEconomyManager().deposit(shop.getOwnerUuid(), shop.getPrice(),
                    "Shop sale #" + shopId);
        }

        // Give items
        ItemStack item = new ItemStack(shop.getItemType(), shop.getAmount());
        java.util.HashMap<Integer, ItemStack> remaining = buyer.getInventory().addItem(item);
        if (!remaining.isEmpty()) {
            // Inventory full, refund
            plugin.getEconomyManager().deposit(buyer.getUniqueId(), shop.getPrice(), "Shop refund (inventory full)");
            return false;
        }

        // Reduce stock if not unlimited
        if (shop.getStock() > 0) {
            shop.setStock(shop.getStock() - 1);
            updateShopStock(shopId, shop.getStock());
        }

        return true;
    }

    private void updateShopStock(int shopId, int stock) {
        String prefix = plugin.getDatabaseManager().prefix("shops");
        String sql = String.format("UPDATE %s SET stock = ? WHERE id = ?", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, stock);
            stmt.setInt(2, shopId);
            stmt.executeUpdate();
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to update shop stock", e);
        }
    }

    public Shop getShop(int shopId) {
        String prefix = plugin.getDatabaseManager().prefix("shops");
        String sql = String.format("SELECT * FROM %s WHERE id = ?", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, shopId);
            ResultSet rs = stmt.executeQuery();

            if (rs.next()) {
                return resultSetToShop(rs);
            }
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to get shop", e);
        }
        return null;
    }

    public List<Shop> getPlayerShops(UUID uuid) {
        List<Shop> shops = new ArrayList<>();
        String prefix = plugin.getDatabaseManager().prefix("shops");
        String sql = String.format("SELECT * FROM %s WHERE owner_uuid = ? AND is_server_shop = FALSE", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, uuid.toString());
            ResultSet rs = stmt.executeQuery();

            while (rs.next()) {
                shops.add(resultSetToShop(rs));
            }
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to fetch player shops", e);
        }
        return shops;
    }

    public List<Shop> getAllServerShops() {
        List<Shop> shops = new ArrayList<>();
        String prefix = plugin.getDatabaseManager().prefix("shops");
        String sql = String.format("SELECT * FROM %s WHERE is_server_shop = TRUE", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                shops.add(resultSetToShop(rs));
            }
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to fetch server shops", e);
        }
        return shops;
    }

    public int getPlayerShopCount(UUID uuid) {
        String prefix = plugin.getDatabaseManager().prefix("shops");
        String sql = String.format("SELECT COUNT(*) FROM %s WHERE owner_uuid = ? AND is_server_shop = FALSE", prefix);

        try (Connection conn = plugin.getDatabaseManager().getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, uuid.toString());
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) return rs.getInt(1);
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to count shops", e);
        }
        return 0;
    }

    private Shop resultSetToShop(ResultSet rs) throws SQLException {
        return new Shop(
                rs.getInt("id"),
                UUID.fromString(rs.getString("owner_uuid")),
                Material.valueOf(rs.getString("item_type")),
                rs.getInt("amount"),
                rs.getDouble("price"),
                rs.getInt("stock"),
                rs.getString("world"),
                rs.getInt("x"),
                rs.getInt("y"),
                rs.getInt("z"),
                rs.getBoolean("is_server_shop"),
                rs.getLong("created_at")
        );
    }

    // Shop data class
    public static class Shop {
        private final int id;
        private final UUID ownerUuid;
        private final Material itemType;
        private final int amount;
        private final double price;
        private int stock;
        private final String world;
        private final int x;
        private final int y;
        private final int z;
        private final boolean serverShop;
        private final long createdAt;

        public Shop(int id, UUID ownerUuid, Material itemType, int amount, double price,
                    int stock, String world, int x, int y, int z, boolean serverShop, long createdAt) {
            this.id = id;
            this.ownerUuid = ownerUuid;
            this.itemType = itemType;
            this.amount = amount;
            this.price = price;
            this.stock = stock;
            this.world = world;
            this.x = x;
            this.y = y;
            this.z = z;
            this.serverShop = serverShop;
            this.createdAt = createdAt;
        }

        public int getId() { return id; }
        public UUID getOwnerUuid() { return ownerUuid; }
        public Material getItemType() { return itemType; }
        public int getAmount() { return amount; }
        public double getPrice() { return price; }
        public int getStock() { return stock; }
        public void setStock(int stock) { this.stock = stock; }
        public String getWorld() { return world; }
        public int getX() { return x; }
        public int getY() { return y; }
        public int getZ() { return z; }
        public boolean isServerShop() { return serverShop; }
        public long getCreatedAt() { return createdAt; }
    }
}
