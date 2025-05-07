import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Group as GroupIcon,
  FolderSpecial as ProjectIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import dashboardService, { DashboardData } from '../../services/dashboardService';
import { authService } from '../../services/authService';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role?.toUpperCase() === 'ADMIN';

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err: any) {
      if (err.message === 'Non authentifié') {
        navigate('/login');
      } else {
        setError('Erreur lors du chargement des données du tableau de bord');
      }
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Projets',
      description: 'Gérez vos projets et suivez leur avancement',
      icon: <ProjectIcon sx={{ fontSize: 40, color: '#f47216' }} />,
      path: '/projects',
    },
    {
      title: 'Collaborateurs',
      description: 'Gérez votre équipe et les affectations',
      icon: <GroupIcon sx={{ fontSize: 40, color: '#f47216' }} />,
      path: '/collaborators',
    },
    {
      title: 'Rapports',
      description: 'Consultez les statistiques et les rapports',
      icon: <ReportIcon sx={{ fontSize: 40, color: '#f47216' }} />,
      path: '/reports',
    },
    ...(isAdmin ? [{
      title: 'Paramètres',
      description: 'Configurez les paramètres de l\'application',
      icon: <SettingsIcon sx={{ fontSize: 40, color: '#f47216' }} />,
      path: '/settings',
    }] : []),
  ];

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', backgroundColor: color }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {icon}
        <Box>
          <Typography variant="h6" component="div">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" component="h1" color="primary" gutterBottom>
          Bienvenue sur votre espace de gestion
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gérez vos projets et votre équipe en toute simplicité
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#f47216' }} />
        </Box>
      ) : dashboardData && (
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Projets Actifs"
              value={dashboardData.totalActiveProjects}
              icon={<ProjectIcon sx={{ fontSize: 40, color: '#f47216' }} />}
              color="#fff3e0"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Collaborateurs"
              value={dashboardData.totalCollaborators}
              icon={<GroupIcon sx={{ fontSize: 40, color: '#f47216' }} />}
              color="#e3f2fd"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Affectations Actives"
              value={dashboardData.activeAssignments}
              icon={<AssignmentIcon sx={{ fontSize: 40, color: '#f47216' }} />}
              color="#ffebee"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Progression Globale"
              value={Math.round(dashboardData.overallProjectProgress * 100)}
              icon={<CheckCircleIcon sx={{ fontSize: 40, color: '#f47216' }} />}
              color="#e8f5e9"
            />
          </Grid>
        </Grid>
      )}

      <Grid container spacing={4}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                {item.icon}
                <Typography gutterBottom variant="h6" component="h2" sx={{ mt: 2 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderColor: '#f47216',
                    color: '#f47216',
                    '&:hover': {
                      borderColor: '#f47216',
                      backgroundColor: 'rgba(244, 114, 22, 0.04)',
                    },
                  }}
                >
                  Accéder
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home; 