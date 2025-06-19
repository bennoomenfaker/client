import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from "react-redux";
import {
    Autocomplete, Button, TextField, MenuItem,
    Select, FormControl, InputLabel
} from "@mui/material";
import { toast } from "react-toastify";
import { fetchEMDNCodes } from "../redux/slices/emdnNomenclatureSlice";
import { fetchHospitals } from "../redux/slices/hospitalSlice";
import { createEquipment, updateEquipment } from "../redux/slices/equipmentSlice";
import { useNavigate } from "react-router-dom";
const riskClasses = ["1", "2a", "2b", "3"];

const EquipmentCreationForm = ({ initialData, onSuccess }) => {
    const dispatch = useDispatch();
    const hospitals = useSelector((state) => state.hospital.hospitals);
    const emdn = useSelector((state) => state.emdnNomenclature.emdnCodeList);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nom: initialData?.nom || "",
        emdnCode: initialData?.emdnCode || null,
        lifespan: initialData?.lifespan || "",
        riskClass: initialData?.riskClass || "",
        hospitalId: initialData?.hospitalId || "",
        acquisitionDate: initialData?.acquisitionDate || "",
        amount: initialData?.amount || "",
        startDateWarranty: initialData?.startDateWarranty || "",
        endDateWarranty: initialData?.endDateWarranty || "",
        fromMinistere: true,
    });

    useEffect(() => {
        dispatch(fetchEMDNCodes());
        dispatch(fetchHospitals());
    }, [dispatch]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? value : value // On garde le montant comme string pour une meilleure validation
        }));
    };

    const getLastIndex = (emdnCode) => {
        if (!emdnCode) return null;
        const parts = emdnCode.split('.');
        return parts[parts.length - 1];
    };

    const flattenEMDNHierarchy = (data) => {
        let flatList = [];
        const traverse = (items, parentCode = "") => {
            items.forEach(item => {
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

    const validateForm = () => {
        // Validation des champs obligatoires
        if (!formData.nom.trim()) {
            toast.warning("Veuillez saisir le nom de l'équipement");
            return false;
        }
        if (!formData.emdnCode) {
            toast.warning("Veuillez sélectionner un code EMDN");
            return false;
        }
        if (!formData.lifespan) {
            toast.warning("Veuillez saisir la durée de vie");
            return false;
        }
        if (!formData.riskClass) {
            toast.warning("Veuillez sélectionner une classe de risque");
            return false;
        }
        if (!formData.hospitalId) {
            toast.warning("Veuillez sélectionner un hôpital");
            return false;
        }
        if (!formData.acquisitionDate) {
            toast.warning("Veuillez saisir la date d'acquisition");
            return false;
        }
        if (!formData.amount) {
            toast.warning("Veuillez saisir le montant d'acquisition");
            return false;
        }
        if (!formData.startDateWarranty) {
            toast.warning("Veuillez saisir la date de début de garantie");
            return false;
        }
        if (!formData.endDateWarranty) {
            toast.warning("Veuillez saisir la date de fin de garantie");
            return false;
        }

        // Validation spécifique pour le montant
        const amountValue = parseFloat(formData.amount);
        if (isNaN(amountValue)) {
            toast.warning("Le montant doit être un nombre valide");
            return false;
        }
        if (amountValue < 0) {
            toast.warning("Le montant ne peut pas être négatif");
            return false;
        }

        // Validation des dates
        if (new Date(formData.endDateWarranty) < new Date(formData.startDateWarranty)) {
            toast.warning("La date de fin de garantie doit être postérieure à la date de début");
            return false;
        }

        return true;
    };

    const prepareUpdateData = (data) => {
        return {
            ...data,
            amount: parseFloat(data.amount) || 0,
            supplier: data.supplier || null,
            acquisitionDate: data.acquisitionDate || null,
            serviceId: data.serviceId || null,
            brandName: data.brandName || null,
            sparePartIds: data.sparePartIds?.length ? data.sparePartIds : [],
            slaId: data.slaId || null,
            startDateWarranty: data.startDateWarranty || null,
            endDateWarranty: data.endDateWarranty || null,
            fromMinistere: true,
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            let response;
            const equipmentData = {
                ...formData,
                amount: parseFloat(formData.amount)
            };

            if (initialData?.id) {
                const updateData = prepareUpdateData(equipmentData);
                response = await dispatch(updateEquipment({ id: initialData.id, formData: updateData }));
                toast.success("Équipement mis à jour avec succès !");
            } else {
                response = await dispatch(createEquipment(equipmentData));
                toast.success("Équipement créé avec succès !");
            }
            onSuccess(response.payload.data);
        } catch (err) {
            toast.error("Une erreur s'est produite : " + err.message);
        }
    };

    const handleCancel = () => {
        navigate("/manage-equipment/equipments");
    };

    // Fonction pour ajouter l'astérisque rouge aux labels
    const requiredLabel = (label) => (
        <span>
            {label}
            <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
        </span>
    );

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", width: "50%" }}>
            <h1>{initialData?.id ? "Modifier l'équipement" : "Créer un nouvel équipement"}</h1>
            
            <TextField 
                label={requiredLabel("Nom de l'équipement")}
                name="nom" 
                value={formData.nom} 
                onChange={handleChange}
            />
            
            <Autocomplete
                options={flatEMDNList}
                getOptionLabel={(option) => `${getLastIndex(option.code)} - ${option.nom}`}
                value={flatEMDNList.find(opt => getLastIndex(opt.code) === formData.emdnCode) || null}
                onChange={(event, newValue) => {
                    const lastIndex = newValue ? getLastIndex(newValue.code) : null;
                    setFormData({ ...formData, emdnCode: lastIndex });
                }}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label={requiredLabel("Code EMDN")}
                    />
                )}
            />
            
            <TextField 
                label={requiredLabel("Durée de vie (en années)")}
                name="lifespan" 
                type="number" 
                value={formData.lifespan} 
                onChange={handleChange} 
            />
            
            <FormControl>
                <InputLabel>{requiredLabel("Classe de risque")}</InputLabel>
                <Select 
                    name="riskClass" 
                    value={formData.riskClass} 
                    onChange={handleChange}
                >
                    {riskClasses.map((risk) => (
                        <MenuItem key={risk} value={risk}>{risk}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            
            <FormControl>
                <InputLabel>{requiredLabel("Hôpital")}</InputLabel>
                <Select 
                    name="hospitalId" 
                    value={formData.hospitalId} 
                    onChange={handleChange}
                >
                    {hospitals.map((hospital) => (
                        <MenuItem key={hospital.id} value={hospital.id}>{hospital.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            
            <TextField
                label={requiredLabel("Date d'acquisition")}
                name="acquisitionDate"
                type="date"
                value={formData.acquisitionDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
            />
            
            <TextField
                label={requiredLabel("Montant d'acquisition")}
                name="amount"
                type="text"
                value={formData.amount}
                onChange={handleChange}
                inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*.?[0-9]*'
                }}
            />
            
            <TextField
                label={requiredLabel("Date de début de garantie")}
                name="startDateWarranty"
                type="date"
                value={formData.startDateWarranty}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
            />
            
            <TextField
                label={requiredLabel("Date de fin de garantie")}
                name="endDateWarranty"
                type="date"
                value={formData.endDateWarranty}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                    min: formData.startDateWarranty || ''
                }}
            />
            
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                <Button type="submit" variant="contained" color="success">
                    {initialData?.id ? "Mettre à jour" : "Créer l'équipement"}
                </Button>
                <Button onClick={handleCancel} variant="contained" color="warning">Annuler</Button>
            </div>
        </form>
    );
};

EquipmentCreationForm.propTypes = {
    initialData: PropTypes.shape({
        id: PropTypes.string,
        nom: PropTypes.string,
        emdnCode: PropTypes.string,
        lifespan: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        riskClass: PropTypes.string,
        hospitalId: PropTypes.string,
        acquisitionDate: PropTypes.string,
        amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        startDateWarranty: PropTypes.string,
        endDateWarranty: PropTypes.string
    }),
    onSuccess: PropTypes.func.isRequired
};

export default EquipmentCreationForm;