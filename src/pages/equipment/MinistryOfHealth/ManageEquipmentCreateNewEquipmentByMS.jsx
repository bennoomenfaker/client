import NavBar from "../../../components/NavBar";
import { useState, useEffect } from "react";
import { useDispatch} from "react-redux";
import { fetchEMDNCodes } from "../../../redux/slices/emdnNomenclatureSlice";
import { fetchHospitals } from "../../../redux/slices/hospitalSlice";
import { Stepper, Step, StepLabel } from "@mui/material";
import EquipmentCreationForm from "../../../components/EquipmentCreationForm";
import PlanMaintenanceForm from "../../../components/PlanMaintenanceForm";

const steps = ["Créer un équipement", "Planifier la maintenance"];

const ManageEquipmentCreateNewEquipmentByMS = () => {
    const dispatch = useDispatch();
    const [isNavOpen, setIsNavOpen] = useState(true);
    const [activeStep, setActiveStep] = useState(0);
    const [createdEquipmentId, setCreatedEquipmentId] = useState(null);

    useEffect(() => {
        dispatch(fetchEMDNCodes());
        dispatch(fetchHospitals());
    }, [dispatch]);

    return (
        <div style={{ display: "flex" }}>
            <NavBar onToggle={setIsNavOpen} />
            <div style={{ width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)", transition: "width 0.3s ease", padding: "20px", marginTop: 50 }}>
                
                {/* Stepper pour afficher l'étape actuelle */}
                <Stepper activeStep={activeStep} style={{ marginBottom: "20px" }}>
                    {steps.map((label, index) => (
                        <Step key={index}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {/* Affichage dynamique du formulaire selon l'étape */}
                {activeStep === 0 ? (
                    <EquipmentCreationForm onSuccess={(id) => {
                        setCreatedEquipmentId(id);
                        setActiveStep(1);
                    }} />
                ) : (
                    <PlanMaintenanceForm 
                        equipmentId={createdEquipmentId} 
                        onComplete={() => setActiveStep(2)}
                    />
                )}
            </div>
        </div>
    );
};

export default ManageEquipmentCreateNewEquipmentByMS;
