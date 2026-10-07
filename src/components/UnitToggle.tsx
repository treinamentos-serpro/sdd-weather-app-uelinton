import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const units: { value: Unit; label: string }[] = [
  { value: 'celsius', label: '\u00b0C' },
  { value: 'fahrenheit', label: '\u00b0F' },
];

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1 font-sans shadow-glass backdrop-blur-md"
    >
      {units.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={unit === option.value}
          onClick={() => {
            if (unit !== option.value) onChange(option.value);
          }}
          className="h-11 w-14 rounded-md font-medium text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 aria-pressed:bg-accent-400 aria-pressed:text-night-900"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
