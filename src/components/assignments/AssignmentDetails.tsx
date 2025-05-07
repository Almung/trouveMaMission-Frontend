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
import assignmentService, { Assignment } from '../../services/assignmentService';
import { authService } from '../../services/authService';

const AssignmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isManagerOrAdmin = ['ADMIN', 'MANAGER'].includes(currentUser?.role || '');

  useEffect(() => {
    fetchAssignmentDetails();
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentService.getById(Number(id));
      setAssignment(data);
    } catch (err) {
      setError('Erreur lors du chargement des détails de l\'affectation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = () => {
    if (window.confirm('Êtes-vous sûr de vouloir désactiver cette affectation ?')) {
      assignmentService.deactivate(assignment!.id!)
        .then(() => fetchAssignmentDetails())
        .catch(() => setError('Erreur lors de la désactivation de l\'affectation'));
    }
  };

  const handleReactivate = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réactiver cette affectation ?')) {
      assignmentService.reactivate(assignment!.id!)
        .then(() => fetchAssignmentDetails())
        .catch(() => setError('Erreur lors de la réactivation de l\'affectation'));
    }
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette affectation ?')) {
      assignmentService.delete(assignment!.id!)
        .then(() => navigate('/assignments'))
        .catch(() => setError('Erreur lors de la suppression de l\'affectation'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_COURS':
        return { bg: '#e8f5e9', color: '#2e7d32' };
      case 'TERMINE':
        return { bg: '#e3f2fd', color: '#1976d2' };
      case 'ANNULE':
        return { bg: '#ffebee', color: '#c62828' };
      default:
        return { bg: '#f5f5f5', color: '#757575' };
    }
  };

  const isAssignmentActive = (assignment: Assignment) => {
    return assignment.project.status === 'EN_COURS' || 
           assignment.project.status === 'EN_DEMARRAGE' || 
           assignment.project.status === 'EN_PAUSE';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#f47216' }} />
      </Box>
    );
  }

  if (!assignment) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Affectation non trouvée</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/assignments')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" color="primary">
            Détails de l'Affectation
          </Typography>
        </Box>
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isAssignmentActive(assignment) ? (
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
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
            >
              Supprimer
            </Button>
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
              Informations du Collaborateur
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Nom
              </Typography>
              <Typography variant="body1">
                {assignment.collaboratorName}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {assignment.collaborator?.email || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Rôle
              </Typography>
              <Typography variant="body1">
                {assignment.role}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Informations du Projet
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Nom
              </Typography>
              <Typography variant="body1">
                {assignment.projectName}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">
                {assignment.project?.description || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Client
              </Typography>
              <Typography variant="body1">
                {assignment.project?.client || 'N/A'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Détails de l'Affectation
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Projet
              </Typography>
              <Typography variant="body1">
                {assignment.projectName || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Collaborateur
              </Typography>
              <Typography variant="body1">
                {assignment.collaboratorName || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                État
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={isAssignmentActive(assignment) ? 'Actif' : 'Inactif'}
                  sx={{
                    backgroundColor: isAssignmentActive(assignment) ? '#4caf50' : '#f44336',
                    color: 'white',
                  }}
                />
              </Box>
            </Box>
          </Grid>

          {isManagerOrAdmin && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/assignments/edit/${assignment.id}`)}
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
    </Container>
  );
};

export default AssignmentDetails; 