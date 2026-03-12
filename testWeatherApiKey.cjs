const weatherService = require('./dist/src/services/weatherService').weatherService;

(async () => {
  try {
    const isValid = await weatherService.testApiKey();
    console.log('Weather API Key is valid:', isValid);
  } catch (error) {
    console.error('Error testing Weather API Key:', error);
  }
})();