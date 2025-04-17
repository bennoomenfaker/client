/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { reportIncident } from "../../redux/slices/incidentSlice";
import NavBar from "../../components/NavBar";
import { toast } from "react-toastify";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Select,
  MenuItem,
} from "@mui/material";
import { assignSlaToEquipment, fetchEquipmentBySerial } from "../../redux/slices/equipmentSlice";
import { createSla, fetchSlaById, resetSelectedSla, updateSla } from "../../redux/slices/slaSlice";
import { getUsersByHospitalId } from "../../redux/slices/userSlice";
const ReportIncident = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [slaData, setSlaData] = useState({
    name: "",
    maxResponseTime: 0,
    maxResolutionTime: 0,
    penaltyAmount: 0,
    userIdCompany: "",
  });
  const { equipment, loading: equipmentLoading } = useSelector((state) => state.equipment);
  const hospitalUsers = useSelector((state) => state.user.usersByHospital);
  const sla = useSelector((state) => state.sla.selectedSla);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { serialCode, id } = useParams(); // Récupère le code série depuis l'URL.
  const hospitalId = sessionStorage.getItem("hospitalId");

  useEffect(() => {
    // Vérifie si equipment est déjà chargé
    if (serialCode && !equipment) {
      dispatch(fetchEquipmentBySerial(serialCode)).then(() => {
        if (!equipment) {
          //toast.error("Équipement introuvable !");
        }
      });
    }
  }, [dispatch, serialCode, equipment]);

  useEffect(() => {
    if (sla) {
      setSlaData(sla);
    }
  }, [sla]);

  useEffect(() => {
    dispatch(resetSelectedSla());
    dispatch(getUsersByHospitalId(hospitalId));
    if (equipment?.slaId) {
      dispatch(fetchSlaById(equipment?.slaId));
    }
  }, [dispatch, hospitalId, equipment?.slaId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSlaData({ ...slaData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!description.trim()) {
      toast.warning("Veuillez saisir une description de la panne !");
      return;
    }
  
    setLoading(true);
  
    try {
      await dispatch(
        reportIncident({
          equipmentId: id,
          description,
          reportedBy: sessionStorage.getItem("userId"),
        })
      ).unwrap();
  
      toast.success("Incident signalé avec succès !");
      setDescription("");
      setTimeout(() => navigate("/manage-equipment/equipmentsOfHospital"), 1500);
    } catch (error) {
      toast.error("Erreur lors de la déclaration de l'incident !");
    } finally {
      setLoading(false);
    }
  };

  const handleSlaSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...slaData,
      equipmentId: id,
      hospitalId: hospitalId,
    };
    try {
      let response;
      if (equipment.slaId) {
        response = await dispatch(updateSla({ slaId: equipment.slaId, slaData: payload })).unwrap();
        toast.success("SLA mis à jour avec succès!");
      } else {
        response = await dispatch(createSla(payload)).unwrap();
        toast.success("SLA créé avec succès!");
      }
      const newSlaId = response.id;
      await dispatch(assignSlaToEquipment({ equipmentId: id, slaId: newSlaId })).unwrap();
    } catch (error) {
      toast.error("Erreur lors de la création/mise à jour du SLA.");
    }
  };

  const maintenanceCompanies = hospitalUsers
    ? hospitalUsers.filter(
        (user) => user.role && user.role.name === "ROLE_MAINTENANCE_COMPANY"
      )
    : [];

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Paper elevation={3} sx={{ maxWidth: 600, p: 4, mx: "auto", mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Signaler une panne
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Code série de l'équipement"
              value={serialCode}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="Description de la panne"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              margin="normal"
            />
            {/* Affichage du formulaire de gestion du SLA */}
            {equipmentLoading ? (
              <CircularProgress size={24} />
            ) : (
              equipment && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Gérer le SLA
                  </Typography>
                  <TextField
                    label="Nom du SLA"
                    name="name"
                    value={slaData.name}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Temps de réponse max (minutes)"
                    name="maxResponseTime"
                    type="number"
                    value={slaData.maxResponseTime}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Temps de résolution max (minutes)"
                    name="maxResolutionTime"
                    type="number"
                    value={slaData.maxResolutionTime}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Pénalité (€)"
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
                  <Button type="button" variant="contained" color="success" onClick={handleSlaSubmit}>
                    {equipment.slaId ? "Modifier le SLA" : "Créer le SLA"}
                  </Button>
                </>
              )
            )}

            <Button
              type="submit"
              variant="contained"
              color="error"
              fullWidth
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Signaler"}
            </Button>
          </form>
        </Paper>
      </Box>
    </div>
  );
};

export default ReportIncident;
