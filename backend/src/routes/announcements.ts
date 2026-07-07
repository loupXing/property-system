import { Router } from 'express';
import { query, get, run } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const announcements = await query('SELECT * FROM announcements ORDER BY is_pinned DESC, id DESC');
    res.json(announcements);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, content, type, author, is_pinned } = req.body;
    if (!title || !content) return res.status(400).json({ message: '标题和内容不能为空' });
    const result = await run(
      'INSERT INTO announcements (title, content, type, author, is_pinned) VALUES (?, ?, ?, ?, ?)',
      [title, content, type || '通知', author || null, is_pinned ? 1 : 0]
    );
    const announcement = await get('SELECT * FROM announcements WHERE id = ?', [result.insertId]);
    res.status(201).json(announcement);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, content, type, author, is_pinned } = req.body;
    const existing = await get('SELECT id FROM announcements WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: '公告不存在' });
    await run(
      'UPDATE announcements SET title=?, content=?, type=?, author=?, is_pinned=? WHERE id=?',
      [title, content, type, author, is_pinned ? 1 : 0, req.params.id]
    );
    const announcement = await get('SELECT * FROM announcements WHERE id = ?', [req.params.id]);
    res.json(announcement);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: '公告不存在' });
    res.json({ message: '删除成功' });
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
