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
  
   const [responseHours, setResponseHours] = useState(0);
    const [responseMinutes, setResponseMinutes] = useState(0);
    const [resolutionHours, setResolutionHours] = useState(0);
    const [resolutionMinutes, setResolutionMinutes] = useState(0);
    const [responseDays, setResponseDays] = useState(0);
    const [resolutionDays, setResolutionDays] = useState(0);

    useEffect(() => {
      const fetchData = async () => {
        await dispatch(resetSelectedSla());
        dispatch(getUsersByHospitalId(hospitalId));
        if (equipment?.slaId) {
          dispatch(fetchSlaById(equipment?.slaId));
        }
      };
      fetchData();
    }, [dispatch, hospitalId, equipment?.slaId]);
  
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
      const responseTotal = sla.maxResponseTime;
      setResponseDays(Math.floor(responseTotal / (60 * 24)));
      setResponseHours(Math.floor((responseTotal % (60 * 24)) / 60));
      setResponseMinutes(responseTotal % 60);
  
      const resolutionTotal = sla.maxResolutionTime;
      setResolutionDays(Math.floor(resolutionTotal / (60 * 24)));
      setResolutionHours(Math.floor((resolutionTotal % (60 * 24)) / 60));
      setResolutionMinutes(resolutionTotal % 60);
    } else {
      setSlaData({
        name: "",
        maxResponseTime: 0,
        maxResolutionTime: 0,
        penaltyAmount: 0,
        userIdCompany: "",
      });
      setResponseDays(0); setResponseHours(0); setResponseMinutes(0);
      setResolutionDays(0); setResolutionHours(0); setResolutionMinutes(0);
    }
  }, [sla]);
  
    useEffect(() => {
      if (!sla) {
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
    }, [sla]);



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
      resetSelectedSla()
  
      toast.success("Incident signalé avec succès !");
      setDescription("");
      navigate("/manage-equipment/equipmentsOfHospital")
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
      maxResponseTime: responseDays * 24 * 60 + responseHours * 60 + responseMinutes,
      maxResolutionTime: resolutionDays * 24 * 60 + resolutionHours * 60 + resolutionMinutes,
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
      await dispatch(assignSlaToEquipment({ equipmentId: id, slaId: newSlaId })).unwrap();
      
      // Réinitialise le SLA sélectionné après traitement
      await dispatch(resetSelectedSla());
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
                  <Button type="button" variant="contained" color="success" onClick={handleSlaSubmit}>
                    {sla ? "Modifier le SLA" : "Créer le SLA"}
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
