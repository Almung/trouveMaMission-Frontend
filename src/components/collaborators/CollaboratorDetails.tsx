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
import { collaboratorService, Collaborator } from '../../services/collaboratorService';
import { authService } from '../../services/authService';

const CollaboratorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isManagerOrAdmin = ['ADMIN', 'MANAGER'].includes(currentUser?.role || '');

  useEffect(() => {
    fetchCollaboratorDetails();
  }, [id]);

  const fetchCollaboratorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await collaboratorService.getById(Number(id));
      setCollaborator(data);
    } catch (err) {
      setError('Erreur lors du chargement des détails du collaborateur');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = () => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver ce collaborateur ?')) {
      collaboratorService.deactivate(collaborator!.id!)
        .then(() => fetchCollaboratorDetails())
        .catch(() => setError('Erreur lors de la désactivation du collaborateur'));
    }
  };

  const handleReactivate = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réactiver ce collaborateur ?')) {
      collaboratorService.reactivate(collaborator!.id!)
        .then(() => fetchCollaboratorDetails())
        .catch(() => setError('Erreur lors de la réactivation du collaborateur'));
    }
  };

  const handleEdit = () => {
    navigate(`/collaborators/edit/${collaborator!.id}`);
  };

  const handleClose = () => {
    navigate('/collaborators');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIF':
        return { bg: '#e8f5e9', color: '#2e7d32' };
      case 'INACTIF':
        return { bg: '#ffebee', color: '#c62828' };
      default:
        return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'Junior':
        return { bg: '#e3f2fd', color: '#1976d2' };
      case 'Confirmé':
        return { bg: '#e8f5e9', color: '#2e7d32' };
      case 'Senior':
        return { bg: '#fff3e0', color: '#ed6c02' };
      case 'Expert':
        return { bg: '#fce4ec', color: '#c2185b' };
      case 'Architecte':
        return { bg: '#f3e5f5', color: '#7b1fa2' };
      default:
        return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#f47216' }} />
      </Box>
    );
  }

  if (!collaborator) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Collaborateur non trouvé</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/collaborators')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" color="primary">
            {collaborator.name}
          </Typography>
        </Box>
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {collaborator.active ? (
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Informations générales
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {collaborator.email}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Téléphone
              </Typography>
              <Typography variant="body1">
                {collaborator.phone}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Rôle
              </Typography>
              <Typography variant="body1">
                {collaborator.role}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Grade
              </Typography>
              <Chip
                label={collaborator.grade}
                sx={{
                  backgroundColor: getGradeColor(collaborator.grade).bg,
                  color: getGradeColor(collaborator.grade).color,
                }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Années d'expérience
              </Typography>
              <Typography variant="body1">
                {collaborator.experienceYears} ans
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Statut
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={collaborator.status}
                  sx={{
                    backgroundColor: getStatusColor(collaborator.status).bg,
                    color: getStatusColor(collaborator.status).color,
                  }}
                />
                {!collaborator.active && (
                  <Chip
                    label="Inactif"
                    color="error"
                    size="small"
                  />
                )}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Compétences
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {collaborator.skills && collaborator.skills.length > 0 ? (
                collaborator.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Aucune compétence
                </Typography>
              )}
            </Box>
          </Grid>

          {isManagerOrAdmin && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleEdit}
                  sx={{ mr: 2 }}
                >
                  Modifier
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleClose}
                >
                  Fermer
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default CollaboratorDetails; 