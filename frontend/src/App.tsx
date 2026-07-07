import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Communities from './pages/Communities';
import Buildings from './pages/Buildings';
import Units from './pages/Units';
import Residents from './pages/Residents';
import Fees from './pages/Fees';
import Repairs from './pages/Repairs';
import Announcements from './pages/Announcements';
import Parking from './pages/Parking';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="communities" element={<Communities />} />
          <Route path="buildings" element={<Buildings />} />
          <Route path="units" element={<Units />} />
          <Route path="residents" element={<Residents />} />
          <Route path="fees" element={<Fees />} />
          <Route path="repairs" element={<Repairs />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="parking" element={<Parking />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
