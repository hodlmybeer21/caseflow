import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { BrandsPage } from './pages/BrandsPage';
import { InventoryPage } from './pages/InventoryPage';
import { EventsPage } from './pages/EventsPage';
import { PromoStaffPage } from './pages/PromoStaffPage';
import { AccountAssetsPage } from './pages/AccountAssetsPage';
import { TransfersPage } from './pages/TransfersPage';
import { RequestsPage } from './pages/RequestsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/promo-staff" element={<PromoStaffPage />} />
        <Route path="/account-assets" element={<AccountAssetsPage />} />
        <Route path="/transfers" element={<TransfersPage />} />
        <Route path="/requests" element={<RequestsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
