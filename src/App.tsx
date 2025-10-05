import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { ForgotPasswordForm } from './components/forgotPassword/ForgotPasswordForm';
import { PasswordResetSent } from './components/forgotPassword/PasswordResetSent';
import { ResetPasswordForm } from './components/forgotPassword/ResetPasswordForm';
import { PasswordResetSuccess } from './components/forgotPassword/PasswordResetSuccess';
import { MainLayout } from './components/MainLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { LeadsModule } from './components/leads/LeadsModule';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { ProposalsModule } from './components/propostas/ProposalsModule';
import { ConfigurationsModule } from './components/configuracoes/ConfigurationsModule';
import { WhatsAppModule } from './components/whatsapp/WhatsAppModule';
import { setupActivityListeners } from './utils/activityTracker';
import { isUserInactive } from './utils/activityTracker';
import { isTokenExpired, refreshToken } from './utils/auth';
import { NotificationProvider } from './components/notifications/NotificationSystemDB';
import { UserProvider } from './hooks/useCurrentUser';

function App() {
  const { isAuthenticated } = useAuth();

  // Componente para rotas protegidas COM NotificationProvider
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return (
      <UserProvider>
        <NotificationProvider>
          <MainLayout>{children}</MainLayout>
        </NotificationProvider>
      </UserProvider>
    );
  };

  useEffect(() => {
    setupActivityListeners();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem('token');
      const userInactive = isUserInactive(5 * 60 * 1000); // 5 minutos

      if (!token) return;

      if (isTokenExpired(token)) {
        if (userInactive) {
          // desloga
          localStorage.removeItem('token');
          window.location.href = '/login';
        } else {
          const newToken = await refreshToken();
          if (!newToken) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
      }
    }, 60 * 1000); // checa a cada minuto

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rota de login - SEM NotificationProvider */}
          <Route path="/login" element={<LoginForm />} />
          {/* Rotas de recuperação de senha */}
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/password-reset-sent" element={<PasswordResetSent />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />
          <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
          
          {/* Todas as rotas protegidas envolvidas pelo NotificationProvider */}
          <Route path="/*" element={
            isAuthenticated ? (
              <Routes>
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/leads" element={
                  <ProtectedRoute>
                    <LeadsModule />
                  </ProtectedRoute>
                } />
                <Route path="/kanban" element={
                  <ProtectedRoute>
                    <KanbanBoard />
                  </ProtectedRoute>
                } />
                <Route path="/propostas" element={
                  <ProtectedRoute>
                    <ProposalsModule />
                  </ProtectedRoute>
                } />
                <Route path="/configuracoes" element={
                  <ProtectedRoute>
                    <ConfigurationsModule />
                  </ProtectedRoute>
                } />
                <Route path="/whatsapp" element={
                  <ProtectedRoute>
                    <WhatsAppModule />
                  </ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

