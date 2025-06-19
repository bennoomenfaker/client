/* eslint-disable no-unused-vars */
import  { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { updateSupplier  } from '../../redux/slices/supplierSlice';
import NavBar from '../../components/NavBar';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Stack
} from '@mui/material';
import { toast } from 'react-toastify';

const ManageSuppliersUpdateSupplier = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const supplier = location.state?.supplier;

  const [name, setName] = useState(supplier?.name || '');
  const [email, setEmail] = useState(supplier?.email || '');
  const [tel, setTel] = useState(supplier?.tel || '');
const handleUpdate = async () => {
  if (!name.trim() || !email.trim() || !tel.trim()) {
    toast.warning("Tous les champs sont obligatoires.");
    return;
  }
  
  // Validation téléphone : 6 chiffres uniquement

const telClean = tel.trim();
const telRegex = /^\d{8}$/; // exactement 6 chiffres

if (!telRegex.test(telClean)) {
  toast.warning("Le numéro de téléphone doit contenir exactement 8 chiffres.");
  return;
}


  try {
    const updatedData = { name, email, tel };
    await dispatch(updateSupplier({ supplierId: supplier.id, supplierData: updatedData }));
    toast.success('Fournisseur mis à jour avec succès !');
    navigate('/manage-supplier/suppliers');
  } catch (error) {
    toast.error("Erreur lors de la mise à jour du fournisseur.");
  }
};


  const handleCancel = () => {
    navigate('/manage-supplier/suppliers');
  };

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      <NavBar onToggle={isNavOpen} />

      <Container component={Paper} maxWidth="sm" sx={{ mt: 9, p: 5 }}>
        <Typography variant="h6" gutterBottom textAlign="center">
          Modifier le fournisseur
        </Typography>

<Box
    sx={{
      width: 500,
      marginTop: 4,
      padding: 5,
      border: "1px solid #ccc",
      borderRadius: 2,
      boxShadow: 1,
    }}
  >   
     <Stack spacing={5}>
         <TextField
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
         
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Téléphone"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            fullWidth
          />

      <Stack direction="row" spacing={2} justifyContent="flex-end">
          
            <Button variant="contained" color="success" onClick={handleUpdate}>
              Modifier
            </Button>
             <Button variant="outlined" color="warning" onClick={handleCancel}>
                      Annuler
                    </Button>
          </Stack>
           </Stack>
        </Box>
      </Container>
    </div>
  );
};

export default ManageSuppliersUpdateSupplier;
