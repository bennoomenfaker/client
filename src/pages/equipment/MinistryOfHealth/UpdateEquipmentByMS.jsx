import NavBar from "../../../components/NavBar";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchEMDNCodes } from "../../../redux/slices/emdnNomenclatureSlice";
import { fetchHospitals } from "../../../redux/slices/hospitalSlice";
import { fetchEquipmentBySerial, updateEquipment, updateMaintenancePlansForEquipment } from "../../../redux/slices/equipmentSlice";
import { CircularProgress, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Autocomplete, Stepper, Step, StepLabel, Paper, Slide, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Checkbox, FormControlLabel } from "@mui/material";
import { toast } from "react-toastify";
import { fetchBrandsByHospital } from "../../../redux/slices/brandsSlice";
import { fetchServicesByHospitalId } from "../../../redux/slices/hospitalServiceSlice";
import { deleteMaintenancePlan } from "../../../redux/slices/maintenancePlanSlice ";
import SlaManagement from "../../../components/SlaManagement";
import SpareParts from '../../../components/SpareParts'
import { getProfile } from "../../../redux/slices/authSlice";
import {fetchSuppliersByHospital}  from '../../../redux/slices/supplierSlice'

const riskClasses = ["1", "2a", "2b", "3"];
const allStatus = ["en attente de réception", "en service", "en panne", "en maintenance", "hors service"]

