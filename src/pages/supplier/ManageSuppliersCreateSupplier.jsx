/* eslint-disable no-unused-vars */
import { createSupplier  } from '../../redux/slices/supplierSlice';
import  { useState } from 'react';
import NavBar from '../../components/NavBar';
import { toast } from 'react-toastify';
import { Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';


const ManageSuppliersCreateSupplier = () => {
      const [isNavOpen, setIsNavOpen] = useState(true);
      const navigate = useNavigate();
      const dispatch = useDispatch();
      
        const [supplierData, setSupplierData] = useState({
            name:'' , email:'' ,tel:'',hospitalId:sessionStorage.getItem("hospitalId")
        })

        const handleUpdate = async () => {
          if (!supplierData.name.trim() || !supplierData.email.trim() || !supplierData.tel.trim()) {
            toast.warning("Tous les champs sont obligatoires.");
            return;
          }
          
          // Validation téléphone : 6 chiffres uniquement
        
        const telClean = supplierData.tel.trim();
        const telRegex = /^\d{8}$/; // exactement 8 chiffres
        
        if (!telRegex.test(telClean)) {
          toast.warning("Le numéro de téléphone doit contenir exactement 8 chiffres.");
          return;
        }
        
        
          try {
            await dispatch(createSupplier(supplierData ));
            toast.success('Fournisseur créé avec succès !');
            navigate('/manage-supplier/suppliers');
          } catch (error) {
            toast.error("Erreur lors de la création du fournisseur.");
          }
        };
          const handleCancel = () => {
    navigate('/manage-supplier/suppliers');
  };
  return (
    <div style={{ display: 'flex', width: '100%' }}>
        <NavBar onToggle={setIsNavOpen} />
      <Container component={Paper} maxWidth="sm" sx={{ mt: 9, p: 5 }}>

          <Typography variant="h6" gutterBottom textAlign="center">
Créer un nouveau fournisseur</Typography>
  <Box
    sx={{
      width: 600,
      marginTop: 4,
      padding: 5,
      border: "1px solid #ccc",
      borderRadius: 2,
      boxShadow: 1,
    }}
  >
    <Stack spacing={5}>
      <TextField
        label="Nom du fournisseur"
        name="name"
        value={supplierData.name}
        onChange={(e) => setSupplierData({ ...supplierData, name: e.target.value })}
        fullWidth
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={supplierData.email}
        onChange={(e) => setSupplierData({ ...supplierData, email: e.target.value })}
        fullWidth
      />
      <TextField
        label="Téléphone"
        name="tel"
        type="tel"
        value={supplierData.tel}
        onChange={(e) => setSupplierData({ ...supplierData, tel: e.target.value })}
        fullWidth
        inputProps={{ maxLength: 8 }}
      />

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="contained" color="success" onClick={handleUpdate}>
          Enregistrer
        </Button>
        <Button variant="outlined" color="warning" onClick={handleCancel}>
          Annuler
        </Button>
      </Stack>
    </Stack>
  </Box>
</Container>

      
    </div>
  )
}

export default ManageSuppliersCreateSupplier
