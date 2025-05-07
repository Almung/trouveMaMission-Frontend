import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Container,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import projectService, { Project, ProjectStatus } from '../../services/projectService';
import { authService } from '../../services/authService';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isManagerOrAdmin = ['ADMIN', 'MANAGER'].includes(currentUser?.role || '');

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const data = await projectService.getById(Number(id));
      console.log('Raw project data:', data);
      console.log('Project skills:', data.skills);
      console.log('Project skillNames:', data.skillNames);
      console.log('Project skills type:', typeof data.skills);
      console.log('Project skills length:', data.skills?.length);
      console.log('Project skills is array:', Array.isArray(data.skills));
      console.log('Project skillNames type:', typeof data.skillNames);
      console.log('Project skillNames is array:', Array.isArray(data.skillNames));
      console.log('Project skillNames is Set:', data.skillNames instanceof Set);
      console.log('Project skillNames size:', data.skillNames?.size);
      console.log('Project skillNames keys:', Object.keys(data.skillNames || {}));
      setProject(data);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Erreur lors du chargement du projet');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.EN_DEMARRAGE:
        return { bg: '#e8f5e9', color: '#2e7d32' };
      case ProjectStatus.EN_COURS:
        return { bg: '#e3f2fd', color: '#1976d2' };
      case ProjectStatus.EN_PAUSE:
        return { bg: '#fff3e0', color: '#f57c00' };
      case ProjectStatus.TERMINE:
        return { bg: '#f5f5f5', color: '#757575' };
      case ProjectStatus.ANNULE:
        return { bg: '#ffebee', color: '#d32f2f' };
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
      case ProjectStatus.TERMINE:
        return 'Terminé';
      case ProjectStatus.ANNULE:
        return 'Annulé';
      default:
        return status;
    }
  };

  const handleDeactivate = () => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver ce projet ?')) {
      projectService.deactivate(project!.id!)
        .then(() => fetchProjectDetails())
        .catch(() => setError('Erreur lors de la désactivation du projet'));
    }
  };

  const handleReactivate = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réactiver ce projet ?')) {
      projectService.reactivate(project!.id!)
        .then(() => fetchProjectDetails())
        .catch(() => setError('Erreur lors de la réactivation du projet'));
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#f47216' }} />
      </Box>
    );
  }

  if (!project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Projet non trouvé</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : project ? (
        <>
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => navigate('/projects')}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1" color="primary">
                {project.name}
              </Typography>
            </Box>
            {isAdmin && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {project.active ? (
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<BlockIcon />}
                    onClick={handleDeactivate}
                  >
                    Désactiver
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleReactivate}
                  >
                    Réactiver
                  </Button>
                )}
              </Box>
            )}
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1">
                  {project.description}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Informations générales
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Client
                  </Typography>
                  <Typography variant="body1">
                    {project.client}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Chef de projet
                  </Typography>
                  <Typography variant="body1">
                    {project.projectManager}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Taille de l'équipe
                  </Typography>
                  <Typography variant="body1">
                    {project.teamSize} personne{project.teamSize > 1 ? 's' : ''}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Statut
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={getStatusLabel(project.status)}
                      sx={{
                        backgroundColor: getStatusColor(project.status).bg,
                        color: getStatusColor(project.status).color,
                      }}
                    />
                    {!project.active && (
                      <Chip
                        label="Inactif"
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>
                {project.progress !== undefined && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Progression
                    </Typography>
                    <Typography variant="body1">
                      {project.progress}%
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Dates
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date de début
                  </Typography>
                  <Typography variant="body1">
                    {new Date(project.startDate).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date de fin
                  </Typography>
                  <Typography variant="body1">
                    {new Date(project.endDate).toLocaleDateString()}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  Compétences requises
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {project.skills && project.skills.length > 0 ? (
                    project.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucune compétence requise
                    </Typography>
                  )}
                </Box>
              </Grid>

              {isManagerOrAdmin && (
                <Grid item xs={12}>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => navigate(`/projects/edit/${project.id}`)}
                      sx={{
                        backgroundColor: '#f47216',
                        '&:hover': {
                          backgroundColor: '#c25810',
                        },
                      }}
                    >
                      Modifier
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        </>
      ) : null}
    </Container>
  );
};

export default ProjectDetails; 