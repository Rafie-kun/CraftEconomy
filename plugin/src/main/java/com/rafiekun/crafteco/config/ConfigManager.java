package com.rafiekun.crafteco.config;

import com.rafiekun.crafteco.CraftEconomy;
import org.bukkit.configuration.file.FileConfiguration;

import java.util.HashMap;
import java.util.Map;

public class ConfigManager {

    private final CraftEconomy plugin;
    private FileConfiguration config;

    // General
    private String currencyName;
    private String currencyNamePlural;
    private String currencySymbol;
    private double startingBalance;
    private double maxBalance;
    private boolean enabled;

    // Storage
    private String storageType;
    private String mysqlHost;
    private int mysqlPort;
    private String mysqlDatabase;
    private String mysqlUsername;
    private String mysqlPassword;
    private int mysqlMaxConnections;
    private String tablePrefix;

    // Bank
    private boolean bankEnabled;
    private double savingsInterestRate;
    private Map<Integer, Double> fixedDepositRates;
    private boolean loanEnabled;
    private double maxLoanAmount;
    private double loanInterestRate;
    private int maxLoanDuration;
    private boolean collateralRequired;
    private double collateralPercentage;

    // Shop
    private boolean shopEnabled;
    private int maxShopsPerPlayer;
    private double taxRate;
    private boolean serverShopsEnabled;

    // Transactions
    private boolean transactionsEnabled;
    private int maxHistory;
    private boolean logToFile;
    private String logFile;

    // Cooldowns
    private Map<String, Integer> cooldowns;

    // PlaceholderAPI
    private boolean placeholderEnabled;

    // Dashboard
    private boolean dashboardEnabled;
    private int dashboardPort;
    private String dashboardApiKey;

    public ConfigManager(CraftEconomy plugin) {
        this.plugin = plugin;
        this.fixedDepositRates = new HashMap<>();
        this.cooldowns = new HashMap<>();
        reload();
    }

    public void reload() {
        plugin.reloadConfig();
        config = plugin.getConfig();

        // General
        currencyName = config.getString("general.currency-name", "Emerald");
        currencyNamePlural = config.getString("general.currency-name-plural", "Emeralds");
        currencySymbol = config.getString("general.currency-symbol", "E");
        startingBalance = config.getDouble("general.starting-balance", 100.0);
        maxBalance = config.getDouble("general.max-balance", 1000000000.0);
        enabled = config.getBoolean("general.enabled", true);

        // Storage
        storageType = config.getString("storage.type", "sqlite");
        mysqlHost = config.getString("storage.mysql.host", "localhost");
        mysqlPort = config.getInt("storage.mysql.port", 3306);
        mysqlDatabase = config.getString("storage.mysql.database", "crafteco");
        mysqlUsername = config.getString("storage.mysql.username", "root");
        mysqlPassword = config.getString("storage.mysql.password", "");
        mysqlMaxConnections = config.getInt("storage.mysql.max-connections", 10);
        tablePrefix = config.getString("storage.mysql.table-prefix", "ce_");

        // Bank
        bankEnabled = config.getBoolean("bank.enabled", true);
        savingsInterestRate = config.getDouble("bank.savings-interest-rate", 0.001);

        fixedDepositRates.clear();
        if (config.contains("bank.fixed-deposits")) {
            for (String key : config.getConfigurationSection("bank.fixed-deposits").getKeys(false)) {
                try {
                    int hours = Integer.parseInt(key);
                    double rate = config.getDouble("bank.fixed-deposits." + key);
                    fixedDepositRates.put(hours, rate);
                } catch (NumberFormatException ignored) {}
            }
        }

        loanEnabled = config.getBoolean("bank.loan.enabled", true);
        maxLoanAmount = config.getDouble("bank.loan.max-loan-amount", 50000.0);
        loanInterestRate = config.getDouble("bank.loan.interest-rate", 0.005);
        maxLoanDuration = config.getInt("bank.loan.max-duration", 720);
        collateralRequired = config.getBoolean("bank.loan.collateral-required", false);
        collateralPercentage = config.getDouble("bank.loan.collateral-percentage", 50.0);

        // Shop
        shopEnabled = config.getBoolean("shop.enabled", true);
        maxShopsPerPlayer = config.getInt("shop.max-shops-per-player", 5);
        taxRate = config.getDouble("shop.tax-rate", 0.05);
        serverShopsEnabled = config.getBoolean("shop.server-shops-enabled", true);

        // Transactions
        transactionsEnabled = config.getBoolean("transactions.enabled", true);
        maxHistory = config.getInt("transactions.max-history", 100);
        logToFile = config.getBoolean("transactions.log-to-file", false);
        logFile = config.getString("transactions.log-file", "plugins/CraftEconomy/transactions.log");

        // Cooldowns
        cooldowns.clear();
        cooldowns.put("pay", config.getInt("cooldowns.pay", 0));
        cooldowns.put("bank-deposit", config.getInt("cooldowns.bank-deposit", 0));
        cooldowns.put("bank-withdraw", config.getInt("cooldowns.bank-withdraw", 0));

        // PlaceholderAPI
        placeholderEnabled = config.getBoolean("placeholderapi.enabled", true);

        // Dashboard
        dashboardEnabled = config.getBoolean("dashboard.enabled", false);
        dashboardPort = config.getInt("dashboard.port", 8080);
        dashboardApiKey = config.getString("dashboard.api-key", "");
    }

    // Getters
    public String getCurrencyName() { return currencyName; }
    public String getCurrencyNamePlural() { return currencyNamePlural; }
    public String getCurrencySymbol() { return currencySymbol; }
    public double getStartingBalance() { return startingBalance; }
    public double getMaxBalance() { return maxBalance; }
    public boolean isEnabled() { return enabled; }
    public String getStorageType() { return storageType; }
    public String getMysqlHost() { return mysqlHost; }
    public int getMysqlPort() { return mysqlPort; }
    public String getMysqlDatabase() { return mysqlDatabase; }
    public String getMysqlUsername() { return mysqlUsername; }
    public String getMysqlPassword() { return mysqlPassword; }
    public int getMysqlMaxConnections() { return mysqlMaxConnections; }
    public String getTablePrefix() { return tablePrefix; }
    public boolean isBankEnabled() { return bankEnabled; }
    public double getSavingsInterestRate() { return savingsInterestRate; }
    public Map<Integer, Double> getFixedDepositRates() { return fixedDepositRates; }
    public boolean isLoanEnabled() { return loanEnabled; }
    public double getMaxLoanAmount() { return maxLoanAmount; }
    public double getLoanInterestRate() { return loanInterestRate; }
    public int getMaxLoanDuration() { return maxLoanDuration; }
    public boolean isCollateralRequired() { return collateralRequired; }
    public double getCollateralPercentage() { return collateralPercentage; }
    public boolean isShopEnabled() { return shopEnabled; }
    public int getMaxShopsPerPlayer() { return maxShopsPerPlayer; }
    public double getTaxRate() { return taxRate; }
    public boolean isServerShopsEnabled() { return serverShopsEnabled; }
    public boolean isTransactionsEnabled() { return transactionsEnabled; }
    public int getMaxHistory() { return maxHistory; }
    public boolean isLogToFile() { return logToFile; }
    public String getLogFile() { return logFile; }
    public int getCooldown(String action) { return cooldowns.getOrDefault(action, 0); }
    public boolean isPlaceholderEnabled() { return placeholderEnabled; }
    public boolean isDashboardEnabled() { return dashboardEnabled; }
    public int getDashboardPort() { return dashboardPort; }
    public String getDashboardApiKey() { return dashboardApiKey; }
}
