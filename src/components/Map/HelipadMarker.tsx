import React from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Helipad } from '../../types/helipad'

function makeHelipadIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize:  [20, 20],
    iconAnchor:[10, 10],
    html: `<div style="
      width:20px;height:20px;background:#1b5e20;
      border:1.5px solid rgba(0,0,0,0.35);border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-weight:900;font-size:11px;color:#fff;font-family:sans-serif;
      box-shadow:0 1px 4px rgba(0,0,0,0.45);">H</div>`,
  })
}

export function HelipadMarker({ hp }: { hp: Helipad }) {
  const pct      = hp.pousos_permitidos > 0 ? Math.min(hp.landings / hp.pousos_permitidos, 1) : 0
  const barColor = pct === 0 ? '#4ade80' : pct < 0.7 ? '#facc15' : '#f87171'
  const overLimit = hp.pousos_permitidos > 0 && hp.landings >= hp.pousos_permitidos

  return (
    <Marker position={[hp.lat, hp.lon]} icon={makeHelipadIcon()}>
      <Popup minWidth={220}>
        <div style={{ fontSize: 13, lineHeight: '1.7', minWidth: 200 }}>
          <strong style={{ fontSize: 14, display: 'block', marginBottom: 2 }}>{hp.name}</strong>
          <span style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 8 }}>{hp.address}</span>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span><b>Pousos realizados</b></span>
            <span style={{ fontWeight: 700, color: overLimit ? '#ef4444' : '#fff' }}>{hp.landings}</span>
          </div>

          {hp.pousos_permitidos > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span><b>Pousos permitidos</b></span>
                <span style={{ fontWeight: 700 }}>{hp.pousos_permitidos}</span>
              </div>

              <div style={{ background: '#e5e7eb', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{
                  height: '100%', borderRadius: 6,
                  width: `${pct * 100}%`,
                  background: barColor,
                  transition: 'width 0.4s',
                }} />
              </div>

              {overLimit && (
                <p style={{ color: '#ef4444', fontWeight: 600, fontSize: 12, marginTop: 4 }}>
                  ⚠️ Limite de pousos atingido
                </p>
              )}
            </>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
