import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  // The site is served from https://<user>.github.io/user-app-service/
  base: '/user-app-service/',
  plugins: [react()],
})
