/* eslint-disable react/prop-types */
import { Card, CardContent, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatutsIncidents = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Calculer la répartition des statuts
  const statusCount = data.reduce((acc, { incident }) => {
    const status = incident?.status;
    if (status) {
      acc[status] = acc[status] ? acc[status] + 1 : 1;
    }
    return acc;
  }, {});

  // Transformer les données pour le graphique
  const transformedData = Object.entries(statusCount).map(([name, value]) => ({
    name,
    value,
  }));

  // Générer la description en fonction des données
  const totalIncidents = data.length;
  const description = `
    Ce graphique montre la répartition des incidents par statut.
    Total des incidents : ${totalIncidents}.
    Les statuts des incidents sont répartis comme suit :
    ${transformedData.map(item => `${item.name}: ${item.value}`).join(", ")}.
  `;

  

  return (
    <Card sx={{ p: 2, borderRadius: '2xl', boxShadow: 3 }}>
            <CardContent>
            <Typography variant="h6" color="green" gutterBottom>

  Répartition des incidents par statut</Typography>
      <Typography variant="body1" color="black" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
      {description}
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={transformedData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {transformedData.map((entry, index) => (
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

export default StatutsIncidents;
