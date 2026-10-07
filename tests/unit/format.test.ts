import { describe, expect, it } from 'vitest';
import { formatDayLabel } from '../../src/lib/format';

describe('formatDayLabel', () => {
  it('formata a data local sem depender do fuso do dispositivo', () => {
    expect(formatDayLabel('2026-10-07')).toBe('qua., 07/10');
    expect(formatDayLabel('2026-10-11')).toBe('dom., 11/10');
    expect(formatDayLabel('2024-02-29')).toBe('qui., 29/02');
  });

  it.each([
    '',
    'invalid',
    '2026-02-29',
    '2026-02-30',
    '2026-13-01',
    '2026-10-07T00:00:00Z',
  ])('retorna fallback para data invalida %s', (date) => {
    expect(formatDayLabel(date)).toBe('Sem dados');
  });
});
