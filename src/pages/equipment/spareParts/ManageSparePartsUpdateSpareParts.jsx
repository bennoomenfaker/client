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
  DialogTitle, } from "@mui/material";
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
  const [newMaintenancePlan, setNewMaintenancePlan] = useState({ maintenanceDate: "", description: "" });
  const [newLot, setNewLot] = useState({ quantity: 0, startDateWarranty: "", endDateWarranty: "", acquisitionDate: "" });
  const [addingMaintenance, setAddingMaintenance] = useState(false);
  const [addingLot, setAddingLot] = useState(false);
  const navigate = useNavigate();
  
  const handleDeleteMaintenancePlan = (index, planId) => {
    setDeleteDialog({ open: true, index, type: "maintenance", id: planId });
  };

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
 
     for (let plan of maintenancePlans) {
       if (!isValidDate(plan.maintenanceDate)) {
         toast.warning("Veuillez entrer une date de maintenance valide !");
         return false;
       }
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


  const handleAddMaintenancePlan = () => {
    setAddingMaintenance(true);
  };

  const handleAddLot = () => {
    setAddingLot(true);
  };

  const handleMaintenancePlanChange = (e) => {
    setNewMaintenancePlan({ ...newMaintenancePlan, [e.target.name]: e.target.value });
  };

  const handleLotChange = (e) => {
    setNewLot({ ...newLot, [e.target.name]: e.target.value });
  };

  const handleConfirmMaintenancePlan = () => {
    setMaintenancePlans([...maintenancePlans, { ...newMaintenancePlan, id: null }]);
    setNewMaintenancePlan({ maintenanceDate: "", description: "" });
    setAddingMaintenance(false);
  };

  const handleConfirmLot = () => {
    setLots([...lots, { ...newLot, id: null }]);
    setNewLot({ quantity: 0, startDateWarranty: "", endDateWarranty: "", acquisitionDate: "" });
    setAddingLot(false);
  };

  const handleCancelMaintenancePlan = () => {
    setNewMaintenancePlan({ maintenanceDate: "", description: "" });
    setAddingMaintenance(false);
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

  const handleEditMaintenancePlan = (index, e) => {
    const updatedPlans = [...maintenancePlans];
    updatedPlans[index] = { ...updatedPlans[index], [e.target.name]: e.target.value };
    setMaintenancePlans(updatedPlans);
  };

 
  return (
    <div style={{ display: 'flex' }}>
      <NavBar onToggle={setIsNavOpen} />
      <div
        style={{
          width: isNavOpen ? 'calc(100% - 60px)' : 'calc(100% - 0px)',
          transition: 'width 0.3s ease',
          padding: '20px',
          marginTop: '50px',
          display: 'grid',
          gridTemplateColumns: '1fr', // Utilisation de CSS Grid
          gap: '20px',
        }}
      >
        <h2>Modifier la pièce de rechange</h2>

        <div style={{ display: 'grid', gap: '10px' }}>
          <TextField label="Nom" name="name" value={formData.name} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Durée de vie" type="number" name="lifespan" value={formData.lifespan} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Fournisseur" name="supplier" value={formData.supplier} onChange={handleChange} fullWidth margin="normal" />
        </div>

        <div>
          <h3>Plans de maintenance</h3>
          {maintenancePlans.map((plan, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <TextField type="date" name="maintenanceDate" value={plan.maintenanceDate?.split('T')[0]} onChange={(e) => handleEditMaintenancePlan(index, e)} />
              <TextField name="description" value={plan.description} onChange={(e) => handleEditMaintenancePlan(index, e)} />
              <Button variant="outlined" color="error" onClick={() => handleDeleteMaintenancePlan(index, plan.id)}>
                Supprimer
              </Button>
            </div>
          ))}

          {addingMaintenance && (
            <div style={{ display: 'grid', gap: '10px' }}>
              <TextField label="Date de maintenance" type="date" name="maintenanceDate" value={newMaintenancePlan.maintenanceDate} onChange={handleMaintenancePlanChange} />
              <TextField label="Description" name="description" value={newMaintenancePlan.description} onChange={handleMaintenancePlanChange} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="contained" onClick={handleConfirmMaintenancePlan}>
                  Confirmer
                </Button>
                <Button variant="outlined" onClick={handleCancelMaintenancePlan}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
          {!addingMaintenance && <Button variant="contained" onClick={handleAddMaintenancePlan}>Ajouter un plan</Button>}
        </div>

        <div>
          <h3>Lots</h3>
          {lots.map((lot, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <TextField label="Quantité" type="number" name="quantity" value={lot.quantity} onChange={(e) => handleEditLot(index, e)} />
              <TextField label="Début garantie" type="date" name="startDateWarranty" value={lot.startDateWarranty?.split('T')[0]} onChange={(e) => handleEditLot(index, e)} />
              <TextField label="Fin garantie" type="date" name="endDateWarranty" value={lot.endDateWarranty?.split('T')[0]} onChange={(e) => handleEditLot(index, e)} />
              <TextField label="Date acquisition" type="date" name="acquisitionDate" value={lot.acquisitionDate?.split('T')[0]} onChange={(e) => handleEditLot(index, e)} />
              <Button variant="outlined" color="error" onClick={() => handleDeleteLot(index)}>
                Supprimer
              </Button>
            </div>
          ))}

          {addingLot && (
            <div style={{ display: 'grid', gap: '10px' }}>
              <TextField label="Quantité" type="number" name="quantity" value={newLot.quantity} onChange={handleLotChange} />
              <TextField label="Début garantie" type="date" name="startDateWarranty" value={newLot.startDateWarranty} onChange={handleLotChange} />
              <TextField label="Fin garantie" type="date" name="endDateWarranty" value={newLot.endDateWarranty} onChange={handleLotChange} />
              <TextField label="Date acquisition" type="date" name="acquisitionDate" value={newLot.acquisitionDate} onChange={handleLotChange} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="contained" onClick={handleConfirmLot}>
                  Confirmer
                </Button>
                <Button variant="outlined" onClick={handleCancelLot}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
          {!addingLot && <Button variant="contained" onClick={handleAddLot}>Ajouter un lot</Button>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="contained" color="success" onClick={handleSave}>
            Sauvegarder
          </Button>
          <Button variant="contained" color="warning" onClick={() => navigate(`/manage-equipment/update-equipment/${id}`)}>
            Annuler
          </Button>
        </div>

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
      </div>
    </div>
  );
};

export default ManageSparePartsUpdateSpareParts;