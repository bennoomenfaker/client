/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import { useDispatch } from 'react-redux';
import { updateCorrectiveMaintenance } from '../../redux/slices/correctiveMaintenanceSlice';
import {
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  MenuItem,
} from '@mui/material';

const UpdateMaintenanceCorrective = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const maintenance = location.state?.maintenance;
  const equipmentId = location.state?.equipmentId;
  const incidentId = location.state?.incidentId;
  const resolutionDetails = location.state?.resolutionDetails;


  const userId = sessionStorage.getItem("userId")
  const [formData, setFormData] = useState({
    id: '',
    equipmentId: '',
    incidentId: '',
    assignedTo: '',
    description: '',
    plannedDate: '',
    completedDate: '',
    status: '',
    resolutionDetails: '', // Ajouté
  });
  console.log(maintenance)
  const getDefaultDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const localDate = new Date(now.getTime() - offset * 60 * 1000); // corriger le fuseau
    return localDate.toISOString().slice(0, 16); // format YYYY-MM-DDTHH:mm
};
const formatDateForInput = (dateStr) => {
    if (!dateStr) return ""; // Si aucune date n'est fournie, renvoie une chaîne vide
  
    // Convertir la date au format attendu pour le champ datetime-local (YYYY-MM-DDTHH:mm)
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return ""; // Si la date n'est pas valide, renvoie une chaîne vide
  
    return date.toISOString().slice(0, 16); // Format : YYYY-MM-DDTHH:mm
  };
  
const transformToISOString = (datetimeStr) => {
    if (!datetimeStr) return null;  // Si la date est vide ou nulle, on retourne null
    const date = new Date(datetimeStr);
    return isNaN(date.getTime()) ? null : date.toISOString(); // On vérifie si la date est valide avant de la convertir
  };
  useEffect(() => {
    if (maintenance) {
      const updatedForm = {
        id: maintenance.id,
        equipmentId: equipmentId || '',
        incidentId: incidentId,
        assignedTo: userId || '',
        description: maintenance.description,
        plannedDate: maintenance.plannedDate ,
        completedDate: maintenance.completedDate ? formatDateForInput(maintenance.completedDate) : '',
        status: maintenance.status,
        resolutionDetails:resolutionDetails || '',
      };
      setFormData(updatedForm);
    }
  }, [equipmentId, incidentId, maintenance, resolutionDetails, userId]);
  
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const transformedData = {
      ...formData,
      plannedDate: transformToISOString(formData.plannedDate),
      resolutionDetails: formData.resolutionDetails,
    };
  
    if (formData.status === 'Terminé') {
      transformedData.completedDate = transformToISOString(formData.completedDate);
    }
  
    dispatch(updateCorrectiveMaintenance({ id: formData.id, maintenanceData: transformedData }));
    navigate('/manageCorrectiveMaintenance');
  };
  
  

  return (
    <div style={{ display: 'flex' }}>
      <NavBar onToggle={setIsNavOpen} />
      <Container style={{ marginTop: 30 }}>
        <Paper style={{ padding: 20 }}>
          <Typography variant="h5" gutterBottom>
            Modifier une Maintenance Corrective
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
            />

            <TextField
              select
              fullWidth
              margin="normal"
              name="status"
              label="Statut"
              value={formData.status}
              onChange={handleChange}
            >
              <MenuItem value="Planifié">Planifié</MenuItem>
              <MenuItem value="En cours">En cours</MenuItem>
              <MenuItem value="Terminé">Terminé</MenuItem>
            </TextField>

            {formData.status === 'Terminé' && (
              <TextField
                fullWidth
                multiline
                rows={4}
                margin="normal"
                name="resolutionDetails"
                label="Détails de la résolution"
                value={formData.resolutionDetails}
                onChange={handleChange}
              />
            )}

{formData.status === 'Terminé' && (
  <TextField
    fullWidth
    margin="normal"
    name="completedDate"
    label="Date de complétion"
    type="datetime-local"
    value={formData.completedDate ? formData.completedDate.slice(0, 16) : getDefaultDateTime()}
    onChange={handleChange}
    InputLabelProps={{ shrink: true }}
  />
)}


            <Button type="submit" variant="contained" color="primary">
              Mettre à jour
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default UpdateMaintenanceCorrective;
