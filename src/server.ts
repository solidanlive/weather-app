import express from "express";
import path from "node:path";
import { getWeather } from "./weather";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.static(path.join(process.cwd(), "public")));

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/weather", async (request, response) => {
  const latitude = Number(request.query.latitude);
  const longitude = Number(request.query.longitude);

  const latitudeIsValid =
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90;

  const longitudeIsValid =
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180;

  if (!latitudeIsValid || !longitudeIsValid) {
    response.status(400).json({
      error: "Valid latitude and longitude values are required."
    });

    return;
  }

  try {
    const weather = await getWeather(latitude, longitude);
    response.json(weather);
  } catch (error) {
    console.error("Weather request failed:", error);

    response.status(502).json({
      error: "Unable to retrieve weather information."
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Weather app running at http://localhost:${port}`);
});