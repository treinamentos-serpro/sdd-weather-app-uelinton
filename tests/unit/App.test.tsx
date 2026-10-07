import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { mockWeatherData } from '../../src/lib/weatherMock';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/services/weatherService')>();
  return { ...actual, searchCities: vi.fn(), getWeather: vi.fn() };
});

const searchCitiesMock = vi.mocked(searchCities);
const getWeatherMock = vi.mocked(getWeather);

beforeEach(() => {
  searchCitiesMock.mockReset();
  getWeatherMock.mockReset();
  searchCitiesMock.mockResolvedValue([mockWeatherData.city]);
  getWeatherMock.mockResolvedValue(mockWeatherData);
});

afterEach(cleanup);

describe('App', () => {
  it('inicia em idle, com marca, busca e Celsius sem consultar dados', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'SDD Weather' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Clima na sua cidade' })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Cidade' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '\u00b0C' })).toHaveAttribute('aria-pressed', 'true');
    expect(searchCitiesMock).not.toHaveBeenCalled();
    expect(getWeatherMock).not.toHaveBeenCalled();
  });

  it('apresenta loading e depois sucesso, convertendo todos os valores sem nova busca', async () => {
    const user = userEvent.setup();
    let resolveWeather: (data: WeatherData) => void = () => {};
    getWeatherMock.mockImplementation(
      () =>
        new Promise<WeatherData>((resolve) => {
          resolveWeather = resolve;
        }),
    );
    render(<App />);
    await user.type(screen.getByRole('searchbox'), '  S\u00e3o Paulo  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('status')).toHaveTextContent('Carregando...');
    expect(screen.getByRole('searchbox')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveFocus();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();

    await act(async () => resolveWeather(mockWeatherData));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('23,1 \u00b0C')).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveFocus();
    expect(
      screen.getByText('Dados de S\u00e3o Paulo carregados em graus Celsius.'),
    ).toHaveAttribute('aria-live', 'polite');
    await user.click(screen.getByRole('button', { name: '\u00b0F' }));
    expect(screen.getByText('73,6 \u00b0F')).toBeInTheDocument();
    expect(screen.getByText('80,6 \u00b0F')).toBeInTheDocument();
    expect(screen.getByText('64,4 \u00b0F')).toBeInTheDocument();
    expect(
      screen.getByText('Dados de S\u00e3o Paulo carregados em graus Fahrenheit.'),
    ).toHaveAttribute('aria-atomic', 'true');
    expect(screen.queryByText(/\d.*\u00b0C$/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '\u00b0C' }));
    expect(screen.getByText('23,1 \u00b0C')).toBeInTheDocument();
    expect(searchCitiesMock).toHaveBeenCalledExactlyOnceWith('S\u00e3o Paulo');
    expect(getWeatherMock).toHaveBeenCalledExactlyOnceWith(mockWeatherData.city);
    expect(mockWeatherData.current.temperatureCelsius).toBe(23.1);
  });

  it('apresenta empty sem dados antigos e permite uma nova busca', async () => {
    const user = userEvent.setup();
    searchCitiesMock.mockResolvedValueOnce([mockWeatherData.city]).mockResolvedValueOnce([]);
    render(<App />);
    const input = screen.getByRole('searchbox');
    await user.type(input, 'Sao Paulo{Enter}');
    expect(await screen.findByText('23,1 \u00b0C')).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, 'Atlantida{Enter}');
    expect(
      await screen.findByRole('heading', { name: 'Nenhuma cidade encontrada' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('23,1 \u00b0C')).not.toBeInTheDocument();
    expect(input).toBeEnabled();
    expect(screen.getByText('Nenhuma cidade encontrada.')).toHaveAttribute('aria-live', 'polite');
    expect(getWeatherMock).toHaveBeenCalledTimes(1);
  });

  it('apresenta error e retry repete a consulta mantendo a unidade selecionada', async () => {
    const user = userEvent.setup();
    getWeatherMock
      .mockRejectedValueOnce(new Error('Erro interno'))
      .mockResolvedValueOnce(mockWeatherData);
    render(<App />);
    await user.click(screen.getByRole('button', { name: '\u00b0F' }));
    await user.type(screen.getByRole('searchbox'), 'Sao Paulo{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'N\u00e3o foi poss\u00edvel consultar o clima.',
    );
    expect(screen.queryByText('Erro interno')).not.toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(await screen.findByText('73,6 \u00b0F')).toBeInTheDocument();
    expect(searchCitiesMock).toHaveBeenCalledExactlyOnceWith('Sao Paulo');
    expect(getWeatherMock).toHaveBeenCalledTimes(2);
    expect(getWeatherMock).toHaveBeenNthCalledWith(1, mockWeatherData.city);
    expect(getWeatherMock).toHaveBeenNthCalledWith(2, mockWeatherData.city);
  });

  it('nao inicia consulta com entrada vazia', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole('searchbox'), '   {Enter}');
    expect(searchCitiesMock).not.toHaveBeenCalled();
    expect(getWeatherMock).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Informe o nome da cidade.');
  });

  it('retry de erro na busca repete geocoding e depois carrega o clima', async () => {
    const user = userEvent.setup();
    searchCitiesMock.mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'));
    render(<App />);
    await user.type(screen.getByRole('searchbox'), 'sao paulo{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
    expect(getWeatherMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('23,1 \u00b0C')).toBeInTheDocument();
    expect(searchCitiesMock.mock.calls).toEqual([['sao paulo'], ['sao paulo']]);
    expect(getWeatherMock).toHaveBeenCalledExactlyOnceWith(mockWeatherData.city);
    expect(screen.queryByText(/Dados fict/)).not.toBeInTheDocument();
  });
});
