import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Overview from './pages/admin/Overview.jsx';
import ProjectsPanel from './pages/admin/ProjectsPanel.jsx';
import MessagesPanel from './pages/admin/MessagesPanel.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="projects" element={<ProjectsPanel />} />
        <Route path="messages" element={<MessagesPanel />} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
