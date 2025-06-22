/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserById } from "../../redux/slices/userSlice";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import ReportIcon from "@mui/icons-material/Report";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { fetchHospitalById } from "../../redux/slices/hospitalSlice";
import {fetchEquipmentById} from "../../redux/slices/equipmentSlice";

const ConsultIncident = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();
  const incident = location.state?.incident;
  const equipment = useSelector((state) => state.equipment.selectedEquipment);
  const [validatorUser, setValidatorUser] = useState(null);
  const [reportedUser, setReportedUser] = useState(null);
  const [resolverUser, setResolverUser] = useState(null);
 const hospital = useSelector((state) => state.hospital.selectedHospital)
  useEffect(() => {

    dispatch(fetchHospitalById(incident.hospitalId))
    dispatch(fetchEquipmentById(incident.equipmentId))
  }, [dispatch, incident])


  useEffect(() => {
    const fetchUsers = async () => {
      if (incident?.validatedBy && !validatorUser) {
        const res = await dispatch(getUserById(incident.validatedBy));
        setValidatorUser(res.payload);
      }
      if (incident?.reportedBy && !reportedUser) {
        const res = await dispatch(getUserById(incident.reportedBy));
        setReportedUser(res.payload);
      }
      if (incident?.resolvedBy && !resolverUser) {
        const res = await dispatch(getUserById(incident.resolvedBy));
        setResolverUser(res.payload);
      }
    };
    fetchUsers();
  }, [dispatch, incident, validatorUser, resolverUser, reportedUser]);

  const renderStatusChip = (status) => {
    const colorMap = {
      "En attente": "default",
      "En cours": "warning",
      "Résolu": "success",
    };

    const iconMap = {
      "En attente": <ReportIcon />,
      "En cours": <ErrorIcon />,
      "Résolu": <CheckCircleIcon />,
    };
    return (
      <Chip
        icon={iconMap[status]}
        label={status}
        color={colorMap[status]}
        variant="outlined"
      />
    );
  };


  const renderStatusChipEquip = (status) => {
    const normalizedStatus = status?.toLowerCase(); // <-- Important


    const colorMap = {
      "en panne": "error",
      "en maintenance": "warning",
      "en service": "success",
    };

    const iconMap = {
      "en panne": <ReportIcon />,
      "en maintenance": <ErrorIcon />,
      "en service": <CheckCircleIcon />,
    };


    return (
      <Chip
        icon={iconMap[normalizedStatus]}
        label={status}
        color={colorMap[normalizedStatus]}
        variant="outlined"
      />
    );
  };


  return (
    <Box display="flex">

      <NavBar onToggle={isNavOpen} />
      <Box
        flexGrow={1}
        p={4}
        ml={-7}
        mt={5}
        transition="margin-left 0.3s"
      >
        <Typography variant="h4" mb={4}>
          Détails de l&apos;incident
        </Typography>

        <Grid container spacing={4}>
          {/* Carte incident */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informations générales
                </Typography>
                <Divider sx={{ mb: 2  }} />
                <Stack spacing={1}>
                  <Typography><strong>Description :</strong> {incident.description}</Typography>
                  <Typography><strong>Gravité :</strong> {incident.severity}</Typography>
                  <Typography><strong>Status :</strong> {renderStatusChip(incident.status)}</Typography>
                  <Typography><strong>Date de déclaration :</strong> {new Date(incident.reportedAt).toLocaleString()}</Typography>
                  {incident.resolvedAt && (
                    <Typography><strong>Résolu le :</strong> {new Date(incident.resolvedAt).toLocaleString()}</Typography>
                  )}
                  {incident.validatedAt && (
                    <Typography><strong>Validé le :</strong> {new Date(incident.validatedAt).toLocaleString()}</Typography>
                  )}
                  {incident.penaltyApplied > 0 && (
                    <Typography><strong>Pénalité :</strong> {incident.penaltyApplied} TND</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Carte équipement */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Équipement concerné
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                <Typography><strong>Hôpital :</strong> {hospital?.name || "Non défini"}</Typography>

<Typography>
  <strong>Service :</strong>{" "}
  {
    hospital?.services?.find(service => service.id === incident.serviceId)?.name || "Non défini"
  }
</Typography>
                  <Typography><strong>Gouvernorat :</strong> {hospital?.gouvernorat?.nom || ""}</Typography>


                  <Typography><strong>Nom :</strong> {equipment?.nom}</Typography>
                  <Typography><strong>Code Série :</strong> {equipment?.serialCode}</Typography>
                  <Typography><strong>EMDN :</strong>{equipment?.emdnCode?.code} -{equipment?.emdnCode?.nom}</Typography>
<Typography><strong>Fournisseur :</strong> {equipment?.supplier?.name || "Non défini"}</Typography>
                  <Typography><strong>Statut :</strong> {renderStatusChipEquip(equipment?.status)}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Carte utilisateurs */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Utilisateurs impliqués
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  <Typography>
                    <strong>Déclaré par :</strong>{" "}
                    {reportedUser
                      ? `${reportedUser.firstName} ${reportedUser.lastName}`
                      : "Chargement..."}
                  </Typography>
                  {validatorUser && (
                    <Typography>
                      <strong>Validé par :</strong>{" "}
                      {`${validatorUser.firstName} ${validatorUser.lastName}`}
                    </Typography>
                  )}
                  {resolverUser && (
                    <Typography>
                      <strong>Résolu par :</strong>{" "}
                      {`${resolverUser.firstName} ${resolverUser.lastName}`}
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Détails de résolution */}
          {incident.status === "Résolu" && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Détails de la résolution
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography>{incident.resolutionDetails || "Aucun détail fourni."}</Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default ConsultIncident;
