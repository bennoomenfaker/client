import { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Button, TextField, InputAdornment, Box, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useDispatch, useSelector } from "react-redux";
import { fetchEquipmentsByHospital, deleteEquipment } from "../../redux/slices/equipmentSlice";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { fetchServicesByHospitalId } from "../../redux/slices/hospitalServiceSlice";
import { CSVLink } from "react-csv";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { toast } from "react-toastify";
import ReportIcon from "@mui/icons-material/Report"; 



const ManageEquipmentConsultListEquipment = () => {
  // eslint-disable-next-line no-unused-vars
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

  useEffect(() => {
    dispatch(fetchEquipmentsByHospital(hospitalId));
    dispatch(fetchServicesByHospitalId(hospitalId));
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
    { field: "serialCode", headerName: "Code Série", width: 150 },
    { field: "nom", headerName: "Nom", width: 200 , cellClassName: 'left-align-cell' },
    { field: "supplier", headerName: "Fournisseur", width: 140 },
    { field: "riskClass", headerName: "Classe de Risque", width: 125 },
    { field: "amount", headerName: "Montant (dt)", width: 120, type: "number" },
    { field: "lifespan", headerName: "Durée de vie (ans)", width: 110, type: "number" },
    {
      field: "status",
      headerName: "Statut",
      width: 140,
      renderCell: (params) => {
        const statusColors = {
          "en attente de réception": "gray",
          "en service": "green",
          "en panne": "red",
          "en maintenance": "orange",
          "hors service": "darkred"
        };
        return <div style={{ color: statusColors[params.value] || "black" }}>{params.value}</div>;
      },
    },
    {
      
        field: "actions",
        headerName: "Actions",
        width: 310,
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
      
            <Tooltip title="Transfert Inter-Hôpital">
              <IconButton onClick={() => navigate(`/manage-equipment/transferEquipmentInterHospital/${params.row.id}`, { state: params.row })}>
                <CompareArrowsIcon color="secondary" />
              </IconButton>
            </Tooltip>
      
            <Tooltip title="Signaler une panne">
              <IconButton onClick={() => navigate(`/manage-incident/reportIncident/equipment/serialCode/${params.row.serialCode}/equipmentId/${params.row.id}`)}>
                <ReportIcon color="error" />
              </IconButton>
            </Tooltip>
          </>
        ),
      }
      
  ];

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: "90%", padding: "20px", marginTop: 50 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 , ml:-6 }}>
          {/* Bouton Ajouter un équipement */}
          {role !== "ROLE_SERVICE_SUPERVISOR" && (
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => navigate("/manage-equipments/add-new-equipment-to-hospital")}
          >
            Ajouter un équipement
          </Button>
          )}

          {/*  Supprimer le Select si ROLE_SERVICE_SUPERVISOR */}
          {role !== "ROLE_SERVICE_SUPERVISOR" && (
            <Select value={selectedService} onChange={handleServiceChange} displayEmpty>
              <MenuItem value=""><em>Sélectionner un service</em></MenuItem>
              {servicesByHospital.map((service) => (
                <MenuItem key={service.id} value={service.id}>{service.name}</MenuItem>
              ))}
            </Select>
          )}

          {/* Champ de recherche */}
          <TextField
            label="Rechercher un équipement"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            width="100%"
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />

          {/* Bouton Export CSV */}
          <CSVLink data={filteredEquipments} headers={[
            { label: "Code Série", key: "serialCode" },
            { label: "Nom", key: "nom" },
            { label: "Fournisseur", key: "supplier" },
            { label: "Classe de Risque", key: "riskClass" },
            { label: "Montant (dt)", key: "amount" },
            { label: "Durée de vie (ans)", key: "lifespan" },
            { label: "Statut", key: "status" },
          ]} filename="equipements.csv">
            <Button variant="outlined" color="primary">Exporter CSV</Button>
          </CSVLink>
      

        </Box>
        <DataGrid style={{marginLeft:'-4%'}} sx={{ '& .MuiDataGrid-cell': {
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
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)', // optionnel : ligne horizontale entre les lignes
    }}} rows={filteredEquipments} columns={columns} pageSize={5} getRowId={(row) => row.id} autoHeight />



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
