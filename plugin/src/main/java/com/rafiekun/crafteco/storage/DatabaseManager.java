package com.rafiekun.crafteco.storage;

import com.rafiekun.crafteco.CraftEconomy;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import java.sql.*;
import java.util.UUID;
import java.util.logging.Level;

public class DatabaseManager {

    private final CraftEconomy plugin;
    private HikariDataSource dataSource;
    private boolean isSQLite;

    public DatabaseManager(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    public boolean connect() {
        String type = plugin.getConfigManager().getStorageType();
        isSQLite = type.equalsIgnoreCase("sqlite");

        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setPoolName("CraftEconomy-HikariPool");
        hikariConfig.setConnectionTimeout(5000);
        hikariConfig.setMaximumPoolSize(plugin.getConfigManager().getMysqlMaxConnections());

        if (isSQLite) {
            hikariConfig.setDriverClassName("org.sqlite.JDBC");
            String dbPath = plugin.getDataFolder().getAbsolutePath() + "/crafteco.db";
            hikariConfig.setJdbcUrl("jdbc:sqlite:" + dbPath);
        } else {
            hikariConfig.setDriverClassName("com.mysql.cj.jdbc.Driver");
            String host = plugin.getConfigManager().getMysqlHost();
            int port = plugin.getConfigManager().getMysqlPort();
            String database = plugin.getConfigManager().getMysqlDatabase();
            String username = plugin.getConfigManager().getMysqlUsername();
            String password = plugin.getConfigManager().getMysqlPassword();
            hikariConfig.setJdbcUrl(String.format(
                    "jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
                    host, port, database));
            hikariConfig.setUsername(username);
            hikariConfig.setPassword(password);
        }

        try {
            dataSource = new HikariDataSource(hikariConfig);
            createTables();
            plugin.getLogger().info("Connected to " + (isSQLite ? "SQLite" : "MySQL") + " database.");
            return true;
        } catch (Exception e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to connect to database", e);
            return false;
        }
    }

    public void disconnect() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
        }
    }

    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    private void createTables() {
        String prefix = plugin.getConfigManager().getTablePrefix();

        try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
            // Accounts table
            stmt.executeUpdate(String.format("""
                CREATE TABLE IF NOT EXISTS %saccounts (
                    uuid VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(16) NOT NULL,
                    balance DOUBLE NOT NULL DEFAULT 0,
                    savings DOUBLE NOT NULL DEFAULT 0,
                    fixed_deposit DOUBLE NOT NULL DEFAULT 0,
                    fixed_deposit_term INT NOT NULL DEFAULT 0,
                    fixed_deposit_start BIGINT NOT NULL DEFAULT 0,
                    loan_amount DOUBLE NOT NULL DEFAULT 0,
                    loan_interest DOUBLE NOT NULL DEFAULT 0,
                    loan_start BIGINT NOT NULL DEFAULT 0,
                    created_at BIGINT NOT NULL,
                    updated_at BIGINT NOT NULL
                )
            """, prefix));

            // Transactions table
            stmt.executeUpdate(String.format("""
                CREATE TABLE IF NOT EXISTS %stransactions (
                    id INTEGER PRIMARY KEY%s,
                    uuid VARCHAR(36) NOT NULL,
                    type VARCHAR(32) NOT NULL,
                    amount DOUBLE NOT NULL,
                    balance_after DOUBLE NOT NULL,
                    description TEXT,
                    target_uuid VARCHAR(36),
                    timestamp BIGINT NOT NULL
                )
            """, prefix, isSQLite ? " AUTOINCREMENT" : " AUTO_INCREMENT"));

            // Shops table
            stmt.executeUpdate(String.format("""
                CREATE TABLE IF NOT EXISTS %sshops (
                    id INTEGER PRIMARY KEY%s,
                    owner_uuid VARCHAR(36) NOT NULL,
                    item_type VARCHAR(64) NOT NULL,
                    item_meta TEXT,
                    amount INT NOT NULL DEFAULT 1,
                    price DOUBLE NOT NULL,
                    stock INT NOT NULL DEFAULT -1,
                    world VARCHAR(64),
                    x INT,
                    y INT,
                    z INT,
                    is_server_shop BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at BIGINT NOT NULL
                )
            """, prefix, isSQLite ? " AUTOINCREMENT" : " AUTO_INCREMENT"));

            // Bank accounts table (for multiple accounts per player)
            stmt.executeUpdate(String.format("""
                CREATE TABLE IF NOT EXISTS %sbank_accounts (
                    id INTEGER PRIMARY KEY%s,
                    uuid VARCHAR(36) NOT NULL,
                    name VARCHAR(64) NOT NULL,
                    balance DOUBLE NOT NULL DEFAULT 0,
                    type VARCHAR(32) NOT NULL DEFAULT 'savings',
                    interest_rate DOUBLE NOT NULL DEFAULT 0,
                    created_at BIGINT NOT NULL,
                    updated_at BIGINT NOT NULL
                )
            """, prefix, isSQLite ? " AUTOINCREMENT" : " AUTO_INCREMENT"));

            // Player data cache table
            stmt.executeUpdate(String.format("""
                CREATE TABLE IF NOT EXISTS %splayer_cache (
                    uuid VARCHAR(36) PRIMARY KEY,
                    name VARCHAR(16) NOT NULL,
                    first_join BIGINT NOT NULL,
                    last_seen BIGINT NOT NULL
                )
            """, prefix));

            plugin.getLogger().info("Database tables created/verified.");
        } catch (SQLException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to create database tables", e);
        }
    }

    public String prefix(String table) {
        return plugin.getConfigManager().getTablePrefix() + table;
    }

    public boolean isSQLite() {
        return isSQLite;
    }
}
