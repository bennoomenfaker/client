/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import { fetchCorrectiveMaintenancesByCompany, deleteCorrectiveMaintenance } from '../../redux/slices/correctiveMaintenanceSlice';
import { useDispatch, useSelector } from 'react-redux';
import NavBar from '../../components/NavBar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    IconButton,
    Button,
    TextField,
    InputAdornment,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
    Grid,
    Typography
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { CSVLink } from "react-csv";
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from "@mui/icons-material/Edit";

const ConsultListOfCorectveMaintenanceByCompany = () => {
    const userIdCompany = sessionStorage.getItem("userId");
    const maintennaceCorrective = useSelector((state) => state.correctiveMaintenance.list);
    const isLoading = useSelector((state) => state.correctiveMaintenance.isLoading);
    const [isNavOpen, setIsNavOpen] = useState(true);
    const [search, setSearch] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedMaintenanceCorrectiveId, setSelectedMaintenanceCorrectiveId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("tous"); // État pour le filtre de statut

    useEffect(() => {
        if (userIdCompany) {
            dispatch(fetchCorrectiveMaintenancesByCompany(userIdCompany));
        }
    }, [dispatch, userIdCompany]);

    const handleDelete = (id) => {
        setSelectedMaintenanceCorrectiveId(id);
        setOpenDialog(true);
    };

    const confirmDelete = () => {
        dispatch(deleteCorrectiveMaintenance(selectedMaintenanceCorrectiveId))
            .then(() => toast.success("La maintenance corrective a été supprimée avec succès !"))
            .catch(() => toast.error("Une erreur est survenue lors de la suppression."));
        setOpenDialog(false);
    };

    const rows = useMemo(() => maintennaceCorrective?.map((item) => ({
        id: item.id,
        equipmentId: item.equipment?.id,
        incidentId: item.incident?.id,
        resolutionDetails: item.incident?.resolutionDetails,
        serialCode: item.equipment?.serialCode,
        description: item.description,
        status: item.status,
        plannedDate: item.plannedDate ? new Date(item.plannedDate).toLocaleString() : '',
        completedDate: item.completedDate ? new Date(item.completedDate).toLocaleString() : '',
        equipmentName: item.equipment?.nom,
        service: item.hospitalServiceEntity?.name,
        responsibleName: item.responsible?.fullName,
        estimatedCost: item.estimatedCost,
    })), [maintennaceCorrective]);


    const filteredCorrectiveMaintenances = useMemo(() => {
        return rows?.filter((maintenance) => {
            const searchMatch =
                maintenance.description?.toLowerCase().includes(search.toLowerCase()) ||
                maintenance.equipmentName?.toLowerCase().includes(search.toLowerCase()) ||
                maintenance.status?.toLowerCase().includes(search.toLowerCase());

            const statusMatch =
                filterStatus === "tous" || maintenance.status?.toLowerCase() === filterStatus;

            return searchMatch && statusMatch;
        });
    }, [rows, search, filterStatus]);

    const columns = [
        { field: 'serialCode', headerName: 'Code Série', width: 150 },
        { field: 'description', headerName: 'Description', width: 180, cellClassName: 'left-align-cell' },
      {
  field: 'status',
  headerName: 'Statut',
  width: 130,
  renderCell: (params) => {
    let color = 'default';
    switch (params.value?.toLowerCase()) {
      case 'en attente':
        color = '#FFA726'; // orange clair
        break;
      case 'en cours':
        color = '#29B6F6'; // bleu
        break;
      case 'terminé':
        color = '#66BB6A'; // vert
        break;
      default:
        color = '#BDBDBD'; // gris
    }

    return (
      <span
        style={{
           padding: "6px 12px",
                borderRadius: "30px",
          backgroundColor: color,
          color: 'white',
         fontWeight: "bold",
                textTransform: "capitalize",
                minWidth: "120px",  // largeur minimale uniforme
                height: "35px",     // hauteur fixe
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
        }}
      >
        {params.value}
      </span>
    );
  },
},

        { field: 'plannedDate', headerName: 'Date Planifiée', width: 180 },
        { field: 'completedDate', headerName: 'Date Réalisée', width: 180 },
        { field: 'equipmentName', headerName: 'Équipement', width: 180 },
        { field: 'service', headerName: 'Service', width: 150 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            renderCell: (params) => (
                <>
                    <Tooltip title="Voir">
                        <IconButton
                            color="primary"
                            onClick={() =>
                                navigate(`/corrective-maintenance/consult/${params.row.id}`, {
                                    state: {
                                        serialCode: params.row?.serialCode,
                                        incidentData: params.row?.incidentId
                                    }
                                })
                            }
                        >
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                        <IconButton
                            color="warning"
                            onClick={() =>
                                navigate(`/corrective-maintenance/update/${params.row.id}`, {
                                    state: {
                                        maintenance: params.row,
                                        equipmentId: params.row.equipmentId,
                                        incidentId: params.row.incidentId,
                                        resolutionDetails: params.row.resolutionDetails
                                    }
                                })
                            }
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                        <IconButton
                            color="error"
                            onClick={() => handleDelete(params.row.id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </>
            )
        }
    ];

    const headers = [
        { label: "ID", key: "id" },
        { label: "Équipement", key: "equipmentName" },
        { label: "Statut", key: "status" },
        { label: "Date planifiée", key: "plannedDate" },
        { label: "Date réalisée", key: "completedDate" },
        { label: "Responsable", key: "responsibleName" },
        { label: "Description", key: "description" },
        { label: "Coût estimé", key: "estimatedCost" },
        { label: "Code Série", key: "serialCode" },
        { label: "Service", key: "service" },
    ];

    return (
        <div style={{ display: "flex", width: "100%"  }}>
            <NavBar onToggle={setIsNavOpen} />
            <div style={{ width: "90%", padding: "20px", marginTop: 50 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, ml: -6 }}>
                    <TextField
                        label="Rechercher une maintenance"
                        variant="outlined"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <CSVLink
                        data={filteredCorrectiveMaintenances }
                        headers={headers}
                        filename="maintenance_corrective.csv"
                        separator=";"
                    >
                        <Button variant="outlined" color="primary">
                            Exporter EXCEL
                        </Button>
                    </CSVLink>
                </Box>

                <Grid container spacing={2} alignItems="center" marginBottom={1} ml={-6}>
                    <Grid item>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Filtrer par statut:</Typography>
                    </Grid>
                    <Grid item>
                        <ToggleButtonGroup
                            value={filterStatus}
                            exclusive
                            onChange={(_, value) => setFilterStatus(value)}
                            aria-label="Filtrage par statut"
                        >
                            <ToggleButton value="tous" aria-label="Tous">
                                Tous
                            </ToggleButton>
                            <ToggleButton value="en attente" aria-label="En attente">
                                En attente
                            </ToggleButton>
                            <ToggleButton value="planifié" aria-label="Planifié">
                                Planifié
                            </ToggleButton>
                            <ToggleButton value="terminé" aria-label="Terminé">
                                Terminé
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                </Grid>

                <div style={{ height: 414, width: '107.5%', marginLeft: '-6%'}}>
                    <DataGrid
                           sx={{
    width: '100%',
    '& .MuiDataGrid-cell': {
      borderRight: '1px solid rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      fontSize: '0.8rem', // ↓ Réduction de taille de police
      padding: '4px 8px', // ↓ Réduction du padding
    },
    '& .MuiDataGrid-columnHeaders': {
      fontSize: '0.85rem',
      height: 40,
      whiteSpace: 'normal',
      lineHeight: 1.3,
      textAlign: 'center',
    },
    '& .MuiDataGrid-root': {
      maxWidth: '100%',
    },
    '& .MuiDataGrid-row': {
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            },
            
  }}
                        rows={filteredCorrectiveMaintenances }
                        columns={columns}
                        pageSize={5}
                        getRowId={(row) => row.id}
                        
                        loading={isLoading}
                        disableSelectionOnClick
                    />
                </div>

                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>Confirmation de Suppression</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Êtes-vous sûr de vouloir supprimer cette maintenance corrective ?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)} color="primary">
                            Annuler
                        </Button>
                        <Button onClick={confirmDelete} color="error">
                            Supprimer
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

export default ConsultListOfCorectveMaintenanceByCompany;