import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNonReceivedEquipment } from "../../../redux/slices/equipmentSlice";
import NavBar from "../../../components/NavBar";
import { Box, Button, TextField, InputAdornment, Grid, IconButton, CircularProgress } from "@mui/material";
import { Search as SearchIcon, Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { CSVLink } from "react-csv"; // Importation du package CSVLink pour l'exportation en CSV
import { useNavigate } from "react-router-dom";
import VisibilityIcon from '@mui/icons-material/Visibility';

const EquipmentComponent = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Récupérer les équipements non réceptionnés depuis Redux
  const { nonReceivedEquipment, isLoading } = useSelector((state) => state.equipment);

  // États pour la recherche et la suppression
  const [search, setSearch] = useState("");
  const [filteredEquipment, setFilteredEquipment] = useState([]);

  // Charger les équipements non réceptionnés au montage du composant
  useEffect(() => {
    dispatch(fetchNonReceivedEquipment());
  }, [dispatch]);



  // Filtrer les équipements en fonction de la recherche
  useEffect(() => {
    setFilteredEquipment(
      nonReceivedEquipment.filter((equipment) =>
      (
        (equipment.nom?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (equipment.serialCode?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (equipment.status?.toLowerCase() || "").includes(search.toLowerCase())
      )
      )
    );
  }, [nonReceivedEquipment, search]);

  // Gérer la recherche
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
    if (isLoading) {
            return (<>
                <NavBar/>
                 <CircularProgress />;
                </>)
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
      sortable: true,
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
                <Button variant="contained" color="primary">
                  Exporter CSV
                </Button>
              </CSVLink>
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
            pageSize={5}
            rowsPerPageOptions={[5, 10, 25]}
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
