import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import assignmentService, { Assignment } from '../../services/assignmentService';
import projectService from '../../services/projectService';
import { collaboratorService } from '../../services/collaboratorService';

interface FormValues {
  id: number | undefined;
  collaboratorId: number;
  projectId: number;
  role: string;
  active: boolean;
  collaborator: {
    name: string;
    email: string;
    role: string;
  };
  project: {
    name: string;
    description: string;
    client: string;
    status: string;
    startDate: string;
    endDate: string;
    active: boolean;
  };
}

const validationSchema = yup.object({
  collaboratorId: yup.number().required('Le collaborateur est requis'),
  projectId: yup.number().required('Le projet est requis'),
  active: yup.boolean(),
});

const EditAssignment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [collaborators, setCollaborators] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      id: undefined,
      collaboratorId: 0,
      projectId: 0,
      role: 'DEFAULT',
      collaborator: { name: '', email: '', role: '' },
      project: { 
        name: '', 
        description: '', 
        client: '',
        status: '',
        startDate: '',
        endDate: '',
        active: true
      }
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        if (id) {
          const assignmentData: Assignment = {
            ...values,
            role: 'DEFAULT',
            collaborator: { name: '', email: '', role: '' },
            project: { 
              name: '', 
              description: '', 
              client: '',
              status: '',
              startDate: '',
              endDate: '',
              active: true
            }
          };
          await assignmentService.update(parseInt(id), assignmentData);
          navigate('/assignments');
        }
      } catch (error) {
        setError('Erreur lors de la mise à jour de l\'affectation');
        console.error('Erreur lors de la mise à jour de l\'affectation:', error);
      }
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, collaboratorsData, assignmentData] = await Promise.all([
          projectService.getAll(),
          collaboratorService.getAll(),
          id ? assignmentService.getById(parseInt(id)) : null
        ]);
        setProjects(projectsData);
        setCollaborators(collaboratorsData);
        if (assignmentData) {
          formik.setValues({
            id: undefined,
            projectId: assignmentData.projectId,
            collaboratorId: assignmentData.collaboratorId,
            role: 'DEFAULT',
            collaborator: { name: '', email: '', role: '' },
            project: { 
              name: '', 
              description: '', 
              client: '',
              status: '',
              startDate: '',
              endDate: '',
              active: true
            }
          });
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error('Erreur:', err);
      }
    };
    fetchData();
  }, [id]);

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
          Modifier l'Affectation
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Projet</InputLabel>
                <Select
                  name="projectId"
                  value={formik.values.projectId}
                  onChange={formik.handleChange}
                  label="Projet"
                  error={formik.touched.projectId && Boolean(formik.errors.projectId)}
                >
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.projectId && formik.errors.projectId && (
                  <Typography color="error" variant="caption">
                    {formik.errors.projectId}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Collaborateur</InputLabel>
                <Select
                  name="collaboratorId"
                  value={formik.values.collaboratorId}
                  onChange={formik.handleChange}
                  label="Collaborateur"
                  error={formik.touched.collaboratorId && Boolean(formik.errors.collaboratorId)}
                >
                  {collaborators.map((collaborator) => (
                    <MenuItem key={collaborator.id} value={collaborator.id}>
                      {collaborator.name}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.collaboratorId && formik.errors.collaboratorId && (
                  <Typography color="error" variant="caption">
                    {formik.errors.collaboratorId}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/assignments')}
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
                startIcon={<SaveIcon />}
                sx={{
                  backgroundColor: '#f47216',
                  '&:hover': {
                    backgroundColor: '#c25810',
                  },
                }}
              >
                Enregistrer les modifications
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditAssignment; 