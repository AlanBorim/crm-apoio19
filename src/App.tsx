import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
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

function App() {
  const { isAuthenticated } = useAuth();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <MainLayout>{children}</MainLayout>;
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

