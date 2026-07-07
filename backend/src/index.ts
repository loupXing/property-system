import express from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';
import { authMiddleware } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import communityRoutes from './routes/communities.js';
import buildingRoutes from './routes/buildings.js';
import unitRoutes from './routes/units.js';
import residentRoutes from './routes/residents.js';
import feeRoutes from './routes/fees.js';
import repairRoutes from './routes/repairs.js';
import announcementRoutes from './routes/announcements.js';
import parkingRoutes from './routes/parking.js';
import dashboardRoutes from './routes/dashboard.js';

initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authMiddleware);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/parking', parkingRoutes);

app.listen(PORT, () => {
  console.log(`物业管理系统后端运行在 http://localhost:${PORT}`);
});
