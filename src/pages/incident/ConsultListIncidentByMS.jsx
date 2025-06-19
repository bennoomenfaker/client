/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import NavBar from "../../components/NavBar";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllIncidents, fetchIncidentsByHospital, fetchIncidentsByHospitalAndService } from "../../redux/slices/incidentSlice";
import { fetchHospitals } from "../../redux/slices/hospitalSlice";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Select, Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Grid, IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";
import { DataGrid, GridCheckCircleIcon } from "@mui/x-data-grid";
import { debounce } from "lodash";
import VerifiedIcon from '@mui/icons-material/Verified';
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-toastify";
import { checkSlaCompliance, resetSlaComplianceStatus } from "../../redux/slices/slaSlice";


const ConsultListIncidentByMS = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [selectedServiceName, setSelectedServiceName] = useState("");
  const slaComplianceStatus = useSelector((state) => state.sla.slaComplianceStatus);
  const isLoading = useSelector((state) => state.sla.isLoading);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterType, setFilterType] = useState("all");



  const debouncedSearch = useMemo(() => debounce((value) => {
    setDebouncedSearchText(value);
  }, 300), []);


  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);
  const [selectedHospitalId, setSelectedHospitalId] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { all: allIncidents, isLoading: isIncidentLoading, error: incidentError } = useSelector(
    (state) => state.incident
  );
  const { hospitals, isLoading: isHospitalLoading, error: hospitalError } = useSelector(
    (state) => state.hospital
  );


  useEffect(() => {
    dispatch(fetchHospitals());
    dispatch(fetchAllIncidents());
  }, [dispatch]);

  // Fonction pour récupérer le nom d’un hôpital via son ID
  const getHospitalName = (hospitalId) => {
    const hospital = hospitals.find((h) => h.id === hospitalId);
    return hospital ? hospital.name : "Hôpital inconnu";
  };

  const handleCheckSlaClick = async (incidentId) => {
    try {
      // Dispatching the checkSlaCompliance action
      await dispatch(checkSlaCompliance(incidentId));

      // After the dispatch, the result should be updated in the Redux store
      toast.success("Vérification SLA effectuée !");

      // Open the dialog to show SLA result
      setOpenDialog(true);
    } catch (error) {
      toast.error("Erreur lors de la vérification du SLA.");
    }
  };

  // Filtrer les incidents :
  const filteredIncidents = useMemo(() => {
    return allIncidents?.filter((incident) => {
      const matchesHospital =
        !selectedHospitalId || incident.incident.hospitalId === selectedHospitalId;

      const matchesSearch =
        !debouncedSearchText ||
        incident.equipment.serialCode?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
        incident.incident.status?.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
        incident.hospitalServiceEntity.name.toLowerCase().includes(debouncedSearchText.toLowerCase()) ||
        incident.incident.description?.toLowerCase().includes(debouncedSearchText.toLowerCase());
      const matchesService =
        !selectedServiceName || incident.hospitalServiceEntity.name === selectedServiceName;

      const matchesFilterType = (() => {
        switch (filterType) {
          case "pending":
            return incident.incident.status === "En cours de validation";
          case "validated":
            return incident.incident.status === "Validé";
          case "resolved":
            return incident.incident.status === "Résolu";
          case "all":
          default:
            return true;
        }
      })();

      return matchesHospital && matchesSearch && matchesService && matchesFilterType;
    });
  }, [allIncidents, selectedHospitalId, debouncedSearchText, selectedServiceName, filterType]);

  // Préparer les lignes pour le DataGrid
  const rows = filteredIncidents.map((incident, index) => ({
    id: incident.incident.id || index,
    serialCode: incident.equipment.serialCode || "N/A",
    description: incident.incident.description || "N/A",
    status: incident.incident.status || "N/A",
    hospitalName: getHospitalName(incident.incident.hospitalId),
    serviceName: incident.hospitalServiceEntity.name,
    createdAt: incident.incident.reportedAt
      ? new Date(incident.incident.reportedAt).toLocaleString()
      : "N/A",
    validatedAt: incident.incident.validatedAt
      ? new Date(incident.incident.validatedAt).toLocaleString()
      : "N/A",
    resolvedAt: incident.incident.resolvedAt
      ? new Date(incident.incident.resolvedAt).toLocaleString()
      : "N/A",
    originalIncident: incident,
  }));

  // Définir les colonnes du DataGrid
  const columns = [
    { field: "serialCode", headerName: "Code Série", width: 120 },
    { field: "description", headerName: "Description", width: 200 },
    { field: "status", headerName: "Statut", width: 100 },
    { field: "hospitalName", headerName: "Hôpital", width: 200 },
    { field: "serviceName", headerName: "service", width: 100 },

    { field: "createdAt", headerName: "Signalé le", width: 160 },
    { field: "validatedAt", headerName: "validé le", width: 160 },
    { field: "resolvedAt", headerName: "Résolu le", width: 160 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      sortable: false,
      renderCell: (params) => {
        console.log("params.row =", params.row.id);

        return (
          <React.Fragment>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Consulter l'incident">
                <IconButton
                  size="small"
                  aria-label="consulter"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/manage-incident/consulIncident/${params.row.id}`, {
                      state: params.row.originalIncident
                    });
                  }}

                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Vérifier SLA">
                <IconButton
                  size="small"
                  color="info"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckSlaClick(params.row.id)
                  }}
                >

                  <VerifiedIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </React.Fragment>
        );
      },
    }


  ];

  // Dialog to show SLA result
  const renderSlaStatus = () => {
    if (isLoading) {
      return <CircularProgress />;
    }
    return slaComplianceStatus ? (
      <Typography variant="body1">{`SLA Status: ${slaComplianceStatus}`}</Typography>
    ) : (
      <Typography variant="body1">Aucune information sur le SLA</Typography>
    );
  };

  const handleCloseDialog = () => {
    // Reset the SLA compliance status when closing the dialog
    dispatch(resetSlaComplianceStatus());
    setOpenDialog(false);
  };

  return (
    <div style={{ display: "flex", width: "100%" }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ padding: "20px", width: "100%" }}>
        <Typography variant="h5" gutterBottom>
          Liste des Incidents
        </Typography>

        {/* Filtres */}
        <Grid container spacing={2} marginBottom={2} alignItems="center" marginLeft="-7.5%">
          <Grid item xs={12} sm={3}>
            <TextField
              label="Rechercher"
              variant="outlined"
              fullWidth
              onChange={(e) => debouncedSearch(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel id="hospital-select-label">Hôpital</InputLabel>
              <Select
                labelId="hospital-select-label"
                value={selectedHospitalId}
                label="Hôpital"
                onChange={(e) => setSelectedHospitalId(e.target.value)}
              >
                <MenuItem value="">Tous les hôpitaux</MenuItem>
                {hospitals.map((hospital) => (
                  <MenuItem key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3} >
            <FormControl fullWidth>
              <InputLabel id="service-select-label">Service</InputLabel>
              <Select
                labelId="service-select-label"
                value={selectedServiceName}
                label="Service"
                onChange={(e) => setSelectedServiceName(e.target.value)}
              >
                <MenuItem value="">Tous les services</MenuItem>
                {[...new Set(allIncidents.map(i => i.hospitalServiceEntity.name))].map(service => (
                  <MenuItem key={service} value={service}>{service}</MenuItem>
                ))}
              </Select>
            </FormControl>

          </Grid>



          <Grid item xs={12} sm={3}>
            <button
              style={{
                width: "40%",
                height: "56px",
                borderRadius: "4px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "16px"
              }}
              onClick={() => {
                setSearchText("");
                setDebouncedSearchText("");
                setSelectedHospitalId("");
                setSelectedServiceName("");
                setFilterType("all")
              }}
            >
              Réinitialiser
            </button>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" marginBottom={2} marginLeft={-11}>
          <Grid item>
            <ToggleButtonGroup
              value={filterType}
              exclusive
              onChange={(_, value) => setFilterType(value)}
              aria-label="Filtrage"
            >
              <ToggleButton value="all" aria-label="Tous">Tous</ToggleButton>
              <ToggleButton value="pending" aria-label="En validation">En cours de validation</ToggleButton>
              <ToggleButton value="validated" aria-label="Validés">Incidents validés</ToggleButton>
              <ToggleButton value="resolved" aria-label="Résolus">Incidents résolus</ToggleButton> {/* Nouveau bouton ajouté ici */}
            </ToggleButtonGroup>

          </Grid>
        </Grid>


        {/* Tableau */}
        {isIncidentLoading || isHospitalLoading ? (
          <Box sx={{ textAlign: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: 400, width: "100%", marginLeft: "-.5%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 25]} loading={isLoading}


              disableRowSelectionOnClick
              sx={{
                fontSize: "0.75rem", // réduit la taille du texte
                ml: -8,
                '& .MuiDataGrid-cell': {
                  borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '4px', // réduit l'espacement
                  fontSize: '0.8rem',
                },// réduit la taille du texte},
                '& .MuiDataGrid-row': {
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                },
                '& .left-align-cell': {
                  justifyContent: 'flex-start !important',
                  textAlign: 'left !important',
                },

              }}
            />
          </Box>
        )}

      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Vérifier SLA</DialogTitle>
        <DialogContent>
          {renderSlaStatus()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConsultListIncidentByMS;
