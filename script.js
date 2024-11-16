"use strict";

const WeatherApp = class {
    constructor(apiKey, resultsBlockSelectorWeather, resultsBlockSelectorForecast) {
        this.apiKey = apiKey;
        this.resultsBlockWeather = document.querySelector(resultsBlockSelectorWeather);
        this.resultsBlockForecast = document.querySelector(resultsBlockSelectorForecast);

        this.currentWeatherData = null;
        this.currentForecastData = null;
    }

    getCurrentWeather(query) {
        return new Promise((resolve, reject) => {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=${this.apiKey}&lang=en`;
            const xhr = new XMLHttpRequest();
    
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        this.currentWeatherData = JSON.parse(xhr.responseText);
                        console.log(this.currentWeatherData);
                        resolve(this.currentWeatherData);
                    } else {
                        reject("Could not get current weather.");
                    }
                }
            };
    
            xhr.open("GET", url, true);
            xhr.send();
        });
    }

    async getForecast(query) {
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${query}&units=metric&appid=${this.apiKey}&lang=en`);
            if (!response.ok) throw new Error("Could not get weather forecast.");
            this.currentForecastData = await response.json();
            console.log(this.currentForecastData);
        } catch (error) {
            this.currentForecastData = null;
            throw error;
        }
    }

    getWeather(query) {
        this.resultsBlockWeather.innerHTML = "";
        this.resultsBlockForecast.innerHTML = "";

        this.getCurrentWeather(query)
            .catch(error => {
                console.error(error);
                this.resultsBlockWeather.innerHTML = `<p>Could not get current weather data.</p>`;
            });

        this.getForecast(query)
            .catch(error => {
                console.error(error);
                this.resultsBlockForecast.innerHTML = `<p>Could not get weather forecast data.</p>`;
            })
            .finally(() => {
                this.drawWeather();
            });
    }

    drawWeather() {
        if (!this.currentWeatherData || !this.currentForecastData) {
            console.error("Weather data is missing.");
            return;
        }

        const weatherBlock = this.createWeatherBlock(
            new Date(this.currentWeatherData.dt * 1000).toLocaleString(),
            this.currentWeatherData.main.temp,
            this.currentWeatherData.main.feels_like,
            this.currentWeatherData.weather[0].icon,
            this.currentWeatherData.weather[0].description
        );

        this.resultsBlockWeather.appendChild(weatherBlock);

        for (let forecast of this.currentForecastData.list) {
            const forecastBlock = this.createWeatherBlock(
                new Date(forecast.dt * 1000).toLocaleString(),
                forecast.main.temp,
                forecast.main.feels_like,
                forecast.weather[0].icon,
                forecast.weather[0].description
            );

            this.resultsBlockForecast.appendChild(forecastBlock);
        }
    }

    createWeatherBlock(dateString, temperature, feelsLikeTemperature, iconName, description) {
        const block = document.createElement("div");
        block.className = "weather-block";

        block.innerHTML = `
            <div class="weather-date">${dateString}</div>
            <div class="weather-temperature">${temperature.toFixed(1)} &deg;C</div>
            <div class="weather-temperature-feels-like">Feel: ${feelsLikeTemperature.toFixed(1)} &deg;C</div>
            <img class="weather-icon" src="https://openweathermap.org/img/wn/${iconName}@2x.png" alt="Weather icon">
            <div class="weather-description">${description}</div>
        `;

        return block;
    }
}

document.weatherApp = new WeatherApp("7f6d0f6986e4cddc54e9ecc6ae4ff44a", "#current-weather-data", "#forecast-data");

document.querySelector("#check-button").addEventListener("click", function() {
    const query = document.querySelector("#location-input").value;
    document.weatherApp.getWeather(query);
});
