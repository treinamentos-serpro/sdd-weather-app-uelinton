import { SearchX } from 'lucide-react';
import { useId } from 'react';

interface EmptyStateProps {
  title?: string;
  hint?: string;
}

export default function EmptyState({
  title = 'Nenhuma cidade encontrada',
  hint = 'Confira o nome da cidade e tente outra busca.',
}: EmptyStateProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="w-full border-y border-white/10 bg-white/5 px-4 py-8 font-sans text-white backdrop-blur-md sm:px-8"
    >
      <SearchX aria-hidden="true" focusable="false" className="mb-4 h-8 w-8 text-accent-400" />
      <h2 id={headingId} className="break-words text-xl font-semibold">
        {title}
      </h2>
      <p className="mt-2 break-words text-sm text-white/70">{hint}</p>
    </section>
  );
}
