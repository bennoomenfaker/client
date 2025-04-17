import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { 
  Box, Button, TextField, InputAdornment, Grid, IconButton, Tooltip, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle 
} from "@mui/material";
import { Search as SearchIcon, Edit as EditIcon, Add as AddIcon, Visibility as VisibilityIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchSparePartsByEquipmentId } from "../redux/slices/equipmentSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { deleteSparePart } from "../redux/slices/sparePartSlice";
import { deleteMaintenancePlan } from "../redux/slices/maintenancePlanSlice ";

const EquipmentSpareParts = ({ equipment }) => {
  console.log(equipment);
  const [search, setSearch] = useState("");
  const [spareParts, setSpareParts] = useState([]);
  const [filteredSpareParts, setFilteredSpareParts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSparePart, setSelectedSparePart] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (equipment && equipment.id) {
      dispatch(fetchSparePartsByEquipmentId(equipment.id))
        .then((resultAction) => {
          setSpareParts(resultAction.payload);
          setFilteredSpareParts(resultAction.payload);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des pièces de rechange:", error);
        });
    } else {
      setSpareParts([]);
      setFilteredSpareParts([]);
    }
  }, [dispatch, equipment]);

  useEffect(() => {
    setFilteredSpareParts(
      spareParts.filter((part) =>
        part.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, spareParts]);

  const columns = [
    { field: "name", headerName: "Nom", width: 150 },
    { field: "lifespan", headerName: "Durée de vie", width: 100 },
    { field: "supplier", headerName: "Fournisseur", width: 150 },
    {
      field: "maintenanceDates",
      headerName: "Dates de maintenance",
      width: 250,
      renderCell: (params) => {
        if (params.row.maintenancePlans && params.row.maintenancePlans.length > 0) {
          return (
            <Tooltip title={params.row.maintenancePlans.map(plan => new Date(plan.maintenanceDate).toLocaleDateString()).join(", ")}>
              <div style={{ whiteSpace: "pre-line" }}>
                {params.row.maintenancePlans.map((plan) => (
                  <div key={plan.id}>{new Date(plan.maintenanceDate).toLocaleDateString()}</div>
                ))}
              </div>
            </Tooltip>
          );
        }
        return <div>Aucune date</div>;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => (
        <div>
          <IconButton aria-label="view" color="primary" onClick={() => handleView(params.row)}>
            <VisibilityIcon />
          </IconButton>
          <IconButton aria-label="edit" color="warning" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton aria-label="delete" color="error" onClick={() => handleOpenDialog(params.row)}>
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleAddSparePart = () => {
    navigate(`/manage-equipment/update-equipment/equipmentId/${equipment.serialCode}/addSpareParts`);
  };

  const handleView = (sparePart) => {
    console.log("Consulter:", sparePart);
  };

  const handleEdit = (sparePart) => {
    navigate(`/manage-equipment/update-equipment/equipmentId/${equipment.serialCode}/editSparePart`, { state: { sparePart } });
  };

  const handleOpenDialog = (sparePart) => {
    setSelectedSparePart(sparePart);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedSparePart(null);
    setOpenDialog(false);
  };

  const handleDelete = async () => {
    if (!selectedSparePart) return;
  
    try {
      //console.log("Détails de la pièce sélectionnée :", selectedSparePart);
  
      // Vérifier si la pièce contient des plans de maintenance
      if (Array.isArray(selectedSparePart.maintenancePlans) && selectedSparePart.maintenancePlans.length > 0) {
       // console.log("Plans de maintenance détectés :", selectedSparePart.maintenancePlans);
  
        for (const plan of selectedSparePart.maintenancePlans) {
         // console.log("Plan en cours de suppression :", plan);
          
          if (plan && plan.id) { 
            await dispatch(deleteMaintenancePlan({ maintenancePlanId: plan.id })); 
           // console.log(`Plan de maintenance supprimé: ${plan.id}`);
          } else {
            console.error("ID du plan de maintenance indéfini :", plan);
          }
        }
      } else {
        console.warn("Aucun plan de maintenance trouvé.");
      }
  
      // Supprimer la pièce de rechange
 // Assurez-vous que selectedSparePart contient equipmentId
 if (selectedSparePart.equipmentId){
  await dispatch(deleteSparePart({ equipmentId: selectedSparePart.equipmentId, sparePartId: selectedSparePart.id }));
}else{
 console.error("ID de l'équipement manquant pour la suppression de la pièce de rechange");
 toast.error("Erreur lors de la suppression : ID de l'équipement manquant.");
 return;
}      toast.success("La pièce de rechange a été supprimée avec succès");
  
      // Mettre à jour l'état local
      setSpareParts(spareParts.filter((part) => part.id !== selectedSparePart.id));
      setFilteredSpareParts(filteredSpareParts.filter((part) => part.id !== selectedSparePart.id));
  
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      handleCloseDialog();
    }
  };
  
  

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" style={{ marginBottom: "20px" }}>
        <Grid item xs={4}>
          <TextField
            label="Rechercher une pièce de rechange"
            variant="outlined"
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </Grid>

        <Grid item xs={4} style={{ textAlign: "right" }}>
          <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={handleAddSparePart}>
            Ajouter une pièce de rechange
          </Button>
        </Grid>
      </Grid>

      <DataGrid rows={filteredSpareParts} columns={columns} autoHeight />

      {/* Dialog de confirmation pour la suppression */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette pièce de rechange ? <br />
            <strong>Nom :</strong> {selectedSparePart?.name} <br />
            <strong>Fournisseur :</strong> {selectedSparePart?.supplier}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Annuler</Button>
          <Button onClick={handleDelete} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

EquipmentSpareParts.propTypes = {
  equipment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    serialCode: PropTypes.string.isRequired,
  }).isRequired,
};

export default EquipmentSpareParts;
