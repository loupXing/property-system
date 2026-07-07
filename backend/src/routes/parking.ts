import { Router } from 'express';
import { query, get, run } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { community_id, status } = req.query;
    let sql = `
      SELECT p.*, c.name as community_name, u.unit_number
      FROM parking_spaces p
      JOIN communities c ON p.community_id = c.id
      LEFT JOIN units u ON p.unit_id = u.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    if (community_id) { sql += ' AND p.community_id = ?'; params.push(Number(community_id)); }
    if (status) { sql += ' AND p.status = ?'; params.push(String(status)); }
    sql += ' ORDER BY p.id DESC';
    const spaces = await query(sql, params);
    res.json(spaces);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { community_id, space_number, type, status, unit_id, monthly_fee } = req.body;
    if (!community_id || !space_number) return res.status(400).json({ message: '小区和车位号不能为空' });
    const result = await run(
      'INSERT INTO parking_spaces (community_id, space_number, type, status, unit_id, monthly_fee) VALUES (?, ?, ?, ?, ?, ?)',
      [community_id, space_number, type || '地上', status || '空闲', unit_id || null, monthly_fee || 0]
    );
    const space = await get('SELECT * FROM parking_spaces WHERE id = ?', [result.insertId]);
    res.status(201).json(space);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { space_number, type, status, unit_id, monthly_fee } = req.body;
    const existing = await get('SELECT id FROM parking_spaces WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: '车位不存在' });
    await run(
      'UPDATE parking_spaces SET space_number=?, type=?, status=?, unit_id=?, monthly_fee=? WHERE id=?',
      [space_number, type, status, unit_id, monthly_fee, req.params.id]
    );
    const space = await get('SELECT * FROM parking_spaces WHERE id = ?', [req.params.id]);
    res.json(space);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM parking_spaces WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: '车位不存在' });
    res.json({ message: '删除成功' });
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
