import express from 'express';
import { createServer } from 'http';
import ViteExpress from 'vite-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// Простой маршрут для проверки работоспособности API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Настраиваем CORS для запросов к внешнему API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Запуск сервера
const server = createServer(app);
ViteExpress.bind(app, { 
  viteConfigOptions: {
    server: {
      host: '0.0.0.0',
      port: 5000,
      open: false
    },
    optimizeDeps: {
      force: true 
    },
    configFile: false
  }
});

const port = process.env.PORT || 5000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});