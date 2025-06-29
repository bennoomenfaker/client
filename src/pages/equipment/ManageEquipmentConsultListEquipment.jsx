/* eslint-disable no-unused-vars */
import  React,{ useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Button, TextField, InputAdornment, Box, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip , CircularProgress, Chip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { fetchEquipmentsByHospital, deleteEquipment } from "../../redux/slices/equipmentSlice";
import { useNavigate } from "react-router-dom";
import { fetchServicesByHospitalId } from "../../redux/slices/hospitalServiceSlice";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { toast } from "react-toastify";
import ReportIcon from "@mui/icons-material/Report"; 
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ErrorIcon from '@mui/icons-material/Error'; // Pour "en maintenance"
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Pour "en service"
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn'; // Suggestion pour "hors service"
import HourglassTopIcon from '@mui/icons-material/HourglassTop'; // Suggestion pour "en attente"
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Pour les statuts inconnus
import NavBar from "../../components/NavBar";
import  SearchIcon from "@mui/icons-material/Search";
import EditIcon  from"@mui/icons-material/Edit";


const ManageEquipmentConsultListEquipment = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const equipments = useSelector((state) => state.equipment.equipmentList);
  const servicesByHospital = useSelector((state) => state.hospitalService.serviceByHospital);


  const hospitalId = sessionStorage.getItem("hospitalId");
  const role = sessionStorage.getItem("role");
  const userServiceId = sessionStorage.getItem("serviceId"); // Service ID du superviseur
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const isLoading = useSelector((state=>state.equipment.isLoading))
  

    useEffect(() => {
      const loadEquipments = async () => {
        try {
           await     dispatch(fetchEquipmentsByHospital(hospitalId));
          await  dispatch(fetchServicesByHospitalId(hospitalId));
          
        } catch (err) {
          toast.error("Erreur lors du chargement des équipements.");
        }
      };
  
      loadEquipments();
    }, [dispatch, hospitalId]);

  const handleServiceChange = (e) => setSelectedService(e.target.value);

  const handleDelete = (id) => {
    setSelectedEquipmentId(id);
    setOpenDialog(true);
  };

  const confirmDelete = () => {
    dispatch(deleteEquipment(selectedEquipmentId))
      .then(() => toast.success("L'équipement a été supprimé avec succès !"))
      .catch(() => toast.error("Une erreur est survenue lors de la suppression."));
    setOpenDialog(false);
  };

 // **🔍 Filtrage des équipements selon le rôle et la recherche**
let filteredEquipments = equipments.filter((equipment) => {
  // Garde la recherche insensible à la casse
  const searchTerm = search.toLowerCase();

  // Condition de recherche générale (renvoie true si l'un des champs correspond)
  const matchesSearch = 
    equipment.nom.toLowerCase().includes(searchTerm) ||
    equipment.status.toLowerCase().includes(searchTerm) ||
    equipment.serialCode.toLowerCase().includes(searchTerm) ||
    
    // --- AJOUTS ---
    // 1. Recherche par nom du fournisseur (avec vérification que `supplier` existe)
    (equipment.supplier?.name || '').toLowerCase().includes(searchTerm) ||
    
    // 2. Recherche par durée de vie (convertie en texte)
    String(equipment.lifespan).includes(searchTerm) ||

    // 3. Recherche par montant (converti en texte)
    String(equipment.amount).includes(searchTerm);
    
  // Combinaison de tous les filtres
  return (
    (role === "ROLE_SERVICE_SUPERVISOR" ? equipment.serviceId === userServiceId : true) &&
    (selectedService === "" || equipment.serviceId === selectedService) &&
    matchesSearch // On utilise notre condition de recherche ici
  );
});


// La fonction qui génère le Chip
const renderStatusChipEquip = (status) => {
  // Si le statut est vide ou non défini, on ne rend rien ou un chip par défaut
  if (!status) {
    return <Chip label="Indéfini" size="small" />;
  }
  
  const normalizedStatus = status.toLowerCase();

  // Mapping pour les couleurs et les styles
  const statusConfig = {
    "en panne": { 
      label: "En Panne", 
      icon: <ReportIcon />,
      // CORRECTION : On utilise les couleurs du thème "error"
      sx: {
        borderColor: 'error.main', // Bordure avec la couleur principale "error"
        color: 'error.main',       // Texte avec la couleur principale "error"
        backgroundColor: 'rgba(211, 47, 47, 0.1)' // Fond léger de la même couleur
      } 
    },
    "en maintenance": { 
      label: "En Maintenance", 
      icon: <ErrorIcon />,
       // On utilise les couleurs du thème "warning" pour la cohérence
      sx: { 
        borderColor: 'warning.main',
        color: 'warning.main',
        backgroundColor: 'rgba(237, 108, 2, 0.1)'
      }
    },
    "en service": { 
      label: "En Service", 
      icon: <CheckCircleIcon />,
      // CORRECTION : On utilise les couleurs du thème "success"
      sx: {
        borderColor: 'success.main', // Bordure avec la couleur principale "success"
        color: 'success.main',       // Texte avec la couleur principale "success"
        backgroundColor: 'rgba(46, 125, 50, 0.1)' // Fond léger de la même couleur
      }
    },
    "hors service": { 
      label: "Hors Service", 
      icon: <DoNotDisturbOnIcon />,
      sx: { 
        borderColor: '#757575',
        color: '#757575',
        backgroundColor: '#f0f0f0'
      }
    },
    "en attente de réception": { 
      label: "En Attente de réception", 
      icon: <HourglassTopIcon />,
      sx: { 
        borderColor: '#1976d2',
        color: '#1976d2',
        backgroundColor: '#e8f4fd'
      }
    },
    default: {
      label: status,
      icon: <HelpOutlineIcon />,
      sx: { 
        borderColor: 'grey',
        color: 'grey',
        backgroundColor: '#fafafa'
      }
    }
  };

  const config = statusConfig[normalizedStatus] || statusConfig.default;

  return (
    <Chip
      variant="outlined"
      size="small"
      icon={config.icon}
      label={config.label}
      sx={config.sx} 
    />
  );
};
 


 const columns = [
        // On utilise flex pour que les colonnes s'adaptent à l'espace disponible.
        // minWidth empêche les colonnes de devenir trop petites.
        { field: "serialCode", headerName: "N° Série", minWidth: 110, flex: 0.8 },
        { field: "nom", headerName: "Nom", minWidth: 180, flex: 1.5 },
        {
            field: "supplier",
            headerName: "Fournisseur",
            minWidth: 120,
            flex: 1,
      renderCell: (params) => {

 const supplier = params.value; // c'est l'objet complet supplier
return supplier ? supplier.name : "Non renseigné";
}

},
        { field: "riskClass", headerName: "Risque", minWidth: 70, flex: 0.5 },
        { field: "amount", headerName: "Montant", minWidth: 100, flex: 0.7, type: "number" },
        { field: "lifespan", headerName: "Vie (ans)", minWidth: 80, flex: 0.6, type: "number" },
        {
            field: "brand", headerName: "Marque", minWidth: 100, flex: 0.8,
renderCell: (params) => { const brand = params.value;
return brand ? brand.name : "Non renseigné";

 }        },
        {
            field: "fromMinistere",
            headerName: "Origine",
            minWidth: 90,
            flex: 0.7,
            renderCell: (params) => (
                <Chip 
                    label={params.value ? "Ministère" : "Hôpital"} 
                    size="small"
                    color={params.value ? "success" : "info"}
                    variant="outlined"
                />
            )
        },
        {
            field: "status",
            headerName: "Statut",
            minWidth: 130,
            flex: 1,
            renderCell: (params) => renderStatusChipEquip(params.value),
            align: 'center',
            headerAlign: 'center',
        },
        {
      
        field: "actions",
        headerName: "Actions",
        width: 260,
        renderCell: (params) => (
          <>
            <Tooltip title="Consulter l'équipement">
              <IconButton onClick={() => navigate(`/manage-equipment/consult-equipment/${params.row.serialCode}`)}>
                <VisibilityIcon color="primary" />
              </IconButton>
            </Tooltip>
      
            {role !== "ROLE_SERVICE_SUPERVISOR" && (
              <Tooltip title="Modifier l'équipement">
                <IconButton onClick={() => navigate(`/manage-equipment/update-equipment/${params.row.serialCode}`)}>
                  <EditIcon color="warning" />
                </IconButton>
              </Tooltip>
            )}
      
            {role !== "ROLE_SERVICE_SUPERVISOR" && (
              <Tooltip title="Supprimer l'équipement">
                <IconButton onClick={() => handleDelete(params.row.id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </Tooltip>
            )}
      
            <Tooltip title="Transfert Inter-Service">
              <IconButton onClick={() => navigate(`/manage-equipment/transferEquipmentInterService/${params.row.id}`, { state: params.row })}>
                <SwapHorizIcon color="info" />
              </IconButton>
            </Tooltip>
            {role !== "ROLE_SERVICE_SUPERVISOR" && (
            <Tooltip title="Transfert Inter-Hôpital">
              <IconButton onClick={() => navigate(`/manage-equipment/transferEquipmentInterHospital/${params.row.id}`, { state: params.row })}>
                <CompareArrowsIcon color="secondary" />
              </IconButton>
            </Tooltip>)}
      
            <Tooltip title="Signaler une panne">
              <IconButton onClick={() => navigate(`/manage-incident/reportIncident/equipment/serialCode/${params.row.serialCode}/equipmentId/${params.row.id}`)}>
                <ReportIcon color="error" />
              </IconButton>
            </Tooltip>
          </>
        ),
      }
      
  ];
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredEquipments);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'equipment.xlsx');
  };


  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen}  style={{display: 'flex', flexDirection: 'row'}}/>
      <div style={{ width: '90%', padding: '10px', marginTop: 60 }}>
    <Box
  sx={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    mb: 2,
    width: '105.5%',
    marginLeft:'-5%'
  
  }}
