import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,     // MUST BE TRUE: Allows the container to accept external traffic from your computer
    port: 5173,
    proxy: {
      '/api': {
        // Use the service name from your docker-compose file (e.g., content-service)
        // Inside Docker, 'localhost' would point to the frontend container itself.
        target: 'http://content-service:8080',  //Point to Java backend service
        changeOrigin: true,
        secure: false,
      },
      '/auth': { 
        target: 'http://auth-service:8081', 
        changeOrigin: true, 
        secure: false 
      }
    }
  }
})
