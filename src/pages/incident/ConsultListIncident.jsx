/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Box, CircularProgress,IconButton,TextField,InputAdornment,Button,Typography,  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, ToggleButton, Grid, ToggleButtonGroup } from "@mui/material";
import { deleteIncident, fetchIncidentsByHospital  } from "../../redux/slices/incidentSlice";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridCheckCircleIcon } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from "@mui/icons-material/Visibility";


const NavBar = React.lazy(() => import("../../components/NavBar"));
const CSVLink = React.lazy(() => import("react-csv").then((module) => ({ default: module.CSVLink })));
const SearchIcon = React.lazy(() => import("@mui/icons-material/Search"));
const EditIcon = React.lazy(() => import("@mui/icons-material/Edit"));

const ConsultListIncident = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, isLoading: isIncidentLoading } = useSelector((state) => state.incident);

  const [searchText, setSearchText] = useState("");
  const loading = isIncidentLoading || false;
  const [openDialog, setOpenDialog] = useState(false);
const [selectedIncidentId, setSelectedIncidentId] = useState(null);
const [filterType, setFilterType] = useState("all");


  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const { payload: incidents } = await dispatch(fetchIncidentsByHospital(sessionStorage.getItem("hospitalId")));
        
      } catch (err) {
        toast.error("Erreur lors du chargement des incidents.");
      }
    };

    loadIncidents();
  }, [dispatch]);

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const filteredIncidents = useMemo(() => {
    const lowerSearch = searchText.toLowerCase();
  
    return list.filter((incident) => {
      const status = incident.incident?.status || "";
      const validatedBy = incident.incident?.validatedBy;
      const validatedAt = incident.incident?.validatedAt;
      const resolvedBy = incident.incident?.resolvedBy;
  
      // Filtrage par type
      if (filterType === "validated") {
        if (!(validatedBy && validatedAt) || status === "Résolu") return false;
      } else if (filterType === "pending") {
        if (validatedBy || validatedAt || status === "Résolu") return false;
      } else if (filterType === "resolved") {
        if (status !== "Résolu") return false;
      }
  
      // Recherche texte
      const equipmentSerial = incident.equipment?.serialCode?.toLowerCase() || "";
      const description = incident.incident?.description?.toLowerCase() || "";
      const reporterName = incident.userDTO
        ? `${incident.userDTO.firstName} ${incident.userDTO.lastName}`.toLowerCase()
        : "";
      const reportedAt = incident.incident?.reportedAt
        ? new Date(incident.incident.reportedAt).toLocaleString().toLowerCase()
        : "";
      const serviceName = incident.hospitalServiceEntity?.name?.toLowerCase() || "";
      const severity = incident.incident?.severity?.toLowerCase() || "";
  
      return (
        equipmentSerial.includes(lowerSearch) ||
        description.includes(lowerSearch) ||
        reporterName.includes(lowerSearch) ||
        reportedAt.includes(lowerSearch) ||
        serviceName.includes(lowerSearch) ||
        severity.includes(lowerSearch)
      );
    });
  }, [filterType, list, searchText]);
  
  

  const csvData = useMemo(() => filteredIncidents.map((incident) => ({
    Équipement: incident.equipment?.serialCode || "N/A",
    Description: incident.incident?.description || "",
    Date: new Date(incident.incident?.reportedAt).toLocaleString(),
    "Déclaré par": incident.reporter ? `${incident.reporter.firstName} ${incident.reporter.lastName}` : "N/A",
    Status: incident.incident?.status || "N/A",
  })), [filteredIncidents]);

  const columns = [
    { field: 'equipment', headerName: 'Équipement', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 ,  cellClassName: 'left-align-cell'
    },
    { field: 'reportedAt', headerName: 'Date de déclaration', flex: 1.5 },
    { field: 'status', headerName: 'Statut', flex: 0.75 },
    { field: 'severity', headerName: 'Gravité', flex: 0.75 },
    { field: 'reporter', headerName: 'Déclaré par', flex: 1.5 },
    { field: 'service', headerName: 'Service', flex: 1.5 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      sortable: false,
      renderCell: (params) => (
    <React.Fragment>
       <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Consulter l'incident">
        <IconButton
        size="small"
      aria-label="consulter"
      color="primary"
      onClick={() => navigate(`/manage-incident/consulIncident/${params.row.incidentId}`, {
        state: params.row.originalIncident
      })}
    >
      <VisibilityIcon />
    </IconButton>
      </Tooltip>


      <Tooltip title="Valider l'incident">
      <IconButton
      aria-label="valider"
      color="success"
      size="small"
      onClick={() => navigate(`/manage-incident/validateIncident/${params.row.incidentId}`, {
        state: params.row.originalIncident
      })}
    >
      <GridCheckCircleIcon />
    </IconButton>
      </Tooltip>
      
      <Tooltip title="Modifier l'équipement">
        <IconButton
        size="small"
          aria-label="edit"
          color="warning"
          onClick={() => navigate(`/manage-incident/updateIncident/${params.row.incidentId}`, {
            state: params.row.originalIncident
          })}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Supprimer l'incident">
        <IconButton
        size="small"
          aria-label="delete"
          color="error"
          onClick={() => handleDeleteClick(params.row.incidentId)}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      </Box>
    </React.Fragment>
      ),
    },
    
  ];
  const rows = filteredIncidents.map((incident, index) => ({
    id: incident.incident?.id || index,
    incidentId: incident.incident?.id,
    equipment: incident.equipment?.serialCode || "N/A",
    description: incident.incident?.description || "N/A",
    reportedAt: incident.incident?.reportedAt
      ? new Date(incident.incident.reportedAt).toLocaleString()
      : "N/A",
    status: incident.incident?.status || "N/A",
    severity: incident.incident?.severity || "N/A",
    reporter: incident.userDTO
      ? `${incident.userDTO.firstName || ""} ${incident.userDTO.lastName || ""}`.trim()
      : "N/A",
    service: incident.hospitalServiceEntity?.name || "N/A",
    originalIncident: incident,
  }));
  

  const handleDeleteClick = (incidentId) => {
    setSelectedIncidentId(incidentId);
    setOpenDialog(true);
  };
  
  const confirmDelete = async () => {
   await dispatch(deleteIncident(selectedIncidentId));
     
  
    setOpenDialog(false);
    setSelectedIncidentId(null);
  };
  
  
  
  const cancelDelete = () => {
    setOpenDialog(false);
    setSelectedIncidentId(null);
  };
  

  return (
    <div style={{ display: "flex" , width: "100%" }}>
        <NavBar onToggle={setIsNavOpen} />
      <div style={{  padding: "15px", marginTop: 50, width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 , ml:-8 }}>
            <Typography variant="h7" sx={{ fontWeight: 'bold' }}>Liste des incidents signalés</Typography>
              <TextField
                label="Rechercher"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: '66%', }}
              />
            {csvData.length > 0 && (
                <Button variant="contained" color="primary">
                  <CSVLink data={csvData} filename={"incidents.csv"} style={{ textDecoration: 'none', color: 'inherit' }}>
                    Exporter CSV
                  </CSVLink>
                </Button>
            )}
            

          </Box>
          <Grid container spacing={2} alignItems="center" marginBottom={2}>
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
          {loading ? (
            <Box sx={{ display: "flex",alignItems: "center", justifyContent: "center", height: 400 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
            
  rows={rows}
  columns={columns}
  autoHeight={false}
  pageSize={rowsPerPage}
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
      fontSize: '0.8rem', },// réduit la taille du texte},
    '& .MuiDataGrid-row': {
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    },
    '& .left-align-cell': {
      justifyContent: 'flex-start !important',
      textAlign: 'left !important',
    },

  }}
  
/>


          )}
      </div>
      <Dialog open={openDialog} onClose={cancelDelete}>
  <DialogTitle>Confirmation</DialogTitle>
  <DialogContent>Voulez-vous vraiment supprimer cet incident ?</DialogContent>
  <DialogActions>
    <Button onClick={cancelDelete}>Annuler</Button>
    <Button onClick={confirmDelete} color="error">Supprimer</Button>
  </DialogActions>
</Dialog>

    </div>
  );
};

export default ConsultListIncident;
