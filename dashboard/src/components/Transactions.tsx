import { useState, useEffect } from 'react'
import type { Transaction } from '../types'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(2)
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString()
}

function getTxColor(type: string): string {
  if (type.includes('IN') || type === 'DEPOSIT' || type === 'BANK_INTEREST' || type === 'SALE') return 'mc-text-green'
  if (type.includes('OUT') || type === 'WITHDRAW' || type === 'PURCHASE' || type === 'TAX') return 'mc-text-red'
  if (type.startsWith('ADMIN')) return 'mc-text-purple'
  return 'mc-text-white'
}

function getTxIcon(type: string): string {
  if (type.includes('IN') || type === 'DEPOSIT') return '+'
  if (type.includes('OUT') || type === 'WITHDRAW') return '-'
  if (type === 'BANK_INTEREST') return '*'
  if (type.startsWith('ADMIN')) return '!'
  return '~'
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [])

  async function loadTransactions() {
    try {
      const data = await fetch('/api/transactions').then(r => r.json()) as Transaction[]
      setTransactions(data)
    } catch {
      // Mock data
      const now = Date.now()
      setTransactions([
        { id: 1, uuid: '1', type: 'DEPOSIT', amount: 5000, balanceAfter: 125000, description: 'Server shop sale', targetUuid: null, timestamp: now - 60000 },
        { id: 2, uuid: '2', type: 'TRANSFER_OUT', amount: 1200, balanceAfter: 98000, description: 'Payment to GoldDigger', targetUuid: '3', timestamp: now - 120000 },
        { id: 3, uuid: '3', type: 'BANK_DEPOSIT', amount: 3000, balanceAfter: 75000, description: 'Savings deposit', targetUuid: null, timestamp: now - 180000 },
        { id: 4, uuid: '4', type: 'SHOP_PURCHASE', amount: 800, balanceAfter: 62000, description: 'Bought Diamond x4', targetUuid: null, timestamp: now - 300000 },
        { id: 5, uuid: '5', type: 'BANK_INTEREST', amount: 150, balanceAfter: 45000, description: 'Savings interest', targetUuid: null, timestamp: now - 600000 },
        { id: 6, uuid: '1', type: 'TRANSFER_IN', amount: 2500, balanceAfter: 120000, description: 'Payment from EmeraldMiner', targetUuid: '2', timestamp: now - 900000 },
        { id: 7, uuid: '6', type: 'LOAN_TAKEN', amount: 5000, balanceAfter: 37000, description: 'Loan taken', targetUuid: null, timestamp: now - 1200000 },
        { id: 8, uuid: '3', type: 'SHOP_SALE', amount: 1500, balanceAfter: 78000, description: 'Sold Emerald x3', targetUuid: null, timestamp: now - 1800000 },
        { id: 9, uuid: '7', type: 'ADMIN_GIVE', amount: 10000, balanceAfter: 28000, description: 'Admin bonus', targetUuid: null, timestamp: now - 2400000 },
        { id: 10, uuid: '8', type: 'WITHDRAW', amount: 500, balanceAfter: 15000, description: 'ATM withdrawal', targetUuid: null, timestamp: now - 3600000 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const types = ['all', ...new Set(transactions.map(t => t.type))]

  const filtered = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t => t.description.toLowerCase().includes(search.toLowerCase()))

  if (loading) {
    return <div className="mc-text animate-pulse">Loading transactions...</div>
  }

  return (
    <div className="space-y-4">
      <div className="mc-title mc-text-gold text-lg mb-4">Transaction Ledger</div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mc-input flex-1"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="mc-input"
          style={{ width: '180px' }}
        >
          {types.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All Types' : t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Transaction List */}
      <div className="space-y-1">
        {filtered.length === 0 ? (
          <div className="mc-gui-dark p-4 text-center mc-text mc-text-dark">No transactions found</div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="mc-gui-dark p-3 flex items-center gap-4"
              style={{ borderLeft: `3px solid ${tx.type.includes('IN') || tx.type === 'DEPOSIT' ? '#55ff55' : tx.type.startsWith('ADMIN') ? '#ff55ff' : '#ff5555'}` }}
            >
              {/* Icon */}
              <div className="mc-slot" style={{ width: '36px', height: '36px', flexShrink: 0 }}>
                <span className={`mc-text text-lg ${getTxColor(tx.type)}`}>{getTxIcon(tx.type)}</span>
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`mc-text ${getTxColor(tx.type)}`}>{tx.type.replace(/_/g, ' ')}</span>
                  {tx.targetUuid && (
                    <span className="mc-text mc-text-dark text-xs">
                      {tx.type.includes('OUT') ? '->' : '<-'} {tx.targetUuid.slice(0, 8)}
                    </span>
                  )}
                </div>
                <div className="mc-text mc-text-dark text-sm">{tx.description}</div>
              </div>

              {/* Amount */}
              <div className="text-right">
                <div className={`mc-text ${getTxColor(tx.type)}`}>
                  {tx.type.includes('IN') || tx.type === 'DEPOSIT' || tx.type === 'BANK_INTEREST' ? '+' : '-'}
                  {formatNumber(tx.amount)} E
                </div>
                <div className="mc-text mc-text-dark text-xs">{formatTime(tx.timestamp)}</div>
              </div>

              {/* Balance After */}
              <div className="text-right" style={{ minWidth: '80px' }}>
                <div className="mc-text mc-text-dark text-xs">Balance</div>
                <div className="mc-text mc-text-gold text-sm">{formatNumber(tx.balanceAfter)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mc-gui-dark p-3 flex justify-between">
        <span className="mc-text mc-text-dark">Showing {filtered.length} of {transactions.length} transactions</span>
        <span className="mc-text mc-text-green">
          Volume: {formatNumber(filtered.reduce((sum, t) => sum + t.amount, 0))} E
        </span>
      </div>
    </div>
  )
}
