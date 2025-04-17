import { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { changeEquipmentInterService } from "../../redux/slices/equipmentSlice";
import { fetchServicesByHospitalId } from "../../redux/slices/hospitalServiceSlice";
import { fetchServiceById } from "../../redux/slices/hospitalServiceSlice";
import { getProfile } from "../../redux/slices/authSlice";
import { Button, Select, MenuItem, TextField, Box, Typography, Paper } from "@mui/material";

const TransferInterService = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [newServiceId, setNewServiceId] = useState("");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const equipment = location.state; // Récupérer les données de l'équipement
  const userInfo = useSelector((state) => state.auth.user);
  const services = useSelector((state) => state.hospitalService.serviceByHospital);
  const [oldService, setOldService] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Récupérer le profil de l'utilisateur une seule fois
        if (!userInfo) {
          const profileInfo = await dispatch(getProfile());
          if (!profileInfo.payload) {
            toast.error('Erreur lors de la récupération du profil.');
            return;
          }
        }

        // Récupérer l'ancien service de l'équipement
        if (equipment?.serviceId) {
          const service = await dispatch(fetchServiceById(equipment.serviceId));
          setOldService(service.payload);
        }
        
        // Récupérer la liste des services disponibles pour le transfert
        dispatch(fetchServicesByHospitalId(userInfo.hospitalId));
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération du profil:", error);
        toast.error("Une erreur s'est produite lors de la récupération du profil.");
      }
    }

    fetchData();
  }, [dispatch, equipment, userInfo]);

  const handleTransfer = async () => {
    if (!newServiceId || !description) {
      toast.warning("Veuillez remplir tous les champs.");
      return;
    }

    try {
      // Appeler le backend pour changer l'équipement de service
      const response = await dispatch(changeEquipmentInterService({
        equipmentId: equipment.id,
        newServiceId,
        description,
        user: userInfo,
        token: sessionStorage.getItem("token"),
      }));

      if (response.payload) {
        toast.success("L'équipement a été transféré avec succès.");
        navigate("/manage-equipment/equipmentsOfHospital"); // Rediriger après le transfert
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Erreur lors du transfert de l'équipement.");
    }
  };

  const handleCancel = () => {
    navigate("/manage-equipment/equipmentsOfHospital"); // Annuler et rediriger vers la page d'accueil des équipements
  };

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)", transition: "width 0.3s ease", padding: "20px", marginTop: 50 }}>
        <Paper sx={{ padding: 2, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom>Transfert d&apos;équipement entre services</Typography>

          {/* Afficher les informations de l'équipement */}
          <Box sx={{ marginBottom: 2, width: "100%" }}>
            <Typography variant="body1"><strong>Nom de l&apos;équipement :</strong> {equipment?.nom}</Typography>
            <Typography variant="body1"><strong>Code série :</strong> {equipment?.serialCode}</Typography>
            <Typography variant="body1"><strong>Service actuel :</strong> {oldService?.name || "Service non trouvé"}</Typography>
          </Box>

          {/* Sélectionner le nouveau service */}
          <Select
            value={newServiceId}
            onChange={(e) => setNewServiceId(e.target.value)}
            fullWidth
            displayEmpty
            sx={{ marginBottom: 2 }}
          >
            <MenuItem value="">
              <em>Sélectionner un nouveau service</em>
            </MenuItem>
            {services.map((service) => (
              <MenuItem key={service.id} value={service.id}>{service.name}</MenuItem>
            ))}
          </Select>

          {/* Champ de texte pour la description */}
          <TextField
            label="Description du changement"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            sx={{ marginBottom: 2 }}
          />

          {/* Boutons d'action */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" color="primary" onClick={handleTransfer} disabled={!newServiceId || !description}>
              Transférer l&apos;équipement
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Annuler
            </Button>
          </Box>
        </Paper>
      </div>
    </div>
  );
};

export default TransferInterService;
