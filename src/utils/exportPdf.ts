import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface ExportRow {
  icao_hex:      string
  last_callsign: string | null
  owner:         string | null
  model:         string | null
  operator:      string | null
  first_seen:    string
  last_seen:     string
  lat:           number | null
  lon:           number | null
  altitude:      number | null
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit', minute: '2-digit',
  })
}

export function exportToPdf(rows: ExportRow[], date: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  doc.setFontSize(13)
  doc.text(`Helicópteros detectados — ${date}`, 14, 14)
  doc.setFontSize(9)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`, 14, 20)

  autoTable(doc, {
    startY: 25,
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
