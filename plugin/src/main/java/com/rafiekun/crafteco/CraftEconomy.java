package com.rafiekun.crafteco;

import com.rafiekun.crafteco.account.AccountManager;
import com.rafiekun.crafteco.bank.BankManager;
import com.rafiekun.crafteco.config.ConfigManager;
import com.rafiekun.crafteco.config.MessagesConfig;
import com.rafiekun.crafteco.economy.EconomyManager;
import com.rafiekun.crafteco.economy.TransactionLogger;
import com.rafiekun.crafteco.hooks.PlaceholderHook;
import com.rafiekun.crafteco.listeners.PlayerListener;
import com.rafiekun.crafteco.shop.ShopManager;
import com.rafiekun.crafteco.storage.DatabaseManager;
import com.rafiekun.crafteco.tasks.InterestTask;
import com.rafiekun.crafteco.dashboard.DashboardServer;
import org.bukkit.plugin.java.JavaPlugin;

public final class CraftEconomy extends JavaPlugin {

    private static CraftEconomy instance;
    private ConfigManager configManager;
    private MessagesConfig messagesConfig;
    private DatabaseManager databaseManager;
    private AccountManager accountManager;
    private EconomyManager economyManager;
    private TransactionLogger transactionLogger;
    private BankManager bankManager;
    private ShopManager shopManager;
    private DashboardServer dashboardServer;

    @Override
    public void onEnable() {
        instance = this;

        saveDefaultConfig();
        saveResource("messages.yml", false);

        configManager = new ConfigManager(this);
        messagesConfig = new MessagesConfig(this);
        messagesConfig.load();

        databaseManager = new DatabaseManager(this);
        if (!databaseManager.connect()) {
            getLogger().severe("Failed to connect to database! Disabling plugin.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        accountManager = new AccountManager(this);
        economyManager = new EconomyManager(this);
        transactionLogger = new TransactionLogger(this);
        bankManager = new BankManager(this);
        shopManager = new ShopManager(this);

        registerCommands();
        registerListeners();
        registerHooks();
        startTasks();

        // Start dashboard server
        dashboardServer = new DashboardServer(this);
        dashboardServer.start();

        getLogger().info("CraftEconomy v" + getDescription().getVersion() + " enabled!");
    }

    @Override
    public void onDisable() {
        if (dashboardServer != null) {
            dashboardServer.stop();
        }
        if (accountManager != null) {
            accountManager.saveAll();
        }
        if (databaseManager != null) {
            databaseManager.disconnect();
        }
        getLogger().info("CraftEconomy disabled.");
    }

    private void registerCommands() {
        getCommand("balance").setExecutor(new com.rafiekun.crafteco.commands.BalanceCommand(this));
        getCommand("pay").setExecutor(new com.rafiekun.crafteco.commands.PayCommand(this));
        getCommand("eco").setExecutor(new com.rafiekun.crafteco.commands.EcoCommand(this));
        getCommand("bank").setExecutor(new com.rafiekun.crafteco.commands.BankCommand(this));
        getCommand("shop").setExecutor(new com.rafiekun.crafteco.commands.ShopCommand(this));
        getCommand("transactions").setExecutor(new com.rafiekun.crafteco.commands.TransactionsCommand(this));
        getCommand("crafteco").setExecutor(new com.rafiekun.crafteco.commands.CraftEcoCommand(this));
    }

    private void registerListeners() {
        getServer().getPluginManager().registerEvents(new PlayerListener(this), this);
    }

    private void registerHooks() {
        if (getServer().getPluginManager().getPlugin("PlaceholderAPI") != null) {
            new PlaceholderHook(this).register();
            getLogger().info("PlaceholderAPI integration enabled.");
        }
    }

    private void startTasks() {
        if (configManager.isBankEnabled()) {
            new InterestTask(this).runTaskTimer(this, 1200L, 1200L); // every minute (20 ticks * 60)
        }
    }

    public static CraftEconomy getInstance() {
        return instance;
    }

    public ConfigManager getConfigManager() {
        return configManager;
    }

    public MessagesConfig getMessagesConfig() {
        return messagesConfig;
    }

    public DatabaseManager getDatabaseManager() {
        return databaseManager;
    }

    public AccountManager getAccountManager() {
        return accountManager;
    }

    public EconomyManager getEconomyManager() {
        return economyManager;
    }

    public TransactionLogger getTransactionLogger() {
        return transactionLogger;
    }

    public BankManager getBankManager() {
        return bankManager;
    }

    public ShopManager getShopManager() {
        return shopManager;
    }

    public DashboardServer getDashboardServer() {
        return dashboardServer;
    }
}
