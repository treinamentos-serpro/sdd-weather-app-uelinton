import { useEffect, useRef, useState } from 'react';
import * as weatherService from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

type WeatherService = Pick<typeof weatherService, 'searchCities' | 'getWeather'>;
type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';
type Operation = { type: 'search'; name: string } | { type: 'weather'; city: City };

interface WeatherState {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
}

export function useWeather(service: WeatherService = weatherService) {
  const [state, setState] = useState<WeatherState>({
    status: 'idle',
    data: null,
    cities: [],
    error: null,
    query: '',
  });
  const requestId = useRef(0);
  const lastOperation = useRef<Operation | null>(null);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  function reportError(error: unknown, currentRequest: number) {
    if (currentRequest !== requestId.current) return;
    setState((previous) => ({
      ...previous,
      status: 'error',
      error:
        error instanceof weatherService.WeatherServiceError
          ? error.message
          : 'N\u00e3o foi poss\u00edvel consultar o clima. Tente novamente.',
    }));
  }

  async function selectCity(city: City): Promise<void> {
    const currentRequest = ++requestId.current;
    lastOperation.current = { type: 'weather', city };
    setState((previous) => ({ ...previous, status: 'loading', data: null, error: null }));

    try {
      const data = await service.getWeather(city);
      if (currentRequest !== requestId.current) return;
      setState((previous) => ({ ...previous, status: 'success', data }));
    } catch (error) {
      reportError(error, currentRequest);
    }
  }

  async function search(name: string): Promise<void> {
    const query = name.trim();
    if (!query) return;
    const currentRequest = ++requestId.current;
    lastOperation.current = { type: 'search', name: query };
    setState({ status: 'loading', data: null, cities: [], error: null, query });

    try {
      const cities = await service.searchCities(query);
      if (currentRequest !== requestId.current) return;
      setState((previous) => ({
        ...previous,
        cities,
        status: cities.length === 0 ? 'empty' : 'loading',
      }));
      if (cities.length > 0) await selectCity(cities[0]);
    } catch (error) {
      reportError(error, currentRequest);
    }
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;
    if (operation?.type === 'search') await search(operation.name);
    if (operation?.type === 'weather') await selectCity(operation.city);
  }

  return { ...state, search, selectCity, retry };
}
