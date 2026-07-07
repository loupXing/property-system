import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get } from '../db.js';
import { JWT_SECRET } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: '请输入用户名和密码' });
    }
    const user = await get<{ id: number; username: string; password: string; name: string; role: string }>(
      'SELECT * FROM users WHERE username = ?', [username]
    );
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: '未登录' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await get('SELECT id, username, name, role, phone FROM users WHERE id = ?', [decoded.id]);
    if (!user) return res.status(404).json({ message: '用户不存在' });
    res.json(user);
  } catch {
    return res.status(401).json({ message: '登录已过期' });
  }
});

export default router;
