import { useEffect, useState } from "react";
import NavBar from "../../components/NavBar";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteService,
  fetchServicesByHospitalId,
} from "../../redux/slices/hospitalServiceSlice";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { CSVLink } from "react-csv";

const ManageServiceConsultList = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const services = useSelector((state) => state.hospitalService.serviceByHospital);
  const hospitalId = sessionStorage.getItem("hospitalId");
  const [filteredServices, setFilteredServices] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [sortModel, setSortModel] = useState([{ field: "name", sort: "asc" }]);

  useEffect(() => {
    if (services.length === 0) {
      dispatch(fetchServicesByHospitalId(hospitalId));
    } else {
      setFilteredServices(services);
    }
  }, [dispatch, services, hospitalId]);

  useEffect(() => {
    const lowerCaseSearch = search.toLowerCase();
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(lowerCaseSearch) ||
        service.description.toLowerCase().includes(lowerCaseSearch)
    );
    setFilteredServices(filtered);
  }, [search, services]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleDelete = (id) => {
    setOpenDialog(true);
    setSelectedService(id);
  };

  const confirmDelete = () => {
    dispatch(deleteService(selectedService));
    setOpenDialog(false);
    toast.success("Service supprimé avec succès !");
  };

  const handleSortModelChange = (newSortModel) => {
    setSortModel(newSortModel);
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1, sortable: true },
    { field: "description", headerName: "Description", flex: 1, sortable: true  },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <div>
          
          
          <IconButton
            onClick={() => navigate(`/manage-service/update-service/${params.id}`)}
          >
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

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <div
        style={{
          width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)",
          transition: "width 0.3s ease",
          padding: "20px",
          marginTop: 50,
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            variant="contained"
            color="success"
            onClick={() => navigate("/manage-service/create-new-service")}
            startIcon={<AddIcon />}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              padding: "8px 16px",
              borderRadius: "8px",
              boxShadow: 2,
            }}
          >
            Créer un service
          </Button>

          <CSVLink
            data={filteredServices} // Utiliser les données filtrées
            headers={columns.map((col) => ({
              label: col.headerName,
              key: col.field,
            }))}
            filename={"services_list.csv"}
            className="btn btn-outline-success"
            style={{ textDecoration: "none" }}
          >
            <Button variant="contained" color="primary">
              Exporter CSV
            </Button>
          </CSVLink>

          <TextField
            label="Rechercher un service"
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
            sx={{
              width: "40%",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: 1,
            }}
          />
        </div>

        <div style={{ height: 450, width: "100%", marginTop: 20 }}>
          <DataGrid
            rows={filteredServices} // Utiliser les données filtrées
            columns={columns}
            pageSize={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            onPageSizeChange={(newPageSize) => setRowsPerPage(newPageSize)}
            page={page}
            onPageChange={(newPage) => setPage(newPage)}
            sortingOrder={["asc", "desc"]}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            getRowId={(row) => row.id} // Important pour DataGrid
          />
        </div>
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>Voulez-vous supprimer ce service ?</DialogContentText>
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

export default ManageServiceConsultList;