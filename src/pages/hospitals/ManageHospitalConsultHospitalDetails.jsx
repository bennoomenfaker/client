import NavBar from "../../components/NavBar";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeServiceFromHospital, fetchHospitalById } from "../../redux/slices/hospitalSlice";
import { createService, deleteService } from "../../redux/slices/hospitalServiceSlice";
import { getUsers } from "../../redux/slices/userSlice";
import { useParams } from "react-router-dom";
import { Card, CardContent, Typography, Grid, Chip, CircularProgress, Button, TextField } from "@mui/material";
import { toast } from 'react-toastify';

const ManageHospitalConsultHospitalDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams(); // Récupérer l'ID de l'hôpital depuis l'URL

  // Sélecteurs Redux
  const hospital = useSelector((state) => state.hospital.selectedHospital);
  const isLoading = useSelector((state) => state.hospital.loading);

  // États locaux pour la création de service
  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchHospitalById(id));
      dispatch(getUsers());
    }
  }, [dispatch, id]);

  // Ajouter un service
  const handleAddService = async () => {
    if (!serviceName) {
      toast.warning("Veuillez saisir le nom du service.");
      return;
    }
    if (!serviceDescription) {
      toast.warning("Veuillez saisir la description du service.");
      return;
    }
    if (serviceName && serviceDescription) {
      const newService = {
        name: serviceName,
        description: serviceDescription,
        hospitalId: id, // Passer l'ID de l'hôpital dans les données du service
      };
      await dispatch(createService(newService));
      dispatch(fetchHospitalById(id));
      setServiceName("");
      setServiceDescription("");
      toast.success("Service créé avec succès !");
    }
  };

  // Supprimer un service
  const handleRemoveService = async (serviceId) => {
    await dispatch(removeServiceFromHospital({ hospitalId: id, serviceId }));
    await dispatch(deleteService(serviceId)); // Supprimer le service de la liste des services
    await dispatch(fetchHospitalById(id)); // Rafraîchir les détails de l'hôpital
    toast.success("Service supprimé avec succès !");
  };

  if (isLoading) {
    return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;
  }

  if (!hospital) {
    return <Typography variant="h6" align="center" sx={{ mt: 5 }}>Aucun hôpital trouvé</Typography>;
  }

  return (
    <>
      <NavBar />
      <Card sx={{ maxWidth: 800, margin: "auto", mt: -3, p: 3, boxShadow: 5 }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
            {hospital?.name}
          </Typography>
          <Grid container spacing={2}>
            {/* Détails de l'hôpital */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Adresse :</strong> {hospital.address}</Typography>
              <Typography variant="body1"><strong>Téléphone :</strong> {hospital.phoneNumber}</Typography>
              <Typography variant="body1"><strong>Email :</strong> {hospital.email}</Typography>
              <Typography variant="body1">
                <strong>Gouvernorat :</strong> {hospital.gouvernorat ? hospital.gouvernorat.nom : "Non spécifié"}
              </Typography>
            </Grid>
            {/* Statut et services */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Statut :</strong> {hospital.activated ? "✅ Actif" : "❌ Inactif"}</Typography>
              <Typography variant="body1" sx={{ mt: 2, fontWeight: "bold" }}>Services :</Typography>
              {hospital.services.map((service) => (
                <Chip
                  key={service.id}
                  label={service.name}
                  color="primary"
                  onDelete={() => handleRemoveService(service.id)}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Grid>
          </Grid>

          {/* Création d'un service */}
          <Typography variant="h6" sx={{ mt: 3 }}>Créer un nouveau service</Typography>
          <TextField
            label="Nom du service"
            fullWidth
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description du service"
            fullWidth
            value={serviceDescription}
            onChange={(e) => setServiceDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleAddService} disabled={!serviceName || !serviceDescription}>
            Ajouter service
          </Button>
        </CardContent>
      </Card>
    </>
  );
};

export default ManageHospitalConsultHospitalDetails;