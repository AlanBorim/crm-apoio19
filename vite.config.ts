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
    allowedHosts: ['5173-i1rxewkzxonsy60fq39fa-5e7ba351.manusvm.computer'],
    proxy: {
      // Proxy para o túnel SSH (acessando o backend remoto via localhost:8000)
      '/api': {
        target: 'https://localhost:8000',
        changeOrigin: true,
        secure: false, // Necessário pois o certificado do servidor remoto não baterá com localhost
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Garante que o caminho seja mantido
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Opcional: Se o servidor remoto exigir o Host correto, descomente abaixo:
            // proxyReq.setHeader('Host', 'crm.apoio19.com.br');
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

