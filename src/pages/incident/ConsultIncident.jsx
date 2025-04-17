/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { useLocation, useNavigate } from "react-router-dom";
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

const ConsultIncident = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [incident, setIncident] = useState(location.state);

  const [validatorUser, setValidatorUser] = useState(null);
  const [reportedUser, setReportedUser] = useState(null);
  const [resolverUser, setResolverUser] = useState(null);

  const { incident: inc, equipment, userDTO, hospitalServiceEntity } = incident;
  const hospital = useSelector((state) => state.hospital.selectedHospital)

  useEffect(() => {

    dispatch(fetchHospitalById(inc.hospitalId))
  }, [dispatch, inc])


  useEffect(() => {
    const fetchUsers = async () => {
      if (inc?.validatedBy && !validatorUser) {
        const res = await dispatch(getUserById(inc.validatedBy));
        setValidatorUser(res.payload);
      }
      if (inc?.reportedBy && !reportedUser) {
        const res = await dispatch(getUserById(inc.reportedBy));
        setReportedUser(res.payload);
      }
      if (inc?.resolvedBy && !resolverUser) {
        const res = await dispatch(getUserById(inc.resolvedBy));
        setResolverUser(res.payload);
      }
    };
    fetchUsers();
  }, [dispatch, inc, validatorUser, resolverUser, reportedUser]);

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
                  <Typography><strong>Description :</strong> {inc.description}</Typography>
                  <Typography><strong>Gravité :</strong> {inc.severity}</Typography>
                  <Typography><strong>Status :</strong> {renderStatusChip(inc.status)}</Typography>
                  <Typography><strong>Date de déclaration :</strong> {new Date(inc.reportedAt).toLocaleString()}</Typography>
                  {inc.resolvedAt && (
                    <Typography><strong>Résolu le :</strong> {new Date(inc.resolvedAt).toLocaleString()}</Typography>
                  )}
                  {inc.validatedAt && (
                    <Typography><strong>Validé le :</strong> {new Date(inc.validatedAt).toLocaleString()}</Typography>
                  )}
                  {inc.penaltyApplied > 0 && (
                    <Typography><strong>Pénalité :</strong> {inc.penaltyApplied} TND</Typography>
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

                  <Typography><strong>Service :</strong> {hospitalServiceEntity?.name || ""}</Typography>
                  <Typography><strong>Gouvernorat :</strong> {hospital?.gouvernorat?.nom || ""}</Typography>


                  <Typography><strong>Nom :</strong> {equipment.nom}</Typography>
                  <Typography><strong>Code Série :</strong> {equipment.serialCode}</Typography>
                  <Typography><strong>EMDN :</strong> {equipment.emdnCode.nom}</Typography>
                  <Typography><strong>Fournisseur :</strong> {equipment.supplier}</Typography>
                  <Typography><strong>Statut :</strong> {renderStatusChipEquip(equipment.status)}</Typography>
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
          {inc.status === "Résolu" && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Détails de la résolution
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography>{inc.resolutionDetails || "Aucun détail fourni."}</Typography>
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
