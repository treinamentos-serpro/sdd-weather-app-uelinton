import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../src/components/UnitToggle';
import type { Unit } from '../../src/types/weather';

afterEach(cleanup);

describe('UnitToggle', () => {
  it.each<Unit>([
    'celsius',
    'fahrenheit',
  ])('indica a unidade ativa %s em um grupo acessivel', (unit) => {
    render(<UnitToggle unit={unit} onChange={vi.fn()} />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: '\u00b0C' })).toHaveAttribute(
      'aria-pressed',
      String(unit === 'celsius'),
    );
    expect(screen.getByRole('button', { name: '\u00b0F' })).toHaveAttribute(
      'aria-pressed',
      String(unit === 'fahrenheit'),
    );
  });

  it('emite a nova unidade e aguarda a atualizacao da prop', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '\u00b0F' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');
    expect(screen.getByRole('button', { name: '\u00b0C' })).toHaveAttribute('aria-pressed', 'true');

    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    expect(screen.getByRole('button', { name: '\u00b0F' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '\u00b0C' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('permite navegar e alternar C para F e de volta usando somente o teclado', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.tab();
    expect(screen.getByRole('button', { name: '\u00b0C' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: '\u00b0F' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenNthCalledWith(1, 'fahrenheit');

    rerender(<UnitToggle unit="fahrenheit" onChange={onChange} />);
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: '\u00b0C' })).toHaveFocus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenNthCalledWith(2, 'celsius');
    expect(onChange).toHaveBeenCalledTimes(2);

    rerender(<UnitToggle unit="celsius" onChange={onChange} />);
    expect(screen.getByRole('button', { name: '\u00b0C' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('nao emite alteracao ao ativar a unidade ja selecionada', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UnitToggle unit="celsius" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '\u00b0C' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('nao envia o formulario que contem o controle', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <UnitToggle unit="celsius" onChange={vi.fn()} />
      </form>,
    );

    await user.click(screen.getByRole('button', { name: '\u00b0F' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
