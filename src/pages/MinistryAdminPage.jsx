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
} from "@mui/material";
import IncidentsParService from "./dashboard/IncidentsParService";
import EquipementsParService from "./dashboard/EquipementsParService";
import StatutsIncidents from "./dashboard/StatutsIncidents";
import EvolutionIncidents from "./dashboard/EvolutionIncidents";
import EquipementsParStatut from "./dashboard/EquipementsParStatut ";
import EquipmentsByBrandChart from "./dashboard/EquipmentsByBrandChart ";


const MinistryAdminPage = () => {
  const dispatch = useDispatch();
  const [selectedHospital, setSelectedHospital] = useState("7a34da16-6bd3-4cc6-8aa6-c1d512c2bf4e");
  const { hospitals } = useSelector((state) => state.hospital);
  const { equipmentList, nonReceivedEquipment, isLoading } = useSelector((state) => state.equipment);
  const { all: allIncidents, list: hospitalIncidents } = useSelector((state) => state.incident);

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
  

  return (
    <div style={{ display: "flex" }}>
      <NavBar />
      <div style={{ width: "90%", padding: "20px", marginTop: "60px" }}>
        <Typography variant="h5" color="primary" gutterBottom>
          Tableau de bord Ministère
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
          <>
            <Typography variant="subtitle1" gutterBottom>
              Équipements pour l&apos;hôpital sélectionné : {equipmentList.length}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Équipements non reçus : {nonReceivedEquipment.length}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Incidents signalés : {hospitalIncidents.length}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Total incidents (tous hôpitaux) : {allIncidents.length}
            </Typography>
            {selectedHospital && !isLoading && (
  <>
    <Box mb={3}>
      <IncidentsParService data={incidentsServiceData} />
    </Box>

    <Box mb={3}>
      <EquipementsParService data={equipmentList} />
    </Box>

    <Box mb={3}>
      <StatutsIncidents data={hospitalIncidents} />
    </Box>


    <Box mb={3}>
      <EvolutionIncidents data={hospitalIncidents} />
    </Box>

    <Box mb={3}>
      <EquipementsParStatut data={equipmentList} />
    </Box>

    <Box mb={3}>
      <EquipmentsByBrandChart data={equipmentList} />
    </Box>
  </>
)}

          </>
        )}
      </div>
    </div>
  );
};

export default MinistryAdminPage;
