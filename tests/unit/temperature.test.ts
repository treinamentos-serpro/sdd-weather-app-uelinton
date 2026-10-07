import { describe, expect, it } from 'vitest';
import { formatTemperature, toFahrenheit } from '../../src/lib/temperature';

describe('temperature', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
  ])('converte %s Celsius para %s Fahrenheit', (input, output) => {
    expect(toFahrenheit(input)).toBe(output);
  });

  it('formata em pt-BR com uma casa decimal', () => {
    expect(formatTemperature(23.16, 'celsius')).toBe('23,2 \u00b0C');
    expect(formatTemperature(0, 'fahrenheit')).toBe('32,0 \u00b0F');
    expect(formatTemperature(-40, 'fahrenheit')).toBe('-40,0 \u00b0F');
  });

  it.each([
    null,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('nao formata leituras ausentes ou invalidas %s', (value) => {
    expect(formatTemperature(value, 'celsius')).toBe('Sem dados');
    expect(formatTemperature(value, 'fahrenheit')).toBe('Sem dados');
  });
});
