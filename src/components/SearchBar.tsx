import { type FormEvent, useId, useRef, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
  busy?: boolean;
}

export default function SearchBar({ onSearch, disabled = false, busy = false }: SearchBarProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = `${inputId}-error`;
  const [city, setCity] = useState('');
  const [hasError, setHasError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || busy) return;

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setHasError(true);
      inputRef.current?.focus();
      return;
    }

    setHasError(false);
    onSearch(trimmedCity);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidade"
      onSubmit={handleSubmit}
      className="w-full min-w-0 font-sans"
    >
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-white">
        Cidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          name="city"
          value={city}
          onChange={(event) => {
            setCity(event.target.value);
            setHasError(false);
          }}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
          className="min-w-0 flex-1 rounded-lg border border-white/40 bg-white/5 px-4 py-3 text-white shadow-glass backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled}
          aria-disabled={busy || undefined}
          className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-5 py-3 font-medium text-white backdrop-blur-md hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 aria-disabled:cursor-wait aria-disabled:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Buscar
        </button>
      </div>
      {hasError && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-sun">
          Informe o nome da cidade.
        </p>
      )}
    </form>
  );
}
