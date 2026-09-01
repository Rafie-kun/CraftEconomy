package com.rafiekun.crafteco.account;

import java.util.UUID;

public class Account {

    private final UUID uuid;
    private String name;
    private double balance;
    private double savings;
    private double fixedDeposit;
    private int fixedDepositTerm;
    private long fixedDepositStart;
    private double loanAmount;
    private double loanInterest;
    private long loanStart;
    private long createdAt;
    private long updatedAt;

    public Account(UUID uuid, String name, double balance, double savings,
                   double fixedDeposit, int fixedDepositTerm, long fixedDepositStart,
                   double loanAmount, double loanInterest, long loanStart,
                   long createdAt, long updatedAt) {
        this.uuid = uuid;
        this.name = name;
        this.balance = balance;
        this.savings = savings;
        this.fixedDeposit = fixedDeposit;
        this.fixedDepositTerm = fixedDepositTerm;
        this.fixedDepositStart = fixedDepositStart;
        this.loanAmount = loanAmount;
        this.loanInterest = loanInterest;
        this.loanStart = loanStart;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Account(UUID uuid, String name, double startingBalance) {
        this(uuid, name, startingBalance, 0, 0, 0, 0, 0, 0, 0,
                System.currentTimeMillis(), System.currentTimeMillis());
    }

    // Getters and Setters
    public UUID getUuid() { return uuid; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getBalance() { return balance; }
    public void setBalance(double balance) {
        this.balance = balance;
        this.updatedAt = System.currentTimeMillis();
    }

    public double getSavings() { return savings; }
    public void setSavings(double savings) {
        this.savings = savings;
        this.updatedAt = System.currentTimeMillis();
    }

    public double getFixedDeposit() { return fixedDeposit; }
    public void setFixedDeposit(double fixedDeposit) {
        this.fixedDeposit = fixedDeposit;
        this.updatedAt = System.currentTimeMillis();
    }

    public int getFixedDepositTerm() { return fixedDepositTerm; }
    public void setFixedDepositTerm(int fixedDepositTerm) { this.fixedDepositTerm = fixedDepositTerm; }

    public long getFixedDepositStart() { return fixedDepositStart; }
    public void setFixedDepositStart(long fixedDepositStart) { this.fixedDepositStart = fixedDepositStart; }

    public double getLoanAmount() { return loanAmount; }
    public void setLoanAmount(double loanAmount) {
        this.loanAmount = loanAmount;
        this.updatedAt = System.currentTimeMillis();
    }

    public double getLoanInterest() { return loanInterest; }
    public void setLoanInterest(double loanInterest) { this.loanInterest = loanInterest; }

    public long getLoanStart() { return loanStart; }
    public void setLoanStart(long loanStart) { this.loanStart = loanStart; }

    public long getCreatedAt() { return createdAt; }
    public long getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(long updatedAt) { this.updatedAt = updatedAt; }

    public double getTotalWealth() {
        return balance + savings + fixedDeposit;
    }

    public double getTotalDebt() {
        if (loanAmount <= 0) return 0;
        long elapsed = System.currentTimeMillis() - loanStart;
        double hoursElapsed = elapsed / (1000.0 * 60 * 60);
        return loanAmount * Math.pow(1 + loanInterest, hoursElapsed);
    }
}
