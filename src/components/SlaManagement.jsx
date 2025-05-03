import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import PropTypes from 'prop-types';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { assignSlaToEquipment } from "../redux/slices/equipmentSlice";
import { createSla, fetchSlaById, resetSelectedSla, updateSla } from "../redux/slices/slaSlice";
import { getUsersByHospitalId } from "../redux/slices/userSlice";

const SlaManagement = ({ equipment, setStep }) => {
  const dispatch = useDispatch();
  const [slaData, setSlaData] = useState({
    name: "",
    maxResponseTime: 0,
    maxResolutionTime: 0,
    penaltyAmount: 0,
    userIdCompany: "",
  });
  // eslint-disable-next-line no-unused-vars
  const [showForm, setShowForm] = useState(false);
  const hospitalUsers = useSelector((state) => state.user.usersByHospital);
  const sla = useSelector((state) => state.sla.selectedSla);
  const [responseHours, setResponseHours] = useState(0);
  const [responseMinutes, setResponseMinutes] = useState(0);
  const [resolutionHours, setResolutionHours] = useState(0);
  const [resolutionMinutes, setResolutionMinutes] = useState(0);
  const [responseDays, setResponseDays] = useState(0);
  const [resolutionDays, setResolutionDays] = useState(0);


  const hospitalId = sessionStorage.getItem("hospitalId");
  useEffect(() => {
    dispatch(resetSelectedSla()); // Clear selectedSla on component mount
    dispatch(getUsersByHospitalId(hospitalId));
    if (equipment.slaId) {
      dispatch(fetchSlaById(equipment.slaId)); // Fetch SLA if it exists
    }
  }, [dispatch, hospitalId, equipment.slaId]);

  useEffect(() => {
    if (!equipment.slaId) {
      // If there is no SLA for the equipment, reset the form fields
      setSlaData({
        name: "",
        maxResponseTime: 0,
        maxResolutionTime: 0,
        penaltyAmount: 0,
        userIdCompany: "",
      });
      setResponseDays(0);
      setResponseHours(0);
      setResponseMinutes(0);
      setResolutionDays(0);
      setResolutionHours(0);
      setResolutionMinutes(0);
    }
  }, [equipment.slaId]);
  useEffect(() => {
    if (sla) {
      setSlaData(sla);
    }
  }, [sla]);
  useEffect(() => {
    if (sla) {
      setSlaData(sla);
      
      const responseD = Math.floor(sla.maxResponseTime / (60 * 24));
      const responseH = Math.floor((sla.maxResponseTime % (60 * 24)) / 60);
      const responseM = sla.maxResponseTime % 60;
      setResponseDays(responseD);
      setResponseHours(responseH);
      setResponseMinutes(responseM);
  
      const resolutionD = Math.floor(sla.maxResolutionTime / (60 * 24));
      const resolutionH = Math.floor((sla.maxResolutionTime % (60 * 24)) / 60);
      const resolutionM = sla.maxResolutionTime % 60;
      setResolutionDays(resolutionD);
      setResolutionHours(resolutionH);
      setResolutionMinutes(resolutionM);
    } else {
      // Reset the form state when sla is null
      setSlaData({
        name: "",
        maxResponseTime: 0,
        maxResolutionTime: 0,
        penaltyAmount: 0,
        userIdCompany: "",
      });
      setResponseDays(0);
      setResponseHours(0);
      setResponseMinutes(0);
      setResolutionDays(0);
      setResolutionHours(0);
      setResolutionMinutes(0);
    }
  }, [sla]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSlaData({ ...slaData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...slaData,
      maxResponseTime: responseDays * 24 * 60 + responseHours * 60 + responseMinutes,
      maxResolutionTime: resolutionDays * 24 * 60 + resolutionHours * 60 + resolutionMinutes,
      penaltyAmount: parseFloat(slaData.penaltyAmount),
      equipmentId: equipment.id,
      hospitalId: hospitalId,
    };

    try {
      let response;
      if (sla) {
        response = await dispatch(updateSla({ slaId: equipment.slaId, slaData: payload })).unwrap();
        toast.success("SLA mis à jour avec succès!");
      } else {
        response = await dispatch(createSla(payload)).unwrap();
        toast.success("SLA créé avec succès!");
      }
      const newSlaId = response.id;

      await dispatch(assignSlaToEquipment({ equipmentId: equipment.id, slaId: newSlaId })).unwrap();

      // Réinitialise le SLA sélectionné après traitement
      await dispatch(resetSelectedSla());
      // Passage à l'étape suivante (pièces de rechange)
      setStep(3); // Assurez-vous que l'étape 3 correspond aux pièces de rechange
      setShowForm(true);
    } catch (error) {
      //toast.error("Erreur lors de la création/mise à jour du SLA.");
      console.error("Erreur lors de la création/mise à jour du SLA:", error);
    }
  };

  const maintenanceCompanies = hospitalUsers
    ? hospitalUsers.filter(
      (user) => user.role && user.role.name === "ROLE_MAINTENANCE_COMPANY"
    )
    : [];

  return (
    <Box>
      <Typography variant="h6">Gérer le SLA</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nom"
          name="name"
          value={slaData.name}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Typography variant="subtitle1">Temps de réponse max</Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="Jours"
            type="number"
            value={responseDays}
            onChange={(e) => setResponseDays(Number(e.target.value))}
          />

          <TextField
            label="Heures"
            type="number"
            value={responseHours}
            onChange={(e) => setResponseHours(Number(e.target.value))}
          />
          <TextField
            label="Minutes"
            type="number"
            value={responseMinutes}
            onChange={(e) => setResponseMinutes(Number(e.target.value))}
          />
        </Box>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Temps de résolution max</Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="Jours"
            type="number"
            value={resolutionDays}
            onChange={(e) => setResolutionDays(Number(e.target.value))}
          />

          <TextField
            label="Heures"
            type="number"
            value={resolutionHours}
            onChange={(e) => setResolutionHours(Number(e.target.value))}
          />
          <TextField
            label="Minutes"
            type="number"
            value={resolutionMinutes}
            onChange={(e) => setResolutionMinutes(Number(e.target.value))}
          />
        </Box>

        <TextField
          label="Pénalité (dt/h)"
          name="penaltyAmount"
          type="number"
          value={slaData.penaltyAmount}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Select
          label="Société de maintenance"
          name="userIdCompany"
          value={slaData.userIdCompany}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        >
          {maintenanceCompanies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.firstName} {company.lastName}
            </MenuItem>
          ))}
        </Select>
        <Button type="submit" variant="contained" color="success">
          {sla ? "Modifier le SLA" : "Créer le SLA"}
        </Button>

      </form>
    </Box>
  );
};

SlaManagement.propTypes = {
  setStep: PropTypes.func.isRequired,
  equipment: PropTypes.shape({
    slaId: PropTypes.string,
    id: PropTypes.string.isRequired,

  }).isRequired,
};

export default SlaManagement;