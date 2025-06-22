/* eslint-disable no-unused-vars */
import NavBar from "../components/NavBar"
import {
  fetchSlaComplianceStats,
  fetchPenaltiesByHospital,
  fetchPenaltiesByCompany,
} from "../redux/slices/slaSlice";
import {  Box, Grid, Paper, Typography } from "@mui/material";

import SlaGaugeChart from "./dashboard/SlaGaugeChart";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";


const MaintenanceCompanyPage = () => {
    const hospitalId = sessionStorage.getItem("hospitalId");
      const [isNavOpen, setIsNavOpen] = useState(true);
    
  
     
    // Log des données pour vérifier leur contenu
    //console.log("Equipements:", equipmentList);
    //console.log("Incidents:", allIncidents);
    //console.log("Services:", serviceByHospital);
    //console.log("maintenanceplans:" , maintenancesPlans);
     //console.log("correctives maintenances:", corrcMaintenance);
     /*// Si tu veux afficher aussi les pénalités du prestataire de maintenance, récupère son ID :
   */
  
    // Dispatch pour récupérer les données nécessaires
    const dispatch = useDispatch();
  
    useEffect(() => {
      // Dispatch des actions pour récupérer les incidents, services et équipements
     
      dispatch(fetchSlaComplianceStats(hospitalId));
      dispatch(fetchPenaltiesByHospital(hospitalId));
      const companyId = sessionStorage.getItem("userId");
  if (companyId) {
    dispatch(fetchPenaltiesByCompany(companyId));
  }
  
    }, [dispatch, hospitalId]);
  
    const {
    slaComplianceStatus,
    penaltiesByHospital,
      penaltiesByCompany,


  } = useSelector((state) => state.sla);
  
    const interpretSlaConformity = (rate) => {
  if (rate >= 90) return "✅ Excellent niveau de conformité. Les délais SLA sont bien respectés.";
  if (rate >= 75) return "🟡 Conformité correcte mais améliorable. Surveillez les délais critiques.";
  if (rate >= 50) return "🔴 Faible conformité. Risque élevé de pénalités et d'insatisfaction.";
  return "❌ Niveau de conformité critique. Mesures urgentes à prendre.";
};

  console.log(slaComplianceStatus,penaltiesByHospital,"top")
  return (
    <Box sx={{ display: "flex", minHeight: '100vh' , mt: 8 , ml:-4 }}>
      <NavBar onToggle={isNavOpen} />
        <Grid item xs={12} md={6}>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Conformité SLA
        </Typography>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
            {slaComplianceStatus && (
              <SlaGaugeChart complianceRate={slaComplianceStatus.complianceRate} />
            )}
          </Paper>
        </Grid>
        <Typography>Total incidents : {slaComplianceStatus?.totalIncidents}</Typography>
        <Typography>Respectés : {slaComplianceStatus?.slaRespected}</Typography>
        <Typography>Violation réponse : {slaComplianceStatus?.responseViolated}</Typography>
        <Typography>Violation résolution : {slaComplianceStatus?.resolutionViolated}</Typography>
        <Typography>Taux conformité : {slaComplianceStatus?.complianceRate?.toFixed(2)}%</Typography>
        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'gray' }}>
          {interpretSlaConformity(slaComplianceStatus?.complianceRate || 0)}
        </Typography>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                💰 Total des pénalités
              </Typography>
              <Typography>Par société : {penaltiesByCompany?.toFixed(2)} DT</Typography>
            </Paper>
          </Grid>
      </Paper>
    </Grid>
  </Box>
  )
}

export default MaintenanceCompanyPage
