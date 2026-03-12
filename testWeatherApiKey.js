import { weatherService } from './src/services/weatherService.js';

(async () => {
  try {
    const isValid = await weatherService.testApiKey();
    console.log('Weather API Key is valid:', isValid);
  } catch (error) {
    console.error('Error testing Weather API Key:', error);
  }
})();