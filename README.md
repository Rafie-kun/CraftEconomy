# CraftEconomy

Minecraft-themed survival ledger and inventory tracker for Code.org App Lab.

## Core Concepts

- Money is tracked in Emeralds.
- Local wallet cash is the In-Hand Inventory.
- Secure bank storage is the Ender Chest.
- Warning state becomes a Phantom Attack Danger alert.

## Suggested App Lab IDs

- `screen1`
- `titleLabel`
- `themeDropdown`
- `addExpenseBtn`
- `typeDropdown`
- `accountDropdown`
- `categoryDropdown`
- `descriptionInput`
- `expenseInput`
- `resetBtn`
- `ledgerDisplay`
- `totalDisplay`
- `walletSpentDisplay`
- `bankSpentDisplay`
- `walletRemainingDisplay`
- `bankRemainingDisplay`
- `totalSpentDisplay`
- `totalRemainingDisplay`
- `statusMessage`

## Theme Options

Add these exact options to `themeDropdown`:

- `Overworld`
- `Cave Night`
- `Phantom Attack`

## Dropdown Options

Add these exact options to `typeDropdown`:

- `Expense`
- `Income`
- `Transfer`

Add these exact options to `accountDropdown`:

- `In-Hand Wallet 💰`
- `Ender Bank 🏦`

Add these exact options to `categoryDropdown`:

- `Food`
- `Bills`
- `Data Plans`
- `Laptop/Tech Repair`

## Contribution Notes

If you add a new theme:

1. Add the theme label to `themeDropdown` in Design Mode.
2. Add a matching `else if` block inside `applyTheme(themeName)`.
3. Reuse hex colors that fit the Minecraft palette.
4. Keep the IDs unchanged so the App Lab code continues to work.

## AP CSP Notes

The code uses:

- parallel arrays for data abstraction
- a student-developed procedure with a parameter
- iteration through the arrays
- selection with `if/else`
- visual output through `setText` and `setProperty`
