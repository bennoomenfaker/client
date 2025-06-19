/* eslint-disable no-unused-vars */
import  { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuppliersByHospital, deleteSupplier } from '../../redux/slices/supplierSlice';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AddIcon from "@mui/icons-material/Add";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const ManageSuplliersConsultListSuppliers = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const hospitalId = sessionStorage.getItem('hospitalId');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);

  const listSuppliers = useSelector((state) => state.supplier.suppliers);

  useEffect(() => {
    dispatch(fetchSuppliersByHospital(hospitalId));
  }, [dispatch, hospitalId]);

  const handleDeleteClick = (id) => {
    setSelectedSupplierId(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    dispatch(deleteSupplier(selectedSupplierId));
    toast.success('Fournisseur supprimé avec succès');
    setOpenDialog(false);
  };

  const filteredSuppliers = listSuppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchText.toLowerCase())||
      supplier.email.toLowerCase().includes(searchText.toLowerCase())||
          supplier.tel.toLowerCase().includes(searchText.toLowerCase())


  );

  const columns = [
    { field: 'name', headerName: 'Nom fournisseur', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'tel', headerName: 'Téléphone', flex: 1 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Box>
         <IconButton
  color="warning"
  onClick={() =>
    navigate(`/manage-supplier/update-supplier/${params.row.id}`, {
      state: {
        supplier: params.row, // ou des champs spécifiques comme name, email, etc.
      },
    })
  }
>
  <EditIcon />
</IconButton>

          <IconButton  color="error" onClick={() => handleDeleteClick(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];
  
    const exportToExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(filteredSuppliers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'SLAs');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'fournisseur.xlsx');
    };
  

  return (
    <div style={{ display: 'flex' }}>
      <NavBar onToggle={isNavOpen} />
      <div style={{ width: '90%', padding: '10px', marginTop: 60 }}>

     
            <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
    mb: 3,
    width: '100%',
  }}
>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 , ml:"-5%" , width:"100%"}}>
      <Box sx={{ flex: 1, minWidth: 200 }}>
  
  <Button
    variant="contained"
    color="success"
    startIcon={<AddIcon />}
    onClick={() => navigate("/manage-supplier/add")}
    sx={{ height: 56 }}
    
  >
    Ajouter un fournisseur
  </Button>
</Box>
  
  <Box sx={{ flex: 3, minWidth: 250 }}>

  <TextField
          label="Rechercher fournisseur"
          variant="outlined"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{height: 56  }}
        />
        </Box>
  <Box sx={{ flex: 1, minWidth: 200 }}>

  <Button
    variant="outlined"
    color="primary"
    onClick={exportToExcel}
    sx={{ height: 56 }}
    
  >
    Exporter Excel
  </Button>
  </Box>
</Box>

       </Box>
                <div style={{ height: 450, width: "105.4%" , marginLeft:"-5%"}}>

        <DataGrid
          rows={filteredSuppliers}
          columns={columns}
          getRowId={(row) => row.id}
          autoHeight
          pageSize={10}
          rowsPerPageOptions={[10]}
            sx={{
  width: '100%',
  '& .MuiDataGrid-cell': {
    borderRight: '1px solid rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: '0.8rem',
    padding: '4px 8px',
  },
  '& .MuiDataGrid-columnHeaders': {
    color: '#333333', // texte gris foncé
    fontWeight: 'bold',
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

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirmation de suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Voulez-vous vraiment supprimer ce fournisseur ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button onClick={handleConfirmDelete} color="error">Supprimer</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageSuplliersConsultListSuppliers;
