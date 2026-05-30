var lootAmountList = [];
var lootCategoryList = [];
var ledgerNotesList = [];
var accountList = [];
var typeList = [];

var inHandWallet = 64;
var enderChestBank = 256;
var phantomDangerLimit = 150;

var typeDropdown = document.getElementById("typeDropdown");
var accountDropdown = document.getElementById("accountDropdown");
var categoryDropdown = document.getElementById("categoryDropdown");
var expenseInput = document.getElementById("expenseInput");
var descriptionInput = document.getElementById("descriptionInput");
var reserveInput = document.getElementById("reserveInput");
var themeDropdown = document.getElementById("themeDropdown");
var addExpenseBtn = document.getElementById("addExpenseBtn");
var resetBtn = document.getElementById("resetBtn");
var totalDisplay = document.getElementById("totalDisplay");
var ledgerDisplay = document.getElementById("ledgerDisplay");
var statusMessage = document.getElementById("statusMessage");
var walletSpentDisplay = document.getElementById("walletSpentDisplay");
var bankSpentDisplay = document.getElementById("bankSpentDisplay");
var walletRemainingDisplay = document.getElementById("walletRemainingDisplay");
var bankRemainingDisplay = document.getElementById("bankRemainingDisplay");
var totalSpentDisplay = document.getElementById("totalSpentDisplay");
var totalRemainingDisplay = document.getElementById("totalRemainingDisplay");

function formatEmeralds(amount) {
  return amount.toFixed(2) + " Emeralds";
}

function setStatus(text, safeMode) {
  statusMessage.textContent = text;
  statusMessage.classList.toggle("safe", safeMode);
  statusMessage.classList.toggle("danger", !safeMode);
}

function applyTheme(themeName) {
  var root = document.documentElement.style;

  if (themeName === "Overworld") {
    root.setProperty("--bg", "#d9f2c7");
    root.setProperty("--card", "rgba(255,255,255,0.88)");
    root.setProperty("--text", "#20311f");
    root.setProperty("--muted", "#5a6b58");
    root.setProperty("--primary", "#55ff55");
    root.setProperty("--primary-text", "#1b1b1b");
    root.setProperty("--safe", "#55ff55");
    root.setProperty("--danger", "#ff5555");
  } else if (themeName === "Cave Night") {
    root.setProperty("--bg", "#121212");
    root.setProperty("--card", "rgba(28,28,28,0.92)");
    root.setProperty("--text", "#e7e7e7");
    root.setProperty("--muted", "#b7b7b7");
    root.setProperty("--primary", "#4c6fff");
    root.setProperty("--primary-text", "#ffffff");
    root.setProperty("--safe", "#55ff55");
    root.setProperty("--danger", "#ff5555");
  } else if (themeName === "Phantom Attack") {
    root.setProperty("--bg", "#2a0e15");
    root.setProperty("--card", "rgba(40,16,23,0.94)");
    root.setProperty("--text", "#ffe6e6");
    root.setProperty("--muted", "#ffbbbb");
    root.setProperty("--primary", "#ff5555");
    root.setProperty("--primary-text", "#ffffff");
    root.setProperty("--safe", "#55ff55");
    root.setProperty("--danger", "#ff5555");
  }
}

function refreshLedgerDisplay() {
  var visualScrollText = "=== ADVENTURER BOOK & QUILL LEDGER ===\n\n";

  for (var i = 0; i < lootAmountList.length; i++) {
    visualScrollText +=
      "[" + typeList[i] + "] " +
      lootCategoryList[i] + " | " +
      ledgerNotesList[i] + " | " +
      (lootAmountList[i] >= 0 ? "+" : "") +
      formatEmeralds(lootAmountList[i]) + " | " +
      accountList[i] + "\n";
  }

  ledgerDisplay.value = visualScrollText;
}

function refreshTotals() {
  totalDisplay.textContent = "Wallet: " + formatEmeralds(inHandWallet) + " | Ender Chest: " + formatEmeralds(enderChestBank);
}

function updateSurvivalLedger(maxExpenseAllowed) {
  var totalEmeraldsSpent = 0;
  var walletSpent = 0;
  var bankSpent = 0;

  for (var i = 0; i < lootAmountList.length; i++) {
    if (lootAmountList[i] < 0) {
      totalEmeraldsSpent += Math.abs(lootAmountList[i]);

      if (accountList[i] === "In-Hand Wallet 💰") {
        walletSpent += Math.abs(lootAmountList[i]);
      } else if (accountList[i] === "Ender Bank 🏦") {
        bankSpent += Math.abs(lootAmountList[i]);
      }
    }
  }

  var walletRemaining = inHandWallet;
  var bankRemaining = enderChestBank;
  var totalRemaining = walletRemaining + bankRemaining;

  walletSpentDisplay.textContent = "In-Hand Wallet Spent: " + formatEmeralds(walletSpent);
  bankSpentDisplay.textContent = "Ender Chest Spent: " + formatEmeralds(bankSpent);
  walletRemainingDisplay.textContent = "In-Hand Wallet: " + formatEmeralds(walletRemaining);
  bankRemainingDisplay.textContent = "Ender Chest: " + formatEmeralds(bankRemaining);
  totalSpentDisplay.textContent = "Total Spent: " + formatEmeralds(totalEmeraldsSpent);
  totalRemainingDisplay.textContent = "Emeralds Remaining: " + formatEmeralds(totalRemaining);
  refreshTotals();
  refreshLedgerDisplay();

  if (totalEmeraldsSpent > maxExpenseAllowed) {
    setStatus("⚠️ PHANTOM ATTACK DANGER! Total expenses are too high!", false);
  } else {
    setStatus("🛡️ Inventory secure. Resource levels look safe from threats.", true);
  }
}

