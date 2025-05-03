import { useSelector } from 'react-redux';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Label
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

const EquipmentsByBrandChart = () => {
  const equipmentList = useSelector(state => state.equipment.equipmentList);

  // Regrouper les équipements par marque
  const brandCounts = equipmentList.reduce((acc, eq) => {
    const brand = eq.brand?.name || "Inconnue";
    acc[brand] = (acc[brand] || 0) + 1;
    return acc;
  }, {});

  // Formater les données pour Recharts
  const chartData = Object.entries(brandCounts).map(([brand, count]) => ({
    brand,
    count,
  }));

  // Générer une description en fonction des données
  const totalEquipments = chartData.reduce((acc, item) => acc + item.count, 0);
  const brandsList = chartData.map(item => item.brand).join(", ");
  const topBrand = chartData.reduce((prev, curr) => (prev.count > curr.count ? prev : curr), {});

  const description = `
    Ce graphique présente la répartition des équipements médicaux par marque.
    Un total de ${totalEquipments} équipements ont été enregistrés.
    Les marques identifiées sont : ${brandsList}.
    La marque avec le plus d’équipements est "${topBrand.brand}" avec ${topBrand.count} équipements.
  `;

  return (
    <Card sx={{ p: 2, borderRadius: '2xl', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6" color="green" gutterBottom>
          Répartition des équipements par marque
        </Typography>
        <Typography variant="body1" color="black" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
          {description}
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number">
              <Label value="Nombre d'équipements" offset={0} position="insideBottom" />
            </XAxis>
            <YAxis dataKey="brand" type="category" />
            <Tooltip />
            <Bar dataKey="count" fill="#1976d2" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default EquipmentsByBrandChart;
