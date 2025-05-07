import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import ProjectList from '../components/projects/ProjectList';
import ProjectDetails from '../components/projects/ProjectDetails';
import AddProject from '../components/projects/AddProject';
import EditProject from '../components/projects/EditProject';
import CollaboratorList from '../components/collaborators/CollaboratorList';
import CollaboratorDetails from '../components/collaborators/CollaboratorDetails';
import AddCollaborator from '../components/collaborators/AddCollaborator';
import EditCollaborator from '../components/collaborators/EditCollaborator';
import AssignmentList from '../components/assignments/AssignmentList';
import AddAssignment from '../components/assignments/AddAssignment';
import EditAssignment from '../components/assignments/EditAssignment';
import Settings from '../components/settings/Settings';
import AddUser from '../components/settings/AddUser';
import EditUser from '../components/settings/EditUser';
import AuthGuard from '../components/auth/AuthGuard';
import MainLayout from '../layouts/MainLayout';
import Home from '../components/home/Home';
import Rapports from '../components/reports/Reports';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Routes protégées */}
      <Route
        path="/"
        element={
          <AuthGuard>
            <MainLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Home />} />
        <Route path="projects" element={<ProjectList />} />
        <Route path="projects/view/:id" element={<ProjectDetails />} />
        <Route path="projects/add" element={<AddProject />} />
        <Route path="projects/edit/:id" element={<EditProject />} />
        <Route path="collaborators" element={<CollaboratorList />} />
        <Route path="collaborators/view/:id" element={<CollaboratorDetails />} />
        <Route path="collaborators/add" element={<AddCollaborator />} />
        <Route path="collaborators/edit/:id" element={<EditCollaborator />} />
        <Route path="assignments" element={<AssignmentList />} />
        <Route path="assignments/add" element={<AddAssignment />} />
        <Route path="assignments/edit/:id" element={<EditAssignment />} />
        <Route path="reports" element={<Rapports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="settings/add" element={<AddUser />} />
        <Route path="settings/edit/:id" element={<EditUser />} />
      </Route>

      {/* Redirection par défaut vers login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes; 