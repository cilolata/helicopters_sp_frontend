import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ExportRow } from '../types/export'
import { isBlockedCallsign } from './blocklist'

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit', minute: '2-digit',
  })
}

export function exportToPdf(rows: ExportRow[], date: string) {
  rows = rows.filter(r => !isBlockedCallsign(r.last_callsign))

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFontSize(13)
  doc.text(`Helicópteros detectados — ${date}`, 14, 14)
  doc.setFontSize(9)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`, 14, 20)

  doc.setFontSize(7)
  doc.setTextColor(100)
  const notices = [
    'Apenas voos dentro do perímetro do município de SP são registrados.',
    'Aeronaves da polícia são omitidas do mapa e dos registros.',
    'Cada entrada no perímetro de SP é contabilizada como um sobrevoo independente, mesmo que seja da mesma aeronave.',
  ]
  notices.forEach((txt, i) => doc.text(txt, 14, 27 + i * 4.5))
  doc.setTextColor(0)

  autoTable(doc, {
    startY: 43,
    styles:       { fontSize: 7, cellPadding: 2 },
    headStyles:   { fillColor: [30, 30, 30], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    head: [[
      'ICAO', 'Matrícula', 'Modelo', 'Owner', 'Operador',
      'Entrada', 'Saída', 'Lat', 'Lon', 'Alt (ft)',
    ]],
    body: rows.map(r => [
      r.icao_hex,
      r.last_callsign ?? '—',
      r.model         ?? '—',
      r.owner         ?? '—',
      r.operator      ?? '—',
      fmtTime(r.first_seen),
      fmtTime(r.last_seen),
      r.lat      != null ? r.lat.toFixed(4)  : '—',
      r.lon      != null ? r.lon.toFixed(4)  : '—',
      r.altitude != null ? String(r.altitude) : '—',
    ]),
  })

  doc.save(`helicopteros-${date}.pdf`)
}
