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
