import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import reportService from '../../services/reportService';

interface DashboardData {
  totalActiveProjects: number;
  totalCollaborators: number;
  recentProjectUpdates: number;
  overdueProjects: number;
  newAssignments: number;
  overallProjectProgress: number;
}

interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  criticalProjects: number;
  leastUsedSkills: Array<{
    name: string;
    category: string;
  }>;
}

interface CollaboratorStatistics {
  onMission: number;
  free: number;
  onLeave: number;
  total: number;
  skills: Record<string, number>;
  topSkills: Array<{
    name: string;
    count: number;
  }>;
  leastUsedSkills: Array<{
    name: string;
    count: number;
  }>;
}

const Reports: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStatistics | null>(null);
  const [collaboratorStats, setCollaboratorStats] = useState<CollaboratorStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
    try {
      setLoading(true);
        console.log('Début du chargement des données...');
        
        const [dashboard, projects, collaborators] = await Promise.all([
          reportService.getDashboardData(),
          reportService.getProjectStatistics(),
          reportService.getCollaboratorStatistics()
        ]);
        
        console.log('Données chargées avec succès:');
        console.log('Dashboard:', JSON.stringify(dashboard, null, 2));
        console.log('Projets:', JSON.stringify(projects, null, 2));
        console.log('Collaborateurs:', JSON.stringify(collaborators, null, 2));
        
        // Log spécifique pour les compétences les moins utilisées
        console.log('Compétences les moins utilisées:', JSON.stringify((collaborators as CollaboratorStatistics).leastUsedSkills, null, 2));
        
        setDashboardData(dashboard);
        setProjectStats(projects);
        setCollaboratorStats(collaborators as CollaboratorStatistics);
    } catch (err) {
        console.error('Erreur détaillée:', err);
        setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

    fetchData();
  }, []);

  if (loading) {
    console.log('État: Chargement en cours...');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.log('État: Erreur', error);
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  console.log('État: Données chargées');
  console.log('Dashboard Data:', dashboardData);
  console.log('Project Stats:', projectStats);
  console.log('Collaborator Stats:', collaboratorStats);

  const projectData = projectStats ? [
    { name: 'Total', value: projectStats.totalProjects },
    { name: 'Actifs', value: projectStats.activeProjects },
    { name: 'Terminés', value: projectStats.completedProjects },
    { name: 'Critiques', value: projectStats.criticalProjects }
  ] : [];

  const collaboratorData = collaboratorStats ? [
    { name: 'En mission', value: collaboratorStats.onMission },
    { name: 'Disponibles', value: collaboratorStats.free },
    { name: 'En congé', value: collaboratorStats.onLeave }
  ] : [];

  const topSkillsData = collaboratorStats?.topSkills?.slice(0, 3).map(skill => ({
    name: skill.name,
    value: skill.count
  })) || [];

  const leastUsedSkillsData = collaboratorStats?.leastUsedSkills?.map(skill => ({
    name: skill.name,
    value: skill.count
  })) || [];

  console.log('Données des graphiques:');
  console.log('Project Data:', JSON.stringify(projectData, null, 2));
  console.log('Collaborator Data:', JSON.stringify(collaboratorData, null, 2));
  console.log('Top Skills Data:', JSON.stringify(topSkillsData, null, 2));
  console.log('Least Used Skills Data:', JSON.stringify(leastUsedSkillsData, null, 2));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* KPIs */}
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Projets Actifs
            </Typography>
            <Typography component="p" variant="h4">
              {dashboardData?.totalActiveProjects || 0}
              </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Collaborateurs
              </Typography>
            <Typography component="p" variant="h4">
              {collaboratorStats?.total || 0}
              </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Projets en Retard
            </Typography>
            <Typography component="p" variant="h4">
              {dashboardData?.overdueProjects || 0}
              </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Progression Moyenne
              </Typography>
            <Typography component="p" variant="h4">
              {dashboardData ? `${Math.round(dashboardData.overallProjectProgress)}%` : '0%'}
              </Typography>
          </Paper>
        </Grid>

        {/* Graphiques */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Statistiques des Projets
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Répartition des Collaborateurs
              </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={collaboratorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#f47216" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top 3 des compétences */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Top 3 des Compétences
              </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkillsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#f47216" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Statistiques détaillées des collaborateurs */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Statistiques des Collaborateurs
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1">En Mission</Typography>
                  <Typography variant="h4">{collaboratorStats?.onMission || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1">Disponibles</Typography>
                  <Typography variant="h4">{collaboratorStats?.free || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1">En Congé</Typography>
                  <Typography variant="h4">{collaboratorStats?.onLeave || 0}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="subtitle1">Total</Typography>
                  <Typography variant="h4">{collaboratorStats?.total || 0}</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Compétences les moins utilisées */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Compétences les moins utilisées
            </Typography>
            {leastUsedSkillsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={leastUsedSkillsData}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} collaborateur${value > 1 ? 's' : ''}`, 'Nombre']}
                  />
                  <Bar dataKey="value" fill="#ff6b6b" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  Aucune donnée disponible pour les compétences les moins utilisées
                </Typography>
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Ces compétences sont sous-utilisées dans votre équipe. Considérez des formations ou des recrutements ciblés.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports; 