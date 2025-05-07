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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  PersonRemove as PersonRemoveIcon,
} from '@mui/icons-material';
import assignmentService, { Assignment } from '../../services/assignmentService';
import { authService } from '../../services/authService';
import RemoveCollaboratorFromAllProjects from './RemoveCollaboratorFromAllProjects';

const AssignmentList: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [removeFromAllProjectsOpen, setRemoveFromAllProjectsOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<{ id: number; name: string } | null>(null);

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isManagerOrAdmin = ['ADMIN', 'MANAGER'].includes(currentUser?.role || '');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentService.getAll();
      setAssignments(data);
    } catch (err) {
      console.error('Erreur lors du chargement des affectations:', err);
      setError('Erreur lors du chargement des affectations');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      (assignment.collaboratorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assignment.projectName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesActiveFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'active' && isAssignmentActive(assignment)) ||
      (activeFilter === 'inactive' && !isAssignmentActive(assignment));

    return matchesSearch && matchesActiveFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_COURS':
        return 'success';
      case 'EN_DEMARRAGE':
        return 'info';
      case 'EN_PAUSE':
        return 'warning';
      case 'TERMINE':
        return 'error';
      default:
        return 'default';
    }
  };

  const isAssignmentActive = (assignment: Assignment) => {
    return assignment?.project?.status === 'EN_COURS' || 
           assignment?.project?.status === 'EN_DEMARRAGE' || 
           assignment?.project?.status === 'EN_PAUSE';
  };

  const handleRemoveFromAllProjects = (collaboratorId: number, collaboratorName: string) => {
    setSelectedCollaborator({ id: collaboratorId, name: collaboratorName });
    setRemoveFromAllProjectsOpen(true);
  };

  const handleRemoveSuccess = () => {
    fetchAssignments();
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
          Liste des Affectations
        </Typography>
        {isManagerOrAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/assignments/add')}
            sx={{
              backgroundColor: '#f47216',
              '&:hover': {
                backgroundColor: '#c25810',
              },
            }}
          >
            Nouvelle Affectation
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Rechercher"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              label="Statut"
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="active">Actifs</MenuItem>
              <MenuItem value="inactive">Inactifs</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Collaborateur</TableCell>
                <TableCell>Projet</TableCell>
                <TableCell>Rôle</TableCell>
                <TableCell>État</TableCell>
                {isManagerOrAdmin && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>{assignment.collaboratorName || 'N/A'}</TableCell>
                  <TableCell>{assignment.projectName || 'N/A'}</TableCell>
                  <TableCell>{assignment.role || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={assignment.projectActive ? 'Actif' : 'Inactif'}
                      sx={{
                        backgroundColor: assignment.projectActive ? '#4caf50' : '#f44336',
                        color: 'white',
                      }}
                    />
                  </TableCell>
                  {isManagerOrAdmin && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => handleRemoveFromAllProjects(assignment.collaboratorId!, assignment.collaboratorName!)}
                          color="warning"
                          title="Retirer le collaborateur du projet"
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {selectedCollaborator && (
        <RemoveCollaboratorFromAllProjects
          collaboratorId={selectedCollaborator.id}
          collaboratorName={selectedCollaborator.name}
          open={removeFromAllProjectsOpen}
          onClose={() => setRemoveFromAllProjectsOpen(false)}
          onSuccess={handleRemoveSuccess}
        />
      )}
    </Container>
  );
};

export default AssignmentList; 