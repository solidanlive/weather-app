const weatherCard = document.querySelector("#weather-card");
const statusElement = document.querySelector("#status");
const weatherElement = document.querySelector("#weather");
const forecastElement = document.querySelector("#forecast");
const locationElement = document.querySelector("#location-name");
const locationButton = document.querySelector("#location-button");
const languageSelect = document.querySelector("#language-select");
const unitsSelect = document.querySelector("#units-select");

const STORAGE_KEYS = {
  language: "weather-app-language",
  units: "weather-app-units"
};

const translations = {
  en: {
    pageTitle: "Local Weather",
    eyebrow: "CURRENT CONDITIONS",
    title: "Local Weather",
    languageLabel: "Language",
    unitsLabel: "Units",
    intro: "Use your location to load the weather.",
    useLocation: "Use My Location",
    currentLocation: "Current location",
    feelsLike: "Feels like",
    humidity: "Humidity",
    wind: "Wind",
    forecastHeading: "Five-day forecast",
    weatherDataBy: "Weather data by",
    locationDataBy: "Location data by",
    findingLocation: "Finding Location…",
    requestingLocation: "Requesting your location…",
    loadingWeather: "Loading local weather…",
    refreshingWeather: "Updating weather units…",
    refreshWeather: "Refresh My Weather",
    tryAgain: "Try Again",
    browserUnsupported: "This browser does not support location services.",
    permissionDenied: "Location permission was denied.",
    locationUnavailable: "Your location is currently unavailable.",
    locationTimeout: "The location request timed out.",
    locationUnknown: "Your location could not be determined.",
    weatherUnavailable: "Weather information is unavailable.",
    updated: "Updated {time}",
    unknownConditions: "Unknown conditions"
  },
  de: {
    pageTitle: "Lokales Wetter",
    eyebrow: "AKTUELLES WETTER",
    title: "Lokales Wetter",
    languageLabel: "Sprache",
    unitsLabel: "Einheiten",
    intro: "Verwende deinen Standort, um das Wetter zu laden.",
    useLocation: "Meinen Standort verwenden",
    currentLocation: "Aktueller Standort",
    feelsLike: "Gefühlt wie",
    humidity: "Luftfeuchtigkeit",
    wind: "Wind",
    forecastHeading: "Fünf-Tage-Vorhersage",
    weatherDataBy: "Wetterdaten von",
    locationDataBy: "Standortdaten von",
    findingLocation: "Standort wird ermittelt…",
    requestingLocation: "Standort wird angefragt…",
    loadingWeather: "Lokales Wetter wird geladen…",
    refreshingWeather: "Wettereinheiten werden aktualisiert…",
    refreshWeather: "Wetter aktualisieren",
    tryAgain: "Erneut versuchen",
    browserUnsupported: "Dieser Browser unterstützt keine Standortdienste.",
    permissionDenied: "Der Zugriff auf den Standort wurde verweigert.",
    locationUnavailable: "Dein Standort ist derzeit nicht verfügbar.",
    locationTimeout: "Die Standortanfrage hat zu lange gedauert.",
    locationUnknown: "Dein Standort konnte nicht ermittelt werden.",
    weatherUnavailable: "Wetterinformationen sind derzeit nicht verfügbar.",
    updated: "Aktualisiert um {time}",
    unknownConditions: "Unbekannte Wetterlage"
  }
};

const weatherDescriptions = {
  en: {
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
  },
  de: {
    0: "Klar",
    1: "Überwiegend klar",
    2: "Teilweise bewölkt",
    3: "Bedeckt",
    45: "Nebelig",
    48: "Gefrierender Nebel",
    51: "Leichter Nieselregen",
    53: "Nieselregen",
    55: "Starker Nieselregen",
    56: "Leichter gefrierender Nieselregen",
    57: "Starker gefrierender Nieselregen",
    61: "Leichter Regen",
    63: "Regen",
    65: "Starker Regen",
    66: "Leichter gefrierender Regen",
    67: "Starker gefrierender Regen",
    71: "Leichter Schneefall",
    73: "Schneefall",
    75: "Starker Schneefall",
    77: "Schneegriesel",
    80: "Leichte Regenschauer",
    81: "Regenschauer",
    82: "Starke Regenschauer",
    85: "Leichte Schneeschauer",
    86: "Starke Schneeschauer",
    95: "Gewitter",
    96: "Gewitter mit Hagel",
    99: "Schwere Gewitter mit Hagel"
  }
};

