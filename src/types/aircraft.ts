export interface Aircraft {
  icao_hex:     string
  callsign:     string | null
  owner:        string | null
  model:        string | null
  operator:     string | null
  altitude:     number | null
  ground_speed: number | null
  track:        number | null
  vert_rate:    number | null
  lat:          number
  lon:          number
  on_ground:    number
  captured_at:  string
  type:         'helicopter'
}

export interface DailyAircraft {
  icao_hex:      string
  last_callsign: string | null
  first_seen:    string
  last_seen:     string
}
