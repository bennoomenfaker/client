/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from "react-redux";
import { Autocomplete, Button, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
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
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        nom: initialData?.nom || "",
        emdnCode: initialData?.emdnCode || null,
        lifespan: initialData?.lifespan || "",
        riskClass: initialData?.riskClass || "",
        hospitalId: initialData?.hospitalId || ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                nom: initialData.nom || "",
                emdnCode: initialData.emdnCode || null,
                lifespan: initialData.lifespan || "",
                riskClass: initialData.riskClass || "",
                hospitalId: initialData.hospitalId || ""
            });
        }
    }, [initialData]);

    useEffect(() => {
        dispatch(fetchEMDNCodes());
        dispatch(fetchHospitals());
    }, [dispatch]);

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };
    const prepareUpdateData = (data) => {
        return {
            ...data,
            amount: data.amount || 0,
            supplier: data.supplier || null,
            acquisitionDate: data.acquisitionDate || null,
            serviceId: data.serviceId || null,
            brandName: data.brandName || null,
            sparePartIds: data.sparePartIds?.length ? data.sparePartIds : [], // Liste vide si undefined/null
            slaId: data.slaId || null,
            startDateWarranty: data.startDateWarranty || null,
            endDateWarranty: data.endDateWarranty || null
        };
    };
    

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            let response;
            if (initialData?.id) {
                // Mode mise à jour → Assure que les champs optionnels sont null ou []
                const updateData = prepareUpdateData(formData);
                response = await dispatch(updateEquipment({ id: initialData.id, formData: updateData }));
                toast.success("Équipement mis à jour avec succès !");
            } else {
                // Mode création → Pas besoin de filtre
                response = await dispatch(createEquipment(formData));
                toast.success("Équipement créé avec succès !");
            }
    
            onSuccess(response.payload.data);
        } catch (error) {
            toast.error("Une erreur s'est produite : " + error.message);
        }
    };
    const handleCancel = () =>{
        navigate("/manage-equipment/equipments")
    }
    
    

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
    const getLastIndex = (emdnCode) => {
        if (!emdnCode) return null;
        const parts = emdnCode.split('.');
        return parts[parts.length - 1];
    };
    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", width: "50%" }}>
            <h1>Créer un nouvel équipement</h1>
            <TextField label="Nom de l'équipement" name="nom" value={formData.nom} onChange={handleChange} required />
            <Autocomplete
                        options={flatEMDNList}
                        getOptionLabel={(option) => `${option.code} - ${option.nom}`}
                        value={flatEMDNList.find(opt => getLastIndex(opt.code) === formData.emdnCode) || null} // Utilisez getLastIndex pour la comparaison
                        onChange={(event, newValue) => {
                            const lastIndex = newValue ? getLastIndex(newValue.code) : null; // Extrait le dernier indice
                            setFormData({ ...formData, emdnCode: lastIndex }); // Stocke uniquement le dernier indice
                        }}
                        renderInput={(params) => <TextField {...params} label="Sélectionner un code EMDN" required />}
                    />
            <TextField label="Durée de vie (en années)" name="lifespan" type="number" value={formData.lifespan} onChange={handleChange} required />
            <FormControl>
                <InputLabel>Classe de risque</InputLabel>
                <Select name="riskClass" value={formData.riskClass} onChange={handleChange} required>
                    {riskClasses.map((risk) => (
                        <MenuItem key={risk} value={risk}>{risk}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl>
                <InputLabel>Hôpital</InputLabel>
                <Select name="hospitalId" value={formData.hospitalId} onChange={handleChange} required>
                    {hospitals.map((hospital) => (
                        <MenuItem key={hospital.id} value={hospital.id}>{hospital.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
            <Button type="submit" variant="contained" color="success">Créer l’équipement</Button>
            <Button onClick={handleCancel} variant="contained" color="warning">Annuler</Button>
            </div>

        </form>
    );
};
EquipmentCreationForm.propTypes = {
    initialData: PropTypes.shape({
        nom: PropTypes.string,
        emdnCode: PropTypes.string,
        lifespan: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        riskClass: PropTypes.string,
        hospitalId: PropTypes.string
    }),
    onSuccess: PropTypes.func.isRequired
};

export default EquipmentCreationForm;
