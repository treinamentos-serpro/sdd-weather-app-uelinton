import { useId } from 'react';
import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

const probabilityFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const headingId = useId();
  const label = formatDayLabel(day.date);
  const { Icon, description } = getWeatherCondition(day.weatherCode);
  const probability = day.precipitationProbabilityMax;
  const rain =
    probability === null || !Number.isFinite(probability) || probability < 0 || probability > 100
      ? 'Sem dados'
      : `${probabilityFormatter.format(probability)} %`;

  return (
    <article
      aria-labelledby={headingId}
      className="h-full min-w-0 rounded-lg border border-white/10 bg-white/5 p-3 font-sans text-white shadow-glass backdrop-blur-md"
    >
      <h3 id={headingId} className="break-words text-sm font-semibold">
        <time dateTime={label === 'Sem dados' ? undefined : day.date}>{label}</time>
      </h3>
      <Icon role="img" aria-label={description} className="my-4 h-10 w-10 text-sun" />
      <dl className="space-y-3">
        <div>
          <dt className="text-xs text-white/70">{'M\u00e1xima'}</dt>
          <dd className="break-words text-lg font-semibold">
            {formatTemperature(day.temperatureMaxCelsius, unit)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-white/70">{'M\u00ednima'}</dt>
          <dd className="break-words text-sm">
            {formatTemperature(day.temperatureMinCelsius, unit)}
          </dd>
        </div>
        <div className="border-t border-white/10 pt-3">
          <dt className="break-words text-xs text-white/70">Probabilidade de chuva</dt>
          <dd className="mt-1 break-words text-sm font-medium">{rain}</dd>
        </div>
      </dl>
    </article>
  );
}
