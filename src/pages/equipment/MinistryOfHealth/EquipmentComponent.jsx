import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNonReceivedEquipment , fetchEquipmentsByHospital } from "../../../redux/slices/equipmentSlice";
import NavBar from "../../../components/NavBar";
import { Box, Button, TextField, InputAdornment, Grid, IconButton, CircularProgress, Chip } from "@mui/material";
import { Search as SearchIcon, Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { CSVLink } from "react-csv"; // Importation du package CSVLink pour l'exportation en CSV
import { useNavigate } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { fetchHospitals } from "../../../redux/slices/hospitalSlice";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// Importez les icônes que vous utilisez
import ReportIcon from '@mui/icons-material/Report'; // Pour "en panne"
import ErrorIcon from '@mui/icons-material/Error'; // Pour "en maintenance"
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Pour "en service"
import DoNotDisturbOnIcon from '@mui/icons-material/DoNotDisturbOn'; // Suggestion pour "hors service"
import HourglassTopIcon from '@mui/icons-material/HourglassTop'; // Suggestion pour "en attente"
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // Pour les statuts inconnus



const EquipmentComponent = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedHospitalId, setSelectedHospitalId] = useState("");


  // Récupérer les équipements non réceptionnés depuis Redux
  const { nonReceivedEquipment, isLoading , equipmentList  } = useSelector((state) => state.equipment);//equipmentList c'est le state of list fetchEquipmentByHospitals
  const { hospitals  } = useSelector((state) => state.hospital);


  // États pour la recherche et la suppression
  const [search, setSearch] = useState("");
  const [filteredEquipment, setFilteredEquipment] = useState([]);

  // Charger les équipements non réceptionnés au montage du composant
  useEffect(() => {
     dispatch(fetchHospitals())
    if (selectedHospitalId) {
      dispatch(fetchEquipmentsByHospital(selectedHospitalId));
    } else {
      dispatch(fetchNonReceivedEquipment());
    }
  }, [dispatch, selectedHospitalId]);
  


  // Filtrer les équipements en fonction de la recherche
  useEffect(() => {
    const sourceData = selectedHospitalId ? equipmentList : nonReceivedEquipment;
    setFilteredEquipment(
      sourceData.filter((equipment) =>
        (
          (equipment.nom?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (equipment.serialCode?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (equipment.status?.toLowerCase() || "").includes(search.toLowerCase())
        )
      )
    );
  }, [search, nonReceivedEquipment, equipmentList, selectedHospitalId]);
  
// 1. La fonction qui génère le Chip
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
      sx: { borderColor: '#d32f2f', color: '#d32f2f', backgroundColor: '#fdecea' } 
    },
    "en maintenance": { 
      label: "En Maintenance", 
      icon: <ErrorIcon />,
      sx: { borderColor: '#ed6c02', color: '#ed6c02', backgroundColor: '#fff4e5' }
    },
    "en service": { 
      label: "En Service", 
      icon: <CheckCircleIcon />,
      sx: { borderColor: '#2e7d32', color: '#2e7d32', backgroundColor: '#ebf9eb' }
    },
    "hors service": { 
      label: "Hors Service", 
      icon: <DoNotDisturbOnIcon />,
      sx: { borderColor: '#757575', color: '#757575', backgroundColor: '#f0f0f0' }
    },
    "en attente de réception": { 
      label: "En Attente", 
      icon: <HourglassTopIcon />,
      sx: { borderColor: '#1976d2', color: '#1976d2', backgroundColor: '#e8f4fd' }
    },
    // AMÉLIORATION : Un cas par défaut pour les statuts imprévus
    default: {
      label: status,
      icon: <HelpOutlineIcon />,
      sx: { borderColor: 'grey', color: 'grey', backgroundColor: '#fafafa' }
    }
  };

  const config = statusConfig[normalizedStatus] || statusConfig.default;
   return (
    <Chip
      variant="outlined"
      size="small"
      icon={config.icon}
      label={config.label}
      sx={config.sx} // On utilise la propriété `sx` pour le style dynamique
    />
  );
};
  // Gérer la recherche
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  if (isLoading) {
    return (
      <>
        <NavBar />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <CircularProgress />
        </Box>
      </>
    );
  }
  
  // Colonnes pour la DataGrid
  const columns = [
    {
      field: "nom",
      headerName: "Nom de l'équipement",
      flex: 1,
      sortable: true,
      filterable: true,
    },
    {
      field: "serialCode",
      headerName: "Numéro de série",
      flex: 1,
      sortable: true,
    },
 {
    field: "status",
    headerName: "Statut",
    flex: 1,
    // CORRECTION : On passe directement `params.value` à la fonction de rendu
    renderCell: (params) => renderStatusChipEquip(params.value),
  },
    
    {
      field: "lifespan",
      headerName: "Durée de vie",
      flex: 1,
      sortable: true,
    },
    {
      field: "riskClass",
      headerName: "Classe de risque",
      flex: 1,
      sortable: true,
    },{
  field: "fromMinistere",
  headerName: "Origine",
  width: 150,
 renderCell: (params) => (
  <span style={{ color: params.value ? "green" : "blue", fontWeight: "bold" }}>
    {params.value ? "Ministère de santé" : "Fournisseur"}
  </span>
)

},

   
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => navigate(`/manage-equipment/consult-equipment/${params.row.serialCode}`)}
            startIcon={<VisibilityIcon />} // Remplacez EditIcon par VisibilityIcon
            color="primary"
            style={{ marginRight: "10px" }}
          >
             <VisibilityIcon color="primary" />
             </IconButton>
          <IconButton
            onClick={() => navigate(`/manage-equipment/update-equipment/${params.row.serialCode}`)}
            startIcon={<EditIcon />}
            color="warning"
            style={{ marginRight: "10px" }}
          >
             <EditIcon color="warning" />
          </IconButton>
        
        </>
      ),
      width: 300,
    },
  ];
    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(filteredEquipment);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'equipement.xlsx');
    };

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)", transition: "width 0.3s ease", padding: "20px", marginTop: 50 }}>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => navigate("/manage-equipment/create-new-equipment")}
              >
                Ajouter un équipement
              </Button>
            </Grid>
            <Grid item>
  <TextField
    select
    label=""
    value={selectedHospitalId}
    onChange={(e) => setSelectedHospitalId(e.target.value)}
    fullWidth
    SelectProps={{ native: true }}
  >
              <option value="">Équipements non réceptionnés</option>

    {hospitals.map((hosp) => (
         <>

<option key={hosp.id} value={hosp.id}>
  {hosp.name}
</option></>
    ))}
  </TextField>
</Grid>


            <Grid item>
              <CSVLink
                data={filteredEquipment}
                headers={[
                  { label: "Nom de l'équipement", key: "nom" },
                  { label: "Numéro de série", key: "serialCode" },
                  { label: "Statut", key: "status" },
                  { label: "Durée de vie", key: "lifeSpan" },
                  { label: "Classe de risque", key: "riskClass" },
                  { label: "Nom de l'hôpital", key: "hospitalName" },
                ]}
                filename="equipements_non_receptionnes.csv"
                style={{ textDecoration: "none" }}
              >
                <Button variant="outlined" color="primary">
                  Exporter CSV
                </Button>
              </CSVLink>
               <Button variant="outlined" color="primary" onClick={() => exportToExcel()}>
                            Exporter Excel
                          </Button>
              
            </Grid>

            <Grid item xs>
              <TextField
                label="Rechercher un équipement"
                variant="outlined"
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>

        <div style={{ height: 470, width: "100%" }}>
          <DataGrid
            rows={filteredEquipment}
            columns={columns}
            checkboxSelection
            disableSelectionOnClick
            loading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default EquipmentComponent;
