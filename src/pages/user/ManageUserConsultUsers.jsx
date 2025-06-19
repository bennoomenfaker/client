import { useDispatch, useSelector } from "react-redux";
import NavBar from "../../components/NavBar";
import { useEffect, useState } from "react";
import { deleteUser, getUsers, getUsersGetHospitalsAdmin, getUsersByServiceIdAndHospitalId, getUsersByHospitalId } from "../../redux/slices/userSlice";
import { fetchHospitals, fetchHospitalById } from "../../redux/slices/hospitalSlice";
import { fetchServicesByHospitalId } from "../../redux/slices/hospitalServiceSlice";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, TablePagination, Paper, TableSortLabel, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Select, MenuItem, InputAdornment } from "@mui/material";
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { PersonAdd, AdminPanelSettings, Business, BusinessCenter } from "@mui/icons-material";


const ManageUserConsultUsers = () => {
  const adminUsers = useSelector((state) => state.user.hospitalsAdmins);
  const users = useSelector((state) => state.user.allUsers);
  const usersByHospital = useSelector((state) => state.user.usersByHospital);
  const usersByHospitalAndService = useSelector((state) => state.user.usersByServiceAndHospital);
  const hospitals = useSelector((state) => state.hospital.hospitals);
  const servicesByHospital = useSelector((state) => state.hospitalService.serviceByHospital);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [view, setView] = useState("admin"); // "admin", "hospital", "hospitalService"

  useEffect(() => {
    const fetchUserData = async () => {
      await dispatch(getUsersGetHospitalsAdmin());
      await dispatch(getUsers());
      await dispatch(fetchHospitals());
    };
    fetchUserData();
  }, [dispatch]);

  useEffect(() => {
    if (view === "admin") {
      setFilteredUsers(adminUsers);
    } else if (view === "hospital" && selectedHospital) {
      dispatch(getUsersByHospitalId(selectedHospital));
    } else if (view === "hospitalService" && selectedHospital && selectedService) {
      dispatch(getUsersByServiceIdAndHospitalId({ hospitalId: selectedHospital, serviceId: selectedService }));
    }
  }, [view, adminUsers, selectedHospital, selectedService, dispatch]);

  useEffect(() => {
    if (view === "admin") {
      setFilteredUsers(adminUsers);
    } else if (view === "hospital") {
      setFilteredUsers(usersByHospital);
    } else if (view === "hospitalService") {
      setFilteredUsers(usersByHospitalAndService);
    }
  }, [adminUsers, usersByHospital, usersByHospitalAndService, view]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    filterUsers(value);
  };

  const filterUsers = (searchTerm) => {
    const usersToFilter = view === "admin" ? adminUsers : (view === "hospital" ? usersByHospital : usersByHospitalAndService);
    if (!searchTerm) {
      setFilteredUsers(usersToFilter);
    } else {
      const filtered = usersToFilter.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.telephone.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (order === 'asc') {
      return a[orderBy] > b[orderBy] ? 1 : -1;
    } else {
      return a[orderBy] < b[orderBy] ? 1 : -1;
    }
  });

  const handleDelete = (id) => {
    setOpenDialog(true);
    setSelectedUser(id);
  };

  const confirmDelete = () => {
    dispatch(deleteUser(selectedUser));
    setOpenDialog(false);
  };

  const handleHospitalChange = (e) => {
    const hospitalId = e.target.value;
    setSelectedHospital(hospitalId);
    setSelectedService("");
    if (hospitalId) {
      dispatch(getUsersByHospitalId(hospitalId));
      dispatch(fetchServicesByHospitalId(hospitalId));
    } else {
      setFilteredUsers(view === "admin" ? adminUsers : users);
    }
  };

  useEffect(() => {
    const fetchHospitalsData = async () => {
      if (adminUsers) {
        // Vous pouvez itérer sur adminUsers pour récupérer chaque hôpital
        for (const user of adminUsers) {
          if (user.hospitalId) {
            // Récupérer l'hôpital correspondant
            await dispatch(fetchHospitalById(user.hospitalId));
          }
        }
      }
    };

    fetchHospitalsData();
  }, [adminUsers, dispatch]);


  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setSelectedService(serviceId);
    if (serviceId) {
      dispatch(getUsersByServiceIdAndHospitalId({ hospitalId: selectedHospital, serviceId }));
    } else if (selectedHospital) {
      dispatch(getUsersByHospitalId(selectedHospital));
    } else {
      setFilteredUsers(view === "admin" ? adminUsers : users);
    }
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setFilteredUsers(newView === "admin" ? adminUsers : (newView === "hospital" ? usersByHospital : usersByHospitalAndService));
  };

  const handleCreate = () => {
    navigate("/manage-users/create-new-user");
  }
  const [isNavOpen, setIsNavOpen] = useState(true); // Gérer la largeur

  const handleModifyUser = (user) => {
    navigate(`/manage-users/modify-user/${user.id}`, {
      state: { isAdmin: view === "admin" }, // Passe true si on est dans la vue "admin"
    });
  };

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)", transition: "width 0.3s ease", padding: "20px", marginTop: 50, alignItems: "center", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%%", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ display: "flex", gap: "2px", width: "60%", marginRight: "-3%" }}>
            <Button style={{ width: "250px", fontSize: "11px", padding: "1%" }} variant="contained" onClick={() => handleViewChange("admin")} startIcon={<AdminPanelSettings />}>Administrateurs</Button>
            <Button style={{ width: "250px", fontSize: "11px", padding: "1%" }} variant="contained" onClick={() => handleViewChange("hospital")} startIcon={<Business />}>Utilisateurs par Hôpital</Button>
            <Button style={{ width: "250px", fontSize: "11px", padding: "1%" }} variant="contained" onClick={() => handleViewChange("hospitalService")} startIcon={<BusinessCenter />}>Utilisateurs par Hôpital et Service</Button>
            <Button style={{ width: "250px", fontSize: "11px", padding: "1%" }} variant="contained" onClick={handleCreate} color="success" startIcon={<PersonAdd />}>Créer un utilisateur</Button>
          </div>
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
            sx={{
              width: "40%",
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: 1,
              marginLeft: "10%"
            }}
          />

        </div>
        {view !== "admin" && (
          <Select
            value={selectedHospital}
            onChange={handleHospitalChange}
            displayEmpty
            fullWidth
            sx={{ mb: 2, mt: 2 }}
          >
            <MenuItem value="">Sélectionner un hôpital</MenuItem>
            {hospitals.map((hospital) => (
              <MenuItem key={hospital.id} value={hospital.id}>{hospital.name}</MenuItem>
            ))}
          </Select>
        )}
        {view === "hospitalService" && (
          <Select
            value={selectedService}
            onChange={handleServiceChange}
            displayEmpty
            fullWidth
            sx={{ mb: 2 }}
            disabled={!selectedHospital}
          >
            <MenuItem value="">Sélectionner un service</MenuItem>
            {servicesByHospital.map((service) => (
              <MenuItem key={service.id} value={service.id}>{service.name}</MenuItem>
            ))}
          </Select>
        )}

        <TableContainer component={Paper} sx={{ width: "100%" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ddd" }}>
                  <TableSortLabel
                    active={orderBy === 'firstName'}
                    direction={orderBy === 'firstName' ? order : 'asc'}
                    onClick={() => handleSort('firstName')}
                  >
                    First Name
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ddd" }}>
                  <TableSortLabel
                    active={orderBy === 'lastName'}
                    direction={orderBy === 'lastName' ? order : 'asc'}
                    onClick={() => handleSort('lastName')}
                  >
                    Last Name
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ddd" }}>
                  <TableSortLabel
                    active={orderBy === 'email'}
                    direction={orderBy === 'email' ? order : 'asc'}
                    onClick={() => handleSort('email')}
                  >
                    Email
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ddd" }}>
                  <TableSortLabel
                    active={orderBy === 'telephone'}
                    direction={orderBy === 'telephone' ? order : 'asc'}
                    onClick={() => handleSort('telephone')}
                  >
                    Telephone
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ddd" }}>
                  Hôpital
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold", border: "1px solid #ddd" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{user.firstName}</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{user.lastName}</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{user.email}</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #ddd" }}>{user.telephone}</TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                      {hospitals.find(hospital => hospital.id === user.hospitalId)?.name || "N/A"}
                    </TableCell>
                    <TableCell align="center" sx={{ border: "1px solid #ddd" }}>
                      <IconButton onClick={() => navigate(`/manage-users/consult-user-details/${user.id}`)}>
                        <VisibilityIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleModifyUser(user)}>
                        <EditIcon color="warning" />
                      </IconButton>

                      <IconButton onClick={() => handleDelete(user.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>Voulez-vous désactiver ce utilisateur ?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">Annuler</Button>
          <Button onClick={confirmDelete} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageUserConsultUsers;