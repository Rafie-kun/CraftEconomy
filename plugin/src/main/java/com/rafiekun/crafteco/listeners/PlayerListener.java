package com.rafiekun.crafteco.listeners;

import com.rafiekun.crafteco.CraftEconomy;
import com.rafiekun.crafteco.account.Account;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;

public class PlayerListener implements Listener {

    private final CraftEconomy plugin;

    public PlayerListener(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        // Load or create account
        Account account = plugin.getAccountManager().getOrCreateAccount(
                event.getPlayer().getUniqueId(), event.getPlayer().getName());

        // Send balance message
        String currency = plugin.getConfigManager().getCurrencyNamePlural();
        String balance = String.format("%.2f", account.getBalance());
        event.getPlayer().sendMessage(
                plugin.getMessagesConfig().get("balance-self",
                        "{amount}", balance, "{currency}", currency));

        // Check for milestones
        if (account.getBalance() >= 10000) {
            plugin.getMessagesConfig().sendMessage(event.getPlayer(), "advancement-wealthy",
                    "{currency}", currency);
        }
        if (account.getBalance() >= 1000000) {
            plugin.getMessagesConfig().sendMessage(event.getPlayer(), "advancement-millionaire",
                    "{currency}", currency);
        }
    }

    @EventHandler
    public void onPlayerQuit(PlayerQuitEvent event) {
        // Save account on disconnect
        Account account = plugin.getAccountManager().getAccount(event.getPlayer().getUniqueId());
        if (account != null) {
            plugin.getAccountManager().saveAccount(account);
        }
    }
}
