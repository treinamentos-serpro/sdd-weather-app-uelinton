import { CircleAlert, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="w-full border-y border-white/10 bg-white/5 px-4 py-8 font-sans text-white backdrop-blur-md sm:px-8"
    >
      <div className="flex items-start gap-3">
        <CircleAlert aria-hidden="true" focusable="false" className="h-6 w-6 shrink-0 text-sun" />
        <p className="min-w-0 break-words">
          {message.trim() || 'N\u00e3o foi poss\u00edvel consultar o clima.'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRetry()}
        className="mt-5 inline-flex min-h-11 max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-medium hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
      >
        <RotateCcw aria-hidden="true" focusable="false" className="h-4 w-4 shrink-0" />
        <span className="min-w-0 break-words">Tentar novamente</span>
      </button>
    </div>
  );
}
