import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // bind host so localhost/127.0.0.1 both work reliably in Windows environments
    host: true,
    port: 5173
  }
})
