import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signUp } from "../../redux/slices/authSlice";
import { addUserToHospital, fetchHospitals } from "../../redux/slices/hospitalSlice";
import { fetchServicesByHospitalId } from "../../redux/slices/hospitalServiceSlice";
import NavBar from "../../components/NavBar";
import { toast } from "react-toastify";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Typography,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUsers, getUsersGetHospitalsAdmin } from "../../redux/slices/userSlice";

const ManageUserCreateUser = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    telephone: "",
    hospitalId: "",
    serviceId: "",
    role: "",
  });

  const dispatch = useDispatch();
  const hospitals = useSelector((state) => state.hospital.hospitals);
  const services = useSelector((state) => state.hospitalService.serviceByHospital);
  const navigate = useNavigate();

  const roleFromSession = sessionStorage.getItem("role");
  const hospitalIdFromSession = sessionStorage.getItem("hospitalId");

  useEffect(() => {
    if (roleFromSession !== "ROLE_HOSPITAL_ADMIN") {
      dispatch(fetchHospitals());
    } else {
      setFormData((prev) => ({ ...prev, hospitalId: hospitalIdFromSession }));
      dispatch(fetchServicesByHospitalId(hospitalIdFromSession));
    }
  }, [dispatch, roleFromSession, hospitalIdFromSession]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "hospitalId") {
      dispatch(fetchServicesByHospitalId(value));
      setFormData((prev) => ({ ...prev, serviceId: "" })); // Réinitialiser service
    }

    // Si le rôle est "ROLE_HOSPITAL_ADMIN", vider le champ "serviceId"
    if (name === "role" && value === "ROLE_HOSPITAL_ADMIN") {
      setFormData((prev) => ({ ...prev, serviceId: "" }));
    }
  };
  
  const role = sessionStorage.getItem("role");

  const handleCancel = () => {
    role === "ROLE_HOSPITAL_ADMIN" ?
    navigate("/manage-users/consult-users-by-hospital-admins"): navigate("/manage-users/consult-users-by-ms")
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await dispatch(signUp(formData)).unwrap();
      toast.success("Utilisateur créé avec succès!");
       handleCancel();
      if (formData.hospitalId && formData.role !== "ROLE_HOSPITAL_ADMIN") {
        await dispatch(
          addUserToHospital({
            hospitalId: formData.hospitalId,
            serviceId: formData.serviceId,
            userId: response.data,
          })
        ).unwrap();
        toast.success("Utilisateur ajouté à l'hôpital avec succès!");
        dispatch(getUsers());
        dispatch(getUsersGetHospitalsAdmin());
      }
    } catch (error) {
      toast.error(error || "Une erreur est survenue!");
      console.error("Error:", error);
    }
  };
  

  return (
    <>
      <NavBar />
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          Créer un utilisateur
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Partie gauche */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Prénom"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                inputProps={{ minLength: 2, maxLength: 50 }}
              />
              <TextField
                fullWidth
                label="Nom"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                inputProps={{ minLength: 2, maxLength: 50 }}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Mot de passe"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                inputProps={{ minLength: 8 }}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Téléphone"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
                inputProps={{ minLength: 8, maxLength: 15 }}
                sx={{ mt: 2 }}
              />
            </Grid>

            {/* Partie droite */}
            <Grid item xs={12} md={6}>
              {/* Sélection du rôle */}
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  {roleFromSession === "ROLE_MINISTRY_ADMIN" && [
                    <MenuItem key="ROLE_HOSPITAL_ADMIN" value="ROLE_HOSPITAL_ADMIN">Hospital Admin</MenuItem>,
                    <MenuItem key="ROLE_SERVICE_SUPERVISOR" value="ROLE_SERVICE_SUPERVISOR">Service Supervisor</MenuItem>,
                    <MenuItem key="ROLE_MAINTENANCE_ENGINEER" value="ROLE_MAINTENANCE_ENGINEER">Maintenance Engineer</MenuItem>,
                    <MenuItem key="ROLE_MAINTENANCE_COMPANY" value="ROLE_MAINTENANCE_COMPANY">Maintenance Company</MenuItem>
                  ]}
                  {roleFromSession === "ROLE_HOSPITAL_ADMIN" && [
                    <MenuItem key="ROLE_SERVICE_SUPERVISOR" value="ROLE_SERVICE_SUPERVISOR">Service Supervisor</MenuItem>,
                    <MenuItem key="ROLE_MAINTENANCE_ENGINEER" value="ROLE_MAINTENANCE_ENGINEER">Maintenance Engineer</MenuItem>,
                    <MenuItem key="ROLE_MAINTENANCE_COMPANY" value="ROLE_MAINTENANCE_COMPANY">Maintenance Company</MenuItem>
                  ]}
                </Select>
              </FormControl>

              {/* Sélection de l'hôpital */}
              {roleFromSession !== "ROLE_HOSPITAL_ADMIN" && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Hôpital</InputLabel>
                  <Select name="hospitalId" value={formData.hospitalId} onChange={handleChange}>
                    {hospitals.map((hospital) => (
                      <MenuItem key={hospital.id} value={hospital.id}>
                        {hospital.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Sélection du service (uniquement si le rôle ≠ "ROLE_HOSPITAL_ADMIN") */}
              {formData.role !== "ROLE_HOSPITAL_ADMIN" && (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Service</InputLabel>
                  <Select
                    name="serviceId"
                    value={formData.serviceId}
                    onChange={handleChange}
                    disabled={!services.length}
                  >
                    {services.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Bouton de soumission */}
              <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
                <Button type="submit" variant="contained" color="success" fullWidth sx={{ mt: 4 }}>
                  Créer l&apos;utilisateur
                </Button>
                <Button onClick={handleCancel} variant="contained" color="warning" fullWidth sx={{ mt: 4 }}>
                  Annuler
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </Container>
    </>
  );
};

export default ManageUserCreateUser;