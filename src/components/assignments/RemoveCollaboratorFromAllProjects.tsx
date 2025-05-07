import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import assignmentService from '../../services/assignmentService';
import { Assignment } from '../../services/assignmentService';

interface RemoveCollaboratorFromAllProjectsProps {
  collaboratorId: number;
  collaboratorName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RemoveCollaboratorFromAllProjects: React.FC<RemoveCollaboratorFromAllProjectsProps> = ({
  collaboratorId,
  collaboratorName,
  open,
  onClose,
  onSuccess,
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollaboratorAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assignmentService.getByCollaborator(collaboratorId);
      setAssignments(data);
    } catch (err) {
      console.error('Erreur lors du chargement des affectations:', err);
      setError('Erreur lors du chargement des affectations');
    } finally {
      setLoading(false);
    }
  }, [collaboratorId]);

  useEffect(() => {
    if (open) {
      fetchCollaboratorAssignments();
    }
  }, [open, fetchCollaboratorAssignments]);

  const handleRemove = async () => {
    if (!window.confirm(`Êtes-vous sûr de vouloir retirer ${collaboratorName} de tous ses projets ?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await assignmentService.removeCollaboratorFromAllProjects(collaboratorId);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erreur lors du retrait du collaborateur:', err);
      setError(err.response?.data?.message || 'Erreur lors du retrait du collaborateur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Retirer le collaborateur de tous ses projets</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          Vous êtes sur le point de retirer {collaboratorName} de tous ses projets.
          Cette action mettra à jour son statut en DISPONIBLE.
        </Typography>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Projets concernés :
        </Typography>

        <List>
          {assignments.map((assignment) => (
            <ListItem key={assignment.id}>
              <ListItemText
                primary={assignment.projectName}
                secondary={`Rôle: ${assignment.role}`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleRemove}
          variant="contained"
          color="error"
          disabled={loading || assignments.length === 0}
        >
          Retirer de tous les projets
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveCollaboratorFromAllProjects; 