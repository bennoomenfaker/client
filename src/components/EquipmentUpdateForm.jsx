import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from "react-redux";
import { Autocomplete, Button, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { fetchEMDNCodes } from "../redux/slices/emdnNomenclatureSlice";
import { fetchHospitals } from "../redux/slices/hospitalSlice";
import { updateEquipment } from "../redux/slices/equipmentSlice";
import NavBar from "./NavBar";

const riskClasses = ["1", "2a", "2b", "3"];
const EquipmentUpdateForm = ({ initialData }) => {
    const dispatch = useDispatch();
    const hospitals = useSelector((state) => state.hospital.hospitals);
    const emdn = useSelector((state) => state.emdnNomenclature.emdnCodeList);
    const isLoading = useSelector((state) => state.emdnNomenclature.isLoading);
    // Initialisez formData avec initialData ou des valeurs par défaut
    const [formData, setFormData] = useState(initialData ? {
        id: initialData.id,
        nom: initialData.nom,
        emdnCode: initialData.emdnCode?.code?.split('.').pop() || '',
        lifespan: initialData.lifespan,
        riskClass: initialData.riskClass,
        hospitalId: initialData.hospitalId,
        amount: initialData.amount,
        supplier: initialData.supplier,
        acquisitionDate: initialData.acquisitionDate,
        serviceId: initialData.serviceId,
        // eslint-disable-next-line react/prop-types
        brandName: initialData.brand?.name,
        sparePartIds: initialData.sparePartIds,
        slaId: initialData.slaId,
        startDateWarranty: initialData.startDateWarranty,
        endDateWarranty: initialData.endDateWarranty,
        reception: initialData.reception,
        fromMinistere: initialData.fromMinistere
    } : {
        id: null,
        nom: '',
        emdnCode: '',
        lifespan: '',
        riskClass: '',
        hospitalId: '',
        amount: 0,
        supplier: null,
        acquisitionDate: null,
        serviceId: null,
        brandName: null,
        sparePartIds: [],
        slaId: null,
        startDateWarranty: null,
        endDateWarranty: null,
        reception: false,
        fromMinistere : true
    });

    

    useEffect(() => {
        dispatch(fetchEMDNCodes());
        dispatch(fetchHospitals());
    }, [dispatch]);

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (initialData?.id) {
             await dispatch(updateEquipment({ id: initialData.id, formData }));
                toast.success("Équipement mis à jour avec succès !");
            }
        } catch (error) {
            console.error("Une erreur s'est produite : " + error.message);
        }
    };
    if (isLoading) {
        return (<>
            <NavBar/>
             <CircularProgress />;
            </>)
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

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", width: "50%" }}>
            <h1>Modifier l&apos;équipement</h1>
            <TextField label="Nom de l'équipement" name="nom" value={formData.nom} onChange={handleChange} required />
            <Autocomplete
                options={flatEMDNList}
                getOptionLabel={(option) => `${option.code} - ${option.nom}`}
                value={flatEMDNList.find(opt => opt.code.split('.').pop() === formData.emdnCode) || null}
                onChange={(event, newValue) => {
                    setFormData({
                        ...formData,
                        emdnCode: newValue ? newValue.code.split('.').pop() : ""
                    });
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
            <Button type="submit" variant="contained" color="primary">Modifier l’équipement</Button>
        </form>
    );
};

EquipmentUpdateForm.propTypes = {
    initialData: PropTypes.shape({
        id: PropTypes.string,
        nom: PropTypes.string,
        emdnCode: PropTypes.shape({
            code: PropTypes.string,
            nom: PropTypes.string
        }),
        lifespan: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        riskClass: PropTypes.string,
        hospitalId: PropTypes.string,
        amount: PropTypes.number,
        supplier: PropTypes.string,
        acquisitionDate: PropTypes.string,
        serviceId: PropTypes.string,
        brandName: PropTypes.string,
        sparePartIds: PropTypes.arrayOf(PropTypes.string),
        slaId: PropTypes.string,
        startDateWarranty: PropTypes.string,
        endDateWarranty: PropTypes.string,
        reception: PropTypes.bool,
        fromMinistere: PropTypes.bool
    }),
    onSuccess: PropTypes.func.isRequired
};

export default EquipmentUpdateForm;