let language = getInitialLanguage();
let units = getInitialUnits();
let lastCoordinates = null;
let latestWeather = null;
let locationName = "";
let loading = false;

function readPreference(key, allowedValues, fallback) {
  try {
    const value = localStorage.getItem(key);
    return allowedValues.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The app remains functional when browser storage is unavailable.
  }
}

function getInitialLanguage() {
  const browserLanguage = navigator.language?.toLowerCase() ?? "en";
  const fallback = browserLanguage.startsWith("de") ? "de" : "en";

  return readPreference(
    STORAGE_KEYS.language,
    ["en", "de"],
    fallback
  );
}

function getInitialUnits() {
  const browserLanguage = navigator.language?.replace("_", "-") ?? "";
  const region = browserLanguage.split("-")[1]?.toUpperCase();
  const fallback = region === "US" ? "imperial" : "metric";

  return readPreference(
    STORAGE_KEYS.units,
    ["imperial", "metric"],
    fallback
  );
}

function translate(key, replacements = {}) {
  let text = translations[language][key] ?? translations.en[key] ?? key;

  for (const [name, value] of Object.entries(replacements)) {
    text = text.replace(`{${name}}`, value);
  }

  return text;
}

function locale() {
  return language === "de" ? "de-DE" : "en-US";
}

function applyTranslations() {
  document.documentElement.lang = language;
  document.title = translate("pageTitle");
  languageSelect.value = language;
  unitsSelect.value = units;

  for (const element of document.querySelectorAll("[data-i18n]")) {
    element.textContent = translate(element.dataset.i18n);
  }

  if (latestWeather) {
    displayWeather(latestWeather);
    locationButton.textContent = translate("refreshWeather");
  } else if (!loading) {
    statusElement.textContent = translate("intro");
    locationButton.textContent = translate("useLocation");
  }

  if (lastCoordinates) {
    locationElement.textContent =
      locationName || translate("currentLocation");
    locationElement.hidden = false;
  }
}

function describeWeather(code) {
  return weatherDescriptions[language][code] ??
    translate("unknownConditions");
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
      return translate("permissionDenied");
    case 2:
      return translate("locationUnavailable");
    case 3:
      return translate("locationTimeout");
    default:
      return translate("locationUnknown");
  }
}

function setLoadingState(isLoading, buttonText) {
  loading = isLoading;
  weatherCard.setAttribute("aria-busy", isLoading.toString());
  locationButton.disabled = isLoading;
  languageSelect.disabled = isLoading;
  unitsSelect.disabled = isLoading;

  if (buttonText) {
    locationButton.textContent = buttonText;
  }
}

async function getWeather(latitude, longitude, requestedUnits) {
  const isImperial = requestedUnits === "imperial";
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
    temperature_unit: isImperial ? "fahrenheit" : "celsius",
    wind_speed_unit: isImperial ? "mph" : "kmh",
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
    units: requestedUnits,
    temperatureUnit: isImperial ? "°F" : "°C",
    windUnit: isImperial ? "mph" : "km/h",
    updatedAt: new Date(),
    current: {
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code
    },
    forecast: data.daily.time.map((date, index) => ({
      date,
      weatherCode: data.daily.weather_code[index],
      high: data.daily.temperature_2m_max[index],
      low: data.daily.temperature_2m_min[index]
    }))
  };
}

