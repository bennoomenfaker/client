/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import { createEquipment, createEquipment1, fetchEquipmentBySerial } from "../../redux/slices/equipmentSlice";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {fetchSuppliersByHospital}  from '../../redux/slices/supplierSlice'
import {
  Box,
  Paper,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { fetchEMDNCodes } from "../../redux/slices/emdnNomenclatureSlice";
import { fetchHospitals } from "../../redux/slices/hospitalSlice";
import { fetchServicesByHospitalId } from "../../redux/slices/hospitalServiceSlice";
import { fetchBrandsByHospital } from "../../redux/slices/brandsSlice";

const riskClasses = ["1", "2a", "2b", "3"];

const AddEquipmentToHospital = () => {
  const [serialCode, setSerialCode] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const emdn = useSelector((state) => state.emdnNomenclature.emdnCodeList);
  const isLoading = useSelector((state) => state.emdnNomenclature.isLoading);
  const hospitalId = sessionStorage.getItem("hospitalId");
  const brands = useSelector((state) => state.brand.brandList);
  const servicesByHospital = useSelector((state) => state.hospitalService.serviceByHospital);
  const suppliers = useSelector((state)=>state.supplier.suppliers)

  // Formulaire création équipement
  const [formData, setFormData] = useState({
    nom: "",
    emdnCode: "",
    lifespan: "",
    riskClass: "",
    hospitalId: hospitalId || "",
    amount: 0,
    supplier: "",
    acquisitionDate: "",
    serviceId: null,
    brand: null,
    sparePartIds: [],
    slaId: null,
    startDateWarranty: "",
    endDateWarranty: "",
    reception: true,
    fromMinistere: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serialCode) {
      toast.warning("Veuillez saisir un code série pour l'équipement.");
      return;
    }

    try {
      const result = await dispatch(fetchEquipmentBySerial(serialCode));

  

      // Si l'équipement est trouvé, redirige vers la page de mise à jour
      if (result.payload === "Erreur lors de la récupération de l'équipement") {
        toast.error("Équipement non trouvé.");
      } else {
        navigate(`/manage-equipment/update-equipment/${serialCode}`);
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la récupération de l'équipement.");
    }
  };

  const handleSubmitNew = async (e) => {
    e.preventDefault();

    if (!formData.nom || !formData.emdnCode || !formData.lifespan || !formData.riskClass || !formData.hospitalId) {
      toast.warning("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (formData.amount < 0) {
      toast.warning("Le montant ne peut pas être négatif");
      return;
    }
    if (formData.startDateWarranty && formData.endDateWarranty && new Date(formData.endDateWarranty) < new Date(formData.startDateWarranty)) {
      toast.warning("La date de fin de garantie doit être postérieure à la date de début");
      return;
    }

    const payload = {
      ...formData,
      brand: formData.brand ? formData.brand.name : "",
      amount: parseFloat(formData.amount),
       supplierId: formData.supplier
    };

    try {
      const res =await dispatch(createEquipment1(payload));
      toast.success("Équipement créé avec succès !");
      navigate(`/manage-equipment/update-equipment/${res?.payload?.data}`)
      // Optionnel: reset form or navigate
    } catch (error) {
      toast.error("Erreur lors de la création de l'équipement");
    }
  };

  useEffect(() => {
    if (hospitalId) {
      dispatch(fetchEMDNCodes());
      dispatch(fetchHospitals());
      dispatch(fetchServicesByHospitalId(hospitalId));
      dispatch(fetchBrandsByHospital(hospitalId));
      dispatch(fetchSuppliersByHospital(hospitalId))
    }
  }, [dispatch, hospitalId]);

  if (isLoading) {
    return (
      <>
        <NavBar />
        <CircularProgress />
      </>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fonction pour aplatir la hiérarchie EMDN
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

  const flatEMDNList = flattenEMDNHierarchy(emdn);

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <Box
        sx={{
          width: isNavOpen ? "calc(100% - 60px)" : "100%",
          transition: "width 0.3s ease",
          padding: "20px",
          marginTop: "50px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
        }}
      >
        <h2>Ajouter un nouvel équipement</h2>

        <Paper
          sx={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <form onSubmit={handleSubmit}>
            <TextField
              label="Code Série"
              variant="outlined"
              value={serialCode}
              onChange={(e) => setSerialCode(e.target.value)}
              placeholder="Entrez le code série"
              fullWidth
              sx={{
                marginBottom: "15px",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
                "& .MuiInputLabel-root": {
                  fontSize: "16px",
                },
                "& .MuiInputBase-root": {
                  fontSize: "14px",
                },
              }}
            />
            <Button type="submit" variant="contained" color="primary" sx={{ marginTop: "15px" }}>
              Valider
            </Button>
          </form>

          <form onSubmit={handleSubmitNew} style={{ display: "flex", flexDirection: "column", gap: "16px", width: "50%" }}>
            <h1>Créer l&apos;équipement</h1>

            <TextField
              label="Nom de l'équipement"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            <Autocomplete
              options={flatEMDNList}
              getOptionLabel={(option) => `${option.code.split('.').pop()} - ${option.nom}`}
              value={flatEMDNList.find((opt) => opt.code.split(".").pop() === formData.emdnCode) || null}
              onChange={(event, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  emdnCode: newValue ? newValue.code.split(".").pop() : "",
                }));
              }}
              renderInput={(params) => <TextField {...params} label="Sélectionner un code EMDN" required />}
            />

            <TextField
              label="Durée de vie (en années)"
              name="lifespan"
              type="number"
              value={formData.lifespan}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            <FormControl required>
              <InputLabel>Classe de risque</InputLabel>
              <Select name="riskClass" value={formData.riskClass} onChange={handleChange} label="Classe de risque">
                {riskClasses.map((risk) => (
                  <MenuItem key={risk} value={risk}>
                    {risk}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Montant d'acquisition"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 0 }}
helperText="Entrez le montant en millimes (exemple : 5000 = 5 DT, 50000 = 50 DT, 5000000 = 5000 DT)"
/>



            <TextField
              label="Date d'acquisition"
              name="acquisitionDate"
              type="date"
              value={formData.acquisitionDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Date de début de garantie"
              name="startDateWarranty"
              type="date"
              value={formData.startDateWarranty}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Date de fin de garantie"
              name="endDateWarranty"
              type="date"
              value={formData.endDateWarranty}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />

            <Autocomplete
              options={brands}
              getOptionLabel={(option) => option.name || ""}
              value={formData.brand}
              onChange={(event, newValue) => setFormData((prev) => ({ ...prev, brand: newValue }))}
              renderInput={(params) => <TextField {...params} label="Marque" variant="outlined" />}
            />

           <Autocomplete
  options={suppliers}
  getOptionLabel={(option) => option.name || ""} // Assure-toi que le champ s'appelle bien `name`
  value={suppliers.find((s) => s.id === formData.supplier) || null}
  onChange={(event, newValue) =>
    setFormData((prev) => ({
      ...prev,
      supplier: newValue ? newValue.id : "", // On ne garde que l’ID
    }))
  }
  renderInput={(params) => <TextField {...params} label="Fournisseur" variant="outlined" required />}
/>


            <Autocomplete
              options={servicesByHospital}
              getOptionLabel={(option) => option.name || ""}
              value={servicesByHospital.find((service) => service.id === formData.serviceId) || null}
              onChange={(event, newValue) =>
                setFormData((prev) => ({
                  ...prev,
                  serviceId: newValue ? newValue.id : null,
                }))
              }
              renderInput={(params) => <TextField {...params} label="Service" variant="outlined" />}
            />

            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
              <Button type="submit" variant="contained" color="success">
                Créer l&apos;équipement
              </Button>
            </div>
          </form>
        </Paper>
      </Box>
    </div>
  );
};

export default AddEquipmentToHospital;


