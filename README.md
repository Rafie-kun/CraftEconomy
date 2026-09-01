# CraftEconomy

A full-featured Minecraft server economy plugin with a web dashboard.

## Features

- **Multi-currency support** — Emeralds, Diamonds, Gold, custom currencies
- **Player & server shops** — Physical sign-based shops and server-run shops
- **Banking system** — Savings accounts, loans, interest, fixed deposits
- **Transaction logging** — Full audit trail of all economic activity
- **PlaceholderAPI integration** — Display balances in scoreboards, tab lists, etc.
- **Web dashboard** — Real-time server economy overview with Minecraft-themed UI
- **Permission-based** — Full permission node system for all commands

## Project Structure

```
CraftEconomy/
├── plugin/          # Spigot/Paper Java plugin
│   └── src/main/
│       ├── java/com/rafiekun/crafteco/
│       └── resources/
└── dashboard/       # React web dashboard
    └── src/
```

## Building

### Plugin
```bash
cd plugin
mvn clean package
# Output: plugin/target/CraftEconomy-1.0.0.jar
```

### Dashboard
```bash
cd dashboard
npm install
npm run build
# Output: dashboard/dist/
```

## Configuration

Copy `plugin/src/main/resources/config.yml` to your server's `plugins/CraftEconomy/` folder and edit.

## Commands

| Command | Description | Permission |
|---------|-------------|------------|
| `/balance` | Check your balance | `crafteco.balance` |
| `/pay <player> <amount>` | Send money to a player | `crafteco.pay` |
| `/eco <give\|take\|set> <player> <amount>` | Manage player balances | `crafteco.admin.eco` |
| `/bank <subcommand>` | Banking operations | `crafteco.bank` |
| `/shop <subcommand>` | Shop management | `crafteco.shop` |
| `/transactions` | View transaction history | `crafteco.history` |

## License

MIT
