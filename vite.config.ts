import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Isso garante que os caminhos sejam relativos à raiz
  server: {
    host: '0.0.0.0', // Permite acesso externo
    allowedHosts: ['5173-i1rxewkzxonsy60fq39fa-5e7ba351.manusvm.computer'],
    proxy: {
      // Proxy para a API quando em desenvolvimento
      '/api': {
        target: 'https://crm.apoio19.com.br',
        changeOrigin: true,
        secure: false, // Para desenvolvimento com certificados auto-assinados
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})

