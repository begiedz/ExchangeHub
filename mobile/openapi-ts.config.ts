import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:8080/openapi/v1.json',
  output: {
    path: './src/types/generated',
  },
  plugins: ['@hey-api/typescript'],
});