themeDropdown.addEventListener("change", function() {
  applyTheme(themeDropdown.value);
});

addExpenseBtn.addEventListener("click", function() {
  var actionSelected = typeDropdown.value;
  var emeraldCount = Number(expenseInput.value);
  var itemCategory = categoryDropdown.value;
  var itemDescription = descriptionInput.value.trim();
  var accountSelected = accountDropdown.value;
  var reserveGoal = Number(reserveInput.value);

  if (!Number.isFinite(emeraldCount) || emeraldCount <= 0) {
    setStatus("Enter a valid Emerald amount.", false);
    return;
  }

  if (!Number.isFinite(reserveGoal) || reserveGoal <= 0) {
    setStatus("Enter a valid Emerald reserve goal.", false);
    return;
  }

  if (actionSelected === "Expense") {
    if (accountSelected === "In-Hand Wallet 💰") {
      inHandWallet -= emeraldCount;
    } else if (accountSelected === "Ender Bank 🏦") {
      enderChestBank -= emeraldCount;
    }

    lootAmountList.push(-emeraldCount);
    lootCategoryList.push(itemCategory);
    ledgerNotesList.push(itemDescription || "Purchased item");
    accountList.push(accountSelected);
    typeList.push(actionSelected);
  } else if (actionSelected === "Income") {
    if (accountSelected === "In-Hand Wallet 💰") {
      inHandWallet += emeraldCount;
    } else if (accountSelected === "Ender Bank 🏦") {
      enderChestBank += emeraldCount;
    }

    lootAmountList.push(emeraldCount);
    lootCategoryList.push("Mined Loot 💎");
    ledgerNotesList.push(itemDescription || "Income received");
    accountList.push(accountSelected);
    typeList.push(actionSelected);
  } else if (actionSelected === "Transfer") {
    if (accountSelected === "In-Hand Wallet 💰" && inHandWallet >= emeraldCount) {
      inHandWallet -= emeraldCount;
      enderChestBank += emeraldCount;
      lootAmountList.push(emeraldCount);
      lootCategoryList.push("Vault Shift 🔄");
      ledgerNotesList.push("Moved Pockets -> Ender Chest");
      accountList.push("In-Hand Wallet 💰 -> Ender Bank 🏦");
      typeList.push(actionSelected);
    } else if (accountSelected === "Ender Bank 🏦" && enderChestBank >= emeraldCount) {
      enderChestBank -= emeraldCount;
      inHandWallet += emeraldCount;
      lootAmountList.push(emeraldCount);
      lootCategoryList.push("Vault Shift 🔄");
      ledgerNotesList.push("Moved Ender Chest -> Pockets");
      accountList.push("Ender Bank 🏦 -> In-Hand Wallet 💰");
      typeList.push(actionSelected);
    } else {
      setStatus("You do not have enough Emeralds for that transfer.", false);
      return;
    }
  }

  expenseInput.value = "";
  descriptionInput.value = "";
  updateSurvivalLedger(phantomDangerLimit);
});

resetBtn.addEventListener("click", function() {
  lootAmountList = [];
  lootCategoryList = [];
  ledgerNotesList = [];
  accountList = [];
  typeList = [];
  inHandWallet = 64;
  enderChestBank = 256;

  expenseInput.value = "";
  descriptionInput.value = "";
  ledgerDisplay.value = "--- LEDGER RESET ---";
  refreshTotals();
  walletSpentDisplay.textContent = "In-Hand Wallet Spent: 0.00 Emeralds";
  bankSpentDisplay.textContent = "Ender Chest Spent: 0.00 Emeralds";
  walletRemainingDisplay.textContent = "In-Hand Wallet: 64.00 Emeralds";
  bankRemainingDisplay.textContent = "Ender Chest: 256.00 Emeralds";
  totalSpentDisplay.textContent = "Total Spent: 0.00 Emeralds";
  totalRemainingDisplay.textContent = "Emeralds Remaining: 320.00 Emeralds";
  setStatus("World reloaded! Log your items.", true);
  applyTheme(themeDropdown.value);
});

applyTheme(themeDropdown.value);
refreshTotals();
refreshLedgerDisplay();
setStatus("Set your Emerald reserve and begin tracking.", true);
