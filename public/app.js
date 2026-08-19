const statusElement = document.querySelector("#status");
const weatherElement = document.querySelector("#weather");
const forecastElement = document.querySelector("#forecast");
const locationButton = document.querySelector("#location-button");

const weatherDescriptions = {
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

function describeWeather(code) {
  return weatherDescriptions[code] ?? "Unknown conditions";
}

function requestCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
}

function describeLocationError(error) {
  switch (error.code) {
    case 1:
      return "Location permission was denied.";
    case 2:
      return "Your location is currently unavailable.";
    case 3:
      return "The location request timed out.";
    default:
      return "Your location could not be determined.";
  }
}

async function getWeather(latitude, longitude) {
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

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${parameters}`
  );

  if (!response.ok) {
    throw new Error(`Weather API returned status ${response.status}`);
  }

  const data = await response.json();

  return {
    current: {
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

function displayWeather(weather) {
  document.querySelector("#condition").textContent =
    weather.current.condition;

  document.querySelector("#temperature").textContent =
    Math.round(weather.current.temperature);

  document.querySelector("#feels-like").textContent =
    Math.round(weather.current.feelsLike);

  document.querySelector("#humidity").textContent =
    weather.current.humidity;

  document.querySelector("#wind").textContent =
    Math.round(weather.current.windSpeed);

  forecastElement.replaceChildren();

  for (const day of weather.forecast) {
    const forecastDay = document.createElement("article");
    const weekday = document.createElement("strong");
    const condition = document.createElement("span");
    const temperatures = document.createElement("span");
    const date = new Date(`${day.date}T12:00:00`);

    forecastDay.className = "forecast-day";

    weekday.textContent = date.toLocaleDateString([], {
      weekday: "short"
    });

    condition.textContent = day.condition;

    temperatures.textContent =
      `${Math.round(day.high)}° / ${Math.round(day.low)}°`;

    forecastDay.append(
      weekday,
      condition,
      temperatures
    );

    forecastElement.appendChild(forecastDay);
  }

  statusElement.textContent =
    `Updated ${new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    })}`;

  weatherElement.hidden = false;
}

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    statusElement.textContent =
      "This browser does not support location services.";

    return;
  }

  locationButton.disabled = true;
  locationButton.textContent = "Finding Location…";
  statusElement.textContent = "Requesting your location…";

  let position;

  try {
    position = await requestCurrentPosition();
  } catch (error) {
    statusElement.textContent = describeLocationError(error);
    locationButton.disabled = false;
    locationButton.textContent = "Try Again";
    return;
  }

  statusElement.textContent = "Loading local weather…";

  try {
    const weather = await getWeather(
      position.coords.latitude,
      position.coords.longitude
    );

    displayWeather(weather);
    locationButton.textContent = "Refresh My Weather";
  } catch (error) {
    console.error(error);
    statusElement.textContent = "Weather information is unavailable.";
    locationButton.textContent = "Try Again";
  } finally {
    locationButton.disabled = false;
  }
}

locationButton.addEventListener("click", useCurrentLocation);