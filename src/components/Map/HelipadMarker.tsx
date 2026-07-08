import React, { useRef } from 'react'
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

interface HelipadMarkerProps {
  hp:     Helipad
  onHide: () => void
}

export function HelipadMarker({ hp, onHide }: HelipadMarkerProps) {
  const markerRef = useRef<L.Marker>(null)

  function handleHide() {
    markerRef.current?.closePopup()
    onHide()
  }

  const pct      = hp.pousos_permitidos > 0 ? hp.landings / hp.pousos_permitidos : 0
  const barColor = pct === 0 ? '#4ade80' : pct < 0.7 ? '#facc15' : '#f87171'

  return (
    <Marker
      ref={markerRef}
      position={[hp.lat, hp.lon]}
      icon={makeHelipadIcon()}
    >
      <Popup minWidth={200}>
        <div style={{ fontFamily: 'sans-serif', fontSize: '13px', lineHeight: '1.5', paddingRight: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
            <strong style={{ fontSize: '14px' }}>{hp.name}</strong>
            <button
              onClick={handleHide}
              title="Fechar e ocultar heliponto"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '18px', lineHeight: 1, color: '#666', padding: '0 2px',
                flexShrink: 0,
              }}
            >×</button>
          </div>
          <div style={{ color: '#555', fontSize: '12px', marginBottom: '6px' }}>{hp.address}</div>
          {hp.pousos_permitidos > 0 && (
            <>
              <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                Pousos hoje: <strong>{hp.landings}</strong> / {hp.pousos_permitidos}
              </div>
              <div style={{ height: '5px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(pct * 100, 100)}%`, background: barColor, borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
            </>
          )}
          {hp.pousos_permitidos === 0 && (
            <div style={{ fontSize: '12px', color: '#888' }}>Sem limite de pousos</div>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
