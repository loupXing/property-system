import { Router } from 'express';
import { query, get, run } from '../db.js';

const router = Router();

router.get('/types', async (_req, res) => {
  try {
    const types = await query('SELECT * FROM fee_types ORDER BY id');
    res.json(types);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/types', async (req, res) => {
  try {
    const { name, unit_price, unit, description } = req.body;
    if (!name || unit_price === undefined) return res.status(400).json({ message: '名称和单价不能为空' });
    const result = await run(
      'INSERT INTO fee_types (name, unit_price, `unit`, description) VALUES (?, ?, ?, ?)',
      [name, unit_price, unit || '元/月', description || null]
    );
    const feeType = await get('SELECT * FROM fee_types WHERE id = ?', [result.insertId]);
    res.status(201).json(feeType);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.get('/bills', async (req, res) => {
  try {
    const { status, unit_id } = req.query;
    let sql = `
      SELECT bl.*, u.unit_number, b.name as building_name, c.name as community_name, ft.name as fee_type_name
      FROM bills bl
      JOIN units u ON bl.unit_id = u.id
      JOIN buildings b ON u.building_id = b.id
      JOIN communities c ON b.community_id = c.id
      JOIN fee_types ft ON bl.fee_type_id = ft.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];
    if (status) { sql += ' AND bl.status = ?'; params.push(String(status)); }
    if (unit_id) { sql += ' AND bl.unit_id = ?'; params.push(Number(unit_id)); }
    sql += ' ORDER BY bl.id DESC';
    const bills = await query(sql, params);
    res.json(bills);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/bills', async (req, res) => {
  try {
    const { unit_id, fee_type_id, amount, period, due_date } = req.body;
    if (!unit_id || !fee_type_id || !amount || !period) {
      return res.status(400).json({ message: '房屋、费用类型、金额和账期不能为空' });
    }
    const result = await run(
      'INSERT INTO bills (unit_id, fee_type_id, amount, period, due_date) VALUES (?, ?, ?, ?, ?)',
      [unit_id, fee_type_id, amount, period, due_date || null]
    );
    const bill = await get('SELECT * FROM bills WHERE id = ?', [result.insertId]);
    res.status(201).json(bill);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.post('/bills/:id/pay', async (req, res) => {
  try {
    const bill = await get<{ id: number; status: string }>('SELECT * FROM bills WHERE id = ?', [req.params.id]);
    if (!bill) return res.status(404).json({ message: '账单不存在' });
    if (bill.status === '已缴') return res.status(400).json({ message: '账单已缴纳' });
    const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    await run("UPDATE bills SET status = '已缴', paid_at = ? WHERE id = ?", [now, req.params.id]);
    const updated = await get('SELECT * FROM bills WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

router.delete('/bills/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM bills WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: '账单不存在' });
    res.json({ message: '删除成功' });
  } catch {
    res.status(500).json({ message: '服务器错误' });
  }
});

export default router;
