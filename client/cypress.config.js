// cypress.config.mjs
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://activity-points.vercel.app',
    supportFile: 'cypress/support/e2e.js',
  },
});
