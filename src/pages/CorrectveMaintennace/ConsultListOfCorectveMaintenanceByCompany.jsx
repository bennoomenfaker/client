/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
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
  Tooltip
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

  const rows = maintennaceCorrective?.map((item) => ({
    id: item.id, // 👈 Ajoute ceci !
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
  }));

  const filteredCorrectiveMaintenances = rows?.filter((maintenance) =>
    maintenance.description?.toLowerCase().includes(search.toLowerCase()) ||
    maintenance.equipmentName?.toLowerCase().includes(search.toLowerCase()) ||
    maintenance.status?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: 'serialCode', headerName: 'Code Série', width: 150 },
    { field: 'description', headerName: 'Description', width: 180 },
    { field: 'status', headerName: 'Statut', width: 120 },
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
        state: { maintenance: params }
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
            equipmentId: params.row.equipmentId ,incidentId: params.row.incidentId , resolutionDetails: params.row.resolutionDetails
          }
      })
    }
  >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
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
    <div style={{ display: "flex" }}>
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
            data={filteredCorrectiveMaintenances || []}
            headers={headers}
            filename="maintenance_corrective.csv"
            separator=";"
          >
            <Button variant="outlined" color="primary">
              Exporter CSV
            </Button>
          </CSVLink>
        </Box>

        <DataGrid
          style={{ marginLeft: '-4%' }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderRight: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            },
            '& .left-align-cell': {
              justifyContent: 'flex-start !important',
              textAlign: 'left !important',
            },
            '& .MuiDataGrid-row': {
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            }
          }}
          rows={filteredCorrectiveMaintenances || []}
          columns={columns}
          pageSize={5}
          getRowId={(row) => row.id}
          autoHeight
          loading={isLoading}
        />

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
