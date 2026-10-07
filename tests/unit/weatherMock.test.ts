import { describe, expect, expectTypeOf, it } from 'vitest';
import { mockWeatherData } from '../../src/lib/weatherMock';
import type { City, CurrentWeather, ForecastDay, Unit, WeatherData } from '../../src/types/weather';

describe('mockWeatherData', () => {
  it('fornece cidade e clima atual no fuso correspondente', () => {
    expectTypeOf(mockWeatherData).toEqualTypeOf<WeatherData>();
    expect(mockWeatherData.city.name).toBe('S\u00e3o Paulo');
    expect(mockWeatherData.timezone).toBe(mockWeatherData.city.timezone);
    expect(mockWeatherData.current.temperatureCelsius).toBe(23.1);
    expect(mockWeatherData.current.descriptionPtBr).toBe('Parcialmente nublado');
    expect(Number.isNaN(Date.parse(mockWeatherData.fetchedAt))).toBe(false);
    expect(mockWeatherData.current.time?.slice(0, 10)).toBe(mockWeatherData.forecast[0].date);
  });

  it('fornece exatamente cinco datas locais consecutivas com valores coerentes', () => {
    expect(mockWeatherData.forecast.map((day) => day.date)).toEqual([
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ]);

    for (const day of mockWeatherData.forecast) {
      expect(day.temperatureMinCelsius).toBeTypeOf('number');
      expect(day.temperatureMaxCelsius).toBeTypeOf('number');
      expect(day.temperatureMinCelsius).toBeLessThanOrEqual(day.temperatureMaxCelsius as number);
      expect(day.precipitationProbabilityMax).toBeGreaterThanOrEqual(0);
      expect(day.precipitationProbabilityMax).toBeLessThanOrEqual(100);
    }
  });

  it('aceita metadados opcionais e leituras ausentes nos contratos', () => {
    expectTypeOf<Unit>().toEqualTypeOf<'celsius' | 'fahrenheit'>();
    expectTypeOf<{ name: string; latitude: number; longitude: number }>().toExtend<City>();
    expectTypeOf<{
      [Field in keyof CurrentWeather]: null;
    }>().toExtend<CurrentWeather>();
    expectTypeOf<{
      date: string;
      weatherCode: null;
      temperatureMinCelsius: null;
      temperatureMaxCelsius: null;
      precipitationProbabilityMax: null;
    }>().toExtend<ForecastDay>();
  });
});
