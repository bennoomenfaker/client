import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createSparePart } from "../../../redux/slices/sparePartSlice";
import { fetchEquipmentBySerial } from "../../../redux/slices/equipmentSlice";
import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import NavBar from "../../../components/NavBar";

const ManageSparePartsCreateNewSpareParts = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    lifespan: "",
    supplier: "",
    serviceId: "",
    hospitalId: "",
    equipmentId: "",
    maintenancePlans: [],
    lots: [],
  });

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { equipment } = useSelector((state) => state.equipment);

  useEffect(() => {
    if (id) dispatch(fetchEquipmentBySerial(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (equipment) {
      setFormData((prevData) => ({
        ...prevData,
        equipmentId: equipment.id,
        serviceId: equipment.serviceId,
        hospitalId: equipment.hospitalId,
      }));
    }
  }, [equipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddLot = () => {
    setFormData((prevData) => ({
      ...prevData,
      lots: [...prevData.lots, { quantity: "", startDateWarranty: "", endDateWarranty: "", acquisitionDate: "" }],
    }));
  };

  const handleChangeLot = (e, index) => {
    const { name, value } = e.target;
    const updatedLots = [...formData.lots];
    updatedLots[index][name] = value;
    setFormData((prevData) => ({ ...prevData, lots: updatedLots }));
  };

  const handleAddMaintenancePlan = () => {
    setFormData((prevData) => ({
      ...prevData,
      maintenancePlans: [...prevData.maintenancePlans, { maintenanceDate: "", description: "" }],
    }));
  };

  const handleChangeMaintenancePlan = (e, index) => {
    const { name, value } = e.target;
    const updatedPlans = [...formData.maintenancePlans];
    updatedPlans[index][name] = value;
    setFormData((prevData) => ({ ...prevData, maintenancePlans: updatedPlans }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.lifespan || !formData.supplier) {
      toast.warning("Veuillez remplir tous les champs obligatoires !");
      return;
    }
    if (formData.maintenancePlans.length === 0) {
      toast.warning("Ajoutez au moins un plan de maintenance !");
      return;
    }
    if (formData.lots.length === 0) {
      toast.warning("Ajoutez au moins un lot !");
      return;
    }

    try {
      await dispatch(createSparePart(formData));
      toast.success("Pièce de rechange créée avec succès !");
      navigate(`/manage-equipment/update-equipment/${equipment.serialCode}`);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Erreur lors de la création de la pièce de rechange.");
    }
  };

  return (
    <Box display="flex">
      <NavBar onToggle={setIsNavOpen} />
      <Box width={isNavOpen ? "100%" : "calc(100% - 60px)"} p={3} mt={5}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Créer une nouvelle pièce de rechange
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Nom" name="name" value={formData.name} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Durée de vie (années)" type="number" name="lifespan" value={formData.lifespan} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Fournisseur" name="supplier" value={formData.supplier} onChange={handleChange} fullWidth required />
              </Grid>
            </Grid>

            <Typography variant="h6" mt={3}>Plans de maintenance</Typography>
            {formData.maintenancePlans.map((plan, index) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={6}>
                  <TextField label="Date" type="date" name="maintenanceDate" value={plan.maintenanceDate} onChange={(e) => handleChangeMaintenancePlan(e, index)} fullWidth />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Description" name="description" value={plan.description} onChange={(e) => handleChangeMaintenancePlan(e, index)} fullWidth />
                </Grid>
              </Grid>
            ))}
            <Button onClick={handleAddMaintenancePlan}>Ajouter un plan</Button>

            <Typography variant="h6" mt={3}>Lots</Typography>
            {formData.lots.map((lot, index) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={3}>
                  <TextField label="Quantité" name="quantity" value={lot.quantity} onChange={(e) => handleChangeLot(e, index)} fullWidth />
                </Grid>
                <Grid item xs={3}>
                  <TextField label="Début Garantie" type="date" name="startDateWarranty" value={lot.startDateWarranty} onChange={(e) => handleChangeLot(e, index)} fullWidth />
                </Grid>
                <Grid item xs={3}>
                  <TextField label="Fin Garantie" type="date" name="endDateWarranty" value={lot.endDateWarranty} onChange={(e) => handleChangeLot(e, index)} fullWidth />
                </Grid>
                <Grid item xs={3}>
                  <TextField label="Date Acquisition" type="date" name="acquisitionDate" value={lot.acquisitionDate} onChange={(e) => handleChangeLot(e, index)} fullWidth />
                </Grid>
              </Grid>
            ))}
            <Button onClick={handleAddLot}>Ajouter un lot</Button>

            <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>Créer</Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default ManageSparePartsCreateNewSpareParts;