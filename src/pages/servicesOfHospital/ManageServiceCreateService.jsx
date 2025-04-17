import { useState } from "react";
import { useDispatch } from "react-redux";
import NavBar from "../../components/NavBar";
import { useNavigate } from "react-router-dom";
import { createService , fetchServicesByHospitalId } from "../../redux/slices/hospitalServiceSlice";
import { toast } from "react-toastify";
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Box,
} from "@mui/material";

const ManageServiceCreateService = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const hospitalId = sessionStorage.getItem("hospitalId");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !description) {
      toast.warning("Veuillez remplir tous les champs.");
      return;
    }
    dispatch(createService({ name, description, hospitalId }))
      .unwrap()
      .then(() => {
        toast.success("Service créé avec succès !");
        dispatch(fetchServicesByHospitalId(hospitalId)); // Recharger les services
        navigate("/manage-service/services");
      })
      .catch((error) => {
        // Vérifier si l'erreur est un conflit (409)
        if (error.status === 409) {
          toast.warning("Ce nom de service existe déjà.");
        } else {
            toast.warning("Ce nom de service existe déjà.");
        }
      });
  };
  const handleCancel = () => {
    navigate("/manage-service/services");
  };

  return (
    <div>
      <NavBar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Créer un Service
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              
              fullWidth
              label="Nom du service"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="normal"
              
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="button"
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                sx={{ mr: 1 }}
              >
                Annuler
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Créer
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default ManageServiceCreateService;