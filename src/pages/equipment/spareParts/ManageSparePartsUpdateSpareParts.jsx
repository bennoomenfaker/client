import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { updateSparePart } from "../../../redux/slices/sparePartSlice";
import NavBar from "../../../components/NavBar";
import {
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Box,
  Typography,
  Grid,
  Stack, } from "@mui/material";
import { deleteMaintenancePlan } from "../../../redux/slices/maintenancePlanSlice ";
import { toast } from "react-toastify";

const ManageSparePartsUpdateSpareParts = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();
  const sparePart = location.state?.sparePart;
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: sparePart?.name || "",
    lifespan: sparePart?.lifespan || 0,
    supplier: sparePart?.supplier || "",
  });

  const [maintenancePlans, setMaintenancePlans] = useState(sparePart?.maintenancePlans || []);
  const [lots, setLots] = useState(sparePart?.lots || []);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, index: null, type: null, id: null });
  const [newLot, setNewLot] = useState({ quantity: 0, startDateWarranty: "", endDateWarranty: "", acquisitionDate: "" });
  const [addingLot, setAddingLot] = useState(false);
  const navigate = useNavigate();
  
  

  const handleDeleteLot = (index) => {
    setDeleteDialog({ open: true, index, type: "lot" });
  };

  const confirmDelete = () => {
    if (deleteDialog.type === "maintenance") {
      const updatedPlans = maintenancePlans.filter((_, i) => i !== deleteDialog.index);
      setMaintenancePlans(updatedPlans);
      dispatch(deleteMaintenancePlan({ maintenancePlanId: deleteDialog.id })).then(() => {
        toast.success("Plan de maintenance supprimé avec succès");
      });
    } else if (deleteDialog.type === "lot") {
      const updatedLots = lots.filter((_, i) => i !== deleteDialog.index);
      setLots(updatedLots);
      toast.success("Lot supprimé avec succès");
    }
    setDeleteDialog({ open: false, index: null, type: null, id: null });
  };
  const isValidDate = (date) => !isNaN(new Date(date).getTime());

   const validateForm = () => {
     if (!formData.name || formData.lifespan <= 0 || !formData.supplier) {
       toast.warning("Tous les champs doivent être remplis !");
       return false;
     }
 
    
 
     for (let lot of lots) {
       if (!isValidDate(lot.startDateWarranty) || !isValidDate(lot.endDateWarranty) || !isValidDate(lot.acquisitionDate)) {
         toast.warning("Veuillez entrer des dates valides pour les lots !");
         return false;
       }
     }
 
     return true;
   };
 
   const handleSave = () => {
    if (!validateForm()) return;

    const updatedSparePart = { ...sparePart, ...formData, maintenancePlans, lots };
    dispatch(updateSparePart({ sparePartId: sparePart.id, sparePartData: updatedSparePart }))
      .then(() => {
        toast.success("Pièce de rechange modifiée avec succès");
        navigate(`/manage-equipment/update-equipment/${id}`);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour de la pièce de rechange:", error);
        toast.error("Erreur lors de la mise à jour de la pièce de rechange");
      });
  };




  const handleAddLot = () => {
    setAddingLot(true);
  };


  const handleLotChange = (e) => {
    setNewLot({ ...newLot, [e.target.name]: e.target.value });
  };


  const handleConfirmLot = () => {
    setLots([...lots, { ...newLot, id: null }]);
    setNewLot({ quantity: 0, startDateWarranty: "", endDateWarranty: "", acquisitionDate: "" });
    setAddingLot(false);
  };



  const handleCancelLot = () => {
    setNewLot({ quantity: 0, startDateWarranty: "", endDateWarranty: "", acquisitionDate: "" });
    setAddingLot(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleEditLot = (index, e) => {
    const updatedLots = [...lots];
    updatedLots[index] = { ...updatedLots[index], [e.target.name]: e.target.value };
    setLots(updatedLots);
  };



 
  return (
  <Box display="flex">
      <NavBar onToggle={setIsNavOpen} />
      <Box
      sx={{
        width: isNavOpen ? "calc(100% - 60px)" : "100%",
        transition: "width 0.3s ease",
        p: 3,
        mt: "50px",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 3,
      }}
    >
       <Typography variant="h5" gutterBottom>
        Modifier la pièce de rechange
      </Typography>
  {/* Formulaire principal */}
      <Grid container spacing={2} >
        <Grid item xs={12} md={4}>
          <TextField label="Nom" name="name" value={formData.name} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="Durée de vie" type="number" name="lifespan" value={formData.lifespan} onChange={handleChange} fullWidth />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="Fournisseur" name="supplier" value={formData.supplier} onChange={handleChange} fullWidth />
        </Grid>
      </Grid>

       {/* Lots */}
      <Box mb={4}>
        <Typography variant="h6" gutterBottom>
          Lots
        </Typography>
       {lots.map((lot, index) => (
  <Stack
    key={index}
    direction="row"
    spacing={2}
    alignItems="center"
    flexWrap="wrap"
    mb={2}
  >
    <TextField
      label="Quantité"
      type="number"
      name="quantity"
      value={lot.quantity}
      onChange={(e) => handleEditLot(index, e)}
    />
    <TextField
      label="Début garantie"
      type="date"
      name="startDateWarranty"
      value={lot.startDateWarranty?.split('T')[0]}
      onChange={(e) => handleEditLot(index, e)}
      InputLabelProps={{ shrink: true }}
    />
    <TextField
      label="Fin garantie"
      type="date"
      name="endDateWarranty"
      value={lot.endDateWarranty?.split('T')[0]}
      onChange={(e) => handleEditLot(index, e)}
      InputLabelProps={{ shrink: true }}
    />
    <TextField
      label="Date acquisition"
      type="date"
      name="acquisitionDate"
      value={lot.acquisitionDate?.split('T')[0]}
      onChange={(e) => handleEditLot(index, e)}
      InputLabelProps={{ shrink: true }}
    />
    <Button
      variant="outlined"
      color="error"
      onClick={() => handleDeleteLot(index)}
    >
      Supprimer
    </Button>
  </Stack>
))}



          {/* Ajout d'un lot */}
       {addingLot && (
  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" mb={2}>
    <TextField
      label="Quantité"
      type="number"
      name="quantity"
      value={newLot.quantity}
      onChange={handleLotChange}
    />
    <TextField
      label="Début garantie"
      type="date"
      name="startDateWarranty"
      value={newLot.startDateWarranty}
      onChange={handleLotChange}
      InputLabelProps={{ shrink: true }}
    />
    <TextField
      label="Fin garantie"
      type="date"
      name="endDateWarranty"
      value={newLot.endDateWarranty}
      onChange={handleLotChange}
      InputLabelProps={{ shrink: true }}
    />
    <TextField
      label="Date acquisition"
      type="date"
      name="acquisitionDate"
      value={newLot.acquisitionDate}
      onChange={handleLotChange}
      InputLabelProps={{ shrink: true }}
    />
    <Stack direction="row" spacing={2}>
      <Button variant="contained" onClick={handleConfirmLot}>Confirmer</Button>
      <Button variant="outlined" onClick={handleCancelLot}>Annuler</Button>
    </Stack>
  </Stack>
)}

{!addingLot && (
  <Button variant="contained" onClick={handleAddLot}>
    Ajouter un lot
  </Button>
)}

      </Box>
       {/* Actions */}
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="contained" color="success" onClick={handleSave}>
          Sauvegarder
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() =>
            navigate(`/manage-equipment/update-equipment/equipmentId/${id}/editSparePart`)
          }
        >
          Annuler
        </Button>
      </Box>

        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>Êtes-vous sûr de vouloir supprimer cet élément ?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>Annuler</Button>
            <Button onClick={confirmDelete} color="error">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ManageSparePartsUpdateSpareParts;