const UpdateEquipmentByMS = () => {
    const dispatch = useDispatch();
    const { serialCode } = useParams();
    const [isNavOpen, setIsNavOpen] = useState(true);
    const [equipmentId, setEquipmentId] = useState(null);
    const { equipment, loading } = useSelector((state) => state.equipment);
    const hospitals = useSelector((state) => state.hospital.hospitals);
    const emdn = useSelector((state) => state.emdnNomenclature.emdnCodeList);
    const [step, setStep] = useState(0);
    const navigate = useNavigate();
    const brands = useSelector((state) => state.brand.brandList);
    const servicesByHospital = useSelector((state) => state.hospitalService.serviceByHospital);
    const [reception, setReception] = useState(false); // New state for reception checkbox
     const suppliers = useSelector((state)=>state.supplier.suppliers)
    const hospitalId = sessionStorage.getItem("hospitalId");
    const userRole = sessionStorage.getItem("role");
    const isAdmin = userRole === "ROLE_HOSPITAL_ADMIN";
    const isCompany = userRole === "ROLE_MAINTENANCE_COMPANY"
    const isEngeering = userRole === "ROLE_MAINTENANCE_ENGINEER"
    const isMS = userRole ==="ROLE_MINISTRY_ADMIN"

    const [equipmentFormData, setEquipmentFormData] = useState({});
    const [maintenancePlans, setMaintenancePlans] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [planIndexToRemove, setPlanIndexToRemove] = useState(null);
 

useEffect(() => {
  if (hospitalId) {
    dispatch(fetchSuppliersByHospital(hospitalId));
  }
}, [dispatch, hospitalId]);


    useEffect(() => {
        dispatch(fetchEMDNCodes());
        dispatch(fetchHospitals());
        dispatch(getProfile())
        if (serialCode) {
            dispatch(fetchEquipmentBySerial(serialCode));
        }
        if (userRole === "ROLE_HOSPITAL_ADMIN" && hospitalId) {
            dispatch(fetchBrandsByHospital(hospitalId));
            dispatch(fetchServicesByHospitalId(hospitalId));
        }

    }, [dispatch, serialCode, hospitalId, userRole]);

    useEffect(() => {
        if (equipment && serialCode) {
            setEquipmentId(equipment.id);
            setEquipmentFormData({
                ...equipment,
                emdnCode: equipment.emdnCode?.code?.split('.').pop() || '',
                riskClass: equipment.riskClass || '',
                hospitalId: equipment.hospitalId || '',
                supplier: equipment.supplier || '',
                amount: equipment.amount || 0,
                acquisitionDate: equipment.acquisitionDate ? equipment.acquisitionDate.split("T")[0] : '',
                status: equipment.status || '',
                useCount: equipment.useCount || 0,
                usageDuration: equipment.usageDuration || 0,
                serviceId: equipment.serviceId || null,
                startDateWarranty: equipment.startDateWarranty ? equipment.startDateWarranty.split("T")[0] : '',
                endDateWarranty: equipment.endDateWarranty ? equipment.endDateWarranty.split("T")[0] : '',
                lastUsedAt: equipment.lastUsedAt
                    ? new Date(equipment.lastUsedAt).toISOString().slice(0, 16)
                    : '',
                fromMinistere: equipment.fromMinistere,


            });
            setReception(equipment.reception || false); // Set the initial value for the reception checkbox

            if (equipment.maintenancePlans && equipment.maintenancePlans.length > 0) {
                const formattedPlans = equipment.maintenancePlans.map(plan => ({
                    ...plan,
                    maintenanceDate: plan.maintenanceDate ? plan.maintenanceDate.split('T')[0] : "",
                     frequency: plan.frequency || ""
                }));
                setMaintenancePlans(formattedPlans);
            } else {
                setMaintenancePlans([{ id: null, maintenanceDate: "", description: "", frequency: "", equipmentId: equipment.id }]);
            }

        }
    }, [equipment, serialCode]);

    if (loading) {
        return (<>
            <NavBar />
            <CircularProgress />;
        </>)
    }


    const handleEquipmentChange = (event) => {
        const { name, value } = event.target;

        // Si on change le status vers "en service" et que réception est false
        if (name === "status" && value === "en service" && !reception) {
            setReception(true);
            setEquipmentFormData((prevData) => ({
                ...prevData,
                [name]: value,
                reception: true // On met aussi reception à true dans les données envoyées
            }));
        } else {
            setEquipmentFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };


    const handleEquipmentSubmit = async (event) => {
        event.preventDefault();
        if (!equipmentFormData.nom || !equipmentFormData.emdnCode || !equipmentFormData.lifespan || !equipmentFormData.riskClass || !equipmentFormData.hospitalId) {
            toast.warning("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        const formDataWithBrandName = {
            ...equipmentFormData,
            brand: equipmentFormData.brand ? equipmentFormData.brand.name : '' ,
             supplierId: equipmentFormData.supplier?.id || null, 
        };

        try {
            await dispatch(updateEquipment({ id: equipmentId, formData: formDataWithBrandName }));
            toast.success("Équipement mis à jour avec succès !");
            setStep(1); // Aller directement à la maintenance après la modification de l'équipement
        } catch (error) {
            console.error("Une erreur s'est produite : " + error.message);
        }
    };
    const handleReceptionChange = (event) => {
        setReception(event.target.checked); // Update reception state when checkbox is toggled
        setEquipmentFormData({
            ...equipmentFormData,
            reception: event.target.checked, // Update the equipment form data with the reception value
        });
    };



    const handleMaintenanceChange = (event, index) => {
        const { name, value } = event.target;
        const updatedPlans = [...maintenancePlans];
        updatedPlans[index][name] = value;
        setMaintenancePlans(updatedPlans);
    };

    const handleAddPlan = () => {
        setMaintenancePlans([
            ...maintenancePlans,
            { maintenanceDate: "", description: "", equipmentId: equipmentId }
        ]);
    };

    const handleRemovePlan = (index) => {
        setPlanIndexToRemove(index);
        setOpenDialog(true);
    };
    const handleConfirmRemovePlan = () => {
        const planToRemove = maintenancePlans[planIndexToRemove]; // Récupérer le plan à supprimer
        const planIdToRemove = planToRemove.id; // Assurez-vous que votre plan a un champ 'id'

        if (planIdToRemove) {
            dispatch(deleteMaintenancePlan({ maintenancePlanId: planToRemove.id }))
                .then(() => {

                    // Si la suppression API réussit, mettre à jour le state local
                    const updatedPlans = [...maintenancePlans];
                    updatedPlans.splice(planIndexToRemove, 1);
                    setMaintenancePlans(updatedPlans);
                    toast.success("Suppression réussie du plan de maintenance"); // Afficher le toast de succès

                })
                .catch((error) => {
                    // Gérer l'erreur de suppression API
                    console.error("Erreur lors de la suppression du plan:", error);
                    // Vous pouvez afficher un message d'erreur à l'utilisateur ici
                })
                .finally(() => {
                    setOpenDialog(false);
                    setPlanIndexToRemove(null);
                });
        } else {
            // Si l'ID n'est pas disponible (nouveau plan non sauvegardé), supprimer localement
            dispatch(deleteMaintenancePlan({ maintenancePlanId: planToRemove.id }))


            const updatedPlans = [...maintenancePlans];
            updatedPlans.splice(planIndexToRemove, 1);
            setMaintenancePlans(updatedPlans);
            setOpenDialog(false);
            setPlanIndexToRemove(null);
        }
    };

    const handleCancelRemovePlan = () => {
        setOpenDialog(false);
        setPlanIndexToRemove(null);
    };
    const handleMaintenanceSubmit = async (event) => {
        event.preventDefault();
        if (maintenancePlans.some(plan => !plan.maintenanceDate || !plan.description)) {
            toast.warning("Veuillez remplir tous les champs obligatoires pour les plans de maintenance.");
            return;
        }

        try {



            await dispatch(updateMaintenancePlansForEquipment({ equipmentId, updatedPlans: maintenancePlans }));


            toast.success("Plans de maintenance enregistrés !");
            if (isAdmin || isEngeering) {
                setStep(2);
            } else {
                navigate("/manage-equipment/equipments");
            }
            if (isCompany) {
                navigate("/manage-maintenance/trackMaintenance");

            }
        } catch (error) {
            console.error("Erreur lors de l'enregistrement des plans de maintenance : ", error);
            toast.error("Erreur lors de l'enregistrement des plans de maintenance.");
        }
    };
   const handleCancel = () => {
    if (isCompany) {
        navigate("/manage-maintenance/trackMaintenance");
    } else if (isAdmin) {
        navigate("/manage-equipment/equipmentsOfHospital");
    } else {
        navigate("/manage-equipment/equipments");
    }
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

    const steps = ["Modifier l'équipement", "Planifier la maintenance", "SLA", "Pièces de rechange"];
    // Add this condition to disable the fields
const shouldDisableFields = equipmentFormData.fromMinistere === true && !isMS;
    return (
        <div style={{ display: "flex" }}>
            <NavBar onToggle={setIsNavOpen} />
            <div style={{ width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)", transition: "width 0.3s ease", padding: "20px", marginTop: 50 }}>

                <Stepper activeStep={step} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Slide direction="right" in={step === 0} mountOnEnter unmountOnExit>
                    <Paper elevation={3} style={{ padding: "20px", marginBottom: "20px" }}>
                        <form onSubmit={handleEquipmentSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", width: "50%" }}>
                            <h1>Modifier l&apos;équipement</h1>
                            <TextField
                                label="Nom de l'équipement"
                                name="nom"
                                value={equipmentFormData.nom}
                                onChange={handleEquipmentChange}
                                InputLabelProps={{ shrink: true }} // Ajout de cette ligne
                                required
                            />
                            <Autocomplete
                                options={flatEMDNList}
                                getOptionLabel={(option) => `${option.code.split('.').pop()} - ${option.nom}`}
                                value={flatEMDNList.find(opt => opt.code.split('.').pop() === equipmentFormData.emdnCode) || null}
                                onChange={(event, newValue) => {
                                    setEquipmentFormData({
                                        ...equipmentFormData,
                                        emdnCode: newValue ? newValue.code.split('.').pop() : ""
                                    });
                                }}
                                disabled={shouldDisableFields}
                                renderInput={(params) => <TextField {...params} label="Sélectionner un code EMDN" required />}
                            />
                            <TextField
                                label="Durée de vie (en années)"
                                name="lifespan"
                                type="number"
                                value={equipmentFormData.lifespan}
                                onChange={handleEquipmentChange}
                                InputLabelProps={{ shrink: true }} // Ajout de cette ligne
                                required
                            />
                            <FormControl key={`riskClass-${equipmentFormData.riskClass}`}>
                                <InputLabel>Classe de risque</InputLabel>
                                <Select
                                    name="riskClass"
                                    value={equipmentFormData.riskClass}
                                    onChange={handleEquipmentChange}
                                    required
                                >
                                    {riskClasses.map((risk) => (
                                        <MenuItem key={risk} value={risk}>{risk}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl key={`hospital-${equipmentFormData.hospitalId}`}>
                                <InputLabel>Hôpital</InputLabel>
                                <Select
                                    name="hospitalId"
                                    value={equipmentFormData.hospitalId}
                                    onChange={handleEquipmentChange}
                                    disabled={shouldDisableFields}
                                    required
                                >
                                    {hospitals.map((hospital) => (
                                        <MenuItem key={hospital.id} value={hospital.id}>
                                            {hospital.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>


                          <TextField
  label="Montant d'acquisition"
  name="amount"
  type="number"
  value={equipmentFormData.amount}
  onChange={handleEquipmentChange}
  InputLabelProps={{ shrink: true }}
  disabled={shouldDisableFields}
helperText="Entrez le montant en millimes (exemple : 5000 = 5 DT, 50000 = 50 DT, 5000000 = 5000 DT)"
/>


                            <TextField
                                label="Date d'acquisition"
                                name="acquisitionDate"
                                type="date"
                                value={equipmentFormData.acquisitionDate}
                                onChange={handleEquipmentChange}
                                InputLabelProps={{ shrink: true }}
                                disabled={shouldDisableFields}
                            />


                            <TextField
                                label="Date de début de garantie"
                                name="startDateWarranty"
                                type="date"
                                value={equipmentFormData.startDateWarranty}
                                onChange={handleEquipmentChange}
                                InputLabelProps={{ shrink: true }}
                                disabled={shouldDisableFields}
                            />
                            <TextField
                                label="Date de fin de garantie"
                                name="endDateWarranty"
                                type="date"
                                value={equipmentFormData.endDateWarranty}
                                onChange={handleEquipmentChange}
                                InputLabelProps={{ shrink: true }}
                                disabled={shouldDisableFields}
                            />

                            {(isAdmin || isEngeering ) && (
                                <>
                                    <Autocomplete
                                        options={brands}
                                        getOptionLabel={(option) => option.name || ""}
                                        value={equipmentFormData.brand ? brands.find(brand => brand.id === equipmentFormData.brand.id) : null}
                                        onChange={(event, newValue) => {
                                            setEquipmentFormData({
                                                ...equipmentFormData,
                                                brand: newValue, // Stocker l'objet brand complet
                                            });
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Marque" variant="outlined" />}
                                    />
   <Autocomplete
    options={suppliers}
    getOptionLabel={(option) => option.name || ""}
    value={
        suppliers.find((supplier) => supplier.id === equipmentFormData?.supplier?.id) || null
    }
    onChange={(event, newValue) => {
        setEquipmentFormData({
            ...equipmentFormData,
            supplier: newValue // on stocke l'objet complet ici
        });
    }}
    renderInput={(params) => (
        <TextField {...params} label="Fournisseur" variant="outlined" required />
    )}
/>

 

                                    <Autocomplete
                                        options={servicesByHospital}
                                        getOptionLabel={(option) => option.name || ""}
                                        value={servicesByHospital.find(service => service.id === equipmentFormData.serviceId) || null}
                                        onChange={(event, newValue) => {
                                            setEquipmentFormData({
                                                ...equipmentFormData,
                                                serviceId: newValue ? newValue.id : null,
                                            });
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Service" variant="outlined" />}
                                    />
                                    <FormControl key={`status-${equipmentFormData.status}`}>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            name="status"
                                            value={equipmentFormData.status}
                                            onChange={handleEquipmentChange}
                                            required
                                        >
                                            {allStatus
                                                .filter(statusItem => !(reception && statusItem === "en attente de réception")) // Filter based on reception
                                                .map((statusItem) => (
                                                    <MenuItem key={statusItem} value={statusItem}>{statusItem}</MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>

                                    {!reception && ( // Conditionally render the checkbox
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={reception}
                                                    onChange={handleReceptionChange}
                                                    name="reception"
                                                />
                                            }
                                            label="Réception"
                                        />
                                    )}
                                </>
                            )}
                            {isCompany && (
    <>
            <FormControl key={`status-${equipmentFormData.status}`}>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            name="status"
                                            value={equipmentFormData.status}
                                            onChange={handleEquipmentChange}
                                            required
                                        >
                                            {allStatus
                                                .filter(statusItem => !(reception && statusItem === "en attente de réception")) // Filter based on reception
                                                .map((statusItem) => (
                                                    <MenuItem key={statusItem} value={statusItem}>{statusItem}</MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
        
    </>
)}


                                  {/*  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <TextField
                                            label="Nombre d'utilisations"
                                            type="number"
                                            value={equipmentFormData.useCount || 0}
                                            onChange={(e) => {
                                                const newValue = parseInt(e.target.value, 10);
                                                setEquipmentFormData(prev => ({
                                                    ...prev,
                                                    useCount: isNaN(newValue) ? 0 : newValue
                                                }));
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={() =>
                                                setEquipmentFormData(prev => ({
                                                    ...prev,
                                                    useCount: (prev.useCount || 0) + 1
                                                }))
                                            }
                                        >
                                            +
                                        </Button>
                                    </div> */}

                                    {/*<FormControl>
                                        <FormLabel>Durée totale utilisée</FormLabel>
                                        <TextField
                                            value={formatDuration(equipmentFormData.usageDuration || 0)}
                                            InputProps={{ readOnly: true }}
                                        />
                                    </FormControl> */}

                                    {/*   <FormControl>
                                        <FormLabel>Ajouter durée aujourd&apos;hui</FormLabel>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <TextField
                                                label="Heures"
                                                type="number"
                                                value={additionalDuration.hours}
                                                onChange={(e) =>
                                                    setAdditionalDuration(prev => ({
                                                        ...prev,
                                                        hours: parseInt(e.target.value || 0)
                                                    }))
                                                }
                                            />
                                            <TextField
                                                label="Minutes"
                                                type="number"
                                                value={additionalDuration.minutes}
                                                onChange={(e) =>
                                                    setAdditionalDuration(prev => ({
                                                        ...prev,
                                                        minutes: parseInt(e.target.value || 0)
                                                    }))
                                                }
                                            />
                                        </div>
                                        <Button
                                            variant="contained"
                                            onClick={() => {
                                                const totalToAdd = additionalDuration.hours * 60 + additionalDuration.minutes;
                                                setEquipmentFormData(prev => ({
                                                    ...prev,
                                                    usageDuration: (prev.usageDuration || 0) + totalToAdd
                                                }));
                                                setAdditionalDuration({ hours: 0, minutes: 0 });
                                            }}
                                            style={{ marginTop: '10px' }}
                                        >
                                            Ajouter à la durée totale
                                        </Button>
                                    </FormControl>
                                    <TextField
                                        type="datetime-local"
                                        name="lastUsedAt"
                                        label="Dernière utilisation"
                                        value={equipmentFormData.lastUsedAt}
                                        onChange={handleEquipmentChange}
                                        fullWidth
                                    />
 */}
                            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                <Button type="submit" variant="contained" color="success">Modifier l’équipement</Button>
                                <Button type="button" onClick={handleCancel}>Annuler</Button>
                                <Button type="button" onClick={() => setStep(1)}>Passer</Button>

                            </div>
                        </form>
                    </Paper>
                </Slide>

                <Slide direction="left" in={step === 1} mountOnEnter unmountOnExit>
                    <Paper elevation={3} style={{ padding: "30px", marginBottom: "20px", marginLeft: "20%", width: "50%" }}>
                        <form onSubmit={handleMaintenanceSubmit} style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
                            <h1>Plan de maintenance</h1>
                            {maintenancePlans.length > 0 ? (
                                maintenancePlans.map((plan, index) => (
                                    <div key={index} style={{ marginBottom: "20px" }}> {/* Ajout d'une marge entre les éléments */}
                                        <TextField
                                            label="Date de maintenance"
                                            type="date"
                                            name="maintenanceDate"
                                            value={plan.maintenanceDate}
                                            onChange={(event) => handleMaintenanceChange(event, index)}
                                            InputLabelProps={{ shrink: true }}
                                            fullWidth
                                            disabled={shouldDisableFields}

                                            style={{ marginBottom: "20px" }} // Marge spécifique entre les champs
                                        />
                                        <TextField
                                            label="Description"
                                            name="description"
                                            value={plan.description}
                                            onChange={(event) => handleMaintenanceChange(event, index)}
                                            fullWidth
                                            disabled={shouldDisableFields}
                                              multiline
                                               minRows={3}

                                            style={{ marginBottom: "20px" }} // Marge spécifique entre les champs
                                        />
                                            <FormControl fullWidth>
      <InputLabel id={`frequency-label-${index}`}>Fréquence</InputLabel>
      <Select
        disabled={shouldDisableFields}
        labelId={`frequency-label-${index}`}
        name="frequency"
        value={plan.frequency}
        onChange={(event) => handleMaintenanceChange(event, index)}
        required
      >
        <MenuItem value="MENSUELLE">Mensuelle</MenuItem>
        <MenuItem value="TRIMESTRIELLE">Trimestrielle</MenuItem>
        <MenuItem value="SEMESTRIELLE">Semestrielle</MenuItem>
        <MenuItem value="ANNUELLE">Annuelle</MenuItem>
      </Select>
    </FormControl>
                                        {!shouldDisableFields && (  // Only show delete button if fields shouldn't be disabled
                                            <Button type="button" variant="outlined" color="error" onClick={() => handleRemovePlan(index)}>
                                                Supprimer
                                            </Button>
                                        )}
                                        
                                    </div>
                                ))
                            ) : (
                                <Typography>Aucun plan de maintenance trouvé.</Typography>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                                {!shouldDisableFields && (  // Only show these buttons if fields shouldn't be disabled
                                    <Button type="button" variant="outlined" color="secondary" onClick={handleAddPlan}>
                                        Ajouter un autre plan
                                    </Button>
                                )}
                                <Button type="submit" variant="contained" color="success" disabled={shouldDisableFields}>
                                    Planifier
                                </Button>
                                <Button type="button" onClick={() => setStep(0)}>
                                    Retour
                                </Button>
                                {!isCompany &&(<> {shouldDisableFields && (<Button type="button" onClick={() => setStep(2)}>Passer</Button>)}</>)}
                                {isCompany && (<> <Button onClick={handleCancel}>Terminer</Button></>)}

                            </div>
                        </form>
                    </Paper>
                </Slide>

                {(isAdmin  || isEngeering) && step > 1 && (
                    <>
                        {/* Slide pour Gérer le SLA */}
                        <Slide direction="left" in={step === 2} mountOnEnter unmountOnExit>
                            <Paper elevation={3} style={{ padding: "20px", marginBottom: "20px", float: "right", width: "50%" }}>
                                <h1>Gérer le SLA</h1>
                                <SlaManagement equipment={equipment} setStep={setStep} />
                                <Button onClick={() => setStep(3)}>Passer aux pièces de rechange</Button>
                                <Button onClick={() => setStep(1)}>Retour</Button>
                            </Paper>
                        </Slide>

                        {/* Slide pour Gérer les pièces de rechange */}
                        <Slide direction="left" in={step === 3} mountOnEnter unmountOnExit>
                            <Paper elevation={3} style={{ padding: "20px", marginBottom: "20px", float: "left", width: "100%", marginLeft: "-5%" }}>
                                <h1>Gérer les pièces de rechange</h1>
                                <SpareParts equipment={equipment} />
                                <Button onClick={handleCancel}>Terminer</Button>
                                <Button onClick={() => setStep(2)}>Retour</Button>
                            </Paper>
                        </Slide>

                    </>)}
                {/* Dialogue de confirmation */}
                <Dialog
                    open={openDialog}
                    onClose={handleCancelRemovePlan}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Confirmer la suppression"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Êtes-vous sûr de vouloir supprimer ce plan de maintenance ?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelRemovePlan} color="primary">
                            Annuler
                        </Button>
                        <Button onClick={handleConfirmRemovePlan} color="error" autoFocus>
                            Supprimer
                        </Button>
                    </DialogActions>
                </Dialog>

            </div>

        </div>
    );
};

export default UpdateEquipmentByMS;