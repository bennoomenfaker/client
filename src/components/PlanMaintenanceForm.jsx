/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useDispatch } from "react-redux";
import { TextField, Button, IconButton, Divider, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { createMaintenancePlan } from "../redux/slices/maintenancePlanSlice "; 

// eslint-disable-next-line react/prop-types
const PlanMaintenanceForm = ({ equipmentId, onComplete }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

  const [maintenancePlans, setMaintenancePlans] = useState([
  { maintenanceDate: "", description: "", frequency: "", equipmentId }
]);



    const handleAddPlan = () => {
       setMaintenancePlans([
  ...maintenancePlans,
  { maintenanceDate: "", description: "", frequency: "", equipmentId }
]);

    };

    const handleRemovePlan = (indexToRemove) => {
        if (maintenancePlans.length === 1) {
            toast.warning("Au moins un plan de maintenance est requis.");
            return;
        }
        const updatedPlans = maintenancePlans.filter((_, index) => index !== indexToRemove);
        setMaintenancePlans(updatedPlans);
    };

    const validateForm = () => {
        const today = new Date();
        for (const plan of maintenancePlans) {
            const { maintenanceDate, description } = plan;

            if (!maintenanceDate || !description.trim()) {
                toast.warning("Tous les champs sont obligatoires !");
                return false;
            }
            if (!plan.frequency) {
  toast.warning("Veuillez sélectionner une fréquence !");
  return false;
}

            const planDate = new Date(maintenanceDate);
            if (planDate <= today) {
                toast.warning("La date de maintenance doit être strictement future !");
                return false;
            }
        }
        return true;
    };

 const handleChange = (event, index) => {
  const { name, value } = event.target; // name peut être 'maintenanceDate', 'description' ou 'frequency'
  const updatedPlans = [...maintenancePlans];
  updatedPlans[index][name] = value;  // mise à jour dynamique en fonction du champ modifié
  setMaintenancePlans(updatedPlans);
};

const handleSubmit = async (event) => {
  event.preventDefault();

  for (const plan of maintenancePlans) {
    const maintenancePlanData = {
      maintenanceDate: plan.maintenanceDate,
      description: plan.description,
      frequency: plan.frequency, // <-- valeur récupérée ici
      equipmentId
    };

    await dispatch(createMaintenancePlan({ equipmentId, maintenancePlanData }));
  }
};

    return (
        <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px", width: "50%", marginLeft: "auto" }}
        >
            {maintenancePlans.map((plan, index) => (
                <div key={index} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
                          multiline
                         minRows={3}
                    />
                    {maintenancePlans.length > 1 && (
                        <IconButton color="error" onClick={() => handleRemovePlan(index)} aria-label="Supprimer">
                            <DeleteIcon />
                        </IconButton>
                    )}
                               <FormControl fullWidth>
  <InputLabel>Fréquence</InputLabel>
  <Select
    label="Fréquence"
    name="frequency"
    value={plan.frequency}
    onChange={(event) => handleChange(event, index)}
    required
  >
    <MenuItem value="MENSUELLE">Mensuelle</MenuItem>
    <MenuItem value="TRIMESTRIELLE">Trimestrielle</MenuItem>
    <MenuItem value="SEMESTRIELLE">Semestrielle</MenuItem>
    <MenuItem value="ANNUELLE">Annuelle</MenuItem>
  </Select>
</FormControl>
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
