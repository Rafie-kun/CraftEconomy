import type { ServerStats } from '../types'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(2)
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function Overview({ stats }: { stats: ServerStats | null }) {
  if (!stats) return <div className="mc-text mc-text-red">No data available</div>

  const wealthPercent = stats.totalCirculation > 0
    ? Math.min((stats.totalSavings / stats.totalCirculation) * 100, 100)
    : 0
  const loanPercent = stats.totalCirculation > 0
    ? Math.min((stats.totalLoans / stats.totalCirculation) * 100, 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="mc-title mc-text-gold text-lg mb-4">Server Economy Overview</div>

      {/* Stats Grid */}
      <div className="mc-grid mc-grid-4 gap-4">
        {/* Total Wealth */}
        <div className="mc-gui-dark p-4">
          <div className="mc-text mc-text-dark text-sm mb-1">Total Wealth</div>
          <div className="mc-title mc-text-gold text-2xl">{formatNumber(stats.totalWealth)}</div>
          <div className="mc-text mc-text-green text-xs mt-1">Emeralds</div>
        </div>

        {/* In Circulation */}
        <div className="mc-gui-dark p-4">
          <div className="mc-text mc-text-dark text-sm mb-1">In Circulation</div>
          <div className="mc-title mc-text-aqua text-2xl">{formatNumber(stats.totalCirculation)}</div>
          <div className="mc-text mc-text-blue text-xs mt-1">Wallets</div>
        </div>

        {/* In Savings */}
        <div className="mc-gui-dark p-4">
          <div className="mc-text mc-text-dark text-sm mb-1">In Savings</div>
          <div className="mc-title mc-text-green text-2xl">{formatNumber(stats.totalSavings)}</div>
          <div className="mc-text mc-text-dark text-xs mt-1">Bank Vault</div>
        </div>

        {/* Total Loans */}
        <div className="mc-gui-dark p-4">
          <div className="mc-text mc-text-dark text-sm mb-1">Outstanding Loans</div>
          <div className="mc-title mc-text-red text-2xl">{formatNumber(stats.totalLoans)}</div>
          <div className="mc-text mc-text-red text-xs mt-1">Debt</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mc-grid mc-grid-2 gap-4">
        <div className="mc-gui-dark p-4">
          <div className="flex justify-between mb-2">
            <span className="mc-text mc-text-white">Savings Rate</span>
            <span className="mc-text mc-text-green">{wealthPercent.toFixed(1)}%</span>
          </div>
          <div className="mc-xp-bar">
            <div className="mc-xp-fill" style={{ width: `${wealthPercent}%` }} />
            <div className="mc-xp-text">{wealthPercent.toFixed(1)}%</div>
          </div>
        </div>
        <div className="mc-gui-dark p-4">
          <div className="flex justify-between mb-2">
            <span className="mc-text mc-text-white">Loan Ratio</span>
            <span className="mc-text mc-text-red">{loanPercent.toFixed(1)}%</span>
          </div>
          <div className="mc-xp-bar">
            <div className="mc-xp-fill" style={{ width: `${loanPercent}%`, background: 'linear-gradient(180deg, #ff5555 0%, #aa0000 100%)' }} />
            <div className="mc-xp-text" style={{ color: '#ff5555' }}>{loanPercent.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Player Stats & Recent Activity */}
      <div className="mc-grid mc-grid-2 gap-4">
        {/* Top Players */}
        <div className="mc-gui-dark p-4">
          <div className="mc-title mc-text-gold text-sm mb-3">Richest Players</div>
          {stats.topPlayers.length === 0 ? (
            <div className="mc-text mc-text-dark">No players yet</div>
          ) : (
            <div className="space-y-2">
              {stats.topPlayers.map((player, i) => (
                <div key={player.uuid} className="flex items-center justify-between p-2" style={{
                  background: i === 0 ? 'rgba(255,170,0,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${i === 0 ? 'rgba(255,170,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                  <div className="flex items-center gap-2">
                    <span className="mc-text mc-text-gold">{i + 1}.</span>
                    <span className="mc-text mc-text-white">{player.name}</span>
                  </div>
                  <div className="mc-text mc-text-green">{formatNumber(player.totalWealth)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="mc-gui-dark p-4">
          <div className="mc-title mc-text-gold text-sm mb-3">Recent Activity</div>
          {stats.recentTransactions.length === 0 ? (
            <div className="mc-text mc-text-dark">No transactions yet</div>
          ) : (
            <div className="space-y-2">
              {stats.recentTransactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div>
                    <div className={`mc-text text-sm ${
                      tx.type.includes('IN') || tx.type === 'DEPOSIT' || tx.type === 'BANK_INTEREST'
                        ? 'mc-text-green' : 'mc-text-red'
                    }`}>
                      {tx.type.replace(/_/g, ' ')}
                    </div>
                    <div className="mc-text mc-text-dark text-xs">{tx.description}</div>
                  </div>
                  <div className="text-right">
                    <div className={`mc-text text-sm ${
                      tx.type.includes('IN') || tx.type === 'DEPOSIT' || tx.type === 'BANK_INTEREST'
                        ? 'mc-text-green' : 'mc-text-red'
                    }`}>
                      {tx.type.includes('IN') || tx.type === 'DEPOSIT' || tx.type === 'BANK_INTEREST' ? '+' : '-'}
                      {formatNumber(tx.amount)}
                    </div>
                    <div className="mc-text mc-text-dark text-xs">{formatTime(tx.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Server Shops Summary */}
      <div className="mc-gui-dark p-4">
        <div className="mc-title mc-text-gold text-sm mb-3">Server Shops ({stats.serverShops.length})</div>
        <div className="mc-grid mc-grid-4 gap-2">
          {stats.serverShops.map((shop) => (
            <div key={shop.id} className="mc-slot" title={`${shop.itemType} x${shop.amount} - ${shop.price}E`}>
              <div className="mc-text mc-text-white text-center text-xs">
                <div>{shop.itemType.replace(/_/g, ' ').split(' ').map(w => w[0]).join('')}</div>
                <div className="mc-text-green">{shop.price}E</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
