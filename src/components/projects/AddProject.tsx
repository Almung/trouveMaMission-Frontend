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
  Chip,
  Stack,
  InputAdornment,
  Alert,
  Autocomplete,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import projectService, { Project, ProjectStatus, Skill } from '../../services/projectService';

interface FormValues {
  name: string;
  description: string;
  client: string;
  projectManager: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  teamSize: string;
  skills: string[];
}

const validationSchema = yup.object({
  name: yup.string().required('Le nom du projet est requis'),
  description: yup.string().required('La description est requise'),
  client: yup.string().required('Le client est requis'),
  projectManager: yup.string().required('Le chef de projet est requis'),
  status: yup.string().required('Le statut est requis'),
  startDate: yup.date().required('La date de début est requise'),
  endDate: yup.date()
    .min(yup.ref('startDate'), 'La date de fin doit être après la date de début')
    .required('La date de fin est requise'),
  teamSize: yup.number()
    .min(1, 'La taille de l\'équipe doit être d\'au moins 1')
    .required('La taille de l\'équipe est requise'),
  skills: yup.array().min(1, 'Au moins une compétence est requise'),
});

const AddProject: React.FC = () => {
  const navigate = useNavigate();
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await projectService.getAllSkills();
        setAvailableSkills(skills.map(skill => skill.name));
      } catch (error) {
        console.error('Erreur lors du chargement des compétences:', error);
      }
    };
    fetchSkills();
  }, []);

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      description: '',
      client: '',
      projectManager: '',
      status: ProjectStatus.EN_DEMARRAGE,
      startDate: '',
      endDate: '',
      teamSize: '',
      skills: [],
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        const projectData: Omit<Project, 'id'> = {
          name: values.name,
          description: values.description,
          client: values.client,
          projectManager: values.projectManager,
          status: values.status,
          startDate: new Date(values.startDate),
          endDate: new Date(values.endDate),
          teamSize: parseInt(values.teamSize),
          skills: values.skills,
          active: true
        };

        await projectService.create(projectData);
        navigate('/projects');
      } catch (error: any) {
        setError(error.message || 'Une erreur est survenue lors de la création du projet');
        console.error('Erreur lors de la création du projet:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleAddSkill = () => {
    if (newSkill.trim() && !formik.values.skills.includes(newSkill.trim())) {
      formik.setFieldValue('skills', [...formik.values.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    formik.setFieldValue(
      'skills',
      formik.values.skills.filter(skill => skill !== skillToRemove)
    );
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <IconButton
          onClick={() => navigate('/projects')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" color="primary" display="inline">
          Nouveau Projet
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                name="name"
                label="Nom du projet"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                name="client"
                label="Client"
                value={formik.values.client}
                onChange={formik.handleChange}
                error={formik.touched.client && Boolean(formik.errors.client)}
                helperText={formik.touched.client && formik.errors.client}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                name="projectManager"
                label="Chef de projet"
                value={formik.values.projectManager}
                onChange={formik.handleChange}
                error={formik.touched.projectManager && Boolean(formik.errors.projectManager)}
                helperText={formik.touched.projectManager && formik.errors.projectManager}
                InputProps={{
                  startAdornment: <InputAdornment position="start">👤</InputAdornment>,
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  label="Statut"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <MenuItem value={ProjectStatus.EN_DEMARRAGE}>En démarrage</MenuItem>
                  <MenuItem value={ProjectStatus.EN_COURS}>En cours</MenuItem>
                  <MenuItem value={ProjectStatus.EN_PAUSE}>En pause</MenuItem>
                  <MenuItem value={ProjectStatus.TERMINE}>Terminé</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="date"
                name="startDate"
                label="Date de début"
                value={formik.values.startDate}
                onChange={formik.handleChange}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                helperText={formik.touched.startDate && formik.errors.startDate}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                type="date"
                name="endDate"
                label="Date de fin"
                value={formik.values.endDate}
                onChange={formik.handleChange}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                helperText={formik.touched.endDate && formik.errors.endDate}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                name="teamSize"
                label="Taille de l'équipe"
                value={formik.values.teamSize}
                onChange={formik.handleChange}
                error={formik.touched.teamSize && Boolean(formik.errors.teamSize)}
                helperText={formik.touched.teamSize && formik.errors.teamSize}
                InputProps={{
                  startAdornment: <InputAdornment position="start">👥</InputAdornment>,
                }}
              />
            </Box>

            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Typography variant="subtitle1" gutterBottom>
                  Compétences requises
                </Typography>
              <Autocomplete
                freeSolo
                options={availableSkills}
                value={newSkill}
                onChange={(_, newValue) => setNewSkill(newValue || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Ajouter une compétence"
                    onKeyDown={handleKeyPress}
                      fullWidth
                    />
                  )}
                />
                        <Button
                          variant="outlined"
                          onClick={handleAddSkill}
                  sx={{ alignSelf: 'flex-start' }}
                        >
                          Ajouter
                        </Button>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
              {formik.values.skills.map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  onDelete={() => handleRemoveSkill(skill)}
                      color="primary"
                      variant="outlined"
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
              </Box>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/projects')}
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
                {loading ? 'Enregistrement...' : 'Créer le projet'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddProject; 