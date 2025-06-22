// src/pages/dashboard/SlaGaugeChart.jsx
import { PieChart, Pie, Cell } from 'recharts';
import { Typography, Box } from '@mui/material';
import PropTypes from 'prop-types';

const COLORS = ['#4caf50', '#f44336']; // Vert pour respecté, Rouge pour non respecté

const SlaGaugeChart = ({ complianceRate }) => {
  const data = [
    { name: 'Conforme', value: complianceRate },
    { name: 'Non conforme', value: 100 - complianceRate },
  ];

  return (
    <Box textAlign="center">
      <Typography variant="h6" gutterBottom>
        🎯 Taux de conformité SLA
      </Typography>

      <Box sx={{   display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  height: 200 }}>
  <PieChart width={200} height={150}>
    <Pie
      data={data}
      cx="50%"
      cy="100%"
      startAngle={180}
      endAngle={0}
      innerRadius={60}
      outerRadius={80}
      paddingAngle={3}
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
  </PieChart>
</Box>

      <Typography variant="h5" fontWeight="bold">
        {complianceRate.toFixed(1)}%
      </Typography>
    </Box>
  );
};
SlaGaugeChart.propTypes = {
  complianceRate: PropTypes.number.isRequired,
};

export default SlaGaugeChart;
