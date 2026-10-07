import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import CurrentWeather from '../../src/components/CurrentWeather';
import { mockWeatherData } from '../../src/lib/weatherMock';

afterEach(cleanup);

describe('CurrentWeather', () => {
  it('apresenta cidade, temperatura, icone, condicao, observacao e metricas', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={mockWeatherData.current}
        unit="celsius"
      />,
    );

    expect(screen.getByRole('heading', { name: 'S\u00e3o Paulo' })).toBeInTheDocument();
    expect(screen.getByText('23,1 \u00b0C')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Parcialmente nublado' })).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByText('2026-10-07T10:15')).toHaveAttribute('datetime', '2026-10-07T10:15');
    for (const [label, value] of [
      ['Umidade', '58 %'],
      ['Vento', '9,4 km/h'],
      ['Precipita\u00e7\u00e3o', '0 mm'],
      ['Press\u00e3o', '1.009,6 hPa'],
    ]) {
      expect(screen.getByText(label).nextElementSibling).toHaveTextContent(value);
    }
  });

  it('alterna a temperatura sem modificar os dados nem as demais metricas', () => {
    const props = { city: mockWeatherData.city, current: mockWeatherData.current };
    const { rerender } = render(<CurrentWeather {...props} unit="celsius" />);
    rerender(<CurrentWeather {...props} unit="fahrenheit" />);
    expect(screen.getByText('73,6 \u00b0F')).toBeInTheDocument();
    expect(screen.getByText('9,4 km/h')).toBeInTheDocument();
    rerender(<CurrentWeather {...props} unit="celsius" />);
    expect(screen.getByText('23,1 \u00b0C')).toBeInTheDocument();
    expect(mockWeatherData.current.temperatureCelsius).toBe(23.1);
  });

  it('mostra Sem dados para campos ausentes e valores nao finitos', () => {
    const current = {
      ...mockWeatherData.current,
      temperatureCelsius: null,
      time: null,
      descriptionPtBr: null,
      weatherCode: null,
      relativeHumidity: null,
      windSpeedKmh: Number.NaN,
      precipitationMm: Number.POSITIVE_INFINITY,
      pressureSurfaceHpa: undefined,
    };
    render(<CurrentWeather city={mockWeatherData.city} current={current} unit="celsius" />);
    expect(screen.getAllByText('Sem dados')).toHaveLength(6);
    expect(screen.getByText('Observa\u00e7\u00e3o: Sem dados')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Sem dados' })).toBeInTheDocument();
  });

  it('deriva a condicao do codigo quando a descricao nao esta disponivel', () => {
    render(
      <CurrentWeather
        city={mockWeatherData.city}
        current={{ ...mockWeatherData.current, descriptionPtBr: null, weatherCode: 61 }}
        unit="celsius"
      />,
    );
    expect(screen.getByText('Chuva leve')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Chuva leve' })).toBeInTheDocument();
  });
});
