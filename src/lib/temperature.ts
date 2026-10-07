import type { Unit } from '../types/weather';

const formatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function toFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function formatTemperature(celsius: number | null, unit: Unit): string {
  if (celsius === null || !Number.isFinite(celsius)) return 'Sem dados';

  const value = unit === 'fahrenheit' ? toFahrenheit(celsius) : celsius;
  if (!Number.isFinite(value)) return 'Sem dados';

  return `${formatter.format(value)} ${unit === 'fahrenheit' ? '\u00b0F' : '\u00b0C'}`;
}
