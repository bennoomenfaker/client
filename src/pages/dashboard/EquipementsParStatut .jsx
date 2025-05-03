/* eslint-disable react/prop-types */
import { Card, CardContent, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6666'];

const EquipementsParStatut = ({ data }) => {
  // Regrouper les équipements par statut
  const statusCounts = data.reduce((acc, equipment) => {
    const status = equipment.status || 'Inconnu';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Transformer en tableau pour Recharts
  const chartData = Object.keys(statusCounts).map((status) => ({
    name: status,
    value: statusCounts[status],
  }));

  if (!chartData.length) return <div>Aucune donnée disponible pour les statuts des équipements</div>;

  return (
    <Card sx={{ p: 2, borderRadius: '2xl', boxShadow: 3 }}>
                          <CardContent>
        
                          <Typography variant="h6" color="green" gutterBottom>
                          Répartition des équipements par statut</Typography>
                          <Typography variant="body1" color="black" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                          Ce graphique en secteurs illustre la <strong>distribution des équipements médicaux</strong> selon leur
        <strong> statut actuel</strong>. Chaque portion du diagramme représente un statut particulier (par exemple :
        <em> Fonctionnel, En maintenance, En panne, Hors service</em>, etc.), et sa taille est proportionnelle au
        <strong> nombre d’équipements</strong> ayant ce statut.
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EquipementsParStatut;
