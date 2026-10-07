import { mockWeatherData } from '../lib/weatherMock';
import type { WeatherData } from '../types/weather';

export type MockWeatherSearch = (city: string) => Promise<WeatherData | null>;

const cityComparer = new Intl.Collator('pt-BR', { sensitivity: 'base' });

export const searchMockWeather: MockWeatherSearch = async (city) => {
  await new Promise<void>((resolve) => setTimeout(resolve, 500));
  return cityComparer.compare(city.trim(), mockWeatherData.city.name) === 0
    ? mockWeatherData
    : null;
};
