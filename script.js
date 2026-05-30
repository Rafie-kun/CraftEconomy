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
var reserveEcho = document.getElementById("reserveEcho");

function formatEmeralds(amount) {
  return amount.toFixed(2) + " Emeralds";
}

function syncReserveEcho() {
  reserveEcho.textContent = formatEmeralds(Number(reserveInput.value || 0));
}

function setStatus(text, safeMode) {
  statusMessage.textContent = text;
  statusMessage.classList.toggle("safe", safeMode);
  statusMessage.classList.toggle("danger", !safeMode);
}

function applyTheme(themeName) {
  var root = document.documentElement.style;

  if (themeName === "Overworld") {
    root.setProperty("--bg", "#1a1f1a");
    root.setProperty("--panel", "#1b1b1b");
    root.setProperty("--panel-alt", "#141814");
    root.setProperty("--border", "#485c46");
    root.setProperty("--text", "#f0f5eb");
    root.setProperty("--muted", "#a9b5a2");
    root.setProperty("--green", "#5aac44");
    root.setProperty("--dark-green", "#3d7a2e");
    root.setProperty("--dirt", "#8b6340");
    root.setProperty("--dark-dirt", "#6b4c30");
    root.setProperty("--gold", "#ffd700");
    root.setProperty("--diamond", "#4de6e6");
    root.setProperty("--redstone", "#e03030");
  } else if (themeName === "Cave Night") {
    root.setProperty("--bg", "#101410");
    root.setProperty("--panel", "#121412");
    root.setProperty("--panel-alt", "#0f110f");
    root.setProperty("--border", "#3b4a39");
    root.setProperty("--text", "#eef6e8");
    root.setProperty("--muted", "#9db09a");
    root.setProperty("--green", "#6dc15d");
    root.setProperty("--dark-green", "#355c2b");
    root.setProperty("--dirt", "#6b5743");
    root.setProperty("--dark-dirt", "#4e3b2e");
    root.setProperty("--gold", "#d8c04a");
    root.setProperty("--diamond", "#74dede");
    root.setProperty("--redstone", "#ff6666");
  } else if (themeName === "Phantom Attack") {
    root.setProperty("--bg", "#130b0e");
    root.setProperty("--panel", "#1d1015");
    root.setProperty("--panel-alt", "#150b0e");
    root.setProperty("--border", "#603642");
    root.setProperty("--text", "#fff0f0");
    root.setProperty("--muted", "#ddb4bb");
    root.setProperty("--green", "#7fdb79");
    root.setProperty("--dark-green", "#2f522b");
    root.setProperty("--dirt", "#72503f");
    root.setProperty("--dark-dirt", "#4a3329");
    root.setProperty("--gold", "#ffb84d");
    root.setProperty("--diamond", "#83e5e5");
    root.setProperty("--redstone", "#ff6a6a");
  }
}

function refreshLedgerDisplay() {
  var text = "=== ADVENTURER BOOK & QUILL LEDGER ===\n\n";

  for (var i = 0; i < lootAmountList.length; i++) {
    text +=
      "[" + typeList[i] + "] " +
      lootCategoryList[i] + " | " +
      ledgerNotesList[i] + " | " +
      (lootAmountList[i] >= 0 ? "+" : "") +
      formatEmeralds(lootAmountList[i]) + " | " +
      accountList[i] + "\n";
  }

  ledgerDisplay.value = text;
}

function refreshTotals() {
  totalDisplay.textContent =
    "Wallet: " + formatEmeralds(inHandWallet) + " | Ender Chest: " + formatEmeralds(enderChestBank);
  syncReserveEcho();
}

function updateSurvivalLedger(maxExpenseAllowed) {
  var totalEmeraldsSpent = 0;
  var walletSpent = 0;
  var bankSpent = 0;

  for (var i = 0; i < lootAmountList.length; i++) {
    if (lootAmountList[i] < 0) {
      var spent = Math.abs(lootAmountList[i]);
      totalEmeraldsSpent += spent;

      if (accountList[i] === "In-Hand Wallet 💰") {
        walletSpent += spent;
      } else if (accountList[i] === "Ender Bank 🏦") {
        bankSpent += spent;
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
    setStatus("PHANTOM ATTACK DANGER! Total expenses are too high!", false);
  } else {
    setStatus("Inventory secure. Resource levels look safe from threats.", true);
  }
}

themeDropdown.addEventListener("change", function() {
  applyTheme(themeDropdown.value);
});

reserveInput.addEventListener("input", syncReserveEcho);

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
  walletSpentDisplay.textContent = "In-Hand Wallet Spent: 0.00 Emeralds";
  bankSpentDisplay.textContent = "Ender Chest Spent: 0.00 Emeralds";
  walletRemainingDisplay.textContent = "In-Hand Wallet: 64.00 Emeralds";
  bankRemainingDisplay.textContent = "Ender Chest: 256.00 Emeralds";
  totalSpentDisplay.textContent = "Total Spent: 0.00 Emeralds";
  totalRemainingDisplay.textContent = "Emeralds Remaining: 320.00 Emeralds";
  setStatus("World reloaded! Log your items.", true);
  refreshTotals();
  applyTheme(themeDropdown.value);
});

function fillTerrainRows() {
  var rows = [
    { id: "gr1", type: "grass-block" },
    { id: "gr2", type: "dirt-block" },
    { id: "gr3", type: "dirt-block" },
    { id: "gr4", type: "stone-block" }
  ];

  rows.forEach(function(row) {
    var el = document.getElementById(row.id);
    if (!el) return;
    el.innerHTML = "";
    var count = Math.ceil(window.innerWidth / 48) + 2;
    for (var i = 0; i < count; i++) {
      var block = document.createElement("div");
      block.className = "block " + row.type;
      el.appendChild(block);
    }
  });
}

window.addEventListener("resize", fillTerrainRows);

applyTheme(themeDropdown.value);
fillTerrainRows();
refreshTotals();
refreshLedgerDisplay();
setStatus("Set your Emerald reserve and begin tracking.", true);
