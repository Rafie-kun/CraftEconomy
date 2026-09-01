import { useState } from 'react'

export default function Settings() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8080')
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  async function testConnection() {
    setConnectionStatus('testing')
    try {
      const response = await fetch(`${apiUrl}/api/health`)
      if (response.ok) {
        setConnectionStatus('success')
      } else {
        setConnectionStatus('error')
      }
    } catch {
      setConnectionStatus('error')
    }
  }

  function handleSave() {
    localStorage.setItem('crafteco_api_url', apiUrl)
    localStorage.setItem('crafteco_api_key', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="mc-title mc-text-gold text-lg mb-4">Dashboard Settings</div>

      {/* API Connection */}
      <div className="mc-gui-dark p-4">
        <div className="mc-title mc-text-aqua text-sm mb-3">API Connection</div>

        <div className="space-y-3">
          <div>
            <label className="mc-text mc-text-dark text-sm block mb-1">Server API URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={e => setApiUrl(e.target.value)}
              className="mc-input"
              placeholder="http://localhost:8080"
            />
          </div>

          <div>
            <label className="mc-text mc-text-dark text-sm block mb-1">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="mc-input"
              placeholder="Enter your API key"
            />
          </div>

          <div className="flex gap-2">
            <button onClick={testConnection} className="mc-btn mc-btn-blue">
              {connectionStatus === 'testing' ? 'Testing...' : 'Test Connection'}
            </button>
            <button onClick={handleSave} className="mc-btn mc-btn-green">
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>

          {connectionStatus === 'success' && (
            <div className="mc-text mc-text-green">Connection successful!</div>
          )}
          {connectionStatus === 'error' && (
            <div className="mc-text mc-text-red">Failed to connect. Check the URL and API key.</div>
          )}
        </div>
      </div>

      {/* Plugin Info */}
      <div className="mc-gui-dark p-4">
        <div className="mc-title mc-text-aqua text-sm mb-3">Plugin Information</div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="mc-text mc-text-dark">Plugin Version</span>
            <span className="mc-text mc-text-white">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="mc-text mc-text-dark">Dashboard Version</span>
            <span className="mc-text mc-text-white">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="mc-text mc-text-dark">API Version</span>
            <span className="mc-text mc-text-white">v1</span>
          </div>
          <div className="flex justify-between">
            <span className="mc-text mc-text-dark">Author</span>
            <span className="mc-text mc-text-gold">Rafie-kun</span>
          </div>
        </div>
      </div>

      {/* PlaceholderAPI Reference */}
      <div className="mc-gui-dark p-4">
        <div className="mc-title mc-text-aqua text-sm mb-3">PlaceholderAPI Placeholders</div>
        <div className="space-y-1">
          {[
            ['%crafteco_balance%', 'Player wallet balance'],
            ['%crafteco_balance_formatted%', 'Balance (K/M format)'],
            ['%crafteco_balance_symbol%', 'Balance with currency symbol'],
            ['%crafteco_savings%', 'Bank savings balance'],
            ['%crafteco_total_wealth%', 'Total wealth (wallet + bank)'],
            ['%crafteco_total_wealth_formatted%', 'Total wealth (K/M format)'],
            ['%crafteco_loan%', 'Current loan amount'],
            ['%crafteco_loan_debt%', 'Total loan debt (with interest)'],
            ['%crafteco_currency%', 'Currency name'],
            ['%crafteco_currency_symbol%', 'Currency symbol'],
          ].map(([placeholder, desc]) => (
            <div key={placeholder} className="flex justify-between p-1" style={{
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <code className="mc-text mc-text-green text-sm">{placeholder}</code>
              <span className="mc-text mc-text-dark text-sm">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Commands Reference */}
      <div className="mc-gui-dark p-4">
        <div className="mc-title mc-text-aqua text-sm mb-3">Available Commands</div>
        <div className="space-y-1">
          {[
            ['/balance [player]', 'Check your or another player\'s balance'],
            ['/pay <player> <amount>', 'Send money to a player'],
            ['/bank deposit <amount>', 'Deposit into savings'],
            ['/bank withdraw <amount>', 'Withdraw from savings'],
            ['/bank loan <amount>', 'Take out a loan'],
            ['/bank repay <amount>', 'Repay a loan'],
            ['/shop create <item> <amt> <price>', 'Create a player shop'],
            ['/shop buy <id>', 'Buy from a shop'],
            ['/shop list', 'List your shops'],
            ['/transactions [player]', 'View transaction history'],
            ['/eco give|take|set <player> <amt>', 'Admin: manage balances'],
            ['/crafteco reload', 'Reload configuration'],
          ].map(([cmd, desc]) => (
            <div key={cmd} className="flex justify-between p-1" style={{
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
              <code className="mc-text mc-text-gold text-sm">{cmd}</code>
              <span className="mc-text mc-text-dark text-sm">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
