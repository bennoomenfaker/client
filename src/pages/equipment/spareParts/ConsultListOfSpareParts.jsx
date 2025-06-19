// Complete ConsultListOfSpareParts.jsx Component with fixed header, custom pagination, scrollable table, search, and uniform buttons

import { useState, useEffect, useMemo } from "react";
import NavBar from "../../../components/NavBar";
import { deleteSparePart, fetchSparePartsByHospitalId } from "../../../redux/slices/sparePartSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Grid,
  IconButton
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ConsultListOfSpareParts = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const hospitalId = sessionStorage.getItem("hospitalId");
  const dispatch = useDispatch();
  const spareParts = useSelector((state) => state.spareParts.spareParts || []);
  const isLoading = useSelector(state => state.spareParts.isLoading);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSparePartId, setSelectedSparePartId] = useState(null);
  const role = sessionStorage.getItem("role");
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    dispatch(fetchSparePartsByHospitalId(hospitalId))
      .unwrap()
      .catch(() => toast.error("Erreur lors du chargement des pièces de rechange"));
  }, [dispatch, hospitalId]);

  const handleDeleteClick = (id) => {
    setSelectedSparePartId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteSparePart(selectedSparePartId))
      .unwrap()
      .then(() => toast.success("Pièce supprimée"))
      .catch(() => toast.error("Erreur de suppression"));
    setOpenDialog(false);
  };

  const filteredAndSortedSpareParts = useMemo(() => {
    let list = spareParts.filter(part =>
      [part.emdnCode, part.emdnNom, part.supplier, part.name]
        .some(field => field?.toLowerCase().includes(search.toLowerCase()))
    );

    if (sortConfig.key) {
      list.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase();
        const bVal = b[sortConfig.key]?.toString().toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [spareParts, search, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedSpareParts.length / itemsPerPage);
  const currentItems = filteredAndSortedSpareParts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredAndSortedSpareParts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Spare Parts");
    saveAs(new Blob([XLSX.write(workbook, { type: "array", bookType: "xlsx" })]), "SpareParts.xlsx");
  };

  const handleSortRequest = (key) => {
    const direction = (sortConfig.key === key && sortConfig.direction === 'asc') ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={() => setIsNavOpen(!isNavOpen)} />
      <Box sx={{ flexGrow: 1, p: 3, mt: 5  }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            mb: 1,
            width: '107%',
            marginLeft:'-6%'
          
          }}
        >
           <Grid container spacing={2} alignItems="center" mb={1}>
    {/* Ajouter une pièce */}
    {["ROLE_HOSPITAL_ADMIN", "ROLE_MAINTENANCE_ENGINEER", "ROLE_COMPANY_STAFF"].includes(role) && (
      <Grid item xs={12} sm={4} md={3}>
        <Button
          fullWidth
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => navigate("/manage-spareParts/addSparePart")}
          sx={{ height: '56px' }}
        >
          Ajouter pièce
        </Button>
      </Grid>
    )}

    {/* Recherche */}
    <Grid item xs={12} sm={["ROLE_HOSPITAL_ADMIN", "ROLE_MAINTENANCE_ENGINEER", "ROLE_COMPANY_STAFF"].includes(role) ? 5 : 9} md={7}>
      <TextField
        fullWidth
        label="Rechercher pièce de rechange"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ height: '56px' }}
        InputProps={{
          style: { height: '56px' }
        }}
      />
    </Grid>

    {/* Export Excel */}
    <Grid item xs={12} sm={3} md={2}>
      <Button
        fullWidth
        variant="outlined"
        color="primary"
        onClick={exportToExcel}
        sx={{ height: '56px' }}
      >
        Export Excel
      </Button>
    </Grid>
  </Grid>
        </Box>



        <Box sx={{ height: 415,width: '108%', overflowY: 'auto', border: '1px solid #ccc', borderRadius: 2 , ml: -9 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
<table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9f9f9', zIndex: 1 }}>
                <tr>
                  {['name', 'supplier', 'emdnCode', 'emdnNom', 'lifespan'].map(key => (
                    <th
                      key={key}
                      onClick={() => handleSortRequest(key)}
                      style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #ddd', textAlign: 'left' }}
                    >
                      {key}
                      {sortConfig.key === key ? (sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />) : null}
                    </th>
                  ))}
                  <th style={{ padding: '6px' }}>Quantité</th>
                  <th style={{ padding: '6px' }}>Début garantie</th>
                  <th style={{ padding: '6px' }}>Fin garantie</th>
                  <th style={{ padding: '6px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(part => (
                  <tr key={part.id}>
                    <td style={{ padding: '6px' }}>{part.name}</td>
                    <td style={{ padding: '6px' }}>{part.supplier}</td>
                    <td style={{ padding: '6px' }}>{part.emdnCode}</td>
                    <td style={{ padding: '6px' }}>{part.emdnNom}</td>
                    <td style={{ padding: '6px' }}>{part.lifespan}</td>
                    <td style={{ padding: '6px' }}>{part.lots?.[0]?.quantity || 0}</td>
                    <td style={{ padding: '6px' }}>{part.lots?.[0]?.startDateWarranty?.substring(0, 10)}</td>
                    <td style={{ padding: '6px' }}>{part.lots?.[0]?.endDateWarranty?.substring(0, 10)}</td>
                    <td style={{ padding: '6px' }}>
                      <IconButton onClick={() => navigate(`/manage-equipment/update-equipment/equipmentId/${part.id}/editSpareParts`, { state: { sparePart: part } })}><EditIcon color="warning"/></IconButton>
                      <IconButton onClick={() => handleDeleteClick(part.id)}><DeleteIcon color="error" /></IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Box>

        <Box display="flex" justifyContent="center" mt={2}>
          <IconButton disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            <NavigateBeforeIcon />
          </IconButton>
          <Typography variant="body1" sx={{ mx: 2 }}>Page {currentPage} / {totalPages}</Typography>
          <IconButton disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
            <NavigateNextIcon />
          </IconButton>
        </Box>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirmation</DialogTitle>
          <DialogContent>
            <DialogContentText>Voulez-vous vraiment supprimer cette pièce ?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">Annuler</Button>
            <Button onClick={handleConfirmDelete} color="error">Supprimer</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default ConsultListOfSpareParts;