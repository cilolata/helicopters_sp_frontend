import { describe, it, expect } from 'vitest';
import { lerp, fmt } from '../utils/format';

describe('lerp', () => {
  it('retorna o valor inicial em t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10);
  });

  it('retorna o valor final em t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('retorna o ponto médio em t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it('interpola cordenadas de latitude corretamente', () => {
    const from = -23.55;
    const to   = -23.60;
    expect(lerp(from, to, 0.5)).toBeCloseTo(-23.575, 5);
  });

  it('funciona com valores negativos em ambas as direções', () => {
    expect(lerp(-100, 100, 0.5)).toBe(0);
  });
});

describe('fmt', () => {
  it('formata valor com unidade', () => {
    expect(fmt(1200, 'ft')).toBe('1200 ft');
  });

  it('retorna "—" para null', () => {
    expect(fmt(null, 'ft')).toBe('—');
  });

  it('retorna "—" para 0 (falsy mas válido)', () => {
    // 0 é um valor válido, não deve virar "—"
    expect(fmt(0, 'kt')).toBe('0 kt');
  });
});
