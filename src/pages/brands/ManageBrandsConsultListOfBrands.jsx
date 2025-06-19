import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBrandsByHospital, deleteBrand } from "../../redux/slices/brandsSlice";
import NavBar from "../../components/NavBar";
import { Box, Button, TextField, InputAdornment, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid } from "@mui/material";
import { Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { CSVLink } from "react-csv"; // Importation du package CSVLink pour l'exportation en CSV
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ManageBrandsConsultListOfBrands = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const hospitalId = sessionStorage.getItem("hospitalId");
  const brands = useSelector((state) => state.brand.brandList);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    if (hospitalId) {
      dispatch(fetchBrandsByHospital(hospitalId));
    }
  }, [dispatch, hospitalId]);

  useEffect(() => {
    setFilteredBrands(
      brands.filter(brand => brand.name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [brands, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleDeleteDialogOpen = (brand) => {
    setSelectedBrand(brand);
    setOpenDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setSelectedBrand(null);
    setOpenDialog(false);
  };

  const handleDeleteConfirm = () => {
    if (selectedBrand) {
      dispatch(deleteBrand(selectedBrand.id));
    }
    handleDeleteDialogClose();
  };

  const columns = [
    {
      field: "name",
      headerName: "Nom de la marque",
      flex: 1,
      sortable: true,
      filterable: true
    },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <>
          <Button
            onClick={() => navigate(`/manage-brands/update-brand/${params.row.id}`)}
            startIcon={<EditIcon />}
            color="warning"
            style={{ marginRight: "10px" }}
          >
            Modifier
          </Button>
          <Button
            onClick={() => handleDeleteDialogOpen(params.row)}
            startIcon={<DeleteIcon />}
            color="error"
          >
            Supprimer
          </Button>
        </>
      ),
      width: 300
    }
  ];
     const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filteredBrands);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, 'marques.xlsx');
      };

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)", transition: "width 0.3s ease", padding: "20px", marginTop: 50 }}>
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => navigate("/manage-brands/add-brand")}>
                Ajouter une marque
              </Button>
            </Grid>

            <Grid item xs>
               <div style={{padding: '15px' , display:'flex' , flexDirection:'row' }}>
                              <CSVLink
                data={filteredBrands}
                headers={[{ label: "Nom de la marque", key: "name" }]}
                filename="marques.csv"
                style={{ textDecoration: "none"  , marginRight:'25px'}}
              >
                <Button variant="outlined" color="primary">
                  Exporter CSV
                </Button>
              </CSVLink>
               <Button variant="outlined" color="primary" onClick={() => exportToExcel()}>
                                          Exporter Excel
                                        </Button>
               </div>
            </Grid>

            <Grid item xs>
              <TextField
                label="Rechercher une marque"
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
            rows={filteredBrands}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5, 10, 25]}
            checkboxSelection
            disableSelectionOnClick
          />
        </div>

        <Dialog open={openDialog} onClose={handleDeleteDialogClose}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>Êtes-vous sûr de vouloir supprimer la marque &quot;{selectedBrand?.name}&quot; ?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteDialogClose} color="primary">Annuler</Button>
            <Button onClick={handleDeleteConfirm} color="error">Supprimer</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageBrandsConsultListOfBrands;
