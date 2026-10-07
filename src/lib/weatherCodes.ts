import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  type LucideIcon,
  Moon,
  Sun,
} from 'lucide-react';

interface WeatherCondition {
  description: string;
  Icon: LucideIcon;
}

const conditions: Record<number, WeatherCondition> = {
  0: { description: 'C\u00e9u limpo', Icon: Sun },
  1: { description: 'Predominantemente limpo', Icon: CloudSun },
  2: { description: 'Parcialmente nublado', Icon: CloudSun },
  3: { description: 'Nublado', Icon: Cloud },
  45: { description: 'Nevoeiro', Icon: CloudFog },
  48: { description: 'Nevoeiro com geada', Icon: CloudFog },
  51: { description: 'Garoa leve', Icon: CloudDrizzle },
  53: { description: 'Garoa moderada', Icon: CloudDrizzle },
  55: { description: 'Garoa intensa', Icon: CloudDrizzle },
  56: { description: 'Garoa congelante leve', Icon: CloudDrizzle },
  57: { description: 'Garoa congelante intensa', Icon: CloudDrizzle },
  61: { description: 'Chuva leve', Icon: CloudRain },
  63: { description: 'Chuva moderada', Icon: CloudRain },
  65: { description: 'Chuva forte', Icon: CloudRain },
  66: { description: 'Chuva congelante leve', Icon: CloudRain },
  67: { description: 'Chuva congelante forte', Icon: CloudRain },
  71: { description: 'Neve leve', Icon: CloudSnow },
  73: { description: 'Neve moderada', Icon: CloudSnow },
  75: { description: 'Neve intensa', Icon: CloudSnow },
  77: { description: 'Gr\u00e3os de neve', Icon: CloudSnow },
  80: { description: 'Pancadas de chuva leves', Icon: CloudRain },
  81: { description: 'Pancadas de chuva moderadas', Icon: CloudRain },
  82: { description: 'Pancadas de chuva fortes', Icon: CloudRain },
  85: { description: 'Pancadas de neve leves', Icon: CloudSnow },
  86: { description: 'Pancadas de neve fortes', Icon: CloudSnow },
  95: { description: 'Trovoada', Icon: CloudLightning },
  96: { description: 'Trovoada com granizo leve', Icon: CloudLightning },
  99: { description: 'Trovoada com granizo forte', Icon: CloudLightning },
};

const unknown: WeatherCondition = { description: 'Sem dados', Icon: Cloud };

export function getWeatherCondition(
  code: number | null,
  isDay: boolean | null = null,
): WeatherCondition {
  const condition = code === null ? unknown : (conditions[code] ?? unknown);
  if (isDay === false && code === 0) return { ...condition, Icon: Moon };
  if (isDay === false && (code === 1 || code === 2)) return { ...condition, Icon: CloudMoon };
  return condition;
}
