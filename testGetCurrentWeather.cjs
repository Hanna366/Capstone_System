const weatherService = require('./dist/src/services/weatherService').weatherService;

(async () => {
  try {
    const weatherData = await weatherService.getCurrentWeather('Malaybalay City, PH');
    console.log('Weather Data:', weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
  }
})();