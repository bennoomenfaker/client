/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { updateIncident } from "../../redux/slices/incidentSlice";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Select,
    InputLabel,
    Paper,
    FormControl,
    Typography,
    Grid,
} from "@mui/material";
import { toast } from "react-toastify";
import { getUserById } from "../../redux/slices/userSlice";
import { getProfile } from "../../redux/slices/authSlice";

const UpdateIncident = () => {
    const [isNavOpen, setIsNavOpen] = useState(true);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const [incident, setIncident] = useState(location.state);
    const userId = sessionStorage.getItem("userId");

    const [description, setDescription] = useState(incident?.incident?.description || "");
    const [resolutionDetails, setResolutionDetails] = useState(incident?.incident?.resolutionDetails || "");
    const [penaltyApplied, setPenaltyApplied] = useState(incident?.incident?.penaltyApplied || 0);
    const [status, setStatus] = useState(incident?.incident?.status || "En attente");
    const [resolvedBy, setResolvedBy] = useState(incident?.incident?.resolvedBy || "");
    const [validatedBy, setValidatedBy] = useState(incident?.incident?.validatedBy || "");
    const [reportedBy, setReportedBy] = useState(incident?.incident?.reportedBy || "");

    const [reportedAt, setReportedAt] = useState(incident?.incident?.reportedAt || "");
    const [validatedAt, setValidatedAt] = useState(incident?.incident?.validatedAt || "");
    const userInfo = useSelector((state) => state.auth.user); // Récupérer les informations de l'utilisateur authentifié

    const [resolvedAt, setResolvedAt] = useState(incident?.incident?.resolvedAt || "");
    const [severity, setSeverity] = useState(incident?.incident?.severity);
    const [validatorUser, setValidatorUser] = useState(null);
    const [reportedUser, setReportedUser] = useState(null);
    const [resolverUser, setResolverUser] = useState(null);

    const [resolutionDetailsDisabled, setResolutionDetailsDisabled] = useState(status !== "Résolu");
    const [resolvedAtDisabled, setResolvedAtDisabled] = useState(status !== "Résolu");

    useEffect(() => {
        const fetchUsers = async () => {
            if (incident?.incident?.validatedBy && !validatorUser) {
                const res = await dispatch(getUserById(incident.incident.validatedBy));
                setValidatorUser(res.payload);
            }

            if (incident?.incident?.reportedBy && !reportedUser) {
                const res = await dispatch(getUserById(incident.incident.reportedBy));
                setReportedUser(res.payload);
            }

            if (incident?.incident?.resolvedBy && !resolverUser) {
                const res = await dispatch(getUserById(incident.incident.resolvedBy));
                setResolverUser(res.payload);
            } 
            
            if (status === "Résolu" && userId && !resolverUser) {
                const res = await dispatch(getUserById(userId));
                setResolverUser(res.payload);
            }
            if (status === "Résolu" && userId && !validatorUser) {
                const res = await dispatch(getUserById(userId));
                setValidatorUser(res.payload);
            }
        };

        fetchUsers();
    }, [dispatch, incident, status, userId, validatorUser, resolverUser, reportedUser]);

    useEffect(() => {
        setReportedBy(incident.incident.reportedBy || "");

        if (status === "En attente") {
            setValidatedBy("");
            setResolvedBy("");
        }

        if (status === "En cours") {
            setValidatedBy(incident?.incident?.validatedBy || userId);
            setResolvedBy("");
        }

        if (status === "Résolu") {
            setValidatedBy(incident?.incident?.validatedBy || userId);
            setResolvedBy(incident?.incident?.resolvedBy || userId);
        }

        setResolutionDetailsDisabled(status !== "Résolu");
        setResolvedAtDisabled(status !== "Résolu");
    }, [status, userId, incident]);

    
      useEffect(() => {
        async function fetchData() {
          try {
            // Vérifier si l'utilisateur est authentifié
            if (!userInfo) {
              const profileInfo = await dispatch(getProfile());
              if (!profileInfo.payload) {
                toast.error('Erreur lors de la récupération du profil.');
                return;
              }
            }
    
            
          } catch (error) {
            console.error("Une erreur s'est produite lors de la récupération du profil:", error);
          }
        }
    
        fetchData();
      }, [dispatch, userInfo]);

    const getRoleLabel = (roleName) => {
        switch (roleName) {
            case "ROLE_HOSPITAL_ADMIN":
                return "Administrateur";
            case "ROLE_MAINTENANCE_ENGINEER":
                return "Ingénieur de maintenance";
            case "ROLE_MAINTENANCE_COMPANY":
                return "Société de maintenance";
            default:
                return "Utilisateur";
        }
    };

    const handleValidate = async (e) => {
        e.preventDefault();

        if (description.trim() === "") {
            toast.error("La description ne peut pas être vide.");
            return;
        }


        const updatedData = {
            description,
            resolutionDetails ,
            penaltyApplied,
            severity,
            status,
            resolvedBy: status === "En attente" ? userId : (status === "Résolu" ? userId : null),
            validatedBy: status === "En cours" ? userId : null,
            reportedAt,
            resolvedAt: status === "Résolu" ? resolvedAt : null,
        };

        try {
         const x =   await dispatch(updateIncident({
                incidentId: incident.incident.id,
                updatedData,
                user: userInfo, // Utilisation de l'utilisateur authentifié
            })).unwrap();
            console.log(x)

            toast.success("Incident validé avec succès.");
            navigate("/manage-incident/consultListOfIncident");
        } catch (err) {
            toast.error(`Erreur lors de la modification de l'incident`);
            console.log(err);
        }
    };

    const getDefaultDateTime = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - offset * 60 * 1000); // corriger le fuseau
        return localDate.toISOString().slice(0, 16); // format YYYY-MM-DDTHH:mm
    };

    return (
        <Box sx={{ display: "flex", width: "100%" }}>
            <NavBar onToggle={setIsNavOpen} />
            <Box sx={{ flexGrow: 1, p: 3, mt: 6 }}>
                <Paper elevation={3} style={{ padding: "20px", marginBottom: "20px" }}>
                    <Typography variant="h5" gutterBottom>Mis à jour de l&apos;incident</Typography>
                    <Box component="form" onSubmit={handleValidate} noValidate sx={{ '& .MuiTextField-root': { mb: 2 }, '& .MuiFormControl-root': { mb: 2 } }}>
                        <TextField
                            label="Description du problème"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            required
                        />

                        <TextField
                            label="Détails de la résolution"
                            value={resolutionDetails}
                            onChange={(e) => setResolutionDetails(e.target.value)}
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            disabled={resolutionDetailsDisabled}
                            required={status === "Résolu"}
                        />

                        <TextField
                            label="Pénalité appliquée (dt)"
                            type="number"
                            value={penaltyApplied}
                            onChange={(e) => setPenaltyApplied(parseFloat(e.target.value))}
                            variant="outlined"
                            fullWidth
                        />

                        <FormControl fullWidth>
                            <InputLabel>Statut</InputLabel>
                            <Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                label="Statut"
                                required
                            >
                                <MenuItem value="En attente">En attente</MenuItem>
                                <MenuItem value="En cours">En cours</MenuItem>
                                <MenuItem value="Résolu">Résolu</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Sévérité</InputLabel>
                            <Select
                                value={severity}
                                onChange={(e) => setSeverity(e.target.value)}
                                label="Sévérité"
                                required
                            >
                                <MenuItem value="MINEUR">Mineur</MenuItem>
                                <MenuItem value="MODERE">Modéré</MenuItem>
                                <MenuItem value="MAJEUR">Majeur</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Déclaré par"
                            value={
                                reportedUser
                                    ? `${reportedUser.firstName} ${reportedUser.lastName} - ${getRoleLabel(reportedUser.role?.name)}`
                                    : "Chargement..."
                            }
                            disabled
                            variant="outlined"
                            fullWidth
                        />

                        <TextField
                            label="Date de déclaration"
                            type="datetime-local"
                            value={reportedAt ? reportedAt.slice(0, 16) : getDefaultDateTime()}
                            onChange={(e) => setReportedAt(e.target.value)}
                            variant="outlined"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            disabled
                        />

                        {status === "En cours" && validatorUser && (
                            <>
                                <TextField
                                    label="Validé par"
                                    value={`${validatorUser.firstName} ${validatorUser.lastName} - ${getRoleLabel(validatorUser.role?.name)}`}
                                    disabled
                                    variant="outlined"
                                    fullWidth
                                />
                                <TextField
                                    label="Date de validation"
                                    type="datetime-local"
                                    value={validatedAt ? validatedAt.slice(0, 16) : getDefaultDateTime()}
                                    onChange={(e) => setValidatedAt(e.target.value)}
                                    variant="outlined"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    disabled
                                />
                            </>
                        )}

                        {status === "Résolu" && (
                            <>
                              
                                    <TextField
                                        label="Validé par"
                                        value={`${validatorUser?.firstName} ${validatorUser?.lastName} - ${getRoleLabel(validatorUser?.role?.name)}`}
                                        disabled
                                        variant="outlined"
                                        fullWidth
                                    />
                               
                                <TextField
                                    label="Date de validation"
                                    type="datetime-local"
                                    value={validatedAt ? validatedAt.slice(0, 16) : getDefaultDateTime()}
                                    onChange={(e) => setValidatedAt(e.target.value)}
                                    variant="outlined"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    disabled
                                />
                                {resolverUser && (
                                    <>
                                        <TextField
                                            label="Résolu par"
                                            value={`${resolverUser.firstName} ${resolverUser.lastName} - ${getRoleLabel(resolverUser.role?.name)}`}
                                            disabled
                                            variant="outlined"
                                            fullWidth
                                        />
                                        <TextField
                                            label="Date de résolution"
                                            type="datetime-local"
                                            value={resolvedAt ? resolvedAt.slice(0, 16) : getDefaultDateTime()}
                                            onChange={(e) => setResolvedAt(e.target.value)}
                                            variant="outlined"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            disabled
                                        />
                                    </>
                                )}
                            </>
                        )}

                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                            Modifier l&apos;incident
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default UpdateIncident;