/* eslint-disable no-unused-vars */
import  React,{ useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Button, TextField, InputAdornment, Box, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip , CircularProgress } from "@mui/material";
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

const NavBar = React.lazy(() => import("../../components/NavBar"));
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

  // **🔍 Filtrage des équipements selon le rôle**
  let filteredEquipments = equipments.filter((equipment) =>
    (role === "ROLE_SERVICE_SUPERVISOR" ? equipment.serviceId === userServiceId : true) &&
    (selectedService === "" || equipment.serviceId === selectedService) &&
    (equipment.nom.toLowerCase().includes(search.toLowerCase()) ||
      equipment.serialCode.toLowerCase().includes(search.toLowerCase()))
  );
  const columns = [
    { field: "serialCode", headerName: "Code Série", width: 115 },
    { field: "nom", headerName: "Nom", width: 210 , cellClassName: 'left-align-cell' },
   {
  field: "supplier",
  headerName: "Fournisseur",
  width: 140,
  renderCell: (params) => {
    const supplier = params.value; // c'est l'objet complet supplier
    return supplier ? supplier.name : "Non renseigné";
  }
},

    { field: "riskClass", headerName: "Classe de Risque", width: 125 },
    { field: "amount", headerName: "Montant (dt)", width: 120, type: "number" },
    { field: "lifespan", headerName: "Durée de vie (ans)", width: 110, type: "number" },
{
  field: "fromMinistere",
  headerName: "Origine",
  width: 100,
 renderCell: (params) => (
  <span style={{ color: params.value ? "green" : "blue", fontWeight: "bold" }}>
    {params.value ? "Ministère" : "Fournisseur"}
  </span>
)

}
,
 {
      field: "status",
      headerName: "Statut",
      sortable: true,
      width: 100,
      renderCell: (params) => {
        const status = params.value?.toLowerCase();
    
        let color = "#ccc";
        let bgColor = "#eee";
    
        if (status === "en panne") {
          color = "#fff";
          bgColor = "#e53935"; // rouge
        } else if (status === "en service") {
          color = "#fff";
          bgColor = "#43a047"; // vert
        } else if (status === "en maintenance") {
          color = "#fff";
          bgColor = "#fb8c00"; // orange
        } else if (status === "hors service") {
          color = "#fff";
          bgColor = "#757575"; // gris foncé
        } else if (status === "en attente de réception") {
          color = "#fff";
          bgColor = "#1976d2"; // gris foncé
        }
    
        return (
            <span
              style={{
                padding: "6px 12px",
                borderRadius: "40px",
                backgroundColor: bgColor,
                color: color,
                fontWeight: "bold",
                textTransform: "capitalize",
                minWidth: "155px",  // largeur minimale uniforme
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
      <NavBar onToggle={setIsNavOpen} />
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
