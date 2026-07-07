import L from 'leaflet'

const BLUE  = '#2979ff'
const RED   = '#ff1744'

function helicopterSvg(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
    <!-- tail boom -->
    <rect x="22" y="32" width="4" height="13" rx="2" fill="${color}"/>
    <!-- tail rotor (static) -->
    <rect x="17" y="43" width="14" height="2.5" rx="1.2" fill="${color}" opacity="0.7"/>
    <!-- body fuselage -->
    <ellipse cx="24" cy="27" rx="8" ry="12" fill="${color}"/>
    <!-- cockpit bubble -->
    <ellipse cx="24" cy="15" rx="6.5" ry="6" fill="${color}" opacity="0.65"/>
    <!-- main rotor (SMIL — independent of parent CSS transform) -->
    <g>
      <animateTransform attributeName="transform" type="rotate"
        from="0 24 20" to="360 24 20" dur="0.6s" repeatCount="indefinite"/>
      <rect x="2" y="18" width="44" height="4" rx="2" fill="${color}" opacity="0.92"/>
      <rect x="22" y="0" width="4" height="44" rx="2" fill="${color}" opacity="0.92"/>
    </g>
    <!-- rotor hub -->
    <circle cx="24" cy="20" r="4.5" fill="${color}"/>
    <!-- cockpit glass -->
    <ellipse cx="24" cy="15" rx="4" ry="4" fill="rgba(255,255,255,0.15)"/>
  </svg>`
}

// track: ADS-B true track in degrees (0=north clockwise). Baked into the icon
// so the heading is correct from the first render without any DOM queries.
export function makeHelicopterIcon(tracked: boolean, track: number = 0): L.DivIcon {
  const color = tracked ? BLUE : RED
  const size  = 42

  const ring = tracked
    ? `<div style="position:absolute;inset:-6px;border:2px dashed ${BLUE};border-radius:50%;animation:spin-ring 6s linear infinite;opacity:0.8;"></div>`
    : ''

  return L.divIcon({
    className:  '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <style>@keyframes spin-ring { to { transform: rotate(360deg); } }</style>
      <div class="ac-body" style="
        position:relative; width:${size}px; height:${size}px;
        display:flex; align-items:center; justify-content:center;
        transform:rotate(${track}deg); transform-origin:center;
      ">
        ${ring}
        <div style="
          position:absolute; inset:8px;
          background:${color}; border-radius:50%;
          opacity:0.18; filter:blur(8px);
        "></div>
        <div>
          ${helicopterSvg(color)}
        </div>
      </div>`,
  })
}
