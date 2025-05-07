import React, { useEffect, useState } from 'react';
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
  InputAdornment,
  Alert,
  Autocomplete,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { collaboratorService } from '../../services/collaboratorService';
import { Collaborator, CollaboratorStatus } from '../../services/collaboratorService';

interface FormValues extends Omit<Collaborator, 'skills'> {
  id: number | null;
  skills: string[];
  active: boolean;
}

const validationSchema = yup.object({
  name: yup.string().required('Le nom est requis'),
  email: yup.string().email('Email invalide').required('L\'email est requis'),
  phone: yup.string().required('Le téléphone est requis'),
  role: yup.string().required('Le rôle est requis'),
  grade: yup.string().required('Le grade est requis'),
  status: yup.string().required('Le statut est requis'),
  experienceYears: yup.number().required('Les années d\'expérience sont requises').min(0, 'Le nombre d\'années doit être positif'),
  skills: yup.array().min(1, 'Au moins une compétence est requise'),
  active: yup.boolean(),
});

const getStatusLabel = (status: CollaboratorStatus) => {
  switch (status) {
    case CollaboratorStatus.DISPONIBLE:
      return 'Disponible';
    case CollaboratorStatus.EN_MISSION:
      return 'En mission';
    case CollaboratorStatus.EN_CONGE:
      return 'En congé';
    default:
      return status;
  }
};

const EditCollaborator: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [error, setError] = React.useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const formik = useFormik({
    initialValues: {
      id: null as number | null,
      name: '',
      email: '',
      phone: '',
      role: '',
      grade: '',
      status: CollaboratorStatus.DISPONIBLE,
      experienceYears: 0,
      skills: [] as string[],
      active: true,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        if (id) {
          const collaboratorData = {
            name: values.name,
            email: values.email,
            phone: values.phone,
            role: values.role,
            grade: values.grade,
            status: values.status,
            experienceYears: values.experienceYears,
            skills: values.skills,
            active: values.active
          };
          await collaboratorService.update(parseInt(id), collaboratorData);
          navigate('/collaborators');
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           'Erreur lors de la mise à jour du collaborateur';
        setError(errorMessage);
        console.error('Erreur détaillée:', error.response?.data);
      }
    },
  });

  useEffect(() => {
    const fetchCollaborator = async () => {
      try {
        if (id) {
          const collaborator = await collaboratorService.getById(parseInt(id));
          formik.setValues({
            id: collaborator.id,
            name: collaborator.name,
            email: collaborator.email,
            phone: collaborator.phone,
            role: collaborator.role,
            grade: collaborator.grade,
            status: collaborator.status,
            experienceYears: collaborator.experienceYears,
            skills: collaborator.skills || [],
            active: collaborator.active,
          });
        }
      } catch (error) {
        setError('Erreur lors du chargement du collaborateur');
        console.error('Erreur lors du chargement du collaborateur:', error);
      }
    };

    fetchCollaborator();
  }, [id]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await collaboratorService.getAllSkills();
        setAvailableSkills(skills);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <IconButton
        onClick={() => navigate('/collaborators')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" color="primary" display="inline">
          Modifier le Collaborateur
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
              <TextField
                fullWidth
                name="name"
                label="Nom"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                name="phone"
                label="Téléphone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                InputProps={{
                  startAdornment: <InputAdornment position="start">📞</InputAdornment>,
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  label="Rôle"
                  error={formik.touched.role && Boolean(formik.errors.role)}
                >
                  <MenuItem value="Développeur">Développeur</MenuItem>
                  <MenuItem value="Chef de Projet">Chef de Projet</MenuItem>
                  <MenuItem value="Designer">Designer</MenuItem>
                  <MenuItem value="DevOps">DevOps</MenuItem>
                  <MenuItem value="QA">QA</MenuItem>
                </Select>
                {formik.touched.role && formik.errors.role && (
                  <Typography color="error" variant="caption">
                    {formik.errors.role}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select
                  name="grade"
                  value={formik.values.grade}
                onChange={formik.handleChange}
                  label="Grade"
                  error={formik.touched.grade && Boolean(formik.errors.grade)}
                >
                  <MenuItem value="Junior">Junior</MenuItem>
                  <MenuItem value="Confirmé">Confirmé</MenuItem>
                  <MenuItem value="Senior">Senior</MenuItem>
                  <MenuItem value="Lead">Lead</MenuItem>
                  <MenuItem value="Architect">Architect</MenuItem>
                </Select>
                {formik.touched.grade && formik.errors.grade && (
                  <Typography color="error" variant="caption">
                    {formik.errors.grade}
                  </Typography>
                )}
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  label="Statut"
                  error={formik.touched.status && Boolean(formik.errors.status)}
                >
                  <MenuItem value={CollaboratorStatus.DISPONIBLE}>Disponible</MenuItem>
                  <MenuItem value={CollaboratorStatus.EN_MISSION}>En mission</MenuItem>
                  <MenuItem value={CollaboratorStatus.EN_CONGE}>En congé</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <Typography color="error" variant="caption">
                    {formik.errors.status}
                  </Typography>
                )}
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                name="experienceYears"
                label="Années d'expérience"
                type="number"
                value={formik.values.experienceYears}
                onChange={formik.handleChange}
                error={formik.touched.experienceYears && Boolean(formik.errors.experienceYears)}
                helperText={formik.touched.experienceYears && formik.errors.experienceYears}
                InputProps={{
                  startAdornment: <InputAdornment position="start">📅</InputAdornment>,
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Typography variant="subtitle1" gutterBottom>
                Compétences
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
                />
              ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/collaborators')}
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

export default EditCollaborator; 