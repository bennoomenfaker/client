import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateHospital, fetchHospitalById } from "../../redux/slices/hospitalSlice";
import { fetchGouvernorats } from "../../redux/slices/gouvernoratSlice";
import { getUsersGetHospitalsAdmin, updateUserHospitalAndService } from "../../redux/slices/userSlice";
import { Button, TextField, MenuItem, Select, FormControl, InputLabel, Typography } from "@mui/material";
import NavBar from "../../components/NavBar";
import { toast } from 'react-toastify';
import LocalHospitalSharpIcon from '@mui/icons-material/LocalHospitalSharp';

const ManageHospitalUpdateHospital = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gouvernorats = useSelector((state) => state.gouvernorat.gouvernorats);
  const adminUsers = useSelector((state) => state.user.hospitalsAdmins);
  const hospitalDetails = useSelector((state) => state.hospital.selectedHospital);
  const [hospital, setHospital] = useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    siteUrl: "",
    services: [],
    adminId: "",
    gouvernorat: "",
  });


  useEffect(() => {
    dispatch(fetchGouvernorats());
    dispatch(getUsersGetHospitalsAdmin());
    dispatch(fetchHospitalById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (hospitalDetails) {
      setHospital({
        name: hospitalDetails.name,
        address: hospitalDetails.address,
        phoneNumber: hospitalDetails.phoneNumber,
        email: hospitalDetails.email,
        siteUrl: hospitalDetails.siteUrl,
        services: hospitalDetails.services || [],
        adminId: hospitalDetails.adminId || "",
        gouvernorat: hospitalDetails.gouvernorat?.id || "",
      });
    }
  }, [hospitalDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHospital({ ...hospital, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!hospital.name || !hospital.address || !hospital.gouvernorat || !hospital.phoneNumber || !hospital.adminId) {
      toast.warning("Veuillez remplir tous les champs !");
      return;
    }
  
    const selectedGouvernorat = gouvernorats.find(gov => gov.id === hospital.gouvernorat);
    if (!selectedGouvernorat) {
      toast.error("Erreur: Gouvernorat non trouvé.");
      return;
    }
  
    const hospitalData = { ...hospital, gouvernorat: selectedGouvernorat };
  
    try {
      // Mise à jour de l'appel à dispatch pour envoyer un seul objet avec 'id' et 'hospitalData'
      const response = await dispatch(updateHospital({ id, hospitalData }));
  
      if (response.payload) {
        await dispatch(updateUserHospitalAndService({
          id: hospital.adminId,
          hospitalId: id,
          serviceId: null
        }));
  
        toast.success("Hôpital mis à jour avec succès !");
        navigate("/manage-hospitals/consult-list-hospitals");
      } else {
        toast.error("Erreur lors de la mise à jour de l'hôpital.");
      }
    } catch (error) {
      console.error("Erreur API :", error);
      toast.error("Une erreur s'est produite.");
    }
  };
  

  const handleCancel = () => {
    navigate("/manage-hospitals/consult-list-hospitals");
  };

  const availableAdmins = adminUsers.filter((admin) => !admin.hospitalId || admin.hospitalId === id);

  return (
    <div className="container">
      <div className="sideBar">
        <NavBar />
      </div>
      <div className="main" style={{ maxWidth: "800px", margin: "auto", padding: "15px" }}>
        <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocalHospitalSharpIcon color="success" />
          Modifier un Hôpital
        </Typography>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextField label="Nom de l'hôpital" name="name" value={hospital.name} onChange={handleChange} />
            <TextField label="Adresse" name="address" value={hospital.address} onChange={handleChange} />
            <TextField label="Numéro de téléphone" name="phoneNumber" type="tel" value={hospital.phoneNumber} onChange={handleChange} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <TextField label="Email" name="email" type="email" value={hospital.email} onChange={handleChange} />
            <TextField label="Site Web" name="siteUrl" type="url" value={hospital.siteUrl} onChange={handleChange} />
            <FormControl>
              <InputLabel>Gouvernorat</InputLabel>
              <Select name="gouvernorat" value={hospital.gouvernorat} onChange={handleChange}>
                {gouvernorats.map((gov) => (
                  <MenuItem key={gov.id} value={gov.id}>{gov.nom}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel>Administrateur</InputLabel>
              <Select
                name="adminId"
                value={hospital.adminId}
                onChange={handleChange}
              >
                {availableAdmins.map((admin) => (
                  <MenuItem key={admin.id} value={admin.id}>
                    {admin.firstName} {admin.lastName} ({admin.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "space-between", gap: "8px" }}>
            <Button type="submit" variant="contained" color="success">
              Mettre à jour
            </Button>
            <Button onClick={handleCancel} variant="contained" color="warning">
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageHospitalUpdateHospital;
