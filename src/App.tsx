import { CloudSun } from 'lucide-react';
import { useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const mainRef = useRef<HTMLElement>(null);
  const { status, data, error, search, retry } = useWeather();

  const announcement =
    status === 'success' && data
      ? `Dados de ${data.city.name} carregados em graus ${unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}.`
      : status === 'empty'
        ? 'Nenhuma cidade encontrada.'
        : '';

  function handleRetry() {
    void retry();
    mainRef.current?.focus();
  }

  return (
    <div className="min-h-screen font-sans text-white">
      <a
        href="#weather-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:bg-night-800 focus:p-3 focus:ring-2 focus:ring-accent-400"
      >
        {'Ir para o conte\u00fado'}
      </a>
      <header className="border-b border-white/10 bg-night-800/80 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl items-end gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:gap-8">
          <div className="flex items-center gap-3 lg:self-center">
            <CloudSun aria-hidden="true" className="h-9 w-9 shrink-0 text-sun" />
            <h1 className="break-words text-2xl font-semibold">SDD Weather</h1>
          </div>
          <SearchBar onSearch={search} busy={status === 'loading'} />
          <div className="justify-self-start lg:pb-0.5">
            <UnitToggle unit={unit} onChange={setUnit} />
          </div>
        </div>
      </header>
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
      <main
        ref={mainRef}
        id="weather-content"
        tabIndex={-1}
        className="mx-auto min-w-0 max-w-6xl space-y-8 px-4 py-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400 sm:px-6"
      >
        {status === 'idle' && (
          <EmptyState
            title="Clima na sua cidade"
            hint="Busque uma cidade para consultar o tempo."
          />
        )}
        {status === 'loading' && <LoadingState />}
        {status === 'empty' && <EmptyState />}
        {status === 'error' && <ErrorState message={error ?? ''} onRetry={handleRetry} />}
        {status === 'success' && data && (
          <>
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <ForecastList forecast={data.forecast} unit={unit} />
            <p className="text-xs text-white/70">
              {'Open-Meteo \u00b7 '}
              <time dateTime={data.fetchedAt}>{data.fetchedAt}</time>
            </p>
          </>
        )}
      </main>
    </div>
  );
}
