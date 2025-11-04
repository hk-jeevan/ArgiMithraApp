import React, { useState } from 'react'
import './Weather.css'
import { WiSunrise, WiSunset, WiHumidity, WiBarometer, WiStrongWind } from 'react-icons/wi'
import { MdVisibility } from 'react-icons/md'
import { FaThermometerHalf } from 'react-icons/fa'

export default function Weather() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [airQuality, setAirQuality] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hourlyForecast, setHourlyForecast] = useState(null)

  const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY

  // Helper to get weather icon URL
  const getIconUrl = (iconCode) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`

  // Format timestamp to time
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get day name
  const getDayName = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get AQI description
  const getAQIDescription = (aqi) => {
    const descriptions = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor']
    return descriptions[aqi - 1] || 'Unknown'
  }

  // Get user's location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude)
        },
        (err) => {
          setError('Unable to get location: ' + err.message)
          setLoading(false)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser')
    }
  }

  // Fetch weather data by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true)
      setError(null)

      if(!API_KEY) throw new Error('OpenWeather API key not set. Add VITE_OPENWEATHER_KEY to .env')

      // Fetch current weather
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      )
      if(!weatherRes.ok) throw new Error('Weather API error')
      const weatherData = await weatherRes.json()

      // Fetch 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      )
      if(!forecastRes.ok) throw new Error('Forecast API error')
      const forecastData = await forecastRes.json()

      // Fetch air quality
      const airQualityRes = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      )
      if(!airQualityRes.ok) throw new Error('Air Quality API error')
      const airQualityData = await airQualityRes.json()

      setWeather(weatherData)
      setForecast(forecastData)
      setAirQuality(airQualityData)
      setCity(weatherData.name)
      
      // Process hourly forecast for today
      const today = new Date().setHours(0, 0, 0, 0)
      const hourlyData = forecastData.list
        .filter(item => new Date(item.dt * 1000).setHours(0, 0, 0, 0) === today)
        .slice(0, 6)
      setHourlyForecast(hourlyData)

    } catch (err) {
      setError('Error fetching weather data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Search weather by city name
  const searchWeather = async (e) => {
    e.preventDefault()
    if (!city.trim()) return

    try {
      setLoading(true)
      setError(null)

      if(!API_KEY) throw new Error('OpenWeather API key not set. Add VITE_OPENWEATHER_KEY to .env')

      // Get coordinates for city
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
      )
      if(!geoRes.ok) throw new Error('Geocoding API error')
      const geoData = await geoRes.json()

      if (!geoData.length) {
        throw new Error('City not found')
      }

      const { lat, lon } = geoData[0]
      await fetchWeatherByCoords(lat, lon)

    } catch (err) {
      setError('Error searching city: ' + err.message)
      setLoading(false)
    }
  }

  // Get 5-day forecast (one entry per day)
  const getDailyForecast = () => {
    if (!forecast) return []
    
    const dailyData = {}
    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000).setHours(0, 0, 0, 0)
      if (!dailyData[date] || Math.abs(new Date(item.dt * 1000).getHours() - 12) < 
          Math.abs(new Date(dailyData[date].dt * 1000).getHours() - 12)) {
        dailyData[date] = item
      }
    })
    
    return Object.values(dailyData).slice(0, 5)
  }

  return (
    <div className="weather-tool">
      <div className="weather-search">
        <form onSubmit={searchWeather}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button type="button" onClick={getCurrentLocation} disabled={loading}>
            Current location
          </button>
        </form>
      </div>

      {error && <div className="weather-error">{error}</div>}

      {weather && (
        <div className="weather-content">
          {/* Current Weather */}
          <div className="current-weather">
            <h2>{weather.name}</h2>
            <div className="temp-display">
              <img 
                src={getIconUrl(weather.weather[0].icon)} 
                alt={weather.weather[0].description}
              />
              <div className="temperature">
                {Math.round(weather.main.temp)}°C
              </div>
              <div className="weather-description">
                {weather.weather[0].description}
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          <div className="forecast-section">
            <h3>5 days forecast</h3>
            <div className="forecast-grid">
              {getDailyForecast().map(day => (
                <div key={day.dt} className="forecast-card">
                  <img 
                    src={getIconUrl(day.weather[0].icon)}
                    alt={day.weather[0].description}
                  />
                  <div className="forecast-temp">
                    {Math.round(day.main.temp)}°C
                  </div>
                  <div className="forecast-day">
                    {getDayName(day.dt)}
                  </div>
                  <div className="forecast-desc">
                    {day.weather[0].description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Highlights */}
          <div className="highlights-section">
            <h3>Today's Highlights</h3>
            <div className="highlights-grid">
              {/* Air Quality */}
              {airQuality && (
                <div className="highlight-card air-quality">
                  <h4>Air Quality Index</h4>
                  <div className="aqi-value">
                    {getAQIDescription(airQuality.list[0].main.aqi)}
                  </div>
                  <div className="aqi-details">
                    <div className="aqi-item">
                      <span>PM2.5</span>
                      <span>{Math.round(airQuality.list[0].components.pm2_5)}</span>
                    </div>
                    <div className="aqi-item">
                      <span>PM10</span>
                      <span>{Math.round(airQuality.list[0].components.pm10)}</span>
                    </div>
                    <div className="aqi-item">
                      <span>NO2</span>
                      <span>{Math.round(airQuality.list[0].components.no2)}</span>
                    </div>
                    <div className="aqi-item">
                      <span>O3</span>
                      <span>{Math.round(airQuality.list[0].components.o3)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sunrise & Sunset */}
              <div className="highlight-card sun-times">
                <h4>Sunrise & Sunset</h4>
                <div className="sun-time-container">
                  <div className="sun-time">
                    <WiSunrise className="weather-icon" />
                    <span>Sunrise</span>
                    <strong>{formatTime(weather.sys.sunrise)}</strong>
                  </div>
                  <div className="sun-time">
                    <WiSunset className="weather-icon" />
                    <span>Sunset</span>
                    <strong>{formatTime(weather.sys.sunset)}</strong>
                  </div>
                </div>
              </div>

              {/* Other Highlights */}
              <div className="highlight-card">
                <h4><WiHumidity className="weather-icon" /> Humidity</h4>
                <div className="highlight-value">{weather.main.humidity}%</div>
              </div>

              <div className="highlight-card">
                <h4><WiBarometer className="weather-icon" /> Pressure</h4>
                <div className="highlight-value">{weather.main.pressure} hPa</div>
              </div>

              <div className="highlight-card">
                <h4><MdVisibility className="weather-icon" /> Visibility</h4>
                <div className="highlight-value">{(weather.visibility / 1000).toFixed(1)} km</div>
              </div>

              <div className="highlight-card">
                <h4><WiStrongWind className="weather-icon" /> Wind Speed</h4>
                <div className="highlight-value">{weather.wind.speed} m/s</div>
              </div>

              <div className="highlight-card">
                <h4><FaThermometerHalf className="weather-icon" /> Feels Like</h4>
                <div className="highlight-value">{Math.round(weather.main.feels_like)}°C</div>
              </div>
            </div>
          </div>

          {/* Hourly Forecast */}
          {hourlyForecast && (
            <div className="hourly-section">
              <h3>Today's Hourly Forecast</h3>
              <div className="hourly-grid">
                {hourlyForecast.map(hour => (
                  <div key={hour.dt} className="hourly-card">
                    <div className="hour">{formatTime(hour.dt)}</div>
                    <img 
                      src={getIconUrl(hour.weather[0].icon)}
                      alt={hour.weather[0].description}
                    />
                    <div className="hourly-temp">
                      {Math.round(hour.main.temp)}°C
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
