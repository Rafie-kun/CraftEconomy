package com.rafiekun.crafteco.dashboard;

import com.rafiekun.crafteco.CraftEconomy;
import com.rafiekun.crafteco.account.Account;
import com.rafiekun.crafteco.economy.TransactionLogger;
import com.rafiekun.crafteco.shop.ShopManager;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.logging.Level;

public class DashboardServer {

    private final CraftEconomy plugin;
    private HttpServer server;
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();

    public DashboardServer(CraftEconomy plugin) {
        this.plugin = plugin;
    }

    public void start() {
        if (!plugin.getConfigManager().isDashboardEnabled()) return;

        int port = plugin.getConfigManager().getDashboardPort();
        try {
            server = HttpServer.create(new InetSocketAddress(port), 0);

            server.createContext("/api/health", new HealthHandler());
            server.createContext("/api/stats", new StatsHandler());
            server.createContext("/api/players", new PlayersHandler());
            server.createContext("/api/transactions", new TransactionsHandler());
            server.createContext("/api/shops", new ShopsHandler());
            server.createContext("/api/admin/setbalance", new SetBalanceHandler());

            server.setExecutor(null);
            server.start();
            plugin.getLogger().info("Dashboard API started on port " + port);
        } catch (IOException e) {
            plugin.getLogger().log(Level.SEVERE, "Failed to start dashboard server", e);
        }
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
            plugin.getLogger().info("Dashboard API stopped.");
        }
    }

    private boolean authenticate(HttpExchange exchange) {
        String apiKey = plugin.getConfigManager().getDashboardApiKey();
        if (apiKey == null || apiKey.isEmpty()) return true;

        String authHeader = exchange.getRequestHeaders().getFirst("Authorization");
        if (authHeader == null) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.contains("key=")) {
                authHeader = "Bearer " + query.split("key=")[1].split("&")[0];
            }
        }

        return authHeader != null && authHeader.equals("Bearer " + apiKey);
    }

    private void sendJson(HttpExchange exchange, Object data, int code) throws IOException {
        String json = gson.toJson(data);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(code, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendError(HttpExchange exchange, String message, int code) throws IOException {
        sendJson(exchange, Map.of("error", message), code);
    }

    // Health Check Handler
    private class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!authenticate(exchange)) { sendError(exchange, "Unauthorized", 401); return; }
            sendJson(exchange, Map.of(
                    "status", "ok",
                    "version", plugin.getDescription().getVersion(),
                    "players", plugin.getServer().getOnlinePlayers().size()
            ), 200);
        }
    }

    // Stats Handler
    private class StatsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!authenticate(exchange)) { sendError(exchange, "Unauthorized", 401); return; }

            try {
                List<Map<String, Object>> topPlayers = new ArrayList<>();
                List<Map<String, Object>> allAccounts = getAllAccounts();

                // Sort by wealth
                allAccounts.sort((a, b) -> Double.compare(
                        (double) b.get("totalWealth"), (double) a.get("totalWealth")));

                // Get top 10
                for (int i = 0; i < Math.min(10, allAccounts.size()); i++) {
                    topPlayers.add(allAccounts.get(i));
                }

                double totalWealth = allAccounts.stream().mapToDouble(a -> (double) a.get("totalWealth")).sum();
                double totalCirculation = allAccounts.stream().mapToDouble(a -> (double) a.get("balance")).sum();
                double totalSavings = allAccounts.stream().mapToDouble(a -> (double) a.get("savings")).sum();
                double totalLoans = allAccounts.stream().mapToDouble(a -> (double) a.get("loanAmount")).sum();

                // Recent transactions
                List<Map<String, Object>> recentTxs = new ArrayList<>();
                for (UUID uuid : getAllPlayerUUIDs()) {
                    List<TransactionLogger.Transaction> txs = plugin.getTransactionLogger().getTransactions(uuid, 5);
                    for (TransactionLogger.Transaction tx : txs) {
                        Map<String, Object> txMap = new HashMap<>();
                        txMap.put("id", tx.getId());
                        txMap.put("uuid", tx.getUuid().toString());
                        txMap.put("type", tx.getType().name());
                        txMap.put("amount", tx.getAmount());
                        txMap.put("balanceAfter", tx.getBalanceAfter());
                        txMap.put("description", tx.getDescription());
                        txMap.put("targetUuid", tx.getTargetUuid() != null ? tx.getTargetUuid().toString() : null);
                        txMap.put("timestamp", tx.getTimestamp());
                        recentTxs.add(txMap);
                    }
                }
                recentTxs.sort((a, b) -> Long.compare((long) b.get("timestamp"), (long) a.get("timestamp")));
                if (recentTxs.size() > 20) recentTxs = recentTxs.subList(0, 20);

                // Server shops
                List<Map<String, Object>> serverShops = new ArrayList<>();
                for (ShopManager.Shop shop : plugin.getShopManager().getAllServerShops()) {
                    serverShops.add(shopToMap(shop));
                }

                Map<String, Object> stats = new HashMap<>();
                stats.put("totalPlayers", allAccounts.size());
                stats.put("totalWealth", totalWealth);
                stats.put("totalCirculation", totalCirculation);
                stats.put("totalSavings", totalSavings);
                stats.put("totalLoans", totalLoans);
                stats.put("averageBalance", allAccounts.isEmpty() ? 0 : totalCirculation / allAccounts.size());
                stats.put("richestPlayer", topPlayers.isEmpty() ? null : topPlayers.get(0));
                stats.put("topPlayers", topPlayers);
                stats.put("recentTransactions", recentTxs);
                stats.put("serverShops", serverShops);

                sendJson(exchange, stats, 200);
            } catch (Exception e) {
                sendError(exchange, "Internal error", 500);
            }
        }
    }

    // Players Handler
    private class PlayersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!authenticate(exchange)) { sendError(exchange, "Unauthorized", 401); return; }

            String path = exchange.getRequestURI().getPath();
            if (path.contains("/api/players/") && path.length() > "/api/players/".length()) {
                // Single player
                String uuid = path.substring("/api/players/".length());
                Account account = plugin.getAccountManager().getAccount(UUID.fromString(uuid));
                if (account == null) { sendError(exchange, "Player not found", 404); return; }
                sendJson(exchange, accountToMap(account), 200);
            } else {
                // All players
                sendJson(exchange, getAllAccounts(), 200);
            }
        }
    }

    // Transactions Handler
    private class TransactionsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!authenticate(exchange)) { sendError(exchange, "Unauthorized", 401); return; }

            String query = exchange.getRequestURI().getQuery();
            String uuidParam = null;
            int page = 1;

            if (query != null) {
                for (String param : query.split("&")) {
                    String[] kv = param.split("=");
                    if (kv.length == 2) {
                        if (kv[0].equals("uuid")) uuidParam = kv[1];
                        if (kv[0].equals("page")) page = Integer.parseInt(kv[1]);
                    }
                }
            }

            List<Map<String, Object>> allTxs = new ArrayList<>();
            List<UUID> uuids = uuidParam != null ? List.of(UUID.fromString(uuidParam)) : getAllPlayerUUIDs();

            for (UUID uuid : uuids) {
                List<TransactionLogger.Transaction> txs = plugin.getTransactionLogger().getTransactions(uuid, page, 20);
                for (TransactionLogger.Transaction tx : txs) {
                    Map<String, Object> txMap = new HashMap<>();
                    txMap.put("id", tx.getId());
                    txMap.put("uuid", tx.getUuid().toString());
                    txMap.put("type", tx.getType().name());
                    txMap.put("amount", tx.getAmount());
                    txMap.put("balanceAfter", tx.getBalanceAfter());
                    txMap.put("description", tx.getDescription());
                    txMap.put("targetUuid", tx.getTargetUuid() != null ? tx.getTargetUuid().toString() : null);
                    txMap.put("timestamp", tx.getTimestamp());
                    allTxs.add(txMap);
                }
            }

            allTxs.sort((a, b) -> Long.compare((long) b.get("timestamp"), (long) a.get("timestamp")));
            sendJson(exchange, allTxs, 200);
        }
    }

    // Shops Handler
    private class ShopsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!authenticate(exchange)) { sendError(exchange, "Unauthorized", 401); return; }

            List<Map<String, Object>> shops = new ArrayList<>();
            for (ShopManager.Shop shop : plugin.getShopManager().getAllServerShops()) {
                shops.add(shopToMap(shop));
            }
            for (UUID uuid : getAllPlayerUUIDs()) {
                for (ShopManager.Shop shop : plugin.getShopManager().getPlayerShops(uuid)) {
                    shops.add(shopToMap(shop));
                }
            }
            sendJson(exchange, shops, 200);
        }
    }

    // Set Balance Handler
    private class SetBalanceHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!authenticate(exchange)) { sendError(exchange, "Unauthorized", 401); return; }
            if (!exchange.getRequestMethod().equals("POST")) { sendError(exchange, "Method not allowed", 405); return; }

            try (Reader reader = new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8)) {
                Map<String, Object> body = gson.fromJson(reader, Map.class);
                String uuid = (String) body.get("uuid");
                double amount = ((Number) body.get("amount")).doubleValue();

                boolean success = plugin.getEconomyManager().setBalance(UUID.fromString(uuid), amount);
                sendJson(exchange, Map.of("success", success), success ? 200 : 400);
            }
        }
    }

    // Helper methods
    private List<Map<String, Object>> getAllAccounts() {
        List<Map<String, Object>> accounts = new ArrayList<>();
        for (UUID uuid : getAllPlayerUUIDs()) {
            Account account = plugin.getAccountManager().getAccount(uuid);
            if (account != null) {
                accounts.add(accountToMap(account));
            }
        }
        return accounts;
    }

    private Map<String, Object> accountToMap(Account account) {
        Map<String, Object> map = new HashMap<>();
        map.put("uuid", account.getUuid().toString());
        map.put("name", account.getName());
        map.put("balance", account.getBalance());
        map.put("savings", account.getSavings());
        map.put("fixedDeposit", account.getFixedDeposit());
        map.put("loanAmount", account.getLoanAmount());
        map.put("loanDebt", account.getTotalDebt());
        map.put("totalWealth", account.getTotalWealth());
        map.put("createdAt", account.getCreatedAt());
        map.put("updatedAt", account.getUpdatedAt());
        return map;
    }

    private Map<String, Object> shopToMap(ShopManager.Shop shop) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", shop.getId());
        map.put("ownerUuid", shop.getOwnerUuid().toString());
        map.put("ownerName", plugin.getServer().getOfflinePlayer(shop.getOwnerUuid()).getName());
        map.put("itemType", shop.getItemType().name());
        map.put("amount", shop.getAmount());
        map.put("price", shop.getPrice());
        map.put("stock", shop.getStock());
        map.put("isServerShop", shop.isServerShop());
        map.put("createdAt", shop.getCreatedAt());
        return map;
    }

    private List<UUID> getAllPlayerUUIDs() {
        List<UUID> uuids = new ArrayList<>();
        String table = plugin.getDatabaseManager().prefix("accounts");
        try (var conn = plugin.getDatabaseManager().getConnection();
             var stmt = conn.createStatement();
             var rs = stmt.executeQuery("SELECT uuid FROM " + table)) {
            while (rs.next()) {
                uuids.add(UUID.fromString(rs.getString("uuid")));
            }
        } catch (Exception e) {
            plugin.getLogger().warning("Failed to fetch player UUIDs for dashboard: " + e.getMessage());
        }
        return uuids;
    }
}
