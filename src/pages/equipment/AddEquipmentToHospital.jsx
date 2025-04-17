import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { fetchEquipmentBySerial } from "../../redux/slices/equipmentSlice"; // Assurez-vous que cette fonction existe dans ton redux
import { toast } from "react-toastify";
import { useDispatch } from "react-redux"; // Pour pouvoir utiliser dispatch
import { Box, Paper, TextField, Button } from "@mui/material"; // Importation des composants MUI

const AddEquipmentToHospital = () => {
  const [serialCode, setSerialCode] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Pour pouvoir utiliser dispatch

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    // Vérification si le champ serialCode est vide
    if (!serialCode) {
      toast.warning("Veuillez saisir un code série pour l'équipement.");
      return;
    }

    try {
      // Dispatch de l'action pour récupérer l'équipement par son serialCode
      const result = await dispatch(fetchEquipmentBySerial(serialCode));

      // Si l'équipement est trouvé, redirige vers la page de mise à jour
      if (result.payload === "Erreur lors de la récupération de l'équipement") {
        toast.error("Équipement non trouvé.");
      } else {
        console.log(result.payload)
        navigate(`/manage-equipment/update-equipment/${serialCode}`);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Une erreur est survenue lors de la récupération de l'équipement.");
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <Box
        sx={{
          width: isNavOpen ? "calc(100% - 60px)" : "calc(100% - 0px)",
          transition: "width 0.3s ease",
          padding: "20px",
          marginTop: "50px",
          display: "grid",
          gridTemplateColumns: "1fr", // Utilisation de CSS Grid
          gap: "20px",
        }}
      >
        <h2>Ajouter un nouvel équipement</h2>
        <Paper
          sx={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <form onSubmit={handleSubmit}>
          <TextField
    label="Code Série"
    variant="outlined"
    value={serialCode}
    onChange={(e) => setSerialCode(e.target.value)}
    placeholder="Entrez le code série"
    fullWidth
    sx={{
      marginBottom: "15px",
      borderRadius: "8px", // Bordures arrondies
      "& .MuiOutlinedInput-root": {
        borderRadius: "8px", // Bordures du champ de saisie
      },
      "& .MuiInputLabel-root": {
        fontSize: "16px", // Taille de police du label
      },
      "& .MuiInputBase-root": {
        fontSize: "14px", // Taille de la police de saisie
      },
    }}
  />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ marginTop: "15px" }}
            >
              Valider
            </Button>
          </form>
        </Paper>
      </Box>
    </div>
  );
};

export default AddEquipmentToHospital;
