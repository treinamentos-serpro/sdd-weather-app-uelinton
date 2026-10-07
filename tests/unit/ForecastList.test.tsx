import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ForecastCard from '../../src/components/ForecastCard';
import ForecastList from '../../src/components/ForecastList';
import { mockWeatherData } from '../../src/lib/weatherMock';

afterEach(cleanup);

describe('ForecastList', () => {
  it('associa cada dia aos seus indicadores em cinco cards', () => {
    render(<ForecastList forecast={mockWeatherData.forecast} unit="celsius" />);
    const list = screen.getByRole('list', { name: 'Previs\u00e3o de cinco dias' });
    const cards = within(list).getAllByRole('article');
    expect(within(list).getAllByRole('listitem')).toHaveLength(5);

    const expected = [
      ['qua., 07/10', '27,0 \u00b0C', '18,0 \u00b0C', '20 %', 'Parcialmente nublado'],
      ['qui., 08/10', '29,0 \u00b0C', '19,0 \u00b0C', '5 %', 'C\u00e9u limpo'],
      ['sex., 09/10', '26,0 \u00b0C', '20,0 \u00b0C', '35 %', 'Nublado'],
      ['s\u00e1b., 10/10', '23,0 \u00b0C', '17,0 \u00b0C', '80 %', 'Chuva leve'],
      ['dom., 11/10', '25,0 \u00b0C', '16,0 \u00b0C', '10 %', 'Predominantemente limpo'],
    ];

    expected.forEach(([label, max, min, rain, condition], index) => {
      const card = within(cards[index]);
      expect(card.getByRole('heading', { name: label })).toBeInTheDocument();
      expect(card.getByText(label)).toHaveAttribute(
        'datetime',
        mockWeatherData.forecast[index].date,
      );
      expect(card.getByText('M\u00e1xima').nextElementSibling).toHaveTextContent(max);
      expect(card.getByText('M\u00ednima').nextElementSibling).toHaveTextContent(min);
      expect(card.getByText('Probabilidade de chuva').nextElementSibling).toHaveTextContent(rain);
      expect(card.getByRole('img', { name: condition })).toBeInTheDocument();
    });
  });

  it('converte maxima e minima de todos os cards e preserva as datas', () => {
    const { rerender } = render(
      <ForecastList forecast={mockWeatherData.forecast} unit="celsius" />,
    );
    rerender(<ForecastList forecast={mockWeatherData.forecast} unit="fahrenheit" />);
    const cards = screen.getAllByRole('article');
    const expected = [
      ['80,6 \u00b0F', '64,4 \u00b0F'],
      ['84,2 \u00b0F', '66,2 \u00b0F'],
      ['78,8 \u00b0F', '68,0 \u00b0F'],
      ['73,4 \u00b0F', '62,6 \u00b0F'],
      ['77,0 \u00b0F', '60,8 \u00b0F'],
    ];
    expected.forEach(([max, min], index) => {
      expect(within(cards[index]).getByText(max)).toBeInTheDocument();
      expect(within(cards[index]).getByText(min)).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'qua., 07/10' })).toBeInTheDocument();
    rerender(<ForecastList forecast={mockWeatherData.forecast} unit="celsius" />);
    expect(screen.getByText('27,0 \u00b0C')).toBeInTheDocument();
  });

  it('apresenta estado vazio sem fabricar dias', () => {
    render(<ForecastList forecast={[]} unit="celsius" />);
    expect(screen.getByRole('status')).toHaveTextContent('Sem dados');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

describe('ForecastCard', () => {
  it('mantem dados parciais e identifica campos ausentes ou invalidos', () => {
    render(
      <ForecastCard
        day={{
          ...mockWeatherData.forecast[0],
          weatherCode: null,
          temperatureMaxCelsius: null,
          temperatureMinCelsius: Number.NaN,
          precipitationProbabilityMax: null,
        }}
        unit="celsius"
      />,
    );
    expect(screen.getAllByText('Sem dados')).toHaveLength(3);
    expect(screen.getByRole('img', { name: 'Sem dados' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'qua., 07/10' })).toBeInTheDocument();
  });

  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    -1,
    101,
  ])('nao apresenta probabilidade invalida %s', (probability) => {
    render(
      <ForecastCard
        day={{ ...mockWeatherData.forecast[0], precipitationProbabilityMax: probability }}
        unit="celsius"
      />,
    );
    expect(screen.getByText('Probabilidade de chuva').nextElementSibling).toHaveTextContent(
      'Sem dados',
    );
  });

  it('preserva zero como probabilidade valida e usa fallback para data invalida', () => {
    render(
      <ForecastCard
        day={{ ...mockWeatherData.forecast[0], date: '2026-02-30', precipitationProbabilityMax: 0 }}
        unit="celsius"
      />,
    );
    expect(screen.getByRole('heading', { name: 'Sem dados' })).toBeInTheDocument();
    expect(screen.getByText('Sem dados')).not.toHaveAttribute('datetime');
    expect(screen.getByText('0 %')).toBeInTheDocument();
    expect(screen.getByText('27,0 \u00b0C')).toBeInTheDocument();
  });
});
