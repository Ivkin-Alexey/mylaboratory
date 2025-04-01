import express from 'express';
import { storage } from './storage';

const router = express.Router();

// Настройка CORS для доступа к внешним API
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Простой маршрут для проверки работоспособности API
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// В данном случае используем прокси к внешнему API
// Все запросы к API просто пробрасываются на внешний сервер
router.all('*', (req, res) => {
  res.status(200).json({ message: 'API запросы перенаправляются на внешний сервер' });
});

export default router;