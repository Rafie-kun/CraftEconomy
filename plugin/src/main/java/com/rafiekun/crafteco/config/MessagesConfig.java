package com.rafiekun.crafteco.config;

import com.rafiekun.crafteco.CraftEconomy;
import org.bukkit.ChatColor;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class MessagesConfig {

    private final CraftEconomy plugin;
    private FileConfiguration messagesConfig;
    private File messagesFile;
    private final Map<String, String> cache = new HashMap<>();

    public MessagesConfig(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    public void load() {
        messagesFile = new File(plugin.getDataFolder(), "messages.yml");
        if (!messagesFile.exists()) {
            plugin.saveResource("messages.yml", false);
        }
        messagesConfig = YamlConfiguration.loadConfiguration(messagesFile);

        // Load defaults from jar
        InputStream defConfigStream = plugin.getResource("messages.yml");
        if (defConfigStream != null) {
            YamlConfiguration defConfig = YamlConfiguration.loadConfiguration(
                    new InputStreamReader(defConfigStream, StandardCharsets.UTF_8));
            messagesConfig.setDefaults(defConfig);
        }

        cache.clear();
        for (String key : messagesConfig.getKeys(true)) {
            if (messagesConfig.isString(key)) {
                cache.put(key, translate(messagesConfig.getString(key)));
            }
        }
    }

    public String get(String key, String... replacements) {
        String message = cache.getOrDefault(key, "&cMissing message: " + key);
        for (int i = 0; i < replacements.length - 1; i += 2) {
            message = message.replace(replacements[i], replacements[i + 1]);
        }
        return message;
    }

    public String getPrefixed(String key, String... replacements) {
        String prefix = get("prefix");
        return prefix + get(key, replacements);
    }

    public void sendMessage(org.bukkit.entity.Player player, String key, String... replacements) {
        player.sendMessage(getPrefixed(key, replacements));
    }

    private String translate(String text) {
        return ChatColor.translateAlternateColorCodes('&', text);
    }

    public void reload() {
        load();
    }
}
