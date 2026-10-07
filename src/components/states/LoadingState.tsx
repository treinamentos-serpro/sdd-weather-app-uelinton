import { LoaderCircle } from 'lucide-react';

export default function LoadingState() {
  return (
    <div
      role="status"
      aria-atomic="true"
      className="flex w-full items-center gap-3 border-y border-white/10 bg-white/5 px-4 py-8 font-sans text-white backdrop-blur-md sm:px-8"
    >
      <LoaderCircle
        aria-hidden="true"
        focusable="false"
        className="h-6 w-6 shrink-0 text-accent-400 motion-safe:animate-spin"
      />
      <p className="min-w-0 break-words">Carregando...</p>
    </div>
  );
}
