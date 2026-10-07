import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

afterEach(cleanup);

describe('LoadingState', () => {
  it('anuncia o carregamento como status e nao oferece acoes', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando...');
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('apresenta a mensagem como alerta sem tentar novamente automaticamente', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Falha de rede." onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falha de rede.');
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeInTheDocument();
    expect(onRetry).not.toHaveBeenCalled();
  });

  it.each(['', '   '])('garante mensagem nao vazia para %j', (message) => {
    render(<ErrorState message={message} onRetry={vi.fn()} />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'N\u00e3o foi poss\u00edvel consultar o clima.',
    );
  });

  it.each([
    'click',
    'enter',
    'space',
  ])('invoca onRetry uma vez por ativacao %s', async (activation) => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Tempo de espera excedido." onRetry={onRetry} />);
    const button = screen.getByRole('button', { name: 'Tentar novamente' });

    if (activation === 'click') {
      await user.click(button);
    } else {
      await user.tab();
      expect(button).toHaveFocus();
      await user.keyboard(activation === 'enter' ? '{Enter}' : ' ');
    }

    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });

  it('nao envia o formulario que contem o estado', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    const onRetry = vi.fn();
    render(
      <form onSubmit={onSubmit}>
        <ErrorState message="Falha de rede." onRetry={onRetry} />
      </form>,
    );
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('EmptyState', () => {
  it('apresenta titulo e dica padrao em uma regiao nomeada', () => {
    render(<EmptyState />);
    expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
    expect(screen.getByText('Confira o nome da cidade e tente outra busca.')).toBeInTheDocument();
  });

  it('aceita titulo e dica personalizados', () => {
    render(<EmptyState title="Sem previsao" hint="Selecione outra cidade." />);
    expect(screen.getByRole('heading', { name: 'Sem previsao' })).toBeInTheDocument();
    expect(screen.getByText('Selecione outra cidade.')).toBeInTheDocument();
  });
});

it('remove o status de carregamento quando o componente pai muda de estado', () => {
  const { rerender } = render(<LoadingState />);
  rerender(<ErrorState message="Falha de rede." onRetry={vi.fn()} />);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toBeInTheDocument();
  rerender(<EmptyState />);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeInTheDocument();
});
