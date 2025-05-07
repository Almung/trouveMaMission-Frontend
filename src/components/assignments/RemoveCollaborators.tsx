import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Typography,
  Alert,
} from '@mui/material';
import assignmentService from '../../services/assignmentService';
import { Assignment } from '../../services/assignmentService';

interface RemoveCollaboratorsProps {
  projectId: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RemoveCollaborators: React.FC<RemoveCollaboratorsProps> = ({
  projectId,
  open,
  onClose,
  onSuccess,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchProjectAssignments();
    }
  }, [open, projectId]);

  const fetchProjectAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentService.getByProject(projectId);
      setAssignments(data);
      setSelectedCollaborators([]);
    } catch (err) {
      console.error('Erreur lors du chargement des affectations:', err);
      setError('Erreur lors du chargement des affectations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollaborator = (collaboratorId: number) => {
    setSelectedCollaborators(prev =>
      prev.includes(collaboratorId)
        ? prev.filter(id => id !== collaboratorId)
        : [...prev, collaboratorId]
    );
  };

  const handleRemoveSelected = async () => {
    if (selectedCollaborators.length === 0) {
      setError('Veuillez sélectionner au moins un collaborateur');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await assignmentService.removeCollaboratorsFromProject(projectId, selectedCollaborators);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erreur lors du retrait des collaborateurs:', err);
      setError(err.response?.data?.message || 'Erreur lors du retrait des collaborateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAll = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer tous les collaborateurs de ce projet ?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await assignmentService.removeAllCollaboratorsFromProject(projectId);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erreur lors du retrait des collaborateurs:', err);
      setError(err.response?.data?.message || 'Erreur lors du retrait des collaborateurs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Retirer des collaborateurs du projet</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          Sélectionnez les collaborateurs à retirer du projet :
        </Typography>

        <List>
          {assignments.map((assignment) => (
            <ListItem key={assignment.id}>
              <ListItemText
                primary={assignment.collaborator.name}
                secondary={`Rôle: ${assignment.role}`}
              />
              <ListItemSecondaryAction>
                <Checkbox
                  edge="end"
                  checked={selectedCollaborators.includes(assignment.collaboratorId)}
                  onChange={() => handleToggleCollaborator(assignment.collaboratorId)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleRemoveAll}
          color="error"
          disabled={loading || assignments.length === 0}
        >
          Retirer tous les collaborateurs
        </Button>
        <Button
          onClick={handleRemoveSelected}
          variant="contained"
          disabled={loading || selectedCollaborators.length === 0}
        >
          Retirer les collaborateurs sélectionnés
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveCollaborators; 