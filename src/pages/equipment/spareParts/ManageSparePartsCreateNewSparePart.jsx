import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Autocomplete, TextField, Button, Box, Paper, Typography, Grid } from "@mui/material";
import {  fetchSuppliersByHospital } from "../../../redux/slices/supplierSlice";
import NavBar from "../../../components/NavBar";
import { createSparePart } from "../../../redux/slices/sparePartSlice";
import { fetchEMDNCodes } from "../../../redux/slices/emdnNomenclatureSlice";
import { toast } from "react-toastify";

const ManageSparePartsCreateNewSparePart = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const emdn = useSelector((state) => state.emdnNomenclature.emdnCodeList);
  const hospitalId = sessionStorage.getItem("hospitalId");

  const [formData, setFormData] = useState({
    emdnCode: "",
    emdnNom: "",
    name: "",
    lifespan: "",
    supplier: "",
    serviceId: "",
    hospitalId: hospitalId,
    equipmentId: "",
    lots: [],
  });

  useEffect(() => {
    dispatch(fetchEMDNCodes());
  }, [dispatch]);

   useEffect(() => {
       dispatch(fetchSuppliersByHospital(hospitalId));
     }, [dispatch, hospitalId]);
   

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

  const requiredLabel = (label) => (
    <span>
      {label}
      <span style={{ color: "red", marginLeft: "4px" }}>*</span>
    </span>
  );
  const listSuppliers = useSelector((state) => state.supplier.suppliers);

  const flatEMDNList = flattenEMDNHierarchy(emdn);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name || !formData.lifespan || !formData.supplier || !formData.emdnCode) {
      toast.warning("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    dispatch(createSparePart(formData))
      .unwrap()
      .then(() => {
         toast.success("Pièce de rechange créée avec succès !");
        navigate("/manageSparePart/consultListSpareParts");
      })
      .catch((error) => {
        console.error("Erreur lors de la création :", error);
      });
  };

    const getLastIndex = (emdnCode) => {
        if (!emdnCode) return null;
        const parts = emdnCode.split('.');
        return parts[parts.length - 1];
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
   <Autocomplete
                options={flatEMDNList}
                getOptionLabel={(option) => `${getLastIndex(option.code)} - ${option.nom}`}
                value={flatEMDNList.find(opt => getLastIndex(opt.code) === formData.emdnCode) || null}
                onChange={(event, newValue) => {
                    const lastIndex = newValue ? getLastIndex(newValue.code) : null;
                    setFormData({ ...formData, emdnCode: lastIndex  , emdnNom: newValue ? newValue.nom : ""});
                }}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label={requiredLabel("Code EMDN")}
                    />
                )}
            />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField label="Nom" name="name" value={formData.name} onChange={handleChange} fullWidth required />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Durée de vie (années)"
                  type="number"
                  name="lifespan"
                  value={formData.lifespan}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={6}>
  <Autocomplete
    options={listSuppliers}
    getOptionLabel={(option) => option.name}
    onChange={(event, newValue) => {
      setFormData((prevData) => ({
        ...prevData,
        supplier: newValue ? newValue.name : ""
      }));
    }}
    renderInput={(params) => (
      <TextField {...params} label="Fournisseur" fullWidth required />
    )}
  />              </Grid>
            </Grid>

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
            <Button onClick={handleAddLot} sx={{ mt: 2 }}>Ajouter un lot</Button>

            <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
              Créer la pièce
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default ManageSparePartsCreateNewSparePart;
