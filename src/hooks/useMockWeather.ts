import { useEffect, useRef, useState } from 'react';
import type { MockWeatherSearch } from '../services/mockWeatherService';
import type { WeatherData } from '../types/weather';

type MockWeatherState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; message: string }
  | { status: 'success'; data: WeatherData };

export function useMockWeather(searchWeather: MockWeatherSearch) {
  const [state, setState] = useState<MockWeatherState>({ status: 'idle' });
  const requestId = useRef(0);

  useEffect(
    () => () => {
      requestId.current += 1;
    },
    [],
  );

  async function search(city: string) {
    const query = city.trim();
    if (!query) return;
    const currentRequest = ++requestId.current;
    setState({ status: 'loading', query });

    try {
      const data = await searchWeather(query);
      if (currentRequest !== requestId.current) return;
      setState(data ? { status: 'success', data } : { status: 'empty', query });
    } catch {
      if (currentRequest !== requestId.current) return;
      setState({
        status: 'error',
        query,
        message: 'N\u00e3o foi poss\u00edvel consultar o clima. Tente novamente.',
      });
    }
  }

  function retry() {
    if (state.status === 'error') void search(state.query);
  }

  return { state, search, retry };
}
