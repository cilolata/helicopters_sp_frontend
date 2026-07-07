import { useState } from 'react'
import { FaHelicopter } from 'react-icons/fa'
import { Aircraft } from '../../types/aircraft'
import { Helipad } from '../../types/helipad'
import { fmt } from '../../utils/format'
import { useDateAircrafts } from '../../hooks/useDateAircrafts'

interface Props {
  aircrafts:     Aircraft[]
  helipads:      Helipad[]
  trackedIcao:   string | null
  historyIcao:   string | null
  onSelect:      (icao: string) => void
  onShowHistory: (icao: string) => void
}

type Tab = 'live' | 'today' | 'helipads'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function HelicopterList({ aircrafts, helipads, trackedIcao, historyIcao, onSelect, onShowHistory }: Props) {
  const [tab, setTab]       = useState<Tab>('live')
  const [date, setDate]     = useState(todayStr)

  const { aircrafts: dateList, loading } = useDateAircrafts(date)

  const activeHelipads = helipads.filter(hp => hp.landings > 0).sort((a, b) => b.landings - a.landings)
  const allHelipads    = [...helipads].sort((a, b) => b.pousos_permitidos - a.pousos_permitidos)

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const tabs: { id: Tab; label: string; active: string }[] = [
    { id: 'live',     label: `🚁 ${aircrafts.length} ao vivo`,  active: 'border-red-500' },
    { id: 'today',    label: `📋 histórico`,                    active: 'border-yellow-500' },
    { id: 'helipads', label: `H ${activeHelipads.length > 0 ? `${activeHelipads.length} pousos` : helipads.length}`, active: 'border-green-500' },
  ]

  return (
    <aside className="w-72 h-screen bg-gray-900 text-white flex flex-col shrink-0 overflow-hidden">
      <header className="px-4 pt-3 pb-0 border-b border-white/10 bg-gray-950">
        <div className="flex items-center gap-2 mb-2">
          <FaHelicopter className="text-red-500" size={16} />
          <span className="font-semibold text-sm tracking-wide">Radar SP</span>
        </div>
        <div className="flex text-xs">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 pb-2 font-medium transition-colors border-b-2 ${
                tab === t.id ? `${t.active} text-white` : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Date picker — only shown on histórico tab */}
      {tab === 'today' && (
        <div className="px-3 py-2 bg-gray-950 border-b border-white/10 flex items-center gap-2">
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={e => setDate(e.target.value)}
            className="flex-1 bg-gray-800 text-white text-xs rounded px-2 py-1.5 border border-white/10
                       focus:outline-none focus:border-yellow-500 cursor-pointer"
          />
          <span className="text-xs text-gray-500 shrink-0 tabular-nums">
            {loading ? '…' : `${dateList.length} voos`}
          </span>
        </div>
      )}

      <ul className="overflow-y-auto flex-1 divide-y divide-white/5">

        {/* AO VIVO */}
        {tab === 'live' && (
          <>
            {aircrafts.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-gray-500">Aguardando dados...</li>
            )}
            {aircrafts.map(ac => {
              const isTracked = trackedIcao === ac.icao_hex
              return (
                <li
                  key={ac.icao_hex}
                  onClick={() => onSelect(ac.icao_hex)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2 ${
                    isTracked ? 'bg-blue-700/30 border-blue-400' : 'hover:bg-white/5 border-transparent'
                  }`}
                >
                  <FaHelicopter size={20} className={isTracked ? 'text-blue-400 shrink-0' : 'text-red-500 shrink-0'} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{ac.callsign ?? ac.icao_hex}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <span>{fmt(ac.altitude, 'ft')}</span>
                      <span className="mx-1">·</span>
                      <span>{fmt(ac.ground_speed, 'kt')}</span>
                    </p>
                  </div>
                  {isTracked && <span className="text-xs text-blue-400 shrink-0">seguindo</span>}
                </li>
              )
            })}
          </>
        )}

        {/* HISTÓRICO */}
        {tab === 'today' && (
          <>
            {!loading && dateList.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-gray-500">
                Nenhum registro nesta data.
              </li>
            )}
            {dateList.map(ac => {
              const isHistory = historyIcao === ac.icao_hex
              return (
                <li
                  key={ac.icao_hex}
                  onClick={() => onShowHistory(ac.icao_hex)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-2 ${
                    isHistory ? 'bg-green-900/30 border-green-400' : 'hover:bg-white/5 border-transparent'
                  }`}
                >
                  <FaHelicopter size={16} className={isHistory ? 'text-green-400 shrink-0' : 'text-yellow-500 shrink-0'} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {ac.last_callsign ?? ac.icao_hex}
                      {ac.last_callsign && (
                        <span className="ml-1.5 text-xs text-gray-500 font-normal">{ac.icao_hex}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fmtTime(ac.first_seen)} → {fmtTime(ac.last_seen)}
                    </p>
                  </div>
                  {isHistory && <span className="text-xs text-green-400 shrink-0">rota</span>}
                </li>
              )
            })}
          </>
        )}

        {/* HELIPONTOS */}
        {tab === 'helipads' && (
          <>
            {allHelipads.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-gray-500">Carregando helipontos...</li>
            )}
            {allHelipads.map((hp, i) => {
              const pct      = hp.pousos_permitidos > 0 ? hp.landings / hp.pousos_permitidos : 0
              const barColor = pct === 0 ? '#4ade80' : pct < 0.7 ? '#facc15' : '#f87171'
              return (
                <li key={i} className="px-4 py-3 border-l-2 border-transparent">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-medium leading-snug truncate flex-1 ${hp.landings > 0 ? 'text-white' : 'text-gray-400'}`}>
                      {hp.name.replace(/^Heliponto\s+/i, '')}
                    </p>
                    <span className={`text-xs font-bold shrink-0 tabular-nums ${hp.landings > 0 ? 'text-white' : 'text-gray-600'}`}>
                      {hp.landings}
                      {hp.pousos_permitidos > 0 && <span className="text-gray-500 font-normal">/{hp.pousos_permitidos}</span>}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate mt-0.5">{hp.address}</p>
                  {hp.pousos_permitidos > 0 && (
                    <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(pct * 100, 100)}%`, background: barColor }}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </>
        )}
      </ul>

      <footer className="px-4 py-2 text-xs text-gray-600 border-t border-white/10 text-center">
        Atualizado a cada 5s · ADS-B
      </footer>
    </aside>
  )
}
