/* eslint-disable react/prop-types */
import { Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IncidentsParService = ({ data }) => {
  // Générer la description en fonction des données
  const totalIncidents = data.reduce((acc, item) => acc + item.incidentCount, 0);
  const maxIncidentsService = data.reduce((prev, curr) => (prev.incidentCount > curr.incidentCount ? prev : curr), {});

  const description = `
    Ce graphique montre le nombre d'incidents par service.
    Total des incidents : ${totalIncidents}.
    Le service avec le plus grand nombre d'incidents est ${maxIncidentsService.serviceName}, avec ${maxIncidentsService.incidentCount} incidents.
  `;



  return (
    <Card sx={{ p: 2, borderRadius: '2xl', boxShadow: 3 }}>
                        <CardContent>

                        <Typography variant="h6" color="green" gutterBottom>
Incidents par service</Typography>
<Typography variant="body1" color="black" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
{description}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="serviceName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="incidentCount" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default IncidentsParService;
