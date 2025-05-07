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
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import projectService, { Project, ProjectStatus } from '../../services/projectService';
import { authService } from '../../services/authService';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
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
    fetchProjects();
  }, [activeFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      let data: Project[];
      switch (activeFilter) {
        case 'active':
          data = await projectService.getActiveProjects();
          break;
        case 'inactive':
          data = await projectService.getInactiveProjects();
          break;
        default:
          data = await projectService.getAll();
      }
      console.log('Projects data received:', data);
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }
    try {
      setError(null);
      await projectService.delete(id);
      await fetchProjects();
    } catch (err) {
      setError('Erreur lors de la suppression du projet');
    }
  };

  const handleDeactivate = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir désactiver ce projet ?')) {
      return;
    }
    try {
      setError(null);
      console.log('Deactivating project:', id);
      const result = await projectService.deactivate(id);
      console.log('Deactivation result:', result);
      // Mettre à jour la liste en fonction du filtre actuel
      switch (activeFilter) {
        case 'active':
          const activeProjects = await projectService.getActiveProjects();
          setProjects(activeProjects);
          break;
        case 'inactive':
          const inactiveProjects = await projectService.getInactiveProjects();
          setProjects(inactiveProjects);
          break;
        default:
          const allProjects = await projectService.getAll();
          setProjects(allProjects);
      }
    } catch (err) {
      console.error('Error deactivating project:', err);
      setError('Erreur lors de la désactivation du projet');
    }
  };

  const handleReactivate = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir réactiver ce projet ?')) {
      return;
    }
    try {
      setError(null);
      console.log('Reactivating project:', id);
      const result = await projectService.reactivate(id);
      console.log('Reactivation result:', result);
      // Mettre à jour la liste en fonction du filtre actuel
      switch (activeFilter) {
        case 'active':
          const activeProjects = await projectService.getActiveProjects();
          setProjects(activeProjects);
          break;
        case 'inactive':
          const inactiveProjects = await projectService.getInactiveProjects();
          setProjects(inactiveProjects);
          break;
        default:
          const allProjects = await projectService.getAll();
          setProjects(allProjects);
      }
    } catch (err) {
      console.error('Error reactivating project:', err);
      setError('Erreur lors de la réactivation du projet');
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredProjects = projects.filter((project) =>
    Object.values(project).some(
      value => 
        value && 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.EN_DEMARRAGE:
        return { bg: '#e8f5e9', color: '#2e7d32' };
      case ProjectStatus.EN_COURS:
        return { bg: '#e3f2fd', color: '#1976d2' };
      case ProjectStatus.EN_PAUSE:
        return { bg: '#fff3e0', color: '#f57c00' };
      case ProjectStatus.EN_COURS:
        return { bg: '#f5f5f5', color: '#757575' };
      case ProjectStatus.EN_COURS:
        return { bg: '#ffebee', color: '#c62828' };
      default:
        return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.EN_DEMARRAGE:
        return 'En démarrage';
      case ProjectStatus.EN_COURS:
        return 'En cours';
      case ProjectStatus.EN_PAUSE:
        return 'En pause';
      case ProjectStatus.EN_COURS:
        return 'En cours';
      default:
        return status;
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
          Liste des Projets
        </Typography>
        {isManagerOrAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/add')}
            sx={{
              backgroundColor: '#f47216',
              '&:hover': {
                backgroundColor: '#c25810',
              },
            }}
          >
            Nouveau Projet
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
          placeholder="Rechercher un projet..."
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
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Chef de projet</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date de début</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date de fin</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>État</TableCell>
              {isManagerOrAdmin && <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.name}</TableCell>
                  <TableCell>{project.client}</TableCell>
                  <TableCell>{project.projectManager}</TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(project.status)}
                      sx={{
                        backgroundColor: getStatusColor(project.status).bg,
                        color: getStatusColor(project.status).color,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {project.active ? (
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
                          onClick={() => navigate(`/projects/view/${project.id}`)}
                          color="info"
                          title="Voir les détails"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => navigate(`/projects/edit/${project.id}`)}
                          color="primary"
                          title="Modifier"
                        >
                          <EditIcon />
                        </IconButton>
                        {isAdmin && (
                          <>
                            {project.active ? (
                              <IconButton
                                onClick={() => handleDeactivate(project.id!)}
                                color="warning"
                                title="Désactiver"
                              >
                                <BlockIcon />
                              </IconButton>
                            ) : (
                              <IconButton
                                onClick={() => handleReactivate(project.id!)}
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
          count={filteredProjects.length}
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

export default ProjectList; 