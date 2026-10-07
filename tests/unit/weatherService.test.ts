import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

describe('searchCities', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(['', '   ', '\t\n'])('retorna vazio sem rede para entrada %j', async (name) => {
    await expect(searchCities(name)).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each([
    'S\u00e3o Paulo',
    'Aix-en-Provence',
    "St. John's",
    'A&B / C?',
  ])('codifica o nome %s e usa o endpoint de geocoding', async (name) => {
    fetchMock.mockResolvedValue(Response.json({ results: [] }));

    await searchCities(`  ${name}  `);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=pt&format=json`,
      { signal: expect.any(AbortSignal) },
    );
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('name')).toBe(name);
  });

  it('mapeia todos os resultados para City e descarta campos externos', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        results: [
          {
            id: 3448439,
            name: 'S\u00e3o Paulo',
            admin1: 'S\u00e3o Paulo',
            country: 'Brasil',
            country_code: 'BR',
            latitude: -23.5475,
            longitude: -46.6361,
            timezone: 'America/Sao_Paulo',
            elevation: 760,
            population: 10000000,
            feature_code: 'PPLA',
          },
          { name: 'Outra cidade', latitude: 1, longitude: 2 },
        ],
      }),
    );

    await expect(searchCities('S\u00e3o Paulo')).resolves.toEqual([
      {
        id: 3448439,
        name: 'S\u00e3o Paulo',
        admin1: 'S\u00e3o Paulo',
        country: 'Brasil',
        countryCode: 'BR',
        latitude: -23.5475,
        longitude: -46.6361,
        timezone: 'America/Sao_Paulo',
        elevation: 760,
      },
      { name: 'Outra cidade', latitude: 1, longitude: 2 },
    ]);
  });

  it.each([{}, { results: [] }])('retorna vazio quando nao ha resultados: %j', async (data) => {
    fetchMock.mockResolvedValue(Response.json(data));
    await expect(searchCities('Inexistente')).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it.each([400, 429, 500])('lanca WeatherServiceError para HTTP %s', async (status) => {
    fetchMock.mockResolvedValue(new Response('Mensagem interna do provedor', { status }));

    await expect(searchCities('Cidade')).rejects.toThrow(WeatherServiceError);
  });

  it('converte falha de rede em WeatherServiceError sem expor a mensagem original', async () => {
    fetchMock.mockRejectedValue(new TypeError('Detalhes internos da rede'));

    await expect(searchCities('Cidade')).rejects.toThrow(new WeatherServiceError('Falha de rede.'));
  });
});

describe('getWeather', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const city: City = {
    name: 'S\u00e3o Paulo',
    latitude: -23.5475,
    longitude: -46.6361,
    timezone: 'America/Sao_Paulo',
  };
  const dates = ['2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'];
  const payload = {
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-10-07T10:15',
      temperature_2m: 23.1,
      apparent_temperature: 24,
      relative_humidity_2m: 58,
      is_day: 1,
      precipitation: 0,
      weather_code: 2,
      wind_speed_10m: 9.4,
      wind_direction_10m: 110,
      wind_gusts_10m: 14.8,
    },
    daily: {
      time: [...dates, '2026-10-12'],
      weather_code: [2, 3, 61, 3, 1, 0],
      temperature_2m_min: [17.2, 18, 16.8, 17.1, 18.2, 19],
      temperature_2m_max: [25.1, 26, 22.4, 24.8, 27, 28],
      precipitation_probability_max: [10, 20, 70, 30, 0, 40],
    },
  };

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('solicita current, daily, unidades e cinco dias no fuso da cidade', async () => {
    fetchMock.mockResolvedValue(Response.json(payload));

    await getWeather(city);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      latitude: '-23.5475',
      longitude: '-46.6361',
      current:
        'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
      daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
      temperature_unit: 'celsius',
      wind_speed_unit: 'kmh',
      precipitation_unit: 'mm',
      timezone: 'America/Sao_Paulo',
      forecast_days: '5',
    });
  });

  it('mapeia current e alinha os arrays de daily em exatamente cinco dias', async () => {
    fetchMock.mockResolvedValue(Response.json(payload));
    const before = Date.now();

    const result = await getWeather(city);

    expect(result.city).toBe(city);
    expect(result.timezone).toBe(payload.timezone);
    expect(Date.parse(result.fetchedAt)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(result.fetchedAt)).toBeLessThanOrEqual(Date.now());
    expect(result.current).toEqual({
      time: '2026-10-07T10:15',
      temperatureCelsius: 23.1,
      apparentTemperatureCelsius: 24,
      relativeHumidity: 58,
      isDay: true,
      precipitationMm: 0,
      weatherCode: 2,
      descriptionPtBr: 'Parcialmente nublado',
      windSpeedKmh: 9.4,
      windDirectionDegrees: 110,
      windGustsKmh: 14.8,
    });
    expect(result.forecast).toEqual([
      {
        date: dates[0],
        weatherCode: 2,
        temperatureMinCelsius: 17.2,
        temperatureMaxCelsius: 25.1,
        precipitationProbabilityMax: 10,
      },
      {
        date: dates[1],
        weatherCode: 3,
        temperatureMinCelsius: 18,
        temperatureMaxCelsius: 26,
        precipitationProbabilityMax: 20,
      },
      {
        date: dates[2],
        weatherCode: 61,
        temperatureMinCelsius: 16.8,
        temperatureMaxCelsius: 22.4,
        precipitationProbabilityMax: 70,
      },
      {
        date: dates[3],
        weatherCode: 3,
        temperatureMinCelsius: 17.1,
        temperatureMaxCelsius: 24.8,
        precipitationProbabilityMax: 30,
      },
      {
        date: dates[4],
        weatherCode: 1,
        temperatureMinCelsius: 18.2,
        temperatureMaxCelsius: 27,
        precipitationProbabilityMax: 0,
      },
    ]);
  });

  it('preserva zero, noite e leituras parciais sem reutilizar valores de outro dia', async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        timezone: 'America/Sao_Paulo',
        current: { is_day: 0, weather_code: 0, temperature_2m: 0 },
        daily: { time: dates, temperature_2m_min: [0, null, 2] },
      }),
    );

    const result = await getWeather(city);

    expect(result.current).toMatchObject({
      temperatureCelsius: 0,
      isDay: false,
      weatherCode: 0,
      descriptionPtBr: 'C\u00e9u limpo',
      apparentTemperatureCelsius: null,
      relativeHumidity: null,
      windSpeedKmh: null,
    });
    expect(result.forecast.map((day) => day.temperatureMinCelsius)).toEqual([
      0,
      null,
      2,
      null,
      null,
    ]);
    expect(result.forecast.every((day) => day.weatherCode === null)).toBe(true);
  });

  it('usa timezone auto sem fuso na cidade e conserva o fuso retornado', async () => {
    fetchMock.mockResolvedValue(Response.json({ ...payload, current: {} }));

    const result = await getWeather({ name: 'Cidade', latitude: 1, longitude: 2 });

    const url = new URL(String(fetchMock.mock.calls[0][0]));
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(result.timezone).toBe(payload.timezone);
    expect(result.current.isDay).toBeNull();
    expect(result.current.descriptionPtBr).toBeNull();
  });

  it.each([
    {},
    { daily: payload.daily },
    { current: payload.current },
    { current: null, daily: payload.daily },
    { current: payload.current, daily: null },
    { current: payload.current, daily: {} },
    { current: payload.current, daily: { time: dates.slice(0, 4) } },
    null,
  ])('rejeita resposta incompleta: %j', async (data) => {
    fetchMock.mockResolvedValue(Response.json(data));

    await expect(getWeather(city)).rejects.toThrow(
      new WeatherServiceError('Resposta de clima incompleta.'),
    );
  });

  it.each([400, 429, 500])('lanca WeatherServiceError para HTTP %s', async (status) => {
    fetchMock.mockResolvedValue(new Response('Erro interno do provedor', { status }));

    await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
  });

  it('converte falha de rede em WeatherServiceError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Erro interno da rede'));

    await expect(getWeather(city)).rejects.toThrow(new WeatherServiceError('Falha de rede.'));
  });

  it('converte JSON invalido em WeatherServiceError', async () => {
    fetchMock.mockResolvedValue(new Response('JSON invalido'));

    await expect(getWeather(city)).rejects.toThrow(WeatherServiceError);
  });
});

describe('fetchWithTimeout', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const url = 'https://api.open-meteo.com/v1/forecast';

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it.each([200, 500])('retorna a resposta HTTP %s e limpa o timer sem abortar', async (status) => {
    const response = new Response(null, { status });
    fetchMock.mockResolvedValue(response);

    await expect(fetchWithTimeout(url)).resolves.toBe(response);

    const signal = fetchMock.mock.calls[0][1]?.signal;
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(signal?.aborted).toBe(false);
  });

  it.each([
    ['helper', () => fetchWithTimeout(url)],
    ['geocoding', () => searchCities('Cidade')],
    ['forecast', () => getWeather({ name: 'Cidade', latitude: 1, longitude: 2 })],
  ] as const)('aborta %s aos 10s e converte AbortError em WeatherServiceError', async (_label, request) => {
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => {
              reject(new DOMException('Mensagem interna de abort', 'AbortError'));
            },
            { once: true },
          );
        }),
    );
    const result = request();
    const assertion = expect(result).rejects.toThrow(
      new WeatherServiceError('A requisi\u00e7\u00e3o demorou demais.'),
    );
    const signal = fetchMock.mock.calls[0][1]?.signal;

    await vi.advanceTimersByTimeAsync(9_999);
    expect(signal?.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(1);

    await assertion;
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    [new DOMException('Detalhes internos', 'AbortError'), 'A requisi\u00e7\u00e3o demorou demais.'],
    [new TypeError('Detalhes internos'), 'Falha de rede.'],
  ])('normaliza rejeicao %s e limpa o timer', async (error, message) => {
    fetchMock.mockRejectedValue(error);

    await expect(fetchWithTimeout(url)).rejects.toThrow(new WeatherServiceError(message));

    expect(vi.getTimerCount()).toBe(0);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(false);
  });
});
