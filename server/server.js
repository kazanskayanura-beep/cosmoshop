// server/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====== ENV ======
const {
  PORT = 5177,
  JWT_SECRET = 'change_me',
  YOOKASSA_SHOP_ID,
  YOOKASSA_SECRET_KEY,
  RETURN_URL = 'http://localhost:5173/'
} = process.env;

// ====== APP ======
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ====== Файловое "хранилище" ======
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const usersFile = path.join(dataDir, 'users.json');
const bookingsFile = path.join(dataDir, 'bookings.json');
const ordersFile = path.join(dataDir, 'orders.json');

function readJSON(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf8');
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2), 'utf8');
}

// ====== AUTH ======
function generateToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });
}

// Регистрация: email или phone + пароль
app.post('/api/register', async (req, res) => {
  try {
    const { email, phone, password } = req.body || {};
    if ((!email && !phone) || !password) {
      return res.status(400).json({ error: 'Укажите e-mail или телефон и пароль' });
    }
    const users = readJSON(usersFile, []);
    const exists = users.find(u => (email && u.email === email) || (phone && u.phone === phone));
    if (exists) return res.status(409).json({ error: 'Пользователь уже существует' });

    const hash = await bcrypt.hash(password, 10);
    const user = {
      id: uuid(),
      email: email || null,
      phone: phone || null,
      passwordHash: hash,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    writeJSON(usersFile, users);

    const token = generateToken(user);
    return res.json({ token, user: { id: user.id, email: user.email, phone: user.phone } });
  } catch (e) {
    console.error('register error', e);
    res.status(500).json({ error: 'register failed' });
  }
});

// Логин: email или phone + пароль
app.post('/api/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body || {};
    if ((!email && !phone) || !password) {
      return res.status(400).json({ error: 'Укажите e-mail или телефон и пароль' });
    }
    const users = readJSON(usersFile, []);
    const user = users.find(u => (email && u.email === email) || (phone && u.phone === phone));
    if (!user) return res.status(401).json({ error: 'Неверные данные' });

    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(401).json({ error: 'Неверные данные' });

    const token = generateToken(user);
    return res.json({ token, user: { id: user.id, email: user.email, phone: user.phone } });
  } catch (e) {
    console.error('login error', e);
    res.status(500).json({ error: 'login failed' });
  }
});

// "Отправка" кода восстановления (смс/почта) — для демо просто логируем
const resetCodes = new Map(); // key: email|phone, value: { code, exp }
app.post('/api/forgot-password', (req, res) => {
  const { email, phone } = req.body || {};
  const key = email || phone;
  if (!key) return res.status(400).json({ error: 'Укажите e-mail или телефон' });

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const exp = Date.now() + 15 * 60 * 1000; // 15 минут
  resetCodes.set(key, { code, exp });
  console.log('[RESET CODE]', key, '=>', code);

  res.json({ ok: true });
});

// Подтверждение кода и установка нового пароля
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, phone, code, newPassword } = req.body || {};
    const key = email || phone;
    if (!key || !code || !newPassword) return res.status(400).json({ error: 'Нужно email/phone, код и новый пароль' });

    const entry = resetCodes.get(key);
    if (!entry || entry.exp < Date.now() || entry.code !== code) {
      return res.status(400).json({ error: 'Код недействителен' });
    }
    resetCodes.delete(key);

    const users = readJSON(usersFile, []);
    const idx = users.findIndex(u => (email && u.email === email) || (phone && u.phone === phone));
    if (idx === -1) return res.status(404).json({ error: 'Пользователь не найден' });

    users[idx].passwordHash = await bcrypt.hash(newPassword, 10);
    writeJSON(usersFile, users);

    res.json({ ok: true });
  } catch (e) {
    console.error('reset error', e);
    res.status(500).json({ error: 'reset failed' });
  }
});

// ====== BOOKING ======
app.post('/api/bookings', (req, res) => {
  try {
    const { name, phone, date, time, city = 'Пермь', address = '' } = req.body || {};
    if (!name || !phone || !date || !time) return res.status(400).json({ error: 'Заполните все поля' });

    const list = readJSON(bookingsFile, []);
    const row = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      name, phone, date, time, city, address
    };
    list.push(row);
    writeJSON(bookingsFile, list);

    res.json({ ok: true, id: row.id });
  } catch (e) {
    console.error('bookings error', e);
    res.status(500).json({ error: 'bookings failed' });
  }
});

// ====== ORDERS ======
app.post('/api/orders', (req, res) => {
  try {
    const { items = [], total = 0, city = '', address = '', method = 'cod' } = req.body || {};
    const list = readJSON(ordersFile, []);
    const row = {
      id: String(Date.now()).slice(-6),
      createdAt: new Date().toISOString(),
      items, total, pickup: { city, address },
      method,
      status: 'готов к выдаче'
    };
    list.push(row);
    writeJSON(ordersFile, list);

    res.json({ ok: true, id: row.id });
  } catch (e) {
    console.error('orders error', e);
    res.status(500).json({ error: 'orders failed' });
  }
});

// ====== YooKassa через axios (без SDK) ======
app.post('/api/create-payment', async (req, res) => {
  try {
    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      return res.status(500).json({ error: 'YOOKASSA env not set' });
    }
    const { amount, currency = 'RUB', description = 'Оплата заказа', meta = {} } = req.body;

    const idempotenceKey = uuid();
    const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

    const { data } = await axios.post(
      'https://api.yookassa.ru/v3/payments',
      {
        amount: { value: Number(amount).toFixed(2), currency },
        confirmation: { type: 'redirect', return_url: RETURN_URL },
        capture: true,
        description,
        metadata: meta
      },
      {
        headers: {
          'Idempotence-Key': idempotenceKey,
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    res.json({
      id: data.id,
      status: data.status,
      confirmation_url: data.confirmation?.confirmation_url
    });
  } catch (err) {
    console.error('create-payment error', err.response?.data || err.message);
    res.status(500).json({ error: 'create-payment failed' });
  }
});

// Вебхук ЮKassa (по желанию)
app.post('/api/yookassa/webhook', (req, res) => {
  console.log('Webhook:', req.body?.event, req.body?.object?.status, req.body?.object?.id);
  res.status(200).send('OK');
});

// ====== START ======
app.listen(PORT, () => {
  console.log('Server listening on http://localhost:' + PORT);
});
