import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  TextField,
  Button,
  IconButton,
  Chip,
  Stack,
  InputAdornment,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { collaboratorService, CollaboratorStatus } from '../../services/collaboratorService';

interface FormValues {
  name: string;
  email: string;
  phone: string;
  role: string;
  grade: string;
  status: CollaboratorStatus;
  experienceYears: number;
  skills: string[];
  active: boolean;
}

const validationSchema = yup.object({
  name: yup.string().required('Le nom est requis'),
  email: yup.string().email('Email invalide').required('L\'email est requis'),
  phone: yup.string().required('Le numéro de téléphone est requis'),
  role: yup.string().required('Le poste est requis'),
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

const AddCollaborator: React.FC = () => {
  const navigate = useNavigate();
  const [newSkill, setNewSkill] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

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

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      role: '',
      grade: 'Junior',
      status: CollaboratorStatus.DISPONIBLE,
      experienceYears: 0,
      skills: [],
      active: true,
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
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

        await collaboratorService.create(collaboratorData);
        navigate('/collaborators');
      } catch (error: any) {
        setError(error.message || 'Une erreur est survenue lors de la création du collaborateur');
        console.error('Erreur lors de la création du collaborateur:', error);
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
          onClick={() => navigate('/collaborators')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" color="primary" display="inline">
          Nouveau Collaborateur
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

            <TextField
              fullWidth
              name="name"
              label="Nom complet"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              InputProps={{
                startAdornment: <InputAdornment position="start">👤</InputAdornment>,
              }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                InputProps={{
                  startAdornment: <InputAdornment position="start">📧</InputAdornment>,
                }}
              />
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
            </Box>

            <TextField
              fullWidth
              name="role"
              label="Poste"
              value={formik.values.role}
              onChange={formik.handleChange}
              error={formik.touched.role && Boolean(formik.errors.role)}
              helperText={formik.touched.role && formik.errors.role}
              InputProps={{
                startAdornment: <InputAdornment position="start">💼</InputAdornment>,
              }}
            />

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

            {/* Compétences */}
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

            <Box sx={{ display: 'flex', gap: 2 }}>
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
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/collaborators')}
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
                {loading ? 'Enregistrement...' : 'Créer le collaborateur'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddCollaborator; 