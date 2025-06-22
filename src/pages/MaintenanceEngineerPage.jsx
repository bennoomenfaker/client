/* eslint-disable no-unused-vars */
import NavBar from "./../components/NavBar";
import { fetchAllIncidents, fetchIncidentsByHospital, fetchIncidentsByHospitalAndService } from "../redux/slices/incidentSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices , fetchServiceById, fetchServicesByHospitalId } from "../redux/slices/hospitalServiceSlice";
import { fetchEquipmentsByHospital } from "../redux/slices/equipmentSlice";
import { useEffect, useState } from "react";
import IncidentsParService from "./dashboard/IncidentsParService";
import EquipementsParService from "./dashboard/EquipementsParService";
import StatutsIncidents from "./dashboard/StatutsIncidents";
import EvolutionIncidents from "./dashboard/EvolutionIncidents";
import EquipementsParStatut from "./dashboard/EquipementsParStatut ";
import { Box, Grid, Typography , Paper } from "@mui/material";
import EquipmentsByBrandChart from "./dashboard/EquipmentsByBrandChart ";

import { fetchAllMaintenancePlansByHospital } from "../redux/slices/maintenancePlanSlice ";
import { fetchCorrectiveMaintenancesByHospital } from "../redux/slices/correctiveMaintenanceSlice";
import MaintenanceCalendar from "./dashboard/MaintenanceCalendar"
import SlaGaugeChart from "./dashboard/SlaGaugeChart";

const MaintenanceEngineerPage = () => {
   const hospitalId = sessionStorage.getItem("hospitalId");
  const [isNavOpen, setIsNavOpen] = useState(true);

  // Sélection des états du Redux
  const { list: allIncidents, isLoading: isIncidentLoading } = useSelector(
    (state) => state.incident
  );
  const { equipmentList, isLoading: isEquipmentLoading } = useSelector(
    (state) => state.equipment
  );
    const {
    slaComplianceStatus,
    penaltiesByHospital,
    penaltiesByCompany,
    topPenalizedEquipments,
  } = useSelector((state) => state.sla);
  
  

   
  // Log des données pour vérifier leur contenu
  //console.log("Equipements:", equipmentList);
  //console.log("Incidents:", allIncidents);
  //console.log("Services:", serviceByHospital);
  //console.log("maintenanceplans:" , maintenancesPlans);
   //console.log("correctives maintenances:", corrcMaintenance);

  // Dispatch pour récupérer les données nécessaires
  const dispatch = useDispatch();

  useEffect(() => {
    // Dispatch des actions pour récupérer les incidents, services et équipements
    dispatch(fetchIncidentsByHospital(hospitalId));
    dispatch(fetchServicesByHospitalId(hospitalId));
    dispatch(fetchEquipmentsByHospital(hospitalId));
    dispatch(fetchAllMaintenancePlansByHospital(hospitalId));
    dispatch(fetchCorrectiveMaintenancesByHospital(hospitalId))
  }, [dispatch, hospitalId]);


  // Traitement des données si nécessaire (ex : filtrage ou transformation)
  const incidentsByService = allIncidents.reduce((acc, incident) => {
    const serviceName = incident?.hospitalServiceEntity?.name; // Assure-toi que la clé 'serviceName' existe dans l'incident
    if (!acc[serviceName]) {
      acc[serviceName] = 0;
    }
    acc[serviceName]++;
    return acc;
  }, {});

  // Préparer les données pour le graphique
  const incidentsServiceData = Object.keys(incidentsByService).map((service) => ({
    serviceName: service,
    incidentCount: incidentsByService[service],
  }));
    const interpretSlaConformity = (rate) => {
  if (rate >= 90) return "✅ Excellent niveau de conformité. Les délais SLA sont bien respectés.";
  if (rate >= 75) return "🟡 Conformité correcte mais améliorable. Surveillez les délais critiques.";
  if (rate >= 50) return "🔴 Faible conformité. Risque élevé de pénalités et d'insatisfaction.";
  return "❌ Niveau de conformité critique. Mesures urgentes à prendre.";
};


 return (
    <Box sx={{ display: "flex", minHeight: '100vh' , mt: 8 , ml:-4 }}>
      <NavBar onToggle={isNavOpen} />
      
      <Box component="main" >
        <Box sx={{ 
          maxWidth: 1800,
          mx: 'auto'
        }}>
          {/* Header */}
          <Box sx={{ 
            mb: 4,
            p: 3,
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: 2
          }}>
            <Typography variant="h4" sx={{ 
              color: 'primary.main',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: 1,
              textAlign: 'center',
            }}>
              Statistique des incidents et équipements
            </Typography>
          </Box>

          {/* Main Content */}
          <Grid container spacing={4}>
            {/* Calendrier en pleine largeur */}
            <Grid item xs={12}>
              <MaintenanceCalendar />
            </Grid>
              {/*  Conformité SLA & 💰 Pénalités */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom>
                     Conformité SLA
                  </Typography>
            
                  {slaComplianceStatus && (
                    <SlaGaugeChart complianceRate={slaComplianceStatus.complianceRate} />
                  )}
            
                  <Typography>Total incidents : {slaComplianceStatus?.totalIncidents}</Typography>
                  <Typography>Respectés : {slaComplianceStatus?.slaRespected}</Typography>
                  <Typography>Violation réponse : {slaComplianceStatus?.responseViolated}</Typography>
                  <Typography>Violation résolution : {slaComplianceStatus?.resolutionViolated}</Typography>
                  <Typography>Taux conformité : {slaComplianceStatus?.complianceRate.toFixed(2)}%</Typography>
                  <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'gray' }}>
                    {interpretSlaConformity(slaComplianceStatus?.complianceRate || 0)}
                  </Typography>
                </Paper>
              </Grid>
            
              {/*  Top équipements pénalisés */}
            
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                     <Typography variant="h6" gutterBottom>
                     Top 5 équipements les plus pénalisés
                  </Typography>
                  <ul>
                    {topPenalizedEquipments?.map((eq) => (
                      <li key={eq.serialNumber}>
                        Code série: {eq.serialNumber} – Pénalités : {eq.totalPenalty.toFixed(2)} DT
                      </li>
                    ))}
                  </ul>
                  </Paper>
              </Grid>

            {/* Première ligne de graphiques */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                <IncidentsParService data={incidentsServiceData} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                <EquipementsParService data={equipmentList} />
              </Paper>
            </Grid>

            {/* Deuxième ligne de graphiques */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                <StatutsIncidents data={allIncidents} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                <EquipementsParStatut data={equipmentList} />
              </Paper>
            </Grid>

            

            {/* Graphique en pleine largeur */}
            <Grid item xs={12} >
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                <EquipmentsByBrandChart />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
                <EvolutionIncidents data={allIncidents} />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default MaintenanceEngineerPage
