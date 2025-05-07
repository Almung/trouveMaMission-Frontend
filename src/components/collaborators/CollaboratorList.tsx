import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Container,
  Chip,
  TextField,
  TablePagination,
  InputAdornment,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { collaboratorService } from '../../services/collaboratorService';
import { Collaborator } from '../../services/collaboratorService';
import { authService } from '../../services/authService';

// Liste des compétences disponibles
const availableSkills = [
  'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'Java', 'C#',
  'AWS', 'Azure', 'DevOps', 'Docker', 'Kubernetes',
  'Machine Learning', 'Data Science', 'Cybersecurity',
  'Project Management', 'Agile', 'Scrum'
];

// Liste des grades
const grades = [
  'Junior',
  'Confirmé',
  'Senior',
  'Expert',
  'Architecte'
];

type SkillCategory = 'Frontend' | 'Backend' | 'DevOps' | 'Data' | 'Management' | 'default';

// Catégories de compétences et leurs couleurs
const skillCategories: Record<SkillCategory, { bg: string; color: string }> = {
  'Frontend': { bg: '#e3f2fd', color: '#1976d2' },
  'Backend': { bg: '#e8f5e9', color: '#2e7d32' },
  'DevOps': { bg: '#fff3e0', color: '#ed6c02' },
  'Data': { bg: '#fce4ec', color: '#c2185b' },
  'Management': { bg: '#f3e5f5', color: '#7b1fa2' },
  'default': { bg: '#f5f5f5', color: '#757575' }
};

// Mapping des compétences vers leurs catégories
const skillToCategory: Record<string, SkillCategory> = {
  'React': 'Frontend',
  'Angular': 'Frontend',
  'Vue.js': 'Frontend',
  'Node.js': 'Backend',
  'Python': 'Backend',
  'Java': 'Backend',
  'C#': 'Backend',
  'AWS': 'DevOps',
  'Azure': 'DevOps',
  'DevOps': 'DevOps',
  'Docker': 'DevOps',
  'Kubernetes': 'DevOps',
  'Machine Learning': 'Data',
  'Data Science': 'Data',
  'Cybersecurity': 'Data',
  'Project Management': 'Management',
  'Agile': 'Management',
  'Scrum': 'Management'
};

const CollaboratorList: React.FC = () => {
  const navigate = useNavigate();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isManagerOrAdmin = ['ADMIN', 'MANAGER'].includes(currentUser?.role || '');

  useEffect(() => {
    fetchCollaborators();
  }, [activeFilter]);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      setError(null);
      let data: Collaborator[];
      switch (activeFilter) {
        case 'active':
          data = await collaboratorService.getActiveCollaborators();
          break;
        case 'inactive':
          data = await collaboratorService.getInactiveCollaborators();
          break;
        default:
          data = await collaboratorService.getAll();
      }
      console.log('Collaborators data received:', data);
      setCollaborators(data);
    } catch (err) {
      console.error('Error fetching collaborators:', err);
      setError('Erreur lors du chargement des collaborateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce collaborateur ?')) {
      return;
    }
    try {
      setError(null);
      await collaboratorService.delete(id);
      await fetchCollaborators();
    } catch (err) {
      setError('Erreur lors de la suppression du collaborateur');
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver ce collaborateur ?')) {
      return;
    }
    try {
      setError(null);
      console.log('Deactivating collaborator:', id);
      const result = await collaboratorService.deactivate(id);
      console.log('Deactivation result:', result);
      await fetchCollaborators();
    } catch (err) {
      console.error('Error deactivating collaborator:', err);
      setError('Erreur lors de la désactivation du collaborateur');
    }
  };

  const handleReactivate = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir réactiver ce collaborateur ?')) {
      return;
    }
    try {
      setError(null);
      console.log('Reactivating collaborator:', id);
      const result = await collaboratorService.reactivate(id);
      console.log('Reactivation result:', result);
      await fetchCollaborators();
    } catch (err) {
      console.error('Error reactivating collaborator:', err);
      setError('Erreur lors de la réactivation du collaborateur');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredCollaborators = collaborators.filter((collaborator) =>
    Object.values(collaborator).some(
      value =>
        value &&
        (Array.isArray(value)
          ? value.some(v => v.toString().toLowerCase().includes(searchTerm.toLowerCase()))
          : value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DISPONIBLE':
        return { bg: '#e8f5e9', color: '#2e7d32' };  // Green
      case 'EN_MISSION':
        return { bg: '#e3f2fd', color: '#1976d2' };  // Blue
      case 'EN_CONGES':
        return { bg: '#fff3e0', color: '#ed6c02' };  // Orange
      case 'INDISPONIBLE':
        return { bg: '#ffebee', color: '#c62828' };  // Red
      default:
        return { bg: '#f5f5f5', color: '#757575' };  // Grey
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#f47216' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Liste des Collaborateurs
        </Typography>
        {isManagerOrAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/collaborators/add')}
            sx={{
              backgroundColor: '#f47216',
              '&:hover': {
                backgroundColor: '#c25810',
              },
            }}
          >
            Nouveau Collaborateur
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un collaborateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <ToggleButtonGroup
          value={activeFilter}
          exclusive
          onChange={(e, newValue) => newValue && setActiveFilter(newValue)}
          aria-label="filtre de statut"
        >
          <ToggleButton value="all" aria-label="tous">
            Tous
          </ToggleButton>
          <ToggleButton value="active" aria-label="actifs">
            Actifs
          </ToggleButton>
          <ToggleButton value="inactive" aria-label="inactifs">
            Inactifs
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>État</TableCell>
              {isManagerOrAdmin && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCollaborators
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((collaborator) => (
                <TableRow key={collaborator.id}>
                  <TableCell>{collaborator.name}</TableCell>
                  <TableCell>{collaborator.email}</TableCell>
                  <TableCell>{collaborator.role}</TableCell>
                  <TableCell>{collaborator.grade}</TableCell>
                  <TableCell>
                    <Chip
                      label={collaborator.status}
                      sx={{
                        backgroundColor: getStatusColor(collaborator.status).bg,
                        color: getStatusColor(collaborator.status).color,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {collaborator.active ? (
                      <Chip
                        label="Actif"
                        color="success"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label="Inactif"
                        color="error"
                        size="small"
                      />
                    )}
                  </TableCell>
                  {isManagerOrAdmin && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => navigate(`/collaborators/view/${collaborator.id}`)}
                          color="info"
                          title="Voir les détails"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => navigate(`/collaborators/edit/${collaborator.id}`)}
                          color="primary"
                          title="Modifier"
                        >
                          <EditIcon />
                        </IconButton>
                        {isAdmin && (
                          <>
                            {collaborator.active ? (
                              <IconButton
                                onClick={() => handleDeactivate(collaborator.id!)}
                                color="warning"
                                title="Désactiver"
                              >
                                <BlockIcon />
                              </IconButton>
                            ) : (
                              <IconButton
                                onClick={() => handleReactivate(collaborator.id!)}
                                color="success"
                                title="Réactiver"
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            )}
                          </>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCollaborators.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </TableContainer>
    </Container>
  );
};

export default CollaboratorList; 