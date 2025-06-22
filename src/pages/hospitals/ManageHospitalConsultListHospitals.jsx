import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { DataGrid } from "@mui/x-data-grid";
import { Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Box, Paper } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { deleteHospital, fetchHospitals } from "../../redux/slices/hospitalSlice";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Add as AddIcon} from "@mui/icons-material";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv"; // Importation du package CSVLink pour l'exportation en CSV
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const ManageHospitalConsultListHospitals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hospitals = useSelector((state) => state.hospital.hospitals);
  const [search, setSearch] = useState("");
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [sortModel, setSortModel] = useState([{ field: 'name', sort: 'asc' }]);

  useEffect(() => {
    if (hospitals.length === 0) {
      dispatch(fetchHospitals());
    } else {
      setFilteredHospitals(hospitals);
    }
  }, [dispatch, hospitals]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    filterHospitals(value);
  };

  const filterHospitals = (searchTerm) => {
    if (!searchTerm) {
      setFilteredHospitals(hospitals);
    } else {
      const filtered = hospitals.filter(
        (hospital) =>
          hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hospital.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hospital.phoneNumber.includes(searchTerm) ||
          hospital.email.includes(searchTerm)
      );
      setFilteredHospitals(filtered);
    }
  };

  const handleDelete = (id) => {
    setOpenDialog(true);
    setSelectedHospital(id);
  };

  const confirmDelete = () => {
    dispatch(deleteHospital(selectedHospital));
    setOpenDialog(false);
    toast.success("Hôpital supprimé avec succès !");
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1, sortable: true },
    { field: 'address', headerName: 'Address', flex: 1, sortable: true },
    { field: 'phoneNumber', headerName: 'Phone', flex: 1, sortable: true },
    { field: 'email', headerName: 'Email', flex: 1, sortable: true },
    {
      field: 'gouvernorat',
      headerName: 'Gouvernorat',
      flex: 1,
      sortable: true,
      valueGetter: (params) => params.nom,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      renderCell: (params) => (
        <div>
          <IconButton onClick={() => navigate(`/manage-hospitals/consult-hospital-details/${params.id}`)}>
            <VisibilityIcon color="primary" />
          </IconButton>
          <IconButton onClick={() => navigate(`/manage-hospitals/update-hospital/${params.id}`)}>
            <EditIcon color="warning" />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.id)}>
            <DeleteIcon color="error" />
          </IconButton>
        </div>
      ),
      sortable: false,
      width: 150,
    },
  ];

  const rows = filteredHospitals.map(hospital => ({
    ...hospital,
    id: hospital.id,
    gouvernorat: hospital.gouvernorat || { nom: "Non spécifié" },
  }));

  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
    const sortedRows = [...filteredHospitals];
    const { field, sort } = newSortModel[0];

    sortedRows.sort((a, b) => {
      if (a[field] < b[field]) return sort === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return sort === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredHospitals(sortedRows);
  };
      const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'hopitaux.xlsx');
      };

  return (
  <div style={{ display: "flex" }}>
  <NavBar onToggle={() => { }} />

  <div style={{ width: "100%", padding: "20px", marginTop: 50 }}>
    {/* Barre supérieure : Nouveau + Rechercher + Export */}
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      {/* Gauche : Créer */}
      <Button
        variant="contained"
        color="success"
        onClick={() => navigate("/manage-hospitals/create-new-hospital")}
        startIcon={<AddIcon />}
        sx={{
          textTransform: "none",
          fontWeight: "bold",
          padding: "8px 16px",
          borderRadius: "8px",
          boxShadow: 2,
        }}
      >
        Créer un hôpital
      </Button>

      {/* Centre : Recherche */}
      <TextField
        label="Rechercher un hôpital"
        variant="outlined"
        value={search}
        onChange={handleSearchChange}
        placeholder="Nom ou localisation..."
        sx={{
          flexGrow: 1,
          minWidth: 250,
          maxWidth: 400,
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: 1,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Droite : Export */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <CSVLink
          data={rows}
          headers={columns.map((col) => ({
            label: col.headerName,
            key: col.field,
          }))}
          filename="hospitals_list.csv"
          style={{ textDecoration: "none" }}
        >
          <Button variant="outlined" color="primary">
            Exporter CSV
          </Button>
        </CSVLink>

        <Button variant="outlined" color="primary" onClick={exportToExcel}>
          Exporter Excel
        </Button>
      </Box>
    </Box>

    {/* Tableau des hôpitaux */}
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        onPageSizeChange={(newPageSize) => setRowsPerPage(newPageSize)}
        page={page}
        onPageChange={(newPage) => setPage(newPage)}
        sortingOrder={["asc", "desc"]}
        sortModel={sortModel}
        onSortModelChange={handleSortModelChange}
        autoHeight
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f0f8ff',
          },
        }}
      />
    </Paper>
  </div>

  {/* Modal de confirmation */}
  <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
    <DialogTitle>Confirmation</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Voulez-vous désactiver cet hôpital ?
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

  );
};

export default ManageHospitalConsultListHospitals;
