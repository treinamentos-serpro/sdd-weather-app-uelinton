import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { mockWeatherData } from '../../src/lib/weatherMock';
import { WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

afterEach(cleanup);

function deferred<Value>() {
  let resolve!: (value: Value) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('useWeather', () => {
  const firstCity = mockWeatherData.city;
  const otherCity: City = { name: 'Outra cidade', latitude: 1, longitude: 2 };
  const otherWeather: WeatherData = { ...mockWeatherData, city: otherCity };
  const service = {
    searchCities: vi.fn<(name: string) => Promise<City[]>>(),
    getWeather: vi.fn<(city: City) => Promise<WeatherData>>(),
  };

  beforeEach(() => {
    service.searchCities.mockReset();
    service.getWeather.mockReset();
    service.searchCities.mockResolvedValue([firstCity, otherCity]);
    service.getWeather.mockResolvedValue(mockWeatherData);
  });

  it('inicia em idle e retry sem operacao anterior nao consulta o servico', async () => {
    const { result } = renderHook(() => useWeather(service));

    expect(result.current).toMatchObject({
      status: 'idle',
      data: null,
      cities: [],
      error: null,
      query: '',
    });
    await act(async () => result.current.retry());
    expect(service.searchCities).not.toHaveBeenCalled();
    expect(service.getWeather).not.toHaveBeenCalled();
  });

  it.each(['', '   ', '\t\n'])('ignora busca vazia %j sem consultar o servico', async (name) => {
    const { result } = renderHook(() => useWeather(service));

    await act(async () => result.current.search(name));

    expect(result.current.status).toBe('idle');
    expect(service.searchCities).not.toHaveBeenCalled();
    expect(service.getWeather).not.toHaveBeenCalled();
  });

  it('busca cidades e carrega automaticamente o clima da primeira', async () => {
    const { result } = renderHook(() => useWeather(service));

    await act(async () => result.current.search('  Sao Paulo  '));

    expect(service.searchCities).toHaveBeenCalledExactlyOnceWith('Sao Paulo');
    expect(service.getWeather).toHaveBeenCalledExactlyOnceWith(firstCity);
    expect(result.current).toMatchObject({
      status: 'success',
      data: mockWeatherData,
      cities: [firstCity, otherCity],
      query: 'Sao Paulo',
      error: null,
    });
  });

  it('mantem loading durante geocoding e forecast', async () => {
    const cities = deferred<City[]>();
    const weather = deferred<WeatherData>();
    service.searchCities.mockReturnValue(cities.promise);
    service.getWeather.mockReturnValue(weather.promise);
    const { result } = renderHook(() => useWeather(service));
    let pending: Promise<void>;

    act(() => {
      pending = result.current.search('Cidade');
    });
    expect(result.current.status).toBe('loading');
    expect(service.getWeather).not.toHaveBeenCalled();

    await act(async () => {
      cities.resolve([firstCity]);
    });
    expect(result.current.status).toBe('loading');
    expect(result.current.cities).toEqual([firstCity]);

    await act(async () => {
      weather.resolve(mockWeatherData);
      await pending;
    });
    expect(result.current.status).toBe('success');
  });

  it('sem resultados fica empty sem forecast nem dados anteriores', async () => {
    const { result } = renderHook(() => useWeather(service));
    await act(async () => result.current.selectCity(firstCity));
    service.getWeather.mockClear();
    service.searchCities.mockResolvedValue([]);

    await act(async () => result.current.search('Inexistente'));

    expect(result.current).toMatchObject({
      status: 'empty',
      data: null,
      cities: [],
      error: null,
      query: 'Inexistente',
    });
    expect(service.getWeather).not.toHaveBeenCalled();
  });

  it('selecionar outra cidade consulta somente forecast e conserva cidades e query', async () => {
    const { result } = renderHook(() => useWeather(service));
    await act(async () => result.current.search('Cidade'));
    service.getWeather.mockResolvedValue(otherWeather);

    await act(async () => result.current.selectCity(otherCity));

    expect(service.searchCities).toHaveBeenCalledTimes(1);
    expect(service.getWeather).toHaveBeenLastCalledWith(otherCity);
    expect(result.current).toMatchObject({
      status: 'success',
      data: otherWeather,
      cities: [firstCity, otherCity],
      query: 'Cidade',
    });
  });

  it('retry repete geocoding quando a busca falha e limpa o erro', async () => {
    service.searchCities.mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    const { result } = renderHook(() => useWeather(service));

    await act(async () => result.current.search('  Cidade  '));
    expect(result.current).toMatchObject({ status: 'error', error: 'Falha de rede.', data: null });
    expect(service.getWeather).not.toHaveBeenCalled();
    await act(async () => result.current.retry());

    expect(service.searchCities.mock.calls).toEqual([['Cidade'], ['Cidade']]);
    expect(result.current).toMatchObject({ status: 'success', error: null });
  });

  it('retry repete somente forecast quando o clima da primeira cidade falha', async () => {
    service.getWeather.mockRejectedValueOnce(
      new WeatherServiceError('A requisi\u00e7\u00e3o demorou demais.'),
    );
    const { result } = renderHook(() => useWeather(service));

    await act(async () => result.current.search('Cidade'));
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('A requisi\u00e7\u00e3o demorou demais.');
    await act(async () => result.current.retry());

    expect(service.searchCities).toHaveBeenCalledTimes(1);
    expect(service.getWeather.mock.calls).toEqual([[firstCity], [firstCity]]);
    expect(result.current).toMatchObject({ status: 'success', data: mockWeatherData, error: null });
  });

  it('retry usa a ultima cidade selecionada', async () => {
    service.getWeather.mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    const { result } = renderHook(() => useWeather(service));
    await act(async () => result.current.selectCity(otherCity));
    service.getWeather.mockResolvedValue(otherWeather);

    await act(async () => result.current.retry());

    expect(service.getWeather.mock.calls).toEqual([[otherCity], [otherCity]]);
    expect(service.searchCities).not.toHaveBeenCalled();
    expect(result.current.data).toBe(otherWeather);
  });

  it('nao expoe detalhes de erros inesperados', async () => {
    service.searchCities.mockRejectedValue(new Error('Detalhes internos'));
    const { result } = renderHook(() => useWeather(service));

    await act(async () => result.current.search('Cidade'));

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe(
      'N\u00e3o foi poss\u00edvel consultar o clima. Tente novamente.',
    );
  });

  it('ignora geocoding antigo sem iniciar forecast para seus resultados', async () => {
    const oldCities = deferred<City[]>();
    service.searchCities.mockReturnValueOnce(oldCities.promise).mockResolvedValueOnce([otherCity]);
    service.getWeather.mockResolvedValue(otherWeather);
    const { result } = renderHook(() => useWeather(service));
    let oldRequest: Promise<void>;
    act(() => {
      oldRequest = result.current.search('Antiga');
    });
    await act(async () => result.current.search('Nova'));

    await act(async () => {
      oldCities.resolve([firstCity]);
      await oldRequest;
    });

    expect(service.getWeather).toHaveBeenCalledExactlyOnceWith(otherCity);
    expect(result.current).toMatchObject({
      status: 'success',
      data: otherWeather,
      query: 'Nova',
      cities: [otherCity],
    });
  });

  it.each(['success', 'error'])('ignora forecast antigo que termina com %s', async (outcome) => {
    const oldWeather = deferred<WeatherData>();
    service.getWeather.mockReturnValueOnce(oldWeather.promise).mockResolvedValueOnce(otherWeather);
    const { result } = renderHook(() => useWeather(service));
    let oldRequest: Promise<void>;
    act(() => {
      oldRequest = result.current.selectCity(firstCity);
    });
    await act(async () => result.current.selectCity(otherCity));

    await act(async () => {
      if (outcome === 'success') oldWeather.resolve(mockWeatherData);
      else oldWeather.reject(new WeatherServiceError('Falha de rede.'));
      await oldRequest;
    });

    expect(result.current).toMatchObject({ status: 'success', data: otherWeather, error: null });
    await act(async () => result.current.retry());
    expect(service.getWeather).toHaveBeenLastCalledWith(otherCity);
  });

  it('ignora geocoding pendente depois de desmontar o hook', async () => {
    const cities = deferred<City[]>();
    service.searchCities.mockReturnValue(cities.promise);
    const { result, unmount } = renderHook(() => useWeather(service));
    let pending: Promise<void>;
    act(() => {
      pending = result.current.search('Cidade');
    });
    unmount();

    await act(async () => {
      cities.resolve([firstCity]);
      await pending;
    });

    expect(service.getWeather).not.toHaveBeenCalled();
  });
});
