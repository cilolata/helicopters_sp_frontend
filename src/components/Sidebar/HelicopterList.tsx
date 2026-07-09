import { useState } from 'react'
import { FaHelicopter } from 'react-icons/fa'
import { Aircraft } from '../../types/aircraft'
import { Helipad } from '../../types/helipad'
import { fmt } from '../../utils/format'
import { useDateAircrafts } from '../../hooks/useDateAircrafts'
import { exportToPdf } from '../../utils/exportPdf'
import { ExportRow } from '../../types/export'
import { API_BASE } from '../../config'

interface Props {
  aircrafts:             Aircraft[]
  helipads:              Helipad[]
  trackedIcao:           string | null
  historyIcao:           string | null
  visibleHelipadIndices: Set<number>
  onSelect:              (icao: string) => void
  onShowHistory:         (icao: string) => void
  onToggleHelipad:       (idx: number) => void
}

type Tab = 'live' | 'today' | 'helipads'

function todayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

export function HelicopterList({ aircrafts, helipads, trackedIcao, historyIcao, visibleHelipadIndices, onSelect, onShowHistory, onToggleHelipad }: Props) {
  const [tab, setTab]              = useState<Tab>('live')
  const [date, setDate]            = useState(todayStr)
  const [helipadSearch, setHelipadSearch] = useState('')
  const [exporting, setExporting]  = useState(false)

  async function handleExportPdf() {
    setExporting(true)
    try {
      const res  = await fetch(`${API_BASE}/aircrafts/export?date=${date}`)
      const rows = await res.json() as ExportRow[]
      exportToPdf(rows, date)
    } catch {
      // silently ignore — user can retry
    } finally {
      setExporting(false)
    }
  }

  const { aircrafts: dateList, loading } = useDateAircrafts(date)

  const allHelipads = [...helipads].sort((a, b) => b.pousos_permitidos - a.pousos_permitidos)

  const filteredHelipads = helipadSearch.trim() === ''
    ? allHelipads
    : allHelipads.filter(hp =>
        hp.name.toLowerCase().includes(helipadSearch.toLowerCase()) ||
        hp.address.toLowerCase().includes(helipadSearch.toLowerCase())
      )

  function fmtTime(iso: string) {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
  }

  const tabs: { id: Tab; label: string; active: string }[] = [
    { id: 'live',     label: `🚁 ${aircrafts.length} ao vivo`,  active: 'border-red-500' },
    { id: 'today',    label: `📋 histórico`,                    active: 'border-yellow-500' },
    { id: 'helipads', label: `H ${helipads.length}`, active: 'border-green-500' },
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
        <div className="px-3 py-2 bg-gray-950 border-b border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
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
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="w-full text-center text-xs bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400
                       border border-yellow-600/40 rounded px-2 py-1.5 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? 'Gerando PDF…' : '⬇ Exportar PDF'}
          </button>
          <p className="text-[10px] text-white/70 leading-snug">
            ⚠ Apenas voos dentro do perímetro do município de SP são registrados no histórico.
          </p>
          <p className="text-[10px] text-white/70 leading-snug">
            🚔 Aeronaves da polícia são omitidas do mapa e dos registros.
          </p>
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
            {dateList.map(ac => (
              <li
                key={ac.icao_hex}
                className="flex items-center gap-3 px-4 py-3 border-l-2 border-transparent"
              >
                <FaHelicopter size={16} className="text-yellow-500 shrink-0" />
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
              </li>
            ))}
          </>
        )}

        {/* HELIPONTOS */}
        {tab === 'helipads' && (
          <>
            {allHelipads.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-gray-500">Carregando helipontos...</li>
            )}
            {allHelipads.length > 0 && (
              <li className="px-3 py-2 bg-gray-950 border-b border-white/10 sticky top-0">
                <input
                  type="text"
                  placeholder="Buscar heliponto..."
                  value={helipadSearch}
                  onChange={e => setHelipadSearch(e.target.value)}
                  className="w-full bg-gray-800 text-white text-xs rounded px-2 py-1.5 border border-white/10
                             focus:outline-none focus:border-green-500 placeholder-gray-600"
                />
              </li>
            )}
            {filteredHelipads.length === 0 && allHelipads.length > 0 && (
              <li className="px-4 py-8 text-center text-sm text-gray-500">Nenhum resultado.</li>
            )}
            {filteredHelipads.map((hp, i) => {
              const originalIdx = allHelipads.indexOf(hp)
              const isVisible   = visibleHelipadIndices.has(originalIdx)
              return (
                <li
                  key={i}
                  onClick={() => onToggleHelipad(originalIdx)}
                  className={`px-4 py-3 cursor-pointer transition-colors border-l-2 ${
                    isVisible ? 'bg-green-900/20 border-green-500' : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-black ${
                        isVisible ? 'bg-green-700 border-green-500 text-white' : 'bg-transparent border-gray-600 text-gray-500'
                      }`}>H</span>
                      <p className="text-xs font-medium leading-snug truncate text-gray-300">
                        {hp.name.replace(/^Heliponto\s+/i, '')}
                      </p>
                    </div>
                    {hp.pousos_permitidos > 0 && (
                      <span className="text-xs font-bold shrink-0 tabular-nums text-gray-400">
                        {hp.pousos_permitidos}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate mt-0.5 pl-5">{hp.address}</p>
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
