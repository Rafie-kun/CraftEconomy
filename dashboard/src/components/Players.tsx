import { useState, useEffect } from 'react'
import type { PlayerAccount } from '../types'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(2)
}

export default function Players() {
  const [players, setPlayers] = useState<PlayerAccount[]>([])
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'balance' | 'wealth' | 'name'>('wealth')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlayers()
  }, [])

  async function loadPlayers() {
    try {
      const data = await fetch('/api/players').then(r => r.json()) as PlayerAccount[]
      setPlayers(data)
    } catch {
      // Mock data
      setPlayers([
        { uuid: '1', name: 'DiamondKing', balance: 125000, savings: 50000, fixedDeposit: 25000, loanAmount: 0, loanDebt: 0, totalWealth: 200000, createdAt: 0, updatedAt: 0 },
        { uuid: '2', name: 'EmeraldMiner', balance: 98000, savings: 30000, fixedDeposit: 0, loanAmount: 0, loanDebt: 0, totalWealth: 128000, createdAt: 0, updatedAt: 0 },
        { uuid: '3', name: 'GoldDigger', balance: 75000, savings: 20000, fixedDeposit: 10000, loanAmount: 5000, loanDebt: 5100, totalWealth: 105000, createdAt: 0, updatedAt: 0 },
        { uuid: '4', name: 'RedstoneWizard', balance: 62000, savings: 15000, fixedDeposit: 0, loanAmount: 0, loanDebt: 0, totalWealth: 77000, createdAt: 0, updatedAt: 0 },
        { uuid: '5', name: 'IronForger', balance: 45000, savings: 10000, fixedDeposit: 5000, loanAmount: 0, loanDebt: 0, totalWealth: 60000, createdAt: 0, updatedAt: 0 },
        { uuid: '6', name: 'CreeperSlayer', balance: 32000, savings: 8000, fixedDeposit: 0, loanAmount: 2000, loanDebt: 2050, totalWealth: 40000, createdAt: 0, updatedAt: 0 },
        { uuid: '7', name: 'NetherExplorer', balance: 28000, savings: 5000, fixedDeposit: 0, loanAmount: 0, loanDebt: 0, totalWealth: 33000, createdAt: 0, updatedAt: 0 },
        { uuid: '8', name: 'EndHunter', balance: 15000, savings: 3000, fixedDeposit: 0, loanAmount: 0, loanDebt: 0, totalWealth: 18000, createdAt: 0, updatedAt: 0 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filtered = players
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'balance') return b.balance - a.balance
      if (sortBy === 'wealth') return b.totalWealth - a.totalWealth
      return a.name.localeCompare(b.name)
    })

  if (loading) {
    return <div className="mc-text animate-pulse">Loading players...</div>
  }

  return (
    <div className="space-y-4">
      <div className="mc-title mc-text-gold text-lg mb-4">Player Registry</div>

      {/* Search & Sort */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mc-input flex-1"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="mc-input"
          style={{ width: '160px' }}
        >
          <option value="wealth">Sort: Total Wealth</option>
          <option value="balance">Sort: Balance</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Player Table */}
      <div className="mc-gui-dark overflow-hidden">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#2a2a3e', borderBottom: '2px solid #4a4a6e' }}>
              <th className="mc-text mc-text-gold text-left p-3">#</th>
              <th className="mc-text mc-text-gold text-left p-3">Player</th>
              <th className="mc-text mc-text-gold text-right p-3">Balance</th>
              <th className="mc-text mc-text-gold text-right p-3">Savings</th>
              <th className="mc-text mc-text-gold text-right p-3">Fixed Deposit</th>
              <th className="mc-text mc-text-gold text-right p-3">Loan Debt</th>
              <th className="mc-text mc-text-gold text-right p-3">Total Wealth</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((player, i) => (
              <tr key={player.uuid} style={{
                background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}>
                <td className="p-3 mc-text mc-text-dark">{i + 1}</td>
                <td className="p-3">
                  <span className="mc-text mc-text-white">{player.name}</span>
                </td>
                <td className="p-3 text-right">
                  <span className="mc-text mc-text-green">{formatNumber(player.balance)}</span>
                </td>
                <td className="p-3 text-right">
                  <span className="mc-text mc-text-blue">{formatNumber(player.savings)}</span>
                </td>
                <td className="p-3 text-right">
                  <span className="mc-text mc-text-purple">{formatNumber(player.fixedDeposit)}</span>
                </td>
                <td className="p-3 text-right">
                  <span className="mc-text mc-text-red">{player.loanDebt > 0 ? formatNumber(player.loanDebt) : '-'}</span>
                </td>
                <td className="p-3 text-right">
                  <span className="mc-text mc-text-gold">{formatNumber(player.totalWealth)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-4 text-center mc-text mc-text-dark">No players found</div>
        )}
      </div>

      {/* Summary */}
      <div className="mc-gui-dark p-3 flex justify-between">
        <span className="mc-text mc-text-dark">Showing {filtered.length} of {players.length} players</span>
        <span className="mc-text mc-text-gold">
          Total Wealth: {formatNumber(filtered.reduce((sum, p) => sum + p.totalWealth, 0))}
        </span>
      </div>
    </div>
  )
}
