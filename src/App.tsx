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

function App() {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <MainLayout>{children}</MainLayout>;
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
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
      </div>
    </Router>
  );
}

export default App;

