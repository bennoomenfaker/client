/* eslint-disable no-unused-vars */
import { useState } from 'react';
import NavBar from '../../components/NavBar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { validateIncident } from '../../redux/slices/incidentSlice';

import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Paper
} from '@mui/material';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const getDefaultDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const ValidateIncident = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [incident, setIncident] = useState(location.state);
  const [severity, setSeverity] = useState(incident.incident.severity || '');
  const [description, setDescription] = useState(incident.incident.description || '');

  const engineerId = sessionStorage.getItem("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.warning("Veuillez saisir une description.");
      return;
    }

    const updatedData = {
      ...incident.incident,
      description,
      severity,
      validatedBy: engineerId,
      validatedAt: getDefaultDateTime()
    };

    try {
      await dispatch(
        validateIncident({
          incidentId: incident.incident.id,
          engineerId,
          severity,
          updatedData
        })
      ).unwrap();

      toast.success("L'incident a été validé avec succès !");
      navigate('/manage-incident/consultListOfIncident');
    } catch (error) {
      console.error("Erreur lors de la validation de l'incident :", error);
      toast.error("Erreur lors de la validation.");
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <NavBar onToggle={isNavOpen} />
      <Box component={Paper} p={4} m={7} flex={1}>
        <Typography variant="h5" gutterBottom>
          Validation de l&apos;incident
        </Typography>

        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>Équipement :</strong> {incident.equipment.serialCode}
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          <strong>Service :</strong> {incident.hospitalServiceEntity.name}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            
          />

          <TextField
            fullWidth
            label="Sévérité"
            select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            margin="normal"
            required
          >
            <MenuItem value="MINEUR">Mineur</MenuItem>
            <MenuItem value="MODERE">Modéré</MenuItem>
            <MenuItem value="MAJEUR">Majeur</MenuItem>
          </TextField>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Valider l&apos;incident
          </Button>
        </form>
      </Box>
    </div>
  );
};

export default ValidateIncident;
