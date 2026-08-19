const statusElement = document.querySelector("#status");
const weatherElement = document.querySelector("#weather");
const forecastElement = document.querySelector("#forecast");
const locationButton = document.querySelector("#location-button");

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

async function loadWeather(latitude, longitude) {
  const parameters = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString()
  });

  const response = await fetch(`/api/weather?${parameters}`);

  if (!response.ok) {
    throw new Error(`Weather request returned ${response.status}`);
  }

  const weather = await response.json();

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
    const date = new Date(`${day.date}T12:00:00`);

    forecastDay.className = "forecast-day";
    forecastDay.innerHTML = `
      <strong>${date.toLocaleDateString([], {
        weekday: "short"
      })}</strong>
      <span>${day.condition}</span>
      <span>${Math.round(day.high)}° / ${Math.round(day.low)}°</span>
    `;

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
    await loadWeather(
      position.coords.latitude,
      position.coords.longitude
    );

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