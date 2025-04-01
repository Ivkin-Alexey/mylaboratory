import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import routes from './routes';

// Устанавливаем переменную окружения для разрешенных хостов
process.env.VITE_ALLOWED_HOSTS = "0e8c7ed3-260d-4f0b-b5fb-53fd79f6710d-00-1xde2lvs0krlt.worf.replit.dev,.replit.dev,.repl.co";

function log(message: string) {
  console.log(`${new Date().toLocaleTimeString()} [express] ${message}`);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

  // В режиме разработки используем Vite dev server с настройками для Replit
  const allowedHosts = process.env.VITE_ALLOWED_HOSTS ? 
    process.env.VITE_ALLOWED_HOSTS.split(',') : 
    ["0e8c7ed3-260d-4f0b-b5fb-53fd79f6710d-00-1xde2lvs0krlt.worf.replit.dev"];
    
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: true,
      port: 5000,
      host: '0.0.0.0',
      strictPort: false,
      allowedHosts: allowedHosts
    },
    appType: 'spa',
    optimizeDeps: {
      force: true
    },
    clearScreen: false
  });

  app.use(vite.middlewares);
  app.use(express.json());
  
  // Подключаем API маршруты
  app.use('/api', routes);

  // Для обработки всех остальных запросов в режиме разработки
  app.use('*', async (req, res, next) => {
    try {
      // Сервер может просто отдать статику в режиме разработки
      // Vite middleware обработает всё остальное
      next();
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal Server Error');
    }
  });

  const server = app.listen(port, '0.0.0.0', () => {
    log(`Server running on port ${port}`);
  });

  return { app, server };
}

startServer();

export default startServer;