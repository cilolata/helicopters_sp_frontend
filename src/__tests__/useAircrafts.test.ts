import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAircrafts } from '../hooks/useAircrafts';

const mockAircrafts = [
  {
    icao_hex: 'E48832', callsign: 'PPAIS', owner: 'LUCAS MARTINS CARDOSO',
    model: 'R44', altitude: 800, ground_speed: 60, track: 90,
    vert_rate: 0, lat: -23.55, lon: -46.63, on_ground: 0,
    captured_at: new Date().toISOString(), type: 'helicopter' as const,
  },
];

// Avança o tempo e drena microtasks — não roda todos os timers de uma vez
async function flush(ms = 0) {
  await act(async () => { await vi.advanceTimersByTimeAsync(ms); });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true, json: async () => mockAircrafts,
  }));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useAircrafts', () => {
  it('busca helicópteros ao montar', async () => {
    const { result } = renderHook(() => useAircrafts());
    await flush(); // drena a Promise do fetch inicial sem avançar o setInterval
    expect(result.current.aircrafts).toHaveLength(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('retorna callsign, owner e model corretos', async () => {
    const { result } = renderHook(() => useAircrafts());
    await flush();
    const ac = result.current.aircrafts[0];
    expect(ac.callsign).toBe('PPAIS');
    expect(ac.owner).toBe('LUCAS MARTINS CARDOSO');
    expect(ac.model).toBe('R44');
  });

  it('faz novo fetch a cada 5 segundos (polling real-time)', async () => {
    renderHook(() => useAircrafts());
    await flush();                // poll inicial
    expect(fetch).toHaveBeenCalledTimes(1);

    await flush(5000);            // +5s → dispara setInterval
    expect(fetch).toHaveBeenCalledTimes(2);

    await flush(5000);            // +5s → dispara novamente
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('cancela o intervalo ao desmontar (sem memory leak)', async () => {
    const { unmount } = renderHook(() => useAircrafts());
    await flush();
    const callsBefore = (fetch as ReturnType<typeof vi.fn>).mock.calls.length;

    unmount();

    await flush(15000); // 3 ciclos que NÃO devem ocorrer
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsBefore);
  });

  it('define mensagem de erro quando a API falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
    const { result } = renderHook(() => useAircrafts());
    await flush();
    expect(result.current.error).toBeTruthy();
    expect(result.current.aircrafts).toHaveLength(0);
  });

  it('limpa o erro quando a API volta a funcionar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('falha')));
    const { result } = renderHook(() => useAircrafts());
    await flush();
    expect(result.current.error).toBeTruthy();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => mockAircrafts }));
    await flush(5000);
    expect(result.current.error).toBeNull();
    expect(result.current.aircrafts).toHaveLength(1);
  });
});
