import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Stack,
  InputAdornment,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Business as BusinessIcon, Person as PersonIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import assignmentService, { Assignment } from '../../services/assignmentService';
import projectService from '../../services/projectService';
import { collaboratorService } from '../../services/collaboratorService';
import { SelectChangeEvent } from '@mui/material/Select';

interface FormValues {
  projectId: number;
  collaboratorId: number;
  role: string;
  notes?: string;
}

const validationSchema = yup.object({
  projectId: yup.number().required('Le projet est requis'),
  collaboratorId: yup.number().required('Le collaborateur est requis'),
  role: yup.string().required('Le rôle est requis'),
  notes: yup.string(),
});

const AddAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedCollaborator, setSelectedCollaborator] = useState<any>(null);
  const [assignmentData, setAssignmentData] = useState<Assignment>({
    projectId: 0,
    collaboratorId: 0,
    role: '',
    notes: '',
    collaborator: {
      name: '',
      email: '',
      role: ''
    },
    project: {
      name: '',
      description: '',
      client: '',
      status: 'PLANNED',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      active: true
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, collaboratorsData] = await Promise.all([
          projectService.getAll(),
          collaboratorService.getAll()
        ]);
        console.log('Projects data:', projectsData);
        console.log('Collaborators data:', collaboratorsData);
        setProjects(projectsData);
        setCollaborators(collaboratorsData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      projectId: 0,
      collaboratorId: 0,
      role: '',
      notes: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Vérifier que les valeurs ne sont pas vides
        if (!values.projectId || !values.collaboratorId) {
          setError('Veuillez sélectionner un projet et un collaborateur');
          return;
        }

        // Trouver le projet et le collaborateur sélectionnés
        const selectedProject = projects.find(p => p.id === values.projectId);
        const selectedCollaborator = collaborators.find(c => c.id === values.collaboratorId);

        // Vérifier si le projet est actif et a un statut valide
        if (!selectedProject?.active) {
          setError('Le projet sélectionné est inactif. Impossible de faire une affectation.');
          return;
        }

        if (selectedProject.status === 'TERMINE' || selectedProject.status === 'ANNULE') {
          setError('Impossible d\'affecter un collaborateur à un projet terminé ou annulé.');
          return;
        }

        // Vérifier si le collaborateur est actif et a un statut valide
        if (!selectedCollaborator?.active) {
          setError('Le collaborateur sélectionné est inactif. Impossible de faire une affectation.');
          return;
        }

        if (selectedCollaborator.status === 'EN_CONGE') {
          setError('Impossible d\'affecter un collaborateur en congé.');
          return;
        }

        // Vérifier si le collaborateur est déjà affecté à un projet actif
        const activeAssignments = await assignmentService.getActive();
        const collaboratorHasActiveAssignment = activeAssignments.some(
          assignment => assignment.collaboratorId === values.collaboratorId
        );

        if (collaboratorHasActiveAssignment) {
          setError('Ce collaborateur est déjà affecté à un projet actif');
          return;
        }

        // Créer l'affectation
        const assignmentData: Assignment = {
          ...values,
          projectId: Number(values.projectId),
          collaboratorId: Number(values.collaboratorId),
          collaborator: {
            name: selectedCollaborator.name,
            email: selectedCollaborator.email,
            role: values.role
          },
          project: {
            name: selectedProject.name,
            description: selectedProject.description,
            client: selectedProject.client,
            status: selectedProject.status || 'PLANNED',
            startDate: selectedProject.startDate || new Date().toISOString().split('T')[0],
            endDate: selectedProject.endDate || new Date().toISOString().split('T')[0],
            active: true
          }
        };

        await assignmentService.create(assignmentData);
        navigate('/assignments');
      } catch (error: any) {
        console.error('Erreur lors de la création de l\'affectation:', error);
        setError(error.response?.data?.message || 'Erreur lors de la création de l\'affectation');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleProjectChange = async (event: SelectChangeEvent<number>) => {
    const projectId = Number(event.target.value);
    formik.setFieldValue('projectId', projectId);
    
    const selectedProject = projects.find(p => p.id === projectId);
    setSelectedProject(selectedProject);

    if (selectedProject) {
      if (!selectedProject.active) {
        setError('Le projet sélectionné est inactif. Impossible de faire une affectation.');
      } else if (selectedProject.status === 'TERMINE' || selectedProject.status === 'ANNULE') {
        setError('Impossible d\'affecter un collaborateur à un projet terminé ou annulé.');
      } else {
        setError(null);
      }
    }
  };

  const handleCollaboratorChange = async (event: SelectChangeEvent<number>) => {
    const collaboratorId = Number(event.target.value);
    formik.setFieldValue('collaboratorId', collaboratorId);
    
    const selectedCollaborator = collaborators.find(c => c.id === collaboratorId);
    setSelectedCollaborator(selectedCollaborator);

    if (selectedCollaborator) {
      if (!selectedCollaborator.active) {
        setError('Le collaborateur sélectionné est inactif. Impossible de faire une affectation.');
      } else if (selectedCollaborator.status === 'EN_CONGE') {
        setError('Impossible d\'affecter un collaborateur en congé.');
      } else {
        setError(null);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <IconButton
          onClick={() => navigate('/assignments')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" color="primary" display="inline">
          Nouvelle Affectation
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item key="project-select" xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Projet</InputLabel>
                  <Select
                    name="projectId"
                    label="Projet"
                    value={formik.values.projectId || ''}
                    onChange={handleProjectChange}
                    error={formik.touched.projectId && Boolean(formik.errors.projectId)}
                  >
                    <MenuItem key="empty-project" value="">
                      <em>Sélectionner un projet</em>
                    </MenuItem>
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name} {!project.active && '(Inactif)'}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.projectId && formik.errors.projectId && (
                    <Typography color="error" variant="caption">
                      {formik.errors.projectId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item key="collaborator-select" xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Collaborateur</InputLabel>
                  <Select
                    name="collaboratorId"
                    label="Collaborateur"
                    value={formik.values.collaboratorId || ''}
                    onChange={handleCollaboratorChange}
                    error={formik.touched.collaboratorId && Boolean(formik.errors.collaboratorId)}
                  >
                    <MenuItem key="empty-collaborator" value="">
                      <em>Sélectionner un collaborateur</em>
                    </MenuItem>
                    {collaborators.map((collaborator) => (
                      <MenuItem key={collaborator.id} value={collaborator.id}>
                        {collaborator.name} {!collaborator.active && '(Inactif)'}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.collaboratorId && formik.errors.collaboratorId && (
                    <Typography color="error" variant="caption">
                      {formik.errors.collaboratorId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            {selectedProject && (
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Informations du Projet</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Date de début: {new Date(selectedProject.startDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Date de fin: {new Date(selectedProject.endDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Description: {selectedProject.description}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(selectedProject.skills || []).map((skill: any) => (
                          <Chip key={skill.id} label={skill.name} size="small" />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {selectedCollaborator && (
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">Informations du Collaborateur</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Email: {selectedCollaborator.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Téléphone: {selectedCollaborator.phone}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(selectedCollaborator.skills || []).map((skill: any) => (
                          <Chip key={skill.id} label={skill.name} size="small" />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            <TextField
              fullWidth
              name="role"
              label="Rôle"
              value={formik.values.role}
              onChange={formik.handleChange}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
              InputProps={{
                startAdornment: <InputAdornment position="start">👤</InputAdornment>,
              }}
            />

            <TextField
              fullWidth
              name="notes"
              label="Notes"
              multiline
              rows={4}
              value={formik.values.notes}
              onChange={formik.handleChange}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
              helperText={formik.touched.notes && formik.errors.notes}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/assignments')}
                disabled={loading}
                sx={{
                  borderColor: '#f47216',
                  color: '#f47216',
                  '&:hover': {
                    borderColor: '#c25810',
                    backgroundColor: 'rgba(244, 114, 22, 0.04)',
                  },
                }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                disabled={loading}
                sx={{
                  backgroundColor: '#f47216',
                  '&:hover': {
                    backgroundColor: '#c25810',
                  },
                }}
              >
                {loading ? 'Enregistrement...' : 'Créer l\'affectation'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddAssignment; 