>
  {/* Ajouter un équipement */}
  {role !== "ROLE_SERVICE_SUPERVISOR" && (
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Button
        fullWidth
        variant="contained"
        color="success"
        startIcon={<AddIcon />}
        onClick={() => navigate("/manage-equipments/add-new-equipment-to-hospital")}
        sx={{ height: '56px' }}
      >
        Ajouter un équipement
      </Button>
    </Box>
  )}

  {/* Select Service */}
  {role !== "ROLE_SERVICE_SUPERVISOR" && (
    <Box sx={{ flex: 1, minWidth: 200 }}>
      <Select
        value={selectedService}
        onChange={handleServiceChange}
        displayEmpty
        fullWidth
        sx={{ height: '56px' }}
      >
        <MenuItem value="">
          <em>Sélectionner un service</em>
        </MenuItem>
        {servicesByHospital.map((service) => (
          <MenuItem key={service.id} value={service.id}>
            {service.name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  )}

  {/* Champ de recherche */}
  <Box sx={{ flex: 2, minWidth: 250 }}>
    <TextField
      fullWidth
      label="Rechercher un équipement"
      variant="outlined"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      sx={{ height: '56px' }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  </Box>

  {/* Export Excel */}
  <Box sx={{ flex: 1, minWidth: 180 }}>
    <Button
      fullWidth
      variant="outlined"
      color="primary"
      onClick={exportToExcel}
      sx={{ height: '56px' }}
    >
      Exporter Excel
    </Button>
  </Box>
</Box>

                <div style={{ height: 470, width: "105.4%" , marginLeft:"-5%"}}>

 <DataGrid
  rows={filteredEquipments}
  columns={columns}
  paginationMode="client"
  pageSize={5}
  disableSelectionOnClick
  loading={isLoading}
  sx={{
    width: '100%',
    '& .MuiDataGrid-root': {
      maxWidth: '100%',
    },
    '& .MuiDataGrid-cell': {
      borderRight: '1px solid rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      fontSize: '0.75rem',
      padding: '2px 6px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontWeight:'bold',
    },
    '& .MuiDataGrid-columnHeaders': {
      fontSize: '0.75rem',
      height: 36,
      whiteSpace: 'normal',
      lineHeight: 1.3,
      textAlign: 'center',
    },
    '& .MuiDataGrid-row': {
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    },
  }}
/>


</div>

        {/* Dialog de confirmation de suppression */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirmation de Suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer cet équipement ? Cette action entraînera la suppression de toutes les pièces de rechange et du plan de maintenance associé.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">Annuler</Button>
            <Button onClick={confirmDelete} color="error">Supprimer</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageEquipmentConsultListEquipment;
