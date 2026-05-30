// =================================================================
// CRAFTECONOMY: MINECRAFT MINING LEDGER & INVENTORY TRACKER
// =================================================================

// AP CSP data abstraction: parallel arrays
var lootAmountList = [];    // Stores positive income and negative expense values
var lootCategoryList = [];   // Stores item categories
var ledgerNotesList = [];    // Stores user-entered descriptions
var accountList = [];        // Stores where each transaction belongs
var typeList = [];           // Stores transaction type

// Starting resource balances
var inHandWallet = 64;
var enderChestBank = 256;
var phantomDangerLimit = 150;

// ---------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------
function formatEmeralds(amount) {
  return amount.toFixed(2) + " Emeralds";
}

function refreshTotals() {
  setText("totalDisplay", "Wallet: " + inHandWallet + " 🟩 | Ender Chest: " + enderChestBank + " 🏦");
}

function applyTheme(themeName) {
  if (themeName == "Overworld") {
    setProperty("screen1", "background-color", "#D9F2C7");
    setProperty("titleLabel", "text-color", "#2E7D32");
    setProperty("addExpenseBtn", "background-color", "#55FF55");
    setProperty("addExpenseBtn", "text-color", "#1B1B1B");
    setProperty("statusMessage", "text-color", "#2E7D32");
  } else if (themeName == "Cave Night") {
    setProperty("screen1", "background-color", "#1E1E1E");
    setProperty("titleLabel", "text-color", "#E0E0E0");
    setProperty("addExpenseBtn", "background-color", "#4C6FFF");
    setProperty("addExpenseBtn", "text-color", "#FFFFFF");
    setProperty("statusMessage", "text-color", "#C8C8C8");
  } else if (themeName == "Phantom Attack") {
    setProperty("screen1", "background-color", "#2A0E15");
    setProperty("titleLabel", "text-color", "#FF5555");
    setProperty("addExpenseBtn", "background-color", "#FF5555");
    setProperty("addExpenseBtn", "text-color", "#FFFFFF");
    setProperty("statusMessage", "text-color", "#FFAAAA");
  }
}

function refreshLedgerDisplay() {
  var visualScrollText = "=== ADVENTURER BOOK & QUILL LEDGER ===\n\n";

  for (var i = 0; i < lootAmountList.length; i++) {
    visualScrollText = visualScrollText +
      "[" + typeList[i] + "] " +
      lootCategoryList[i] + " | " +
      ledgerNotesList[i] + " | " +
      (lootAmountList[i] >= 0 ? "+" : "") +
      formatEmeralds(lootAmountList[i]) + " | " +
      accountList[i] + "\n";
  }

  setText("ledgerDisplay", visualScrollText);
}

// ---------------------------------------------------------------
// Student-developed procedure
// ---------------------------------------------------------------
function updateSurvivalLedger(maxExpenseAllowed) {
  // Sequencing: recalculate from scratch each time
  var totalEmeraldsSpent = 0;
  var walletSpent = 0;
  var bankSpent = 0;

  // Iteration: walk through every stored transaction
  for (var i = 0; i < lootAmountList.length; i++) {
    if (lootAmountList[i] < 0) {
      totalEmeraldsSpent = totalEmeraldsSpent + Math.abs(lootAmountList[i]);

      if (accountList[i] == "In-Hand Wallet 💰") {
        walletSpent = walletSpent + Math.abs(lootAmountList[i]);
      } else if (accountList[i] == "Ender Bank 🏦") {
        bankSpent = bankSpent + Math.abs(lootAmountList[i]);
      }
    }
  }

  var walletRemaining = inHandWallet;
  var bankRemaining = enderChestBank;
  var totalRemaining = walletRemaining + bankRemaining;

  // Output updates
  setText("walletSpentDisplay", "In-Hand Wallet Spent: " + formatEmeralds(walletSpent));
  setText("bankSpentDisplay", "Ender Chest Spent: " + formatEmeralds(bankSpent));
  setText("walletRemainingDisplay", "In-Hand Wallet: " + formatEmeralds(walletRemaining));
  setText("bankRemainingDisplay", "Ender Chest: " + formatEmeralds(bankRemaining));
  setText("totalSpentDisplay", "Total Spent: " + formatEmeralds(totalEmeraldsSpent));
  setText("totalRemainingDisplay", "Emeralds Remaining: " + formatEmeralds(totalRemaining));
  refreshTotals();
  refreshLedgerDisplay();

  // Selection: phantom warning vs safe state
  if (totalEmeraldsSpent > maxExpenseAllowed) {
    setText("statusMessage", "⚠️ PHANTOM ATTACK DANGER! Total expenses are too high!");
    setProperty("statusMessage", "text-color", "#FF5555");
    setProperty("statusMessage", "font-weight", "bold");
  } else {
    setText("statusMessage", "🛡️ Inventory secure. Resource levels look safe from threats.");
    setProperty("statusMessage", "text-color", "#55FF55");
    setProperty("statusMessage", "font-weight", "normal");
  }
}

// ---------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------
applyTheme("Overworld");
setText("ledgerDisplay", "--- LEDGER READY ---");
refreshTotals();
setText("walletSpentDisplay", "In-Hand Wallet Spent: 0.00 Emeralds");
setText("bankSpentDisplay", "Ender Chest Spent: 0.00 Emeralds");
setText("walletRemainingDisplay", "In-Hand Wallet: 64.00 Emeralds");
setText("bankRemainingDisplay", "Ender Chest: 256.00 Emeralds");
setText("totalSpentDisplay", "Total Spent: 0.00 Emeralds");
setText("totalRemainingDisplay", "Emeralds Remaining: 320.00 Emeralds");
setText("statusMessage", "Set your Emerald reserve and begin tracking.");
setProperty("statusMessage", "font-weight", "normal");

// ---------------------------------------------------------------
// Theme selection
// ---------------------------------------------------------------
onEvent("themeDropdown", "change", function() {
  applyTheme(getText("themeDropdown"));
});

// ---------------------------------------------------------------
// Transaction entry
// ---------------------------------------------------------------
onEvent("addExpenseBtn", "click", function() {
  var actionSelected = getText("typeDropdown");
  var emeraldCount = getNumber("expenseInput");
  var itemCategory = getText("categoryDropdown");
  var itemDescription = getText("descriptionInput");
  var accountSelected = getText("accountDropdown");

  if (emeraldCount > 0) {
    if (actionSelected == "Expense") {
      if (accountSelected == "In-Hand Wallet 💰") {
        inHandWallet = inHandWallet - emeraldCount;
      } else if (accountSelected == "Ender Bank 🏦") {
        enderChestBank = enderChestBank - emeraldCount;
      }

      appendItem(lootAmountList, -emeraldCount);
      appendItem(lootCategoryList, itemCategory);
      appendItem(ledgerNotesList, itemDescription);
      appendItem(accountList, accountSelected);
      appendItem(typeList, actionSelected);

    } else if (actionSelected == "Income") {
      if (accountSelected == "In-Hand Wallet 💰") {
        inHandWallet = inHandWallet + emeraldCount;
      } else if (accountSelected == "Ender Bank 🏦") {
        enderChestBank = enderChestBank + emeraldCount;
      }

      appendItem(lootAmountList, emeraldCount);
      appendItem(lootCategoryList, "Mined Loot 💎");
      appendItem(ledgerNotesList, itemDescription);
      appendItem(accountList, accountSelected);
      appendItem(typeList, actionSelected);

    } else if (actionSelected == "Transfer") {
      if (accountSelected == "In-Hand Wallet 💰" && inHandWallet >= emeraldCount) {
        inHandWallet = inHandWallet - emeraldCount;
        enderChestBank = enderChestBank + emeraldCount;
        appendItem(lootAmountList, emeraldCount);
        appendItem(lootCategoryList, "Vault Shift 🔄");
        appendItem(ledgerNotesList, "Moved Pockets -> Ender Chest");
        appendItem(accountList, "In-Hand Wallet 💰 -> Ender Bank 🏦");
        appendItem(typeList, actionSelected);
      } else if (accountSelected == "Ender Bank 🏦" && enderChestBank >= emeraldCount) {
        enderChestBank = enderChestBank - emeraldCount;
        inHandWallet = inHandWallet + emeraldCount;
        appendItem(lootAmountList, emeraldCount);
        appendItem(lootCategoryList, "Vault Shift 🔄");
        appendItem(ledgerNotesList, "Moved Ender Chest -> Pockets");
        appendItem(accountList, "Ender Bank 🏦 -> In-Hand Wallet 💰");
        appendItem(typeList, actionSelected);
      } else {
        setText("statusMessage", "You do not have enough Emeralds for that transfer.");
        setProperty("statusMessage", "text-color", "#FF5555");
        setProperty("statusMessage", "font-weight", "bold");
        return;
      }
    }

    setText("expenseInput", "");
    setText("descriptionInput", "");
    updateSurvivalLedger(phantomDangerLimit);
  } else {
    setText("statusMessage", "Enter a valid Emerald amount.");
    setProperty("statusMessage", "text-color", "#FF5555");
    setProperty("statusMessage", "font-weight", "bold");
  }
});

// ---------------------------------------------------------------
// Reset data
// ---------------------------------------------------------------
onEvent("resetBtn", "click", function() {
  lootAmountList = [];
  lootCategoryList = [];
  ledgerNotesList = [];
  accountList = [];
  typeList = [];
  inHandWallet = 64;
  enderChestBank = 256;

  setText("expenseInput", "");
  setText("descriptionInput", "");
  setText("ledgerDisplay", "--- LEDGER RESET ---");
  refreshTotals();
  setText("walletSpentDisplay", "In-Hand Wallet Spent: 0.00 Emeralds");
  setText("bankSpentDisplay", "Ender Chest Spent: 0.00 Emeralds");
  setText("walletRemainingDisplay", "In-Hand Wallet: 64.00 Emeralds");
  setText("bankRemainingDisplay", "Ender Chest: 256.00 Emeralds");
  setText("totalSpentDisplay", "Total Spent: 0.00 Emeralds");
  setText("totalRemainingDisplay", "Emeralds Remaining: 320.00 Emeralds");
  setText("statusMessage", "World reloaded! Log your items.");
  setProperty("statusMessage", "text-color", "#AAAAAA");
  setProperty("statusMessage", "font-weight", "normal");
  applyTheme(getText("themeDropdown"));
});
