package com.rafiekun.crafteco.tasks;

import com.rafiekun.crafteco.CraftEconomy;
import org.bukkit.scheduler.BukkitRunnable;

public class InterestTask extends BukkitRunnable {

    private final CraftEconomy plugin;

    public InterestTask(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    @Override
    public void run() {
        if (!plugin.getConfigManager().isBankEnabled()) {
            cancel();
            return;
        }

        plugin.getBankManager().applyInterest();
    }
}
