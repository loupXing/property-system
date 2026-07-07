import { Router } from 'express';
import { query, get, run } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { status, category } = req.query;
    let sql = `
      SELECT ro.*, u.unit_number, b.name as building_name, c.name as community_name, r.name as resident_name
      FROM repair_orders ro
      LEFT JOIN units u ON ro.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN communities c ON b.community_id = c.id
      LEFT JOIN residents r ON ro.resident_id = r.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    if (status) { sql += ' AND ro.status = ?'; params.push(String(status)); }
    if (category) { sql += ' AND ro.category = ?'; params.push(String(category)); }
    sql += ' ORDER BY ro.id DESC';
    const orders = await query(sql, params);
    res.json(orders);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { unit_id, resident_id, title, description, category, priority } = req.body;
    if (!title) return res.status(400).json({ message: '标题不能为空' });
    const result = await run(
      'INSERT INTO repair_orders (unit_id, resident_id, title, description, category, priority) VALUES (?, ?, ?, ?, ?, ?)',
      [unit_id || null, resident_id || null, title, description || null, category || '其他', priority || '普通']
    );
    const order = await get('SELECT * FROM repair_orders WHERE id = ?', [result.insertId]);
    res.status(201).json(order);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, handler, result: repairResult } = req.body;
    const existing = await get('SELECT id FROM repair_orders WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: '工单不存在' });
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    const completedAt = status === '已完成' ? now : null;
    await run(
      'UPDATE repair_orders SET status=?, handler=?, `result`=?, completed_at=? WHERE id=?',
      [status, handler, repairResult, completedAt, req.params.id]
    );
    const order = await get('SELECT * FROM repair_orders WHERE id = ?', [req.params.id]);
    res.json(order);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM repair_orders WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: '工单不存在' });
    res.json({ message: '删除成功' });
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
