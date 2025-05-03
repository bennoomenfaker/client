/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Card, CardContent, Typography } from '@mui/material';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const IncidentsParEquipement = ({ data }) => {
  // Transformation des données pour compter les incidents par équipement
  const transformedData = data.reduce((acc, { equipment, incident }) => {
    const equipmentName = equipment?.nom;  // Nom de l'équipement
    if (incident?.status) {
      // Vérifier si cet équipement est déjà dans l'accumulateur
      const existingEntry = acc.find(item => item.equipmentName === equipmentName);
      if (existingEntry) {
        existingEntry.incidentCount += 1;  // Incrémenter le nombre d'incidents
      } else {
        // Ajouter un nouvel objet si cet équipement n'est pas encore dans l'accumulateur
        acc.push({
          equipmentName,
          incidentCount: 1,
        });
      }
    }
    return acc;
  }, []);

  // Générer une description en fonction des données
  const totalIncidents = transformedData.reduce((acc, item) => acc + item.incidentCount, 0);
  const maxIncidentsEquipment = transformedData.reduce((prev, curr) => (prev.incidentCount > curr.incidentCount ? prev : curr), {});

  const description = `
    Ce graphique montre le nombre d'incidents par équipement.
    Total des incidents : ${totalIncidents}.
    L'équipement ayant le plus grand nombre d'incidents est ${maxIncidentsEquipment.equipmentName}, avec ${maxIncidentsEquipment.incidentCount} incidents.
  `;

 

  return (
    <Card sx={{ p: 2, borderRadius: '2xl', boxShadow: 3 }}>
                        <CardContent>

                        <Typography variant="h6" color="green" gutterBottom>
      Incidents par équipement</Typography>
      <Typography variant="body1" color="black" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
      {description}</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="equipmentName" />
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

export default IncidentsParEquipement;
