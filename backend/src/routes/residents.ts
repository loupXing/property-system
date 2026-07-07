import { Router } from 'express';
import { query, get, run } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { unit_id, status } = req.query;
    let sql = `
      SELECT r.*, u.unit_number, b.name as building_name, c.name as community_name
      FROM residents r
      LEFT JOIN units u ON r.unit_id = u.id
      LEFT JOIN buildings b ON u.building_id = b.id
      LEFT JOIN communities c ON b.community_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    if (unit_id) { sql += ' AND r.unit_id = ?'; params.push(Number(unit_id)); }
    if (status) { sql += ' AND r.status = ?'; params.push(String(status)); }
    sql += ' ORDER BY r.id DESC';
    const residents = await query(sql, params);
    res.json(residents);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { unit_id, name, phone, id_card, type, move_in_date, status } = req.body;
    if (!name || !phone) return res.status(400).json({ message: '姓名和电话不能为空' });
    const result = await run(
      'INSERT INTO residents (unit_id, name, phone, id_card, type, move_in_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [unit_id || null, name, phone, id_card || null, type || '业主', move_in_date || null, status || '在住']
    );
    if (unit_id) {
      await run("UPDATE units SET status = '已入住' WHERE id = ?", [unit_id]);
    }
    const resident = await get('SELECT * FROM residents WHERE id = ?', [result.insertId]);
    res.status(201).json(resident);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { unit_id, name, phone, id_card, type, move_in_date, status } = req.body;
    const existing = await get('SELECT id FROM residents WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ message: '住户不存在' });
    await run(
      'UPDATE residents SET unit_id=?, name=?, phone=?, id_card=?, type=?, move_in_date=?, status=? WHERE id=?',
      [unit_id, name, phone, id_card, type, move_in_date, status, req.params.id]
    );
    const resident = await get('SELECT * FROM residents WHERE id = ?', [req.params.id]);
    res.json(resident);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM residents WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: '住户不存在' });
    res.json({ message: '删除成功' });
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
