import { useId } from 'react';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

const metricFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function formatMetric(value: number | null | undefined, suffix: string): string {
  return value == null || !Number.isFinite(value)
    ? 'Sem dados'
    : `${metricFormatter.format(value)} ${suffix}`;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const headingId = useId();
  const { Icon, description } = getWeatherCondition(current.weatherCode, current.isDay);
  const condition = current.descriptionPtBr?.trim() || description;
  const metrics = [
    { label: 'Umidade', value: formatMetric(current.relativeHumidity, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, 'km/h') },
    { label: 'Precipita\u00e7\u00e3o', value: formatMetric(current.precipitationMm, 'mm') },
    { label: 'Press\u00e3o', value: formatMetric(current.pressureSurfaceHpa, 'hPa') },
  ];

  return (
    <section
      aria-labelledby={headingId}
      className="w-full min-w-0 border-y border-white/10 bg-white/5 px-4 py-8 font-sans text-white backdrop-blur-md sm:px-8"
    >
      <h2 id={headingId} className="break-words text-2xl font-semibold">
        {city.name}
      </h2>
      <p className="mt-1 break-words text-sm text-white/70">
        {[city.admin1, city.country].filter(Boolean).join(', ')}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-5">
        <Icon role="img" aria-label={description} className="h-20 w-20 shrink-0 text-sun" />
        <p className="min-w-0 break-words text-6xl font-semibold sm:text-7xl">
          {formatTemperature(current.temperatureCelsius, unit)}
        </p>
      </div>
      <p className="mt-3 break-words text-lg">{condition}</p>
      <p className="mt-2 break-words text-sm text-white/70">
        {'Observa\u00e7\u00e3o: '}
        {current.time ? <time dateTime={current.time}>{current.time}</time> : 'Sem dados'}
      </p>
      <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-white/10 pt-6 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="min-w-0">
            <dt className="break-words text-sm text-white/70">{metric.label}</dt>
            <dd className="mt-1 break-words text-lg font-medium">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
