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
import IncidentsParEquipement from "./dashboard/IncidentsParEquipement";
import EvolutionIncidents from "./dashboard/EvolutionIncidents";
import EquipementsParStatut from "./dashboard/EquipementsParStatut ";
import { Box, Grid, Typography } from "@mui/material";
import EquipmentsByBrandChart from "./dashboard/EquipmentsByBrandChart ";


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
    const serviceByHospital = useSelector(
      (state) => state.hospitalService.serviceByHospital
    );
  
    // Log des données pour vérifier leur contenu
    console.log("Equipements:", equipmentList);
    console.log("Incidents:", allIncidents);
    console.log("Services:", serviceByHospital);
  
    // Dispatch pour récupérer les données nécessaires
    const dispatch = useDispatch();
  
    useEffect(() => {
      // Dispatch des actions pour récupérer les incidents, services et équipements
      dispatch(fetchIncidentsByHospital(hospitalId));
      dispatch(fetchServicesByHospitalId(hospitalId));
      dispatch(fetchEquipmentsByHospital(hospitalId));
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
  
  return (
    <div style={{ display: "flex" }}>
         <NavBar onToggle={isNavOpen} />
         <div style={{ width: '90%', padding: '10px', marginTop: 60 }}>
           <Typography p={2} color="blue" style={{fontSize:"25px", fontWeight:"bold"}}>Tableau de bord des incidents et équipements</Typography>
   
           {/* Passer les données formatées à chaque graphique */}
           <Box mb={3}>
           <IncidentsParService data={incidentsServiceData} />
         </Box>
   
         <Box mb={3}>
           <EquipementsParService data={equipmentList} />
         </Box>
   
         <Box mb={3}>
           <StatutsIncidents data={allIncidents} />
         </Box>
   
         <Box mb={3}>
           <IncidentsParEquipement data={allIncidents} />
         </Box>
   
         <Box mb={3}>
           <EvolutionIncidents data={allIncidents} />
         </Box>
   
         <Box mb={3}>
           <EquipementsParStatut data={equipmentList} />
         </Box>
   
         <Grid item xs={12} md={6}>
           <Box mb={3}>
             <EquipmentsByBrandChart />
           </Box>
         </Grid>
   
         </div>
       </div>
     );
   };

export default MaintenanceEngineerPage
