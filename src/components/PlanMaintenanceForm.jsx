import { useState } from "react";
import { useDispatch } from "react-redux";
import { TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import { updateMaintenancePlansForEquipment } from "../redux/slices/equipmentSlice";


// eslint-disable-next-line react/prop-types
const PlanMaintenanceForm = ({ equipmentId, onComplete }) => {
    const dispatch = useDispatch();

    const [maintenancePlans, setMaintenancePlans] = useState([
        { maintenanceDate: "", description: "", equipmentId: equipmentId }
    ]);

    const handleChange = (event, index) => {
        const { name, value } = event.target;
        const updatedPlans = [...maintenancePlans];
        updatedPlans[index][name] = value;
        setMaintenancePlans(updatedPlans);
    };

    const validateForm = () => {
        for (const plan of maintenancePlans) {
            const { maintenanceDate, description } = plan;

            if (!maintenanceDate || !description.trim()) {
                toast.warning("Tous les champs sont obligatoires !");
                return false;
            }

            const today = new Date().toISOString().split("T")[0]; // Date d'aujourd'hui au format YYYY-MM-DD
            if (maintenanceDate <= today) {
                toast.warning("La date de maintenance doit être dans le futur !");
                return false;
            }
        }

        return true;
    };

    const handleAddPlan = () => {
        setMaintenancePlans([
            ...maintenancePlans,
            { maintenanceDate: "", description: "", equipmentId: equipmentId }
        ]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) return; // Stop si le formulaire n'est pas valide

        try {
            // Envoyer chaque plan de maintenance au backend
       
                await dispatch(updateMaintenancePlansForEquipment({ equipmentId, updatedPlans: maintenancePlans}));
        
            toast.success("Plans de maintenance ajoutés !");
            onComplete(); // Passer à l'étape suivante
           // navigate("/manage-equipment/equipments");
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error("Erreur lors de la planification.");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", width: "50%" }}>
            {maintenancePlans.map((plan, index) => (
                <div key={index}>
                    <TextField
                        label="Date de maintenance"
                        type="date"
                        name="maintenanceDate"
                        value={plan.maintenanceDate}
                        onChange={(event) => handleChange(event, index)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={plan.description}
                        onChange={(event) => handleChange(event, index)}
                        fullWidth
                    />
                </div>
            ))}
            <Button type="button" variant="outlined" color="secondary" onClick={handleAddPlan}>
                Ajouter un autre plan
            </Button>
            <Button type="submit" variant="contained" color="primary">
                Planifier
            </Button>
        </form>
    );
};

export default PlanMaintenanceForm;