async function getLocationName(latitude, longitude) {
  const parameters = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    localityLanguage: language
  });

  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${parameters}`
  );

  if (!response.ok) {
    throw new Error(`Location API returned status ${response.status}`);
  }

  const data = await response.json();
  const parts = [
    data.city || data.locality,
    data.principalSubdivision,
    data.countryName
  ].filter(Boolean);

  return [...new Set(parts)].join(", ");
}

function displayWeather(weather) {
  document.querySelector("#condition").textContent =
    describeWeather(weather.current.weatherCode);

  document.querySelector("#temperature").textContent =
    Math.round(weather.current.temperature);

  document.querySelector("#current-temperature-unit").textContent =
    weather.temperatureUnit;

  document.querySelector("#feels-like").textContent =
    Math.round(weather.current.feelsLike);

  document.querySelector("#feels-like-unit").textContent =
    weather.temperatureUnit;

  document.querySelector("#humidity").textContent =
    weather.current.humidity;

  document.querySelector("#wind").textContent =
    Math.round(weather.current.windSpeed);

  document.querySelector("#wind-unit").textContent =
    weather.windUnit;

  forecastElement.replaceChildren();

  for (const day of weather.forecast) {
    const forecastDay = document.createElement("article");
    const weekday = document.createElement("strong");
    const condition = document.createElement("span");
    const temperatures = document.createElement("span");
    const date = new Date(`${day.date}T12:00:00`);

    forecastDay.className = "forecast-day";

    weekday.textContent = date.toLocaleDateString(locale(), {
      weekday: "short"
    });

    condition.textContent = describeWeather(day.weatherCode);

    temperatures.textContent =
      `${Math.round(day.high)}° / ${Math.round(day.low)}°`;

    forecastDay.append(
      weekday,
      condition,
      temperatures
    );

    forecastElement.appendChild(forecastDay);
  }

  const updatedTime = weather.updatedAt.toLocaleTimeString(locale(), {
    hour: "numeric",
    minute: "2-digit"
  });

  statusElement.textContent = translate("updated", {
    time: updatedTime
  });

  weatherElement.hidden = false;
}

async function updateLocationName() {
  if (!lastCoordinates) {
    return;
  }

  locationElement.textContent = translate("currentLocation");
  locationElement.hidden = false;

  try {
    locationName = await getLocationName(
      lastCoordinates.latitude,
      lastCoordinates.longitude
    );

    locationElement.textContent =
      locationName || translate("currentLocation");
  } catch (error) {
    console.warn("Location name is unavailable.", error);
    locationName = "";
    locationElement.textContent = translate("currentLocation");
  }
}

async function loadWeatherForCoordinates({ includeLocation = false } = {}) {
  if (!lastCoordinates) {
    return;
  }

  const weatherPromise = getWeather(
    lastCoordinates.latitude,
    lastCoordinates.longitude,
    units
  );

  const locationPromise = includeLocation
    ? updateLocationName()
    : Promise.resolve();

  const [weather] = await Promise.all([
    weatherPromise,
    locationPromise
  ]);

  latestWeather = weather;
  displayWeather(weather);
}

async function useCurrentLocation() {
  if (!navigator.geolocation) {
    statusElement.textContent = translate("browserUnsupported");
    return;
  }

  setLoadingState(true, translate("findingLocation"));
  statusElement.textContent = translate("requestingLocation");

  let position;

  try {
    position = await requestCurrentPosition();
  } catch (error) {
    statusElement.textContent = describeLocationError(error);
    setLoadingState(false, translate("tryAgain"));
    return;
  }

  lastCoordinates = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  };

  locationName = "";
  locationElement.textContent = translate("currentLocation");
  locationElement.hidden = false;
  statusElement.textContent = translate("loadingWeather");

  try {
    await loadWeatherForCoordinates({ includeLocation: true });
    setLoadingState(false, translate("refreshWeather"));
  } catch (error) {
    console.error(error);
    statusElement.textContent = translate("weatherUnavailable");
    setLoadingState(false, translate("tryAgain"));
  }
}

async function changeUnits(event) {
  const previousUnits = units;
  units = event.target.value;
  savePreference(STORAGE_KEYS.units, units);

  if (!lastCoordinates) {
    return;
  }

  setLoadingState(true, translate("refreshingWeather"));
  statusElement.textContent = translate("refreshingWeather");

  try {
    await loadWeatherForCoordinates();
    setLoadingState(false, translate("refreshWeather"));
  } catch (error) {
    console.error(error);
    units = previousUnits;
    unitsSelect.value = previousUnits;
    savePreference(STORAGE_KEYS.units, previousUnits);
    statusElement.textContent = translate("weatherUnavailable");
    setLoadingState(false, translate("tryAgain"));
  }
}

function changeLanguage(event) {
  language = event.target.value;
  savePreference(STORAGE_KEYS.language, language);
  locationName = "";
  applyTranslations();

  if (lastCoordinates) {
    void updateLocationName();
  }
}

locationButton.addEventListener("click", useCurrentLocation);
languageSelect.addEventListener("change", changeLanguage);
unitsSelect.addEventListener("change", changeUnits);

applyTranslations();
