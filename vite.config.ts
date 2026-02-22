import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Isso garante que os caminhos sejam relativos à raiz
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0', // Permite acesso externo
    allowedHosts: ['5173-i1rxewkzxonsy60fq39fa-5e7ba351.manusvm.computer']
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})

