export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id?: number;
  name: string;
  admin1?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  elevation?: number;
}

export interface CurrentWeather {
  time: string | null;
  temperatureCelsius: number | null;
  apparentTemperatureCelsius: number | null;
  relativeHumidity: number | null;
  isDay: boolean | null;
  precipitationMm: number | null;
  weatherCode: number | null;
  descriptionPtBr: string | null;
  windSpeedKmh: number | null;
  windDirectionDegrees: number | null;
  windGustsKmh: number | null;
  pressureSurfaceHpa?: number | null;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  temperatureMinCelsius: number | null;
  temperatureMaxCelsius: number | null;
  precipitationProbabilityMax: number | null;
}

export interface WeatherData {
  city: City;
  timezone: string;
  fetchedAt: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
}
