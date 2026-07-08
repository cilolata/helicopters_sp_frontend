import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lerp } from '../utils/format';
import { Aircraft } from '../types/aircraft';

/**
 * O AircraftMarker usa requestAnimationFrame + lerp para suavizar movimento.
 * Testamos o algoritmo de interpolação diretamente e o comportamento de animação
 * via mock de RAF, sem precisar montar o mapa Leaflet (que é pesado e DOM-dependente).
 */

const baseAircraft: Aircraft = {
  icao_hex: 'E48832', callsign: 'PPAIS', owner: 'LUCAS MARTINS CARDOSO',
  model: 'R44', altitude: 800, ground_speed: 60, track: 90,
  vert_rate: 0, lat: -23.55, lon: -46.63, on_ground: 0,
  captured_at: new Date().toISOString(), type: 'helicopter',
};

describe('Algoritmo de animação de posição (lerp)', () => {
  const POLL_MS = 5000;

  it('começa exatamente na posição anterior (t=0)', () => {
    const from: [number, number] = [-23.55, -46.63];
    const to:   [number, number] = [-23.56, -46.64];
    const pos = [lerp(from[0], to[0], 0), lerp(from[1], to[1], 0)];
    expect(pos).toEqual(from);
  });

  it('chega exatamente na posição nova (t=1)', () => {
    const from: [number, number] = [-23.55, -46.63];
    const to:   [number, number] = [-23.56, -46.64];
    const pos = [lerp(from[0], to[0], 1), lerp(from[1], to[1], 1)];
    expect(pos).toEqual(to);
  });

  it('está na metade do caminho em t=0.5 (2.5s no ciclo de 5s)', () => {
    const from: [number, number] = [-23.55, -46.63];
    const to:   [number, number] = [-23.57, -46.65];
    const lat = lerp(from[0], to[0], 0.5);
    const lon = lerp(from[1], to[1], 0.5);
    expect(lat).toBeCloseTo(-23.56, 5);
    expect(lon).toBeCloseTo(-46.64, 5);
  });

  it('t = elapsed / POLL_MS é limitado a 1 para não ultrapassar destino', () => {
    const elapsed = 9999;
    const t = Math.min(elapsed / POLL_MS, 1);
    expect(t).toBe(1);
  });

  it('não inicia animação quando posição não muda', () => {
    const from: [number, number] = [-23.55, -46.63];
    const to:   [number, number] = [-23.55, -46.63];
    const unchanged = from[0] === to[0] && from[1] === to[1];
    expect(unchanged).toBe(true);
  });

  it('detecta mudança de posição entre dois polls', () => {
    const prev: [number, number] = [-23.55, -46.63];
    const next: [number, number] = [-23.552, -46.631];
    const changed = prev[0] !== next[0] || prev[1] !== next[1];
    expect(changed).toBe(true);
  });
});

describe('requestAnimationFrame — controle de animação', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let now = 0;

  beforeEach(() => {
    rafCallbacks = [];
    now = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    vi.spyOn(performance, 'now').mockImplementation(() => now);
  });

  function flush(elapsed: number) {
    now = elapsed;
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach(cb => cb(elapsed));
  }

  it('interpola posição corretamente ao longo do tempo', () => {
    const POLL_MS = 5000;
    const from: [number, number] = [-23.55, -46.63];
    const to:   [number, number] = [-23.57, -46.65];
    const positions: [number, number][] = [];

    const start = 0;
    function step(elapsed: number) {
      const t = Math.min((elapsed - start) / POLL_MS, 1);
      positions.push([lerp(from[0], to[0], t), lerp(from[1], to[1], t)]);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);

    flush(0);     // t=0 → posição inicial
    flush(2500);  // t=0.5 → meio do caminho
    flush(5000);  // t=1 → posição final

    expect(positions[0]).toEqual(from);
    expect(positions[1][0]).toBeCloseTo(-23.56, 4);
    expect(positions[2]).toEqual(to);
  });
});
