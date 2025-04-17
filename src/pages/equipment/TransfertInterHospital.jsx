import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { changeEquipmentInterHospital } from "../../redux/slices/equipmentSlice";
import { fetchHospitals } from "../../redux/slices/hospitalSlice";
import { Button, Select, MenuItem, TextField, Box, Typography, Paper } from "@mui/material";
import { getProfile } from "../../redux/slices/authSlice";
import NavBar from "../../components/NavBar";


const TransfertInterHospital = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const equipment = location.state; // Récupérer les données de l'équipement via location.state
  const hospitals = useSelector((state) => state.hospital.hospitals); // Récupérer la liste des hôpitaux
  const userInfo = useSelector((state) => state.auth.user); // Récupérer les informations de l'utilisateur authentifié

  const [newHospitalId, setNewHospitalId] = useState("");
  const [description, setDescription] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(true);
  

  useEffect(() => {
    async function fetchData() {
      try {
        // Vérifier si l'utilisateur est authentifié
        if (!userInfo) {
          const profileInfo = await dispatch(getProfile());
          if (!profileInfo.payload) {
            toast.error('Erreur lors de la récupération du profil.');
            return;
          }
        }

        // Récupérer la liste des hôpitaux si elle n'est pas déjà présente
        if (hospitals.length === 0) {
          dispatch(fetchHospitals());
        }
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération du profil:", error);
      }
    }

    fetchData();
  }, [dispatch, hospitals, userInfo]);

  const handleTransfer = async () => {
    if (!newHospitalId || !description) {
      toast.warning("Veuillez remplir tous les champs.");
      return;
    }

    try {
      // Effectuer le transfert d'hôpital via l'API
      const response = await dispatch(changeEquipmentInterHospital({
        equipmentId: equipment.id,
        newHospitalId,
        description,
        user: userInfo, // Utilisation de l'utilisateur authentifié
      }));

      if (response.payload) {
        toast.success("L'équipement a été transféré avec succès.");
        navigate("/manage-equipment/equipmentsOfHospital"); // Rediriger après succès
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Erreur lors du transfert de l'équipement.");
    }
  };

  const handleCancel = () => {
    navigate("/manage-equipment/equipmentsOfHospital"); // Annuler et rediriger
  };

  return (
   <div style={{ display: "flex" }}>
        <NavBar onToggle={setIsNavOpen} />
        <div style={{ width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)", transition: "width 0.3s ease", padding: "20px", marginTop: 50 }}>
        <Paper sx={{ padding: 2, display: "flex", flexDirection: "column", alignItems: "center", boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom>Transfert d&apos;équipement entre hôpitaux</Typography>

          {/* Afficher les informations de l'équipement */}
          <Box sx={{ marginBottom: 2, width: "100%" }}>
            <Typography variant="body1"><strong>Nom de l&apos;équipement :</strong> {equipment?.nom}</Typography>
            <Typography variant="body1"><strong>Code série :</strong> {equipment?.serialCode}</Typography>
          </Box>

          {/* Sélectionner le nouvel hôpital */}
          <Select
            value={newHospitalId}
            onChange={(e) => setNewHospitalId(e.target.value)}
            fullWidth
            displayEmpty
            sx={{ marginBottom: 2 }}
          >
            <MenuItem value="">
              <em>Sélectionner un nouvel hôpital</em>
            </MenuItem>
            {hospitals.map((hospital) => (
              <MenuItem key={hospital.id} value={hospital.id}>{hospital.name}</MenuItem>
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
            <Button variant="contained" color="primary" onClick={handleTransfer} disabled={!newHospitalId || !description}>
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

export default TransfertInterHospital;
