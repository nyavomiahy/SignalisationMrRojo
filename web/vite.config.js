// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // Vite écoute dans le conteneur
    watch: {
      usePolling: true,  // Forcer le watcher sur Windows
      interval: 100,     // Intervalle plus rapide
      ignored: ["node_modules/**", "backend/**", "Dockerfile.*"] // Ignorer tout ce qui n’est pas frontend
    },
  },
});

