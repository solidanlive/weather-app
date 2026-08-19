interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

const weatherDescriptions: Record<number, string> = {
  0: "Clear",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Freezing fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  56: "Light freezing drizzle",
  57: "Heavy freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light rain showers",
  81: "Rain showers",
  82: "Heavy rain showers",
  85: "Light snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorms",
  96: "Thunderstorms with hail",
  99: "Severe thunderstorms with hail"
};

function describeWeather(code: number): string {
  return weatherDescriptions[code] ?? "Unknown conditions";
}

export async function getWeather(latitude: number, longitude: number) {
  const parameters = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min"
    ].join(","),
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: "auto",
    forecast_days: "5"
  });

  const url = `https://api.open-meteo.com/v1/forecast?${parameters}`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000)
  });

  if (!response.ok) {
    throw new Error(`Weather API returned status ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoResponse;

  return {
    location: {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone
    },
    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      condition: describeWeather(data.current.weather_code)
    },
    forecast: data.daily.time.map((date, index) => ({
      date,
      condition: describeWeather(data.daily.weather_code[index]),
      high: data.daily.temperature_2m_max[index],
      low: data.daily.temperature_2m_min[index]
    }))
  };
}