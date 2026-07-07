import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { JWT_SECRET } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: '请输入用户名和密码' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as {
    id: number; username: string; password: string; name: string; role: string;
  } | undefined;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: '用户名或密码错误' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

router.get('/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: '未登录' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = db.prepare('SELECT id, username, name, role, phone FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(404).json({ message: '用户不存在' });
    res.json(user);
  } catch {
    return res.status(401).json({ message: '登录已过期' });
  }
});

export default router;
