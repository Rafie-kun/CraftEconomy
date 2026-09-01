import { useState, useEffect } from 'react'
import type { Shop } from '../types'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(2)
}

export default function Shops() {
  const [shops, setShops] = useState<Shop[]>([])
  const [filter, setFilter] = useState<'all' | 'server' | 'player'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadShops()
  }, [])

  async function loadShops() {
    try {
      const data = await fetch('/api/shops').then(r => r.json()) as Shop[]
      setShops(data)
    } catch {
      setShops([
        { id: 1, ownerUuid: '0', ownerName: 'Server', itemType: 'DIAMOND', amount: 1, price: 500, stock: -1, isServerShop: true, createdAt: 0 },
        { id: 2, ownerUuid: '0', ownerName: 'Server', itemType: 'EMERALD', amount: 1, price: 100, stock: -1, isServerShop: true, createdAt: 0 },
        { id: 3, ownerUuid: '0', ownerName: 'Server', itemType: 'GOLD_INGOT', amount: 1, price: 50, stock: -1, isServerShop: true, createdAt: 0 },
        { id: 4, ownerUuid: '0', ownerName: 'Server', itemType: 'IRON_INGOT', amount: 1, price: 25, stock: -1, isServerShop: true, createdAt: 0 },
        { id: 5, ownerUuid: '0', ownerName: 'Server', itemType: 'COAL', amount: 8, price: 20, stock: -1, isServerShop: true, createdAt: 0 },
        { id: 6, ownerUuid: '0', ownerName: 'Server', itemType: 'OAK_LOG', amount: 4, price: 15, stock: -1, isServerShop: true, createdAt: 0 },
        { id: 7, ownerUuid: '1', ownerName: 'DiamondKing', itemType: 'DIAMOND_BLOCK', amount: 1, price: 4500, stock: 5, isServerShop: false, createdAt: Date.now() - 86400000 },
        { id: 8, ownerUuid: '2', ownerName: 'EmeraldMiner', itemType: 'EMERALD_BLOCK', amount: 1, price: 900, stock: 12, isServerShop: false, createdAt: Date.now() - 172800000 },
        { id: 9, ownerUuid: '3', ownerName: 'GoldDigger', itemType: 'GOLDEN_APPLE', amount: 1, price: 200, stock: 8, isServerShop: false, createdAt: Date.now() - 259200000 },
        { id: 10, ownerUuid: '4', ownerName: 'RedstoneWizard', itemType: 'REDSTONE', amount: 16, price: 80, stock: 3, isServerShop: false, createdAt: Date.now() - 345600000 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const filtered = shops.filter(s => {
    if (filter === 'server') return s.isServerShop
    if (filter === 'player') return !s.isServerShop
    return true
  })

  const serverShops = shops.filter(s => s.isServerShop)
  const playerShops = shops.filter(s => !s.isServerShop)

  if (loading) {
    return <div className="mc-text animate-pulse">Loading shops...</div>
  }

  return (
    <div className="space-y-4">
      <div className="mc-title mc-text-gold text-lg mb-4">Shop Registry</div>

      {/* Stats */}
      <div className="mc-grid mc-grid-3 gap-4">
        <div className="mc-gui-dark p-3 text-center">
          <div className="mc-text mc-text-dark text-sm">Server Shops</div>
          <div className="mc-title mc-text-aqua text-xl">{serverShops.length}</div>
        </div>
        <div className="mc-gui-dark p-3 text-center">
          <div className="mc-text mc-text-dark text-sm">Player Shops</div>
          <div className="mc-title mc-text-green text-xl">{playerShops.length}</div>
        </div>
        <div className="mc-gui-dark p-3 text-center">
          <div className="mc-text mc-text-dark text-sm">Total Listings</div>
          <div className="mc-title mc-text-gold text-xl">{shops.length}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'server', 'player'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`mc-btn ${filter === f ? 'mc-btn-gold' : ''}`}
          >
            {f === 'all' ? 'All Shops' : f === 'server' ? 'Server Shops' : 'Player Shops'}
          </button>
        ))}
      </div>

      {/* Shop Grid */}
      <div className="mc-grid mc-grid-4 gap-3">
        {filtered.map(shop => (
          <div
            key={shop.id}
            className="mc-gui-dark p-3 hover:opacity-90 cursor-pointer"
            style={{
              borderLeft: `3px solid ${shop.isServerShop ? '#55ffff' : '#55ff55'}`,
            }}
          >
            {/* Item Icon */}
            <div className="mc-slot mx-auto mb-2" style={{ width: '56px', height: '56px' }}>
              <div className="text-center">
                <div className="mc-text mc-text-white text-xs">
                  {shop.itemType.split('_').map(w => w[0]).join('')}
                </div>
              </div>
            </div>

            {/* Item Name */}
            <div className="mc-text mc-text-white text-center text-sm mb-1">
              {shop.itemType.replace(/_/g, ' ')}
            </div>

            {/* Amount */}
            <div className="mc-text mc-text-dark text-center text-xs mb-2">
              x{shop.amount}
            </div>

            {/* Price */}
            <div className="mc-text mc-text-gold text-center text-lg mb-1">
              {shop.price} E
            </div>

            {/* Stock */}
            <div className="text-center">
              {shop.stock < 0 ? (
                <span className="mc-text mc-text-green text-xs">Unlimited</span>
              ) : (
                <span className={`mc-text text-xs ${shop.stock === 0 ? 'mc-text-red' : 'mc-text-yellow'}`}>
                  Stock: {shop.stock}
                </span>
              )}
            </div>

            {/* Owner */}
            <div className="mc-text mc-text-dark text-center text-xs mt-2">
              {shop.isServerShop ? 'Server Shop' : `By ${shop.ownerName}`}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mc-gui-dark p-4 text-center mc-text mc-text-dark">No shops found</div>
      )}
    </div>
  )
}
