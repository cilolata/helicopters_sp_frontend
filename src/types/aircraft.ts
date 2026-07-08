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
