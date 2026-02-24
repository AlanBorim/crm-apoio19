import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { usePermissions } from './hooks/usePermissions';
import { LoginForm } from './components/LoginForm';
import { ForgotPasswordForm } from './components/forgotPassword/ForgotPasswordForm';
import { PasswordResetSent } from './components/forgotPassword/PasswordResetSent';
import { ResetPasswordForm } from './components/forgotPassword/ResetPasswordForm';
import { PasswordResetSuccess } from './components/forgotPassword/PasswordResetSuccess';
import { AccessDenied } from './components/AccessDenied';
import { MainLayout } from './components/MainLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { LeadsModule } from './components/leads/LeadsModule';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { ProposalsModule } from './components/propostas/ProposalsModule';
import { ConfigurationsModule } from './components/configuracoes/ConfigurationsModule';
import { WhatsAppModule } from './components/whatsapp/WhatsAppModule';
import { WhatsAppConversations } from './components/whatsapp/WhatsAppConversations';
import { TasksModule } from './components/tarefas/TasksModule';
import { ClientsModule } from './components/clients/ClientsModule';
import { setupActivityListeners } from './utils/activityTracker';
import { isUserInactive } from './utils/activityTracker';
import { isTokenExpired, refreshToken } from './utils/auth';
import { NotificationProvider } from './components/notifications/NotificationSystemDB';
import { UserProvider } from './hooks/useCurrentUser';
import { Toaster } from './components/ui/sonner';
import { ProtectedRoute } from './components/ProtectedRoute';
import { WhatsAppPhoneProvider } from './contexts/WhatsAppPhoneContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LayoutConfigProvider } from './contexts/LayoutConfigContext';

// Component to redirect based on user role
function RoleBasedRedirect() {
  const { getUserRole } = usePermissions();
  const role = getUserRole();

  switch (role) {
    case 'cliente':
      return <Navigate to="/clientes" replace />;
    case 'financeiro':
      return <Navigate to="/propostas" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
}

function App() {
  const { isAuthenticated } = useAuth();

  // Componente para rotas autenticadas COM NotificationProvider
  const AuthGuard = ({ children }: { children: React.ReactNode }) => {
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
    // Refresh user data on mount to ensure permissions are up to date
    const { refreshUser } = useAuth.getState();
    refreshUser();
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
    <LayoutConfigProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Router>
          <div className="App dark:bg-gray-900 min-h-screen">
            <Routes>
              {/* Rota de login - SEM NotificationProvider */}
              <Route path="/login" element={<LoginForm />} />
              {/* ... routes ... */}
              {/* Rotas de recuperação de senha */}
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/password-reset-sent" element={<PasswordResetSent />} />
              <Route path="/reset-password" element={<ResetPasswordForm />} />
              <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
              <Route path="/acesso-negado" element={<AccessDenied />} />

              {/* Todas as rotas protegidas envolvidas pelo NotificationProvider */}
              <Route path="/*" element={
                isAuthenticated ? (
                  <Routes>
                    <Route path="/dashboard" element={
                      <AuthGuard>
                        <ProtectedRoute resource="dashboard" action="view">
                          <Dashboard />
                        </ProtectedRoute>
                      </AuthGuard>
                    } />
                    <Route path="/leads" element={
                      <AuthGuard>
                        <ProtectedRoute resource="leads" action="view">
                          <LeadsModule />
                        </ProtectedRoute>
                      </AuthGuard>
                    } />
                    <Route path="/clientes" element={
                      <AuthGuard>
                        <ProtectedRoute resource="clients" action="view">
                          <ClientsModule />
                        </ProtectedRoute>
                      </AuthGuard>
                    } />
                    <Route path="/kanban" element={
                      <AuthGuard>
                        <ProtectedRoute resource="kanban" action="view">
                          <KanbanBoard />
                        </ProtectedRoute>
                      </AuthGuard>
                    } />
                    <Route path="/propostas" element={
                      <AuthGuard>
                        <ProtectedRoute resource="proposals" action="view">
                          <ProposalsModule />
                        </ProtectedRoute>
                      </AuthGuard>
                    } />
                    <Route path="/configuracoes" element={
                      <AuthGuard>
                        <ProtectedRoute resource="configuracoes" action="view">
                          <ConfigurationsModule />
                        </ProtectedRoute>
                      </AuthGuard>
                    } />
                    <Route path="/whatsapp" element={
                      <AuthGuard>
                        <ProtectedRoute resource="whatsapp" action="view">
                          <WhatsAppPhoneProvider>
                            <WhatsAppModule />
                          </WhatsAppPhoneProvider>
                        </ProtectedRoute>
                      </AuthGuard>
                    } />
                    <Route path="/conversas" element={
                      <AuthGuard>
                        <ProtectedRoute resource="whatsapp" action="view">
                          <WhatsAppConversations />
                        </ProtectedRoute>
                      </AuthGuard>
                    } />
                    <Route path="/tarefas" element={
                      <AuthGuard>
                        <ProtectedRoute resource="tasks" action="view">
                          <TasksModule />
                        </ProtectedRoute>
                      </AuthGuard>
                    } />
                    <Route path="/" element={<RoleBasedRedirect />} />
                  </Routes>
                ) : (
                  <Navigate to="/login" replace />
                )
              } />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </ThemeProvider>
    </LayoutConfigProvider>
  );
}

export default App;

