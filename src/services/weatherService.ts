import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

interface GeocodingResult {
  id?: number;
  name: string;
  admin1?: string;
  country?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  elevation?: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  timezone?: string;
  current?: {
    time?: string | null;
    temperature_2m?: number | null;
    apparent_temperature?: number | null;
    relative_humidity_2m?: number | null;
    is_day?: number | null;
    precipitation?: number | null;
    weather_code?: number | null;
    wind_speed_10m?: number | null;
    wind_direction_10m?: number | null;
    wind_gusts_10m?: number | null;
  } | null;
  daily?: {
    time?: string[];
    weather_code?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    temperature_2m_max?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
  } | null;
}

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

export async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError'
    ) {
      throw new WeatherServiceError('A requisi\u00e7\u00e3o demorou demais.');
    }
    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) {
    return [];
  }

  const response = await fetchWithTimeout(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=pt&format=json`,
  );

  if (!response.ok) {
    throw new WeatherServiceError('Nao foi possivel buscar cidades.');
  }

  const data: GeocodingResponse = await response.json();
  return (data.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    admin1: result.admin1,
    country: result.country,
    countryCode: result.country_code,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
    elevation: result.elevation,
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    daily: 'weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timezone: city.timezone ?? 'auto',
    forecast_days: '5',
  });

  const response = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) {
    throw new WeatherServiceError('Nao foi possivel consultar o clima.');
  }

  let data: ForecastResponse | null;
  try {
    data = await response.json();
  } catch {
    throw new WeatherServiceError('Resposta de clima invalida.');
  }
  if (!data?.current || !data.daily) {
    throw new WeatherServiceError('Resposta de clima incompleta.');
  }

  const dates = data.daily.time;
  if (!Array.isArray(dates) || dates.length < 5 || dates.slice(0, 5).some((date) => !date)) {
    throw new WeatherServiceError('Resposta de clima incompleta.');
  }

  const readings = data.current;
  const weatherCode = readings.weather_code ?? null;
  const isDay = readings.is_day === 1 ? true : readings.is_day === 0 ? false : null;
  const current: CurrentWeather = {
    time: readings.time ?? null,
    temperatureCelsius: readings.temperature_2m ?? null,
    apparentTemperatureCelsius: readings.apparent_temperature ?? null,
    relativeHumidity: readings.relative_humidity_2m ?? null,
    isDay,
    precipitationMm: readings.precipitation ?? null,
    weatherCode,
    descriptionPtBr:
      weatherCode === null ? null : getWeatherCondition(weatherCode, isDay).description,
    windSpeedKmh: readings.wind_speed_10m ?? null,
    windDirectionDegrees: readings.wind_direction_10m ?? null,
    windGustsKmh: readings.wind_gusts_10m ?? null,
  };
  const daily = data.daily;
  const forecast: ForecastDay[] = dates.slice(0, 5).map((date, index) => ({
    date,
    weatherCode: daily.weather_code?.[index] ?? null,
    temperatureMinCelsius: daily.temperature_2m_min?.[index] ?? null,
    temperatureMaxCelsius: daily.temperature_2m_max?.[index] ?? null,
    precipitationProbabilityMax: daily.precipitation_probability_max?.[index] ?? null,
  }));

  return {
    city,
    timezone: data.timezone ?? city.timezone ?? 'UTC',
    fetchedAt: new Date().toISOString(),
    current,
    forecast,
  };
}
