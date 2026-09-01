import { useState, useEffect } from 'react'
import type { TabId, ServerStats } from './types'
import { api } from './utils/api'
import Overview from './components/Overview'
import Players from './components/Players'
import Transactions from './components/Transactions'
import Shops from './components/Shops'
import Settings from './components/Settings'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'OVERVIEW', icon: '🗺' },
  { id: 'players', label: 'PLAYERS', icon: '👤' },
  { id: 'transactions', label: 'TRANSACTIONS', icon: '📜' },
  { id: 'shops', label: 'SHOPS', icon: '🏪' },
  { id: 'settings', label: 'SETTINGS', icon: '⚙' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [stats, setStats] = useState<ServerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  async function loadStats() {
    try {
      const data = await api.stats()
      setStats(data)
      setError(null)
    } catch {
      setError('Failed to connect to CraftEconomy API')
      // Use mock data for demo
      setStats(getMockStats())
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mc-gui-dark p-8 text-center">
          <div className="mc-title mc-text-gold text-lg mb-4">CraftEconomy</div>
          <div className="mc-text animate-pulse">Loading...</div>
          <div className="mc-progress mt-4 w-48">
            <div className="mc-progress-fill" style={{ width: '60%', animation: 'pulse 1s infinite' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="mc-gui-dark p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="mc-title mc-text-gold text-xl">CraftEconomy</div>
          <div className="mc-text mc-text-dark text-sm">Dashboard v1.0</div>
        </div>
        <div className="flex items-center gap-4">
          {error && <div className="mc-text mc-text-red text-sm">{error}</div>}
          <div className="mc-text mc-text-green text-sm">
            Server: <span className="mc-text-white">Online</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-0 mb-0 relative z-10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`mc-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mc-gui p-4 min-h-[600px]">
        {activeTab === 'overview' && <Overview stats={stats} />}
        {activeTab === 'players' && <Players />}
        {activeTab === 'transactions' && <Transactions />}
        {activeTab === 'shops' && <Shops />}
        {activeTab === 'settings' && <Settings />}
      </div>

      {/* Footer */}
      <div className="mc-gui-dark p-2 mt-4 text-center">
        <div className="mc-text mc-text-dark text-sm">
          CraftEconomy Dashboard — Made by Rafie-kun
        </div>
      </div>
    </div>
  )
}

function getMockStats(): ServerStats {
  return {
    totalPlayers: 42,
    totalWealth: 1250000,
    totalCirculation: 850000,
    totalSavings: 280000,
    totalLoans: 45000,
    averageBalance: 20238,
    richestPlayer: {
      uuid: 'mock-uuid',
      name: 'DiamondKing',
      balance: 125000,
      savings: 50000,
      fixedDeposit: 25000,
      loanAmount: 0,
      loanDebt: 0,
      totalWealth: 200000,
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now(),
    },
    topPlayers: [
      { uuid: '1', name: 'DiamondKing', balance: 125000, savings: 50000, fixedDeposit: 25000, loanAmount: 0, loanDebt: 0, totalWealth: 200000, createdAt: 0, updatedAt: 0 },
      { uuid: '2', name: 'EmeraldMiner', balance: 98000, savings: 30000, fixedDeposit: 0, loanAmount: 0, loanDebt: 0, totalWealth: 128000, createdAt: 0, updatedAt: 0 },
      { uuid: '3', name: 'GoldDigger', balance: 75000, savings: 20000, fixedDeposit: 10000, loanAmount: 5000, loanDebt: 5100, totalWealth: 105000, createdAt: 0, updatedAt: 0 },
      { uuid: '4', name: 'RedstoneWizard', balance: 62000, savings: 15000, fixedDeposit: 0, loanAmount: 0, loanDebt: 0, totalWealth: 77000, createdAt: 0, updatedAt: 0 },
      { uuid: '5', name: 'IronForger', balance: 45000, savings: 10000, fixedDeposit: 5000, loanAmount: 0, loanDebt: 0, totalWealth: 60000, createdAt: 0, updatedAt: 0 },
    ],
    recentTransactions: [
      { id: 1, uuid: '1', type: 'DEPOSIT', amount: 5000, balanceAfter: 125000, description: 'Server shop sale', targetUuid: null, timestamp: Date.now() - 60000 },
      { id: 2, uuid: '2', type: 'TRANSFER_OUT', amount: 1200, balanceAfter: 98000, description: 'Payment to GoldDigger', targetUuid: '3', timestamp: Date.now() - 120000 },
      { id: 3, uuid: '3', type: 'BANK_DEPOSIT', amount: 3000, balanceAfter: 75000, description: 'Savings deposit', targetUuid: null, timestamp: Date.now() - 180000 },
      { id: 4, uuid: '4', type: 'SHOP_PURCHASE', amount: 800, balanceAfter: 62000, description: 'Bought Diamond x4', targetUuid: null, timestamp: Date.now() - 300000 },
      { id: 5, uuid: '5', type: 'BANK_INTEREST', amount: 150, balanceAfter: 45000, description: 'Savings interest', targetUuid: null, timestamp: Date.now() - 600000 },
    ],
    serverShops: [
      { id: 1, ownerUuid: '0', ownerName: 'Server', itemType: 'DIAMOND', amount: 1, price: 500, stock: -1, isServerShop: true, createdAt: 0 },
      { id: 2, ownerUuid: '0', ownerName: 'Server', itemType: 'EMERALD', amount: 1, price: 100, stock: -1, isServerShop: true, createdAt: 0 },
      { id: 3, ownerUuid: '0', ownerName: 'Server', itemType: 'GOLD_INGOT', amount: 1, price: 50, stock: -1, isServerShop: true, createdAt: 0 },
      { id: 4, ownerUuid: '0', ownerName: 'Server', itemType: 'IRON_INGOT', amount: 1, price: 25, stock: -1, isServerShop: true, createdAt: 0 },
    ],
  }
}
