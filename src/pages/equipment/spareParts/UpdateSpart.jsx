import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { updateSparePart } from "../../../redux/slices/sparePartSlice";
import { fetchEMDNCodes } from "../../../redux/slices/emdnNomenclatureSlice";
import NavBar from "../../../components/NavBar";
import Autocomplete from "@mui/material/Autocomplete";
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
import { toast } from "react-toastify";

const UpdateSpart = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [addingLot, setAddingLot] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, index: null, type: null });
  const [newLot, setNewLot] = useState({ quantity: 0, startDateWarranty: "", endDateWarranty: "", acquisitionDate: "" });

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const sparePart = location.state?.sparePart || {};
 console.log(sparePart, "sparePart");
  const emdn = useSelector((state) => state.emdnNomenclature.emdnCodeList);

  const [formData, setFormData] = useState({
    id: sparePart.id || "",
    emdnCode: sparePart.emdnCode || "",
    emdnNom: sparePart.emdnNom || "",
    name: sparePart.name || "",
    lifespan: sparePart.lifespan || "",
    supplier: sparePart.supplier || "",
    serviceId: sparePart.serviceId || "",
    hospitalId: sparePart.hospitalId || "",
    lots: sparePart.lots || []
  });

  useEffect(() => {
    dispatch(fetchEMDNCodes());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLotChange = (e) => {
    setNewLot((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddLot = () => setAddingLot(true);

  const handleConfirmLot = () => {
    setFormData((prev) => ({
      ...prev,
      lots: [...prev.lots, { ...newLot, id: null }]
    }));
    setNewLot({ quantity: 0, startDateWarranty: "", endDateWarranty: "", acquisitionDate: "" });
    setAddingLot(false);
  };

  const handleCancelLot = () => {
    setNewLot({ quantity: 0, startDateWarranty: "", endDateWarranty: "", acquisitionDate: "" });
    setAddingLot(false);
  };

  const handleEditLot = (index, e) => {
    const updatedLots = [...formData.lots];
    updatedLots[index] = { ...updatedLots[index], [e.target.name]: e.target.value };
    setFormData((prev) => ({ ...prev, lots: updatedLots }));
  };

  const handleDeleteLot = (index) => {
    setDeleteDialog({ open: true, index, type: "lot" });
  };

  const confirmDelete = () => {
    if (deleteDialog.type === "lot") {
      const updatedLots = formData.lots.filter((_, i) => i !== deleteDialog.index);
      setFormData((prev) => ({ ...prev, lots: updatedLots }));
      toast.success("Lot supprimé avec succès !");
    }
    setDeleteDialog({ open: false, index: null, type: null });
  };

  const isValidDate = (date) => !isNaN(new Date(date).getTime());

  const validateForm = () => {
    if (!formData.name || formData.lifespan <= 0 || !formData.supplier) {
      toast.warning("Tous les champs doivent être remplis !");
      return false;
    }

    for (let lot of formData.lots) {
      if (!isValidDate(lot.startDateWarranty) || !isValidDate(lot.endDateWarranty) || !isValidDate(lot.acquisitionDate)) {
        toast.warning("Veuillez entrer des dates valides pour les lots !");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(updateSparePart({ id, updatedSparePart:formData }))
      .unwrap()
      .then(() => {
        toast.success("Pièce de rechange mise à jour avec succès !");
        navigate("/manageSparePart/consultListSpareParts");
      })
      console.log(id,formData ,"hhhh")
      .catch((err) => {
        console.error("Erreur lors de la mise à jour :", err);
        toast.error("Erreur lors de la mise à jour !");
      });
  };

  const flattenEMDNHierarchy = (data) => {
    let flatList = [];
    const traverse = (items, parentCode = "") => {
      items.forEach((item) => {
        const fullCode = parentCode ? `${parentCode}.${item.code}` : item.code;
        flatList.push({ code: fullCode, nom: item.nom });
        if (item.subtypes && item.subtypes.length > 0) {
          traverse(item.subtypes, fullCode);
        }
      });
    };
    traverse(data);
    return flatList;
  };

  const getLastIndex = (code) => code?.split(".").pop() || "";

  const requiredLabel = (label) => (
    <span>
      {label}
      <span style={{ color: "red", marginLeft: "4px" }}>*</span>
    </span>
  );

  const flatEMDNList = flattenEMDNHierarchy(emdn);

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
      <Typography variant="h5" fontWeight={600}>
        Modifier la pièce de rechange
      </Typography>

      <Autocomplete
        options={flatEMDNList}
        getOptionLabel={(option) => `${getLastIndex(option.code)} - ${option.nom}`}
        value={flatEMDNList.find(opt => getLastIndex(opt.code) === formData.emdnCode) || null}
        onChange={(e, newValue) => {
          const lastIndex = newValue ? getLastIndex(newValue.code) : "";
          setFormData((prev) => ({
            ...prev,
            emdnCode: lastIndex,
            emdnNom: newValue?.nom || "",
          }));
        }}
        renderInput={(params) => <TextField {...params} label={requiredLabel("Code EMDN")} fullWidth />}
      />

      <Grid container spacing={2}>
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

      <Box>
        <Typography variant="h6" gutterBottom>Lots</Typography>
        {formData.lots.map((lot, index) => (
          <Stack direction="row" spacing={2} alignItems="center" mb={2} key={index}>
            <TextField label="Quantité" type="number" name="quantity" value={lot.quantity} onChange={(e) => handleEditLot(index, e)} />
            <TextField label="Début garantie" type="date" name="startDateWarranty" value={lot.startDateWarranty?.split("T")[0]} onChange={(e) => handleEditLot(index, e)} />
            <TextField label="Fin garantie" type="date" name="endDateWarranty" value={lot.endDateWarranty?.split("T")[0]} onChange={(e) => handleEditLot(index, e)} />
            <TextField label="Date acquisition" type="date" name="acquisitionDate" value={lot.acquisitionDate?.split("T")[0]} onChange={(e) => handleEditLot(index, e)} />
            <Button variant="outlined" color="error" onClick={() => handleDeleteLot(index)}>Supprimer</Button>
          </Stack>
        ))}
{addingLot ? (
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
    <Stack direction="row" spacing={1}>
      <Button variant="contained" onClick={handleConfirmLot}>
        Confirmer
      </Button>
      <Button variant="outlined" onClick={handleCancelLot}>
        Annuler
      </Button>
    </Stack>
  </Stack>
) : (
  <Button variant="contained" onClick={handleAddLot}>
    Ajouter un lot
  </Button>
)}

      </Box>

      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="contained" color="success" onClick={handleSubmit}>
          Sauvegarder
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={() => navigate(`/manage-equipment/update-equipment/equipmentId/${id}/editSparePart`)}
        >
          Annuler
        </Button>
      </Box>

      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ ...deleteDialog, open: false })}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cet élément ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}>Annuler</Button>
          <Button onClick={confirmDelete} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Box>
);
};

export default UpdateSpart;
