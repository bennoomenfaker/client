/* eslint-disable no-unused-vars */
import NavBar from "../../../health-platform/src/components/NavBar";
import {
  fetchAllIncidents,
  fetchIncidentsByHospital
} from "../redux/slices/incidentSlice";
import { fetchHospitals } from "../redux/slices/hospitalSlice";
import {
  fetchServicesByHospitalId
} from "../redux/slices/hospitalServiceSlice";
import {
  fetchEquipmentsByHospital,
  fetchNonReceivedEquipment
} from "../redux/slices/equipmentSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
  Grid,
  Paper,
} from "@mui/material";
import IncidentsParService from "./dashboard/IncidentsParService";
import EquipementsParService from "./dashboard/EquipementsParService";
import StatutsIncidents from "./dashboard/StatutsIncidents";
import EvolutionIncidents from "./dashboard/EvolutionIncidents";
import EquipementsParStatut from "./dashboard/EquipementsParStatut ";
import EquipmentsByBrandChart from "./dashboard/EquipmentsByBrandChart ";
import MaintenanceCalendar from "./dashboard/MaintenanceCalendar"
import {
  fetchSlaComplianceStats,
  fetchPenaltiesByHospital,
  fetchPenaltiesByCompany,
  fetchTopPenalizedEquipments
} from "../redux/slices/slaSlice";
import SlaGaugeChart from "./dashboard/SlaGaugeChart";
import { fetchAllMaintenancePlansByHospital } from "../redux/slices/maintenancePlanSlice ";
import { fetchCorrectiveMaintenancesByHospital } from "../redux/slices/correctiveMaintenanceSlice";


const MinistryAdminPage = () => {
  const dispatch = useDispatch();
  const [selectedHospital, setSelectedHospital] = useState("7a34da16-6bd3-4cc6-8aa6-c1d512c2bf4e");
  const { hospitals } = useSelector((state) => state.hospital);
  const { equipmentList, nonReceivedEquipment, isLoading } = useSelector((state) => state.equipment);
  const { all: allIncidents, list: hospitalIncidents } = useSelector((state) => state.incident);
  const [isNavOpen, setIsNavOpen] = useState(true);

  useEffect(() => {
    dispatch(fetchHospitals());
    dispatch(fetchAllIncidents());
    dispatch(fetchNonReceivedEquipment());
  }, [dispatch]);

  useEffect(() => {
    if (selectedHospital) {
      dispatch(fetchIncidentsByHospital(selectedHospital));
      dispatch(fetchEquipmentsByHospital(selectedHospital));
      dispatch(fetchServicesByHospitalId(selectedHospital));
      dispatch(fetchAllMaintenancePlansByHospital(selectedHospital));
          dispatch(fetchCorrectiveMaintenancesByHospital(selectedHospital))
          dispatch(fetchSlaComplianceStats(selectedHospital));
          dispatch(fetchPenaltiesByHospital(selectedHospital));
    }
  }, [dispatch, selectedHospital]);
  const incidentsByService = hospitalIncidents.reduce((acc, incident) => {
    const serviceName = incident?.hospitalServiceEntity?.name || "Inconnu";
    acc[serviceName] = (acc[serviceName] || 0) + 1;
    return acc;
  }, {});
  
  const incidentsServiceData = Object.entries(incidentsByService).map(([serviceName, count]) => ({
    serviceName,
    incidentCount: count,
  }));

  
    const {
    slaComplianceStatus,
    penaltiesByHospital,
    penaltiesByCompany,
    topPenalizedEquipments,
  } = useSelector((state) => state.sla);
  

  const interpretSlaConformity = (rate) => {
  if (rate >= 90) return "✅ Excellent niveau de conformité. Les délais SLA sont bien respectés.";
  if (rate >= 75) return "🟡 Conformité correcte mais améliorable. Surveillez les délais critiques.";
  if (rate >= 50) return "🔴 Faible conformité. Risque élevé de pénalités et d'insatisfaction.";
  return "❌ Niveau de conformité critique. Mesures urgentes à prendre.";
};

  
  

  return (
    <Box sx={{ display: "flex", minHeight: '100vh' , mt: 8 , ml:-4 }}>
      <NavBar onToggle={isNavOpen} />
      <div style={{ width: "90%", padding: "20px", marginTop: "60px" }}>
        <Typography variant="h5" color="primary" gutterBottom>
         Visualiser les statiqtiques Ministère
        </Typography>

        <FormControl fullWidth style={{ marginBottom: 20 }}>
          <InputLabel>Choisir un hôpital</InputLabel>
          <Select
            value={selectedHospital}
            label="Choisir un hôpital"
            onChange={(e) => setSelectedHospital(e.target.value)}
          >
            {hospitals.map((hosp) => (
              <MenuItem key={hosp.id} value={hosp.id}>
                {hosp.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

{isLoading ? (
  <CircularProgress />
) : (
  <Box>
    <Typography variant="subtitle1" gutterBottom>
      Équipements pour l&apos;hôpital sélectionné : {equipmentList.length}
    </Typography>
    <Typography variant="subtitle1" gutterBottom>
      Équipements non reçus : {nonReceivedEquipment.length}
    </Typography>
 

    {selectedHospital && !isLoading && (
      <Box component="main">
        <Box sx={{ maxWidth: 1800, mx: 'auto' }}>
          {/* Header */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              backgroundColor: 'white',
              borderRadius: 3,
              boxShadow: 2,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: 'primary.main',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 1,
                textAlign: 'center',
              }}
            >
              Statistique des incidents et équipements
            </Typography>
          </Box>

          {/* Main Content */}
          <Grid container spacing={4}>
            {/* 🗓️ Calendrier en première ligne */}
            <Grid item xs={12}>
              <MaintenanceCalendar />
            </Grid>

            {/* Conformité SLA & 💰 Pénalités */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Conformité SLA
                </Typography>

                {slaComplianceStatus && (
                  <SlaGaugeChart
                    complianceRate={slaComplianceStatus.complianceRate}
                  />
                )}

                <Typography>
                  Total incidents : {slaComplianceStatus?.totalIncidents}
                </Typography>
                <Typography>
                  Respectés : {slaComplianceStatus?.slaRespected}
                </Typography>
                <Typography>
                  Violation réponse : {slaComplianceStatus?.responseViolated}
                </Typography>
                <Typography>
                  Violation résolution : {slaComplianceStatus?.resolutionViolated}
                </Typography>
                <Typography>
                  Taux conformité :{' '}
                  {slaComplianceStatus?.complianceRate.toFixed(2)}%
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 2, fontStyle: 'italic', color: 'gray' }}
                >
                  {interpretSlaConformity(slaComplianceStatus?.complianceRate || 0)}
                </Typography>
              </Paper>
            </Grid>

            {/* Top équipements pénalisés */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Top 5 équipements les plus pénalisés
                </Typography>
                <ul>
                  {topPenalizedEquipments?.map((eq) => (
                    <li key={eq.serialNumber}>
                      Code série: {eq.serialNumber} – Pénalités :{' '}
                      {eq.totalPenalty.toFixed(2)} DT
                    </li>
                  ))}
                </ul>
              </Paper>
            </Grid>

            {/* Autres statistiques */}
            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <IncidentsParService data={incidentsServiceData} />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <EquipementsParService data={equipmentList} />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <StatutsIncidents data={hospitalIncidents} />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <EquipementsParStatut data={equipmentList} />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <EvolutionIncidents data={hospitalIncidents} />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box mb={3}>
                <EquipmentsByBrandChart data={equipmentList} />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    )}
  </Box>
)}

      </div>
    </Box>
  );
}

export default MinistryAdminPage;
