package com.rafiekun.crafteco.economy;

public enum TransactionType {
    DEPOSIT("Deposit"),
    WITHDRAW("Withdraw"),
    TRANSFER_IN("Transfer In"),
    TRANSFER_OUT("Transfer Out"),
    ADMIN_GIVE("Admin Give"),
    ADMIN_TAKE("Admin Take"),
    ADMIN_SET("Admin Set"),
    BANK_DEPOSIT("Bank Deposit"),
    BANK_WITHDRAW("Bank Withdraw"),
    BANK_INTEREST("Bank Interest"),
    LOAN_TAKEN("Loan Taken"),
    LOAN_REPAID("Loan Repaid"),
    SHOP_PURCHASE("Shop Purchase"),
    SHOP_SALE("Shop Sale"),
    SHOP_TAX("Shop Tax");

    private final String displayName;

    TransactionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
