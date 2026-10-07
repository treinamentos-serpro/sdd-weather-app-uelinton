import { CloudMoon, Moon, Sun } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('weatherCodes', () => {
  it.each([
    0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86,
    95, 96, 99,
  ])('fornece descricao e icone para o codigo WMO %s', (code) => {
    const condition = getWeatherCondition(code);
    expect(condition.description).not.toBe('Sem dados');
    expect(condition.description).not.toBe('');
    expect(condition.Icon).toBeDefined();
  });

  it('usa o mesmo fallback para codigo desconhecido e ausente', () => {
    expect(getWeatherCondition(999)).toEqual(getWeatherCondition(null));
    expect(getWeatherCondition(Number.NaN).description).toBe('Sem dados');
  });

  it('distingue icones diurnos e noturnos', () => {
    expect(getWeatherCondition(0, true).Icon).toBe(Sun);
    expect(getWeatherCondition(0, false).Icon).toBe(Moon);
    expect(getWeatherCondition(2, false).Icon).toBe(CloudMoon);
  });
});
