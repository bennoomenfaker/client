/* eslint-disable no-unused-vars */
import NavBar from "./../components/NavBar";
import { fetchAllIncidents, fetchIncidentsByHospital, fetchIncidentsByHospitalAndService } from "../redux/slices/incidentSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchServices , fetchServiceById, fetchServicesByHospitalId } from "../redux/slices/hospitalServiceSlice";
import { fetchEquipmentsByHospital } from "../redux/slices/equipmentSlice";
import { useEffect, useState, useMemo } from "react";
import IncidentsParService from "./dashboard/IncidentsParService";
import EquipementsParService from "./dashboard/EquipementsParService";
import StatutsIncidents from "./dashboard/StatutsIncidents";
import EvolutionIncidents from "./dashboard/EvolutionIncidents";
import EquipementsParStatut from "./dashboard/EquipementsParStatut ";
import { Box, Grid, Paper, Typography } from "@mui/material";
import EquipmentsByBrandChart from "./dashboard/EquipmentsByBrandChart ";
import { fetchAllMaintenancePlansByHospital } from "../redux/slices/maintenancePlanSlice ";
import { fetchCorrectiveMaintenancesByHospital } from "../redux/slices/correctiveMaintenanceSlice";
import MaintenanceCalendar from "./dashboard/MaintenanceCalendar"
import MaintenanceCalendarServisor from "./dashboard/MaintenanceCalendarServisor";


const ServiceSupervisorPage = () => {
 const hospitalId = sessionStorage.getItem("hospitalId");
  const [isNavOpen, setIsNavOpen] = useState(true);
  const serviceId = sessionStorage.getItem("serviceId");


  // Sélection des états du Redux
  const { list: allIncidents, isLoading: isIncidentLoading } = useSelector(
    (state) => state.incident
  );
  const { equipmentList, isLoading: isEquipmentLoading } = useSelector(
    (state) => state.equipment
  );
  

   
  // Log des données pour vérifier leur contenu

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
 const filteredIncidents = useMemo(() => {
  return allIncidents.filter(incident => {
    const incidentServiceId = incident.incident?.serviceId || incident.hospitalServiceEntity?.id;
    return incidentServiceId === serviceId;
  });
}, [allIncidents, serviceId]);
const filteredEquipment = useMemo(() => {
  return equipmentList.filter(equipment => equipment.serviceId === serviceId);
}, [equipmentList, serviceId]);


  // Traitement des données si nécessaire (ex : filtrage ou transformation)
const incidentsByService = filteredIncidents.reduce((acc, incident) => {
  const serviceName = incident?.hospitalServiceEntity?.name || 'Service inconnu';
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

  const filteredEquipmentIds = useMemo(() => {
  return filteredEquipment.map(equipment => equipment.id);
}, [filteredEquipment]);
const maintenancePlans = useSelector((state) => state.maintenancePlan.maintenancePlans);
const filteredMaintenancePlans = useMemo(() => {
  return maintenancePlans.filter(plan =>
    filteredEquipmentIds.includes(plan.equipmentId)
  );
}, [maintenancePlans, filteredEquipmentIds]);
const correctiveMaintenances = useSelector((state) => state.correctiveMaintenance.listCorr);

const filteredCorrectiveMaintenances = useMemo(() => {
  return correctiveMaintenances.filter(cm =>
    filteredEquipmentIds.includes(cm.equipmentId)
  );
}, [correctiveMaintenances, filteredEquipmentIds]);


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
  <MaintenanceCalendarServisor
    maintenancePlans={filteredMaintenancePlans}
    correctiveMaintenances={filteredCorrectiveMaintenances}
  />
</Grid>


            {/* Première ligne de graphiques */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                <IncidentsParService data={incidentsServiceData} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                <EquipementsParService data={filteredEquipment} />
              </Paper>
            </Grid>

            {/* Deuxième ligne de graphiques */}
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                <StatutsIncidents data={filteredIncidents} />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 3, height: '100%' }}>
                <EquipementsParStatut data={filteredEquipment} />
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
                <EvolutionIncidents data={filteredIncidents} />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default ServiceSupervisorPage
