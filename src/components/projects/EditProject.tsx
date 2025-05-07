import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  MenuItem,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Grid,
  IconButton,
  Stack,
  InputAdornment,
  Alert,
  Autocomplete,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import projectService, { Project, ProjectStatus, Skill } from '../../services/projectService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';

interface FormValues {
  id: number | undefined;
  name: string;
  description: string;
  client: string;
  projectManager: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  progress: number;
  teamSize: number;
  skills: string[];
  active: boolean;
}

const validationSchema = yup.object({
  name: yup.string().required('Le nom est requis'),
  description: yup.string().required('La description est requise'),
  client: yup.string().required('Le client est requis'),
  projectManager: yup.string().required('Le chef de projet est requis'),
  startDate: yup.date().required('La date de début est requise'),
  endDate: yup.date()
    .required('La date de fin est requise')
    .min(yup.ref('startDate'), 'La date de fin doit être postérieure à la date de début'),
  status: yup.string().required('Le statut est requis'),
  progress: yup.number()
    .required('La progression est requise')
    .min(0, 'La progression doit être entre 0 et 100')
    .max(100, 'La progression doit être entre 0 et 100'),
  teamSize: yup.number()
    .required('La taille de l\'équipe est requise')
    .min(1, 'La taille de l\'équipe doit être au moins 1'),
  skills: yup.array().of(yup.string()),
  active: yup.boolean(),
});

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

const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  const formik = useFormik<FormValues>({
    initialValues: {
      id: undefined,
      name: '',
      description: '',
      client: '',
      projectManager: '',
      startDate: new Date(),
      endDate: new Date(),
      status: ProjectStatus.EN_DEMARRAGE,
      progress: 0,
      teamSize: 1,
      skills: [],
      active: true,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        const projectData = {
          ...values,
          skills: values.skills
        };
        await projectService.update(Number(id), projectData);
        navigate('/projects');
      } catch (error) {
        setError('Erreur lors de la mise à jour du projet');
        console.error('Erreur lors de la mise à jour du projet:', error);
      }
    },
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (id) {
          const project = await projectService.getById(parseInt(id));
          setProject(project);
          formik.setValues({
            id: project.id,
            name: project.name,
            description: project.description,
            client: project.client,
            projectManager: project.projectManager,
            startDate: new Date(project.startDate),
            endDate: new Date(project.endDate),
            status: project.status,
            progress: project.progress || 0,
            teamSize: project.teamSize,
            skills: project.skills || [],
            active: project.active,
          });
        }
      } catch (error) {
        setError('Erreur lors du chargement du projet');
        console.error('Erreur lors du chargement du projet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mt: 4, mb: 4 }}>
        <IconButton
          onClick={() => navigate('/projects')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" color="primary" display="inline">
          Modifier le Projet
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', mb: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="name"
              label="Nom du projet"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="client"
              label="Client"
              value={formik.values.client}
              onChange={formik.handleChange}
              error={formik.touched.client && Boolean(formik.errors.client)}
              helperText={formik.touched.client && formik.errors.client}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="description"
              label="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="projectManager"
              label="Chef de projet"
              value={formik.values.projectManager}
              onChange={formik.handleChange}
              error={formik.touched.projectManager && Boolean(formik.errors.projectManager)}
              helperText={formik.touched.projectManager && formik.errors.projectManager}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                label="Statut"
              >
                {Object.values(ProjectStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>État</InputLabel>
              <Select
                name="active"
                value={formik.values.active}
                onChange={formik.handleChange}
                label="État"
              >
                <MenuItem value="true">Actif</MenuItem>
                <MenuItem value="false">Inactif</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date de début"
                value={formik.values.startDate}
                onChange={(newValue) => {
                  formik.setFieldValue('startDate', newValue);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date de fin"
                value={formik.values.endDate}
                onChange={(newValue) => {
                  formik.setFieldValue('endDate', newValue);
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              name="teamSize"
              label="Taille de l'équipe"
              value={formik.values.teamSize}
              onChange={formik.handleChange}
              error={formik.touched.teamSize && Boolean(formik.errors.teamSize)}
              helperText={formik.touched.teamSize && formik.errors.teamSize}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              name="progress"
              label="Progression"
              value={formik.values.progress}
              onChange={formik.handleChange}
              error={formik.touched.progress && Boolean(formik.errors.progress)}
              helperText={formik.touched.progress && formik.errors.progress}
              InputProps={{
                endAdornment: '%',
              }}
            />
          </Grid>
        </Grid>
      </Paper>

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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          onClick={() => navigate('/projects')}
          sx={{ mr: 1 }}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => formik.handleSubmit()}
          disabled={loading}
        >
          {id ? 'Mettre à jour' : 'Créer'}
        </Button>
      </Box>
    </Container>
  );
};

export default EditProject; 