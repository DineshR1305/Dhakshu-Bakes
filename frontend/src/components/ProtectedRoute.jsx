import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-bakery-caramel border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. Unauthenticated users redirected to login with target memory
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Admin-only pages check for ROLE_ADMIN
  if (requireAdmin && user?.role !== 'ROLE_ADMIN') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
