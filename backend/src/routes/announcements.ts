import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  const announcements = db.prepare('SELECT * FROM announcements ORDER BY is_pinned DESC, id DESC').all();
  res.json(announcements);
});

router.post('/', (req, res) => {
  const { title, content, type, author, is_pinned } = req.body;
  if (!title || !content) return res.status(400).json({ message: '标题和内容不能为空' });
  const result = db.prepare(
    'INSERT INTO announcements (title, content, type, author, is_pinned) VALUES (?, ?, ?, ?, ?)'
  ).run(title, content, type || '通知', author || null, is_pinned ? 1 : 0);
  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(announcement);
});

router.put('/:id', (req, res) => {
  const { title, content, type, author, is_pinned } = req.body;
  const existing = db.prepare('SELECT id FROM announcements WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: '公告不存在' });
  db.prepare('UPDATE announcements SET title=?, content=?, type=?, author=?, is_pinned=? WHERE id=?')
    .run(title, content, type, author, is_pinned ? 1 : 0, req.params.id);
  const announcement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id);
  res.json(announcement);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: '公告不存在' });
  res.json({ message: '删除成功' });
});

export default router;
