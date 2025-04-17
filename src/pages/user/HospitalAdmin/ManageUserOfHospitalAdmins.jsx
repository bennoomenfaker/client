import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavBar from "../../../components/NavBar";
import { getUsersByHospitalId, getUsersByServiceIdAndHospitalId, deleteUser } from "../../../redux/slices/userSlice";
import { fetchServicesByHospitalId } from "../../../redux/slices/hospitalServiceSlice";
import { TextField, Button, Select, MenuItem, Box, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputAdornment } from "@mui/material";
import { PersonAdd, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { CSVLink } from "react-csv";

const ManageUserOfHospitalAdmins = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const hospitalUsers = useSelector((state) => state.user.usersByHospital);
  const servicesByHospital = useSelector((state) => state.hospitalService.serviceByHospital);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedService, setSelectedService] = useState("");
  const [view, setView] = useState("all");
  const [isNavOpen, setIsNavOpen] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedHospital = sessionStorage.getItem("hospitalId");
      if (storedHospital) {
        await dispatch(getUsersByHospitalId(storedHospital));
        await dispatch(fetchServicesByHospitalId(storedHospital));
      }
    };
    fetchUserData();
  }, [dispatch]);

  useEffect(() => {
    if (view === "all") {
      setFilteredUsers(hospitalUsers);
    } else if (view === "hospitalService") {
      setFilteredUsers(hospitalUsers.filter(user => user.serviceId === selectedService));
    }
  }, [hospitalUsers, selectedService, view]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    filterUsers(value);
  };

  const filterUsers = (searchTerm) => {
    if (!searchTerm) {
      setFilteredUsers(hospitalUsers);
    } else {
      const filtered = hospitalUsers.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.telephone.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  };

  const handleDelete = (id) => {
    setOpenDialog(true);
    setSelectedUser(id);
  };

  const confirmDelete = () => {
    dispatch(deleteUser(selectedUser));
    setOpenDialog(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setSelectedService(serviceId);
    if (serviceId) {
      setView("hospitalService");
      dispatch(getUsersByServiceIdAndHospitalId({ hospitalId: sessionStorage.getItem("hospitalId"), serviceId }));
    } else {
      setView("all");
      dispatch(getUsersByHospitalId(sessionStorage.getItem("hospitalId")));
    }
  };

  const getRoleDisplayName = (role) => {
    const roleMapping = {
      ROLE_MINISTRY_ADMIN: "Ministère de santé",
      ROLE_HOSPITAL_ADMIN: "Administrateur de l'hôpital",
      ROLE_SERVICE_SUPERVISOR: "Surveillance de service",
      ROLE_MAINTENANCE_ENGINEER: "Ingénieur maintenance",
      ROLE_MAINTENANCE_COMPANY: "Société de maintenance",
    };
    return roleMapping[role] || "Utilisateur";
  };

  const handleCreate = () => {
    navigate("/manage-users/create-new-user");
  };

  const columns = [
    { field: 'firstName', headerName: 'Prénom', width: 140, sortable: true, headerAlign: 'center', align: 'center', headerClassName: 'header-cell', cellClassName: 'cell' },
    { field: 'lastName', headerName: 'Nom', width: 170, sortable: true, headerAlign: 'center', align: 'center', headerClassName: 'header-cell', cellClassName: 'cell' },
    { field: 'email', headerName: 'Email', width: 270, sortable: true, headerAlign: 'center', align: 'center', headerClassName: 'header-cell', cellClassName: 'cell' },
    { field: 'telephone', headerName: 'Téléphone', width: 100, sortable: true, headerAlign: 'center', align: 'center', headerClassName: 'header-cell', cellClassName: 'cell' },
    {
      field: 'service', headerName: 'Service', width: 180, headerAlign: 'center', align: 'center', headerClassName: 'header-cell', cellClassName: 'cell',
      renderCell: (params) => {
        const service = servicesByHospital.find(service => service.id === params.row.serviceId);
        return service ? service.name : "N/A";
      },
    },
    {
      field: 'role', headerName: 'Role', width: 190, headerAlign: 'center', align: 'center', headerClassName: 'header-cell', cellClassName: 'cell',
      renderCell: (params) => {
        if (params.row.role && params.row.role.name) {
          const roleName = getRoleDisplayName(params.row.role.name);
          let color = 'inherit';
          if (params.row.role.name === 'ROLE_MAINTENANCE_COMPANY') {
            color = 'blue';
          } else if (params.row.role.name === 'ROLE_HOSPITAL_ADMIN') {
            color = 'green';
          }
          return <span style={{ color }}>{roleName}</span>;
        } else {
          return "N/A";
        }
      },
    },
    {
      field: 'actions', headerName: 'Actions', width: 80, headerAlign: 'center', align: 'center', headerClassName: 'header-cell', cellClassName: 'cell',
      renderCell: (params) => (
        <>
          <IconButton onClick={() => navigate(`/manage-users/modify-user/${params.row.id}`)} style={{ padding: '5px' }}>
            <EditIcon color="warning" style={{ fontSize: '18px' }} />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)} style={{ padding: '5px' }}>
            <DeleteIcon color="error" style={{ fontSize: '18px' }} />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", justifyContent: 'center' }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)", transition: "width 0.3s ease", padding: "20px", marginTop: 50, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, width: '100%',ml:'-15%' }}>
          <Button variant="contained" color="success" startIcon={<PersonAdd />} onClick={handleCreate} sx={{ fontSize: '10px', padding: '1%', fontWeight: 'bold', marginRight: '10px' }}>
            Créer un utilisateur
          </Button>
          <Select
            value={selectedService}
            onChange={handleServiceChange}
            displayEmpty
            sx={{ width: "300px", mr: 2 }}
          >
            <MenuItem value="">Sélectionner un service</MenuItem>
            {servicesByHospital.map((service) => (
              <MenuItem key={service.id} value={service.id}>{service.name}</MenuItem>
            ))}
          </Select>
          <TextField
            label="Rechercher un utilisateur"
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
            sx={{ width: "40%" , mr:2 }}
          />
          <CSVLink
            data={filteredUsers}
            headers={[
              { label: "Prénom", key: "firstName" },
              { label: "Nom", key: "lastName" },
              { label: "Email", key: "email" },
              { label: "Téléphone", key: "telephone" },
              { label: "Service", key: "service" }
            ]}
            filename="utilisateurs.csv"
            style={{ textDecoration: "none" }}
          >
            <Button variant="contained" color="primary">Exporter CSV</Button>
          </CSVLink>
        </Box>

        <div style={{ height: 460, width: "100%",marginLeft:'-8%'}}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            pageSize={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            checkboxSelection
            disableSelectionOnClick
            page={page}
            onPageChange={handleChangePage}
            onPageSizeChange={handleChangeRowsPerPage}
          />
        </div>
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Voulez-vous désactiver cet utilisateur ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">Annuler</Button>
          <Button onClick={confirmDelete} color="secondary">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageUserOfHospitalAdmins;
