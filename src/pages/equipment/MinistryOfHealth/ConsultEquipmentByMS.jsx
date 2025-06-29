/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// Imports existants
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEquipmentBySerial } from "../../../redux/slices/equipmentSlice";
import { fetchHospitalById } from '../../../redux/slices/hospitalSlice';
import NavBar from "../../../components/NavBar";

// Imports MUI et icônes
import { CircularProgress, Typography, Divider, Card, CardContent, Grid, Box, Chip, CardHeader, Paper } from "@mui/material";
import ReportIcon from "@mui/icons-material/Report";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
// --- NOUVELLES ICÔNES POUR LE DESIGN ---
import ApartmentIcon from '@mui/icons-material/Apartment'; // Pour l'hôpital
import BusinessIcon from '@mui/icons-material/Business'; // Pour le fournisseur
import FingerprintIcon from '@mui/icons-material/Fingerprint'; // Pour l'ID
import EventNoteIcon from '@mui/icons-material/EventNote'; // Pour la maintenance
import SecurityIcon from '@mui/icons-material/Security'; // Pour la garantie et risque
import BuildIcon from '@mui/icons-material/Build'; // Pour la marque

// --- Composant réutilisable pour afficher "Label: Valeur" ---
const DetailItem = ({ label, value, icon, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Box sx={{ minWidth: '200px', display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
      {icon}
      <Typography variant="body1" component="span" sx={{ ml: icon ? 1.5 : 0 }}>
        {label}
      </Typography>
    </Box>
    <Box sx={{ flexGrow: 1 }}>
      {children || <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>{value || 'N/A'}</Typography>}
    </Box>
  </Box>
);

// --- Début du composant principal ---
const ConsultEquipmentByMS = () => {
  const { serialCode } = useParams();
  const dispatch = useDispatch();
  const [isNavOpen, setIsNavOpen] = useState(true);

  const { equipment, loading, error } = useSelector((state) => state.equipment);
  const hospital = useSelector((state) => state.hospital.selectedHospital);

  useEffect(() => {
    if (serialCode) {
      dispatch(fetchEquipmentBySerial(serialCode));
    }
  }, [serialCode, dispatch]);

  useEffect(() => {
    if (equipment && equipment.hospitalId) {
      dispatch(fetchHospitalById(equipment.hospitalId));
    }
  }, [equipment, dispatch]);

  // --- Fonctions utilitaires (inchangées) ---
  const changeFormatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const renderStatusChipEquip = (status) => {
    if (!status) return <Chip label="Indéfini" size="small" />;
    const normalizedStatus = status.toLowerCase();
    const statusConfig = {
      "en panne": { label: "En Panne", icon: <ReportIcon />, sx: { borderColor: 'error.main', color: 'error.main', backgroundColor: 'rgba(211, 47, 47, 0.1)' } },
      "en maintenance": { label: "En Maintenance", icon: <ErrorIcon />, sx: { borderColor: 'warning.main', color: 'warning.main', backgroundColor: 'rgba(237, 108, 2, 0.1)' } },
      "en service": { label: "En Service", icon: <CheckCircleIcon />, sx: { borderColor: 'success.main', color: 'success.main', backgroundColor: 'rgba(46, 125, 50, 0.1)' } },
      "hors service": { label: "Hors Service", icon: <DoNotDisturbOnIcon />, sx: { borderColor: '#757575', color: '#757575', backgroundColor: '#f0f0f0' } },
      "en attente de réception": { label: "En Attente", icon: <HourglassTopIcon />, sx: { borderColor: '#1976d2', color: '#1976d2', backgroundColor: '#e8f4fd' } },
      default: { label: status, icon: <HelpOutlineIcon />, sx: { borderColor: 'grey', color: 'grey', backgroundColor: '#fafafa' } }
    };
    const config = statusConfig[normalizedStatus] || statusConfig.default;
    return <Chip variant="outlined" size="small" icon={config.icon} label={config.label} sx={config.sx} />;
  };

  // --- Gestion de l'affichage (Loading / Error) ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <NavBar />
        <Typography color="error" sx={{ p: 3 }}>Erreur: {error}</Typography>
      </Box>
    );
  }

  if (!equipment) {
    return (
        <Box>
          <NavBar />
          <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 5 }} />
        </Box>
      );
  }

  // --- Rendu principal ---
  return (
    <Box sx={{ display: "flex", bgcolor: 'grey.100', minHeight: '100vh' }}>
      <NavBar onToggle={setIsNavOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` }, // Ajustez 240px à la largeur de votre NavBar
          transition: "width 0.3s ease",
          mt: '64px', // Hauteur de l'AppBar
        }}
      >
        {/* --- TITRE DE LA PAGE --- */}
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {equipment.nom}
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ color: 'text.secondary', mb: 3 }}>
          Détails de l&apos;équipement #{equipment.serialCode}
        </Typography>
        
        <Grid container spacing={3}>
          {/* --- COLONNE DE GAUCHE --- */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 2 }} elevation={2}>
              <CardHeader title="Informations Générales" sx={{ bgcolor: 'grey.200' }} />
              <CardContent>
                <DetailItem label="Statut" icon={<BuildIcon />}>{renderStatusChipEquip(equipment.status)}</DetailItem>
                <DetailItem label="Numéro de Série" value={equipment.serialCode} icon={<FingerprintIcon />} />
                <DetailItem label="Marque" value={equipment.brand?.name} icon={<BuildIcon />} />
                <DetailItem label="Classe de Risque" value={equipment.riskClass} icon={<SecurityIcon />} />
                <DetailItem label="Durée de vie" value={`${equipment.lifespan} ans`} icon={<EventNoteIcon />} />
                {equipment.emdnCode && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <DetailItem label="Code EMDN" value={equipment.emdnCode.code} />
                    <DetailItem label="Nom EMDN" value={equipment.emdnCode.nom} />
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* --- COLONNE DE DROITE --- */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 2 }} elevation={2}>
              <CardHeader title="Localisation & Garantie" sx={{ bgcolor: 'grey.200' }} />
              <CardContent>
                <DetailItem label="Hôpital" value={hospital?.name} icon={<ApartmentIcon />} />
                <DetailItem label="Fournisseur" value={equipment.supplier?.name} icon={<BusinessIcon />} />
                <DetailItem label="Contact Fournisseur" value={equipment.supplier?.email || equipment.supplier?.tel} />
                <Divider sx={{ my: 2 }} />
                <DetailItem label="Début Garantie" value={changeFormatDate(equipment.startDateWarranty)} icon={<SecurityIcon />} />
                <DetailItem label="Fin Garantie" value={changeFormatDate(equipment.endDateWarranty)} icon={<SecurityIcon />} />
              </CardContent>
            </Card>
          </Grid>

          {/* --- SECTION MAINTENANCE --- */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 2 }} elevation={2}>
                <CardHeader title="Plans de Maintenance Préventive" sx={{ bgcolor: 'grey.200' }} />
                <CardContent>
                  {equipment.maintenancePlans.length > 0 ? (
                    equipment.maintenancePlans.map((plan, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          borderLeft: "5px solid",
                          borderLeftColor: 'primary.main',
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>{plan.description}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Prochaine maintenance le: <strong>{new Date(plan.maintenanceDate).toLocaleDateString()}</strong> | Fréquence: <strong>{plan.frequency}</strong>
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      Aucun plan de maintenance préventive disponible.
                    </Typography>
                  )}
                </CardContent>
              </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ConsultEquipmentByMS;