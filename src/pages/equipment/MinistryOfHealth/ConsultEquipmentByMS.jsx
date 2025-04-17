import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEquipmentBySerial } from "../../../redux/slices/equipmentSlice";
import { CircularProgress, Typography, Divider, Card, CardContent, Grid, Paper } from "@mui/material";
import NavBar from "../../../components/NavBar";
import { fetchHospitalById } from '../../../redux/slices/hospitalSlice'; // Assurez-vous d'importer la bonne action

const ConsultEquipmentByMS = () => {
  const { serialCode } = useParams(); // Utilisation de useParams pour obtenir serialCode
  const dispatch = useDispatch();
  const [isNavOpen, setIsNavOpen] = useState(true);

  // Récupérer l'équipement depuis le store Redux
  const { equipment, loading, error } = useSelector((state) => state.equipment);

  // Récupérer l'hôpital sélectionné depuis le store Redux
  const hospital = useSelector((state) => state.hospital.selectedHospital);

  useEffect(() => {
    // Lancer l'action pour récupérer l'équipement par code série
    if (serialCode) {
      dispatch(fetchEquipmentBySerial(serialCode));
    }
  }, [serialCode, dispatch]);

  // Si l'équipement est trouvé, récupérer les détails de l'hôpital
  useEffect(() => {
    if (equipment && equipment.hospitalId) {
      dispatch(fetchHospitalById(equipment.hospitalId));
    }
  }, [equipment, dispatch]);

      if (loading) {
          return (<>
              <NavBar/>
               <CircularProgress />;
              </>)
        }

  if (error) {
    return (<><NavBar/><Typography color="error">{error}</Typography>;</>)
  }

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <div
        style={{
          width: isNavOpen ? "calc(100% - 0px)" : "calc(100% - 60px)",
          transition: "width 0.3s ease",
          padding: "20px",
          marginTop: 50,
        }}
      >
        <Typography variant="h4" gutterBottom color="primary">
          Détails de l&apos;équipement
        </Typography>

        {equipment ? (
          <Card sx={{ maxWidth: "100%", marginBottom: 2, backgroundColor: "#f4f6f8" }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" color="secondary">Nom : {equipment.nom}</Typography>
                  {/* Afficher les informations de l'hôpital */}
                  {hospital ? (
                    <>
                      <Typography variant="body1" color="textPrimary">Hôpital : {hospital.name}</Typography>
                      <Typography variant="body1" color="textPrimary">Adresse : {hospital.address}</Typography>
                      <Typography variant="body1" color="textPrimary">Email : {hospital.email}</Typography>
                      {hospital.gouvernorat && (
                        <Typography variant="body1" color="textPrimary">
                          Gouvernorat : {hospital.gouvernorat.nom}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body1" color="textSecondary">Informations sur l&apos;hôpital non disponibles.</Typography>
                  )}
                  <Typography variant="body1" color="textPrimary">Code série : {equipment.serialCode}</Typography>
                  <Typography variant="body1" color="textSecondary">Classe de risque : {equipment.riskClass}</Typography>
                  <Typography variant="body1" color={equipment.status === "En attente de réception" ? "warning" : "textPrimary"}>
                    Statut : {equipment.status}
                  </Typography>
                  <Typography variant="body1" color="textPrimary">Durée de vie : {equipment.lifespan} ans</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  {/* Afficher le code EMDN et le nom du code EMDN */}
                  {equipment.emdnCode ? (
                    <>
                      <Typography variant="h6" color="primary">Code EMDN : {equipment.emdnCode.code}</Typography>
                      <Typography variant="body1" color="textPrimary">Nom du Code EMDN : {equipment.emdnCode.nom}</Typography>
                    </>
                  ) : (
                    <Typography variant="body1" color="textSecondary">Aucun code EMDN disponible.</Typography>
                  )}
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />

              {/* Afficher les plans de maintenance préventive */}
              <Typography variant="h6" color="primary">Maintenance préventive :</Typography>
              {equipment.maintenancePlans.length > 0 ? (
                equipment.maintenancePlans.map((plan, index) => (
                  <Paper
                    key={index}
                    elevation={3}
                    sx={{
                      padding: 2,
                      marginBottom: 2,
                      backgroundColor: "#e3f2fd",
                      borderLeft: "5px solid #2196f3",
                    }}
                  >
                    <Typography variant="body2" color="textPrimary">
                      <strong>Description :</strong> {plan.description}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Date de maintenance :</strong> {new Date(plan.maintenanceDate).toLocaleDateString()}
                    </Typography>
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">Aucun plan de maintenance préventive disponible.</Typography>
              )}
            </CardContent>
          </Card>
        ) : (
          <Typography color="error">Aucun équipement trouvé pour ce code série.</Typography>
        )}
      </div>
    </div>
  );
};

export default ConsultEquipmentByMS;
