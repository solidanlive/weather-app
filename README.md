# Weather App

A mobile-friendly weather application built as a hands-on exercise in application development, containerization, infrastructure as code, localization, and AWS hosting.

**Live application:** https://d27apey3rzosoo.cloudfront.net

## Features

* Detects the user's location through browser geolocation
* Displays the current city, region, and country
* Shows current temperature, conditions, humidity, and wind speed
* Provides a five-day forecast
* Supports Fahrenheit with mph and Celsius with km/h
* Supports English and German
* Automatically selects an initial language and measurement system from the browser locale
* Saves language and unit preferences in browser storage
* Responsive interface designed for phones
* Requires no API keys
* Served globally over HTTPS through Amazon CloudFront

## Architecture

```mermaid
flowchart LR
    User[Phone or Browser]
    CloudFront[Amazon CloudFront]
    S3[Private Amazon S3 Bucket]
    Weather[Open-Meteo API]
    Location[BigDataCloud API]

    User -->|HTTPS| CloudFront
    CloudFront -->|Origin Access Control| S3
    User -->|Weather request| Weather
    User -->|Reverse geocoding request| Location
```

The production application is completely static. CloudFront serves the files from a private S3 bucket while the browser retrieves weather and location information directly from external APIs.

There is no continuously running application server.

## Technology

* HTML, CSS, and JavaScript
* TypeScript and Node.js
* Browser Geolocation API
* Browser Local Storage
* Docker
* OpenTofu
* Amazon S3
* Amazon CloudFront
* Open-Meteo API
* BigDataCloud reverse-geocoding API
* GitHub

## Project Structure

```text
weather-app/
├── public/             Static frontend files
├── src/                TypeScript application code
├── infra/              OpenTofu S3 and CloudFront infrastructure
├── Dockerfile          Container image definition
├── package.json        Node.js scripts and dependencies
├── tsconfig.json       TypeScript configuration
└── README.md           Project documentation
```

## Run Locally

Install dependencies and compile the TypeScript project:

```bash
npm install
npm run build
npm start
```

Open:

```text
http://localhost:3000
```

The browser will request permission to access your location.

## Run with Docker

Build the image:

```bash
docker build --tag weather-app:local .
```

Start the container:

```bash
docker run \
  --detach \
  --rm \
  --name weather-app \
  --publish 3000:3000 \
  weather-app:local
```

Open:

```text
http://localhost:3000
```

Stop the container:

```bash
docker stop weather-app
```

## Infrastructure

The AWS infrastructure is managed with OpenTofu and includes:

* A private, encrypted, versioned S3 bucket
* S3 public-access blocking
* CloudFront Origin Access Control
* An HTTPS CloudFront distribution
* A remote OpenTofu state backend

The infrastructure configuration is provided as a learning reference. Before applying it in another AWS account, update the backend configuration and review all resource settings.

## Deployment

Application files are currently deployed through OpenTofu. After an update, the CloudFront cache is invalidated so users receive the latest HTML, CSS, and JavaScript.

Automated deployment through GitHub Actions is planned as the next project stage.

## Security

* The S3 bucket is not publicly accessible
* CloudFront is the only permitted S3 reader
* HTTP requests redirect to HTTPS
* No AWS credentials or API keys are stored in the repository
* Browser preferences remain on the user's device
* The complete Git history was scanned with Gitleaks before publication

## Location Privacy

Location access requires explicit browser permission. After permission is granted, the browser sends the current coordinates directly to Open-Meteo for weather data and BigDataCloud for the human-readable location name.

The application does not store or transmit location information through its own server.

## Cost Design

The production architecture uses no EC2 instance, load balancer, NAT gateway, or reserved public IP address. S3 and CloudFront remain usage-based services, so they may still generate small charges.

## Data Providers

Weather data is provided by [Open-Meteo](https://open-meteo.com/).

Location names are provided by [BigDataCloud](https://www.bigdatacloud.com/).
