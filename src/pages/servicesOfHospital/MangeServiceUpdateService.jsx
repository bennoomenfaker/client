import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavBar from "../../components/NavBar";
import { useNavigate, useParams } from "react-router-dom";
import { fetchServiceById, updateService, fetchServicesByHospitalId } from "../../redux/slices/hospitalServiceSlice";
import { toast } from "react-toastify";
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Box,
} from "@mui/material";

const MangeServiceUpdateService = () => {
  const { id } = useParams();
  const selectedService = useSelector((state) => state.hospitalService.selectedService);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const hospitalId = sessionStorage.getItem("hospitalId");

  useEffect(() => {
    if (id) {
      dispatch(fetchServiceById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedService) {
      setName(selectedService.name);
      setDescription(selectedService.description);
    }
  }, [selectedService]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !description) {
      toast.warning("Veuillez remplir tous les champs.");
      return;
    }
    dispatch(updateService({
        id,
        serviceData: {
          name,
          description,
          hospitalId, 
        },
      }))      .unwrap()
      .then(() => {
        toast.success("Service mis à jour avec succès !");
        dispatch(fetchServicesByHospitalId(hospitalId))
        navigate("/manage-service/services");
      })
      .catch((error) => {
        if (error.status === 409) {
          toast.warning("Ce nom de service existe déjà.");
        } else {
          toast.error(`Erreur lors de la mise à jour du service`);
          console.log(error)
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
            Modifier un Service
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nom du service"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="normal"
              required
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
                Modifier
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </div>
  );
};

export default MangeServiceUpdateService;