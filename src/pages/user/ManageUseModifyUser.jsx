import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getUserById, updateUser } from "../../redux/slices/userSlice";
import { fetchHospitals } from "../../redux/slices/hospitalSlice";
import { fetchServicesByHospitalId } from "../../redux/slices/hospitalServiceSlice";
import { addUserToHospital, removeUserFromHospital } from "../../redux/slices/hospitalSlice"; // Assurez-vous que cette action est bien définie
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

const ManageUserModifyUser = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userSelected);
  const hospitals = useSelector((state) => state.hospital.hospitals);
  const services = useSelector((state) => state.hospitalService.serviceByHospital);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    telephone: "",
    hospitalId: "",
    serviceId: "",
    role: "",
  });

  useEffect(() => {
    dispatch(fetchHospitals());
    dispatch(getUserById(id));
  }, [dispatch, id]);
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",   // Assurez-vous que la valeur n'est pas indéfinie
        lastName: user.lastName || "",
        email: user.email || "",
        telephone: user.telephone || "",
        hospitalId: user.hospitalId || "",
        serviceId: user.serviceId || "",
        role: user.role || "",
      });

      
      if (user.hospitalId) {
        dispatch(fetchServicesByHospitalId(user.hospitalId));
      }
    }
}, [user, dispatch]);

const role = sessionStorage.getItem("role")

const handleChange = (e) => {
    const { name, value } = e.target;

    // Mettez à jour formData pour la gestion du formulaire
    setFormData({
      ...formData,
      [name]: value,
    });

  
    if (name === "hospitalId") {
      dispatch(fetchServicesByHospitalId(value));
      setFormData((prev) => ({ ...prev, serviceId: "" }));
    }

    if (name === "role" && value === "ROLE_HOSPITAL_ADMIN") {
      setFormData((prev) => ({ ...prev, serviceId: "" }));
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Mettre à jour les données de l'utilisateur
     await dispatch(updateUser({ id, userData: formData })).unwrap();

      //  Vérifiez si l'utilisateur change d'hôpital ou de service
      if (formData.hospitalId !== user.hospitalId || formData.serviceId !== user.serviceId) {
        // Si l'utilisateur change d'hôpital ou de service, d'abord on le retire de son service actuel
        if (user.hospitalId && user.serviceId) {
          await dispatch(removeUserFromHospital({
            hospitalId: user.hospitalId,
            serviceId: user.serviceId,
            userId: id,
          })).unwrap();
       
        }

        // Puis, on ajoute l'utilisateur au nouveau service
         await dispatch(
          addUserToHospital({
            hospitalId: formData.hospitalId,
            serviceId: formData.serviceId,
            userId: id,
          })
        ).unwrap();
        

        toast.success("Utilisateur mis à jour avec succès et affecté au nouveau service !");
        role === "ROLE_HOSPITAL_ADMIN"?
        navigate("/manage-users/consult-users-by-hospital-admins"):
        navigate("/manage-users/consult-users-by-ms");
      } else {
        toast.success("Utilisateur mis à jour avec succès !");
        role === "ROLE_HOSPITAL_ADMIN"?
        navigate("/manage-users/consult-users-by-hospital-admins"):
        navigate("/manage-users/consult-users-by-ms");
      }

    } catch (error) {
     // toast.error(error || "Une erreur est survenue!");
      console.error("Error:", error);
    }
  };

  const handleCancel = () => {
    role === "ROLE_HOSPITAL_ADMIN"?
    navigate("/manage-users/consult-users-by-hospital-admins"):
    navigate("/manage-users/consult-users-by-ms");
  };

  const location = useLocation();
  const isAdmin = location.state?.isAdmin || false;


  return (
    <>
      <NavBar />
      <Container maxWidth="md">
        <Typography variant="h4" gutterBottom>
          Modifier un utilisateur
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Prénom" name="firstName" value={formData.firstName} onChange={handleChange} required />
              <TextField fullWidth label="Nom" name="lastName" value={formData.lastName} onChange={handleChange} required sx={{ mt: 2 }} />
              <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} required sx={{ mt: 2 }} />
              <TextField fullWidth label="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} required sx={{ mt: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Rôle</InputLabel>
                <Select name="role" value={formData.role && formData.role.name} onChange={handleChange}>
                  <MenuItem value="ROLE_HOSPITAL_ADMIN">Hospital Admin</MenuItem>
                  <MenuItem value="ROLE_SERVICE_SUPERVISOR">Service Supervisor</MenuItem>
                  <MenuItem value="ROLE_MAINTENANCE_ENGINEER">Maintenance Engineer</MenuItem>
                  <MenuItem value="ROLE_MAINTENANCE_COMPANY">Maintenance Company</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Hôpital</InputLabel>
                <Select name="hospitalId" value={formData.hospitalId} onChange={handleChange}>
                  {hospitals.map((hospital) => (
                    <MenuItem key={hospital.id} value={hospital.id}>{hospital.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {!isAdmin && (
  <FormControl fullWidth sx={{ mt: 2 }}>
    <InputLabel>Service</InputLabel>
    <Select name="serviceId" value={formData.serviceId} onChange={handleChange} disabled={!services.length}>
      {services.map((service) => (
        <MenuItem key={service.id} value={service.id}>{service.name}</MenuItem>
      ))}
    </Select>
  </FormControl>
)}


              <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 4 }}>Modifier</Button>
                <Button onClick={handleCancel} variant="contained" color="warning" fullWidth sx={{ mt: 4 }}>Annuler</Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </Container>
    </>
  );
};

export default ManageUserModifyUser;