export interface PlayerAccount {
  uuid: string
  name: string
  balance: number
  savings: number
  fixedDeposit: number
  loanAmount: number
  loanDebt: number
  totalWealth: number
  createdAt: number
  updatedAt: number
}

export interface Transaction {
  id: number
  uuid: string
  type: string
  amount: number
  balanceAfter: number
  description: string
  targetUuid: string | null
  timestamp: number
}

export interface Shop {
  id: number
  ownerUuid: string
  ownerName: string
  itemType: string
  amount: number
  price: number
  stock: number
  isServerShop: boolean
  createdAt: number
}

export interface ServerStats {
  totalPlayers: number
  totalWealth: number
  totalCirculation: number
  totalSavings: number
  totalLoans: number
  averageBalance: number
  richestPlayer: PlayerAccount | null
  topPlayers: PlayerAccount[]
  recentTransactions: Transaction[]
  serverShops: Shop[]
}

export type TabId = 'overview' | 'players' | 'transactions' | 'shops' | 'settings'
