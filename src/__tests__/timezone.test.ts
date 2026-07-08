import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Testa que a data e hora exibidas no frontend usam o fuso de Brasília (BRT = UTC-3).
 * Simula o horário às 01:30 UTC (22:30 do dia anterior em BRT).
 */

function todayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

describe('todayStr — data no fuso de Brasília', () => {
  beforeEach(() => {
    // Fixa o relógio em 2025-07-08 01:30 UTC = 2025-07-07 22:30 BRT
    vi.setSystemTime(new Date('2025-07-08T01:30:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna a data de BRT (07/07), não a data UTC (08/07)', () => {
    expect(todayStr()).toBe('2025-07-07');
  });

  it('nunca retorna a data UTC quando BRT ainda é o dia anterior', () => {
    expect(todayStr()).not.toBe('2025-07-08');
  });
});

describe('fmtTime — hora exibida no fuso de Brasília', () => {
  it('converte timestamp UTC para hora BRT (UTC-3)', () => {
    // 15:00 UTC = 12:00 BRT
    const time = fmtTime('2025-07-07T15:00:00Z');
    expect(time).toBe('12:00');
  });

  it('converte corretamente à meia-noite BRT (03:00 UTC)', () => {
    const time = fmtTime('2025-07-08T03:00:00Z');
    expect(time).toBe('00:00');
  });

  it('converte corretamente às 23:59 BRT (02:59 UTC do dia seguinte)', () => {
    const time = fmtTime('2025-07-08T02:59:00Z');
    expect(time).toBe('23:59');
  });
});
