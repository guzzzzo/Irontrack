import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' asegura que los assets funcionen tanto en la raíz como en subrutas de GitHub Pages
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
