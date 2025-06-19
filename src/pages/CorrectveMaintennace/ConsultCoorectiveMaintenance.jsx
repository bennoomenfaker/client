/* eslint-disable no-unused-vars */
import { useLocation } from "react-router-dom"
import NavBar from "../../components/NavBar"
import { fetchEquipmentBySerial } from "../../redux/slices/equipmentSlice"
import { fetchHospitalById } from "../../redux/slices/hospitalSlice"
import { fetchSlaById } from "../../redux/slices/slaSlice"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Box,
  CircularProgress,
} from "@mui/material"

const ConsultCorrectiveMaintenance = () => {
  const location = useLocation()
  const serialCode = location.state.serialCode
  const dispatch = useDispatch()
  const [isNavOpen, setIsNavOpen] = useState(true);
  

  const equipment = useSelector((state) => state.equipment.equipment)
  const hospital = useSelector((state) => state.hospital.selectedHospital)
  const sla = useSelector((state) => state.sla.selectedSla)
  const isLoading = useSelector((state) => state.equipment.loading)

  const hospitalId = equipment?.hospitalId
  const slaId = equipment?.slaId

  useEffect(() => {
    dispatch(fetchEquipmentBySerial(serialCode))
  }, [dispatch, serialCode])

  useEffect(() => {
    if (hospitalId) dispatch(fetchHospitalById(hospitalId))
    if (slaId) dispatch(fetchSlaById(slaId))
  }, [dispatch, hospitalId, slaId])

  if (isLoading || !equipment || !hospital || !sla) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: '90%', padding: '10px', marginTop: 60 }}>

      <Box sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          Détails de l&apos;Équipement Médical
        </Typography>

        <Grid container spacing={3}>
          {/* Équipement */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Informations sur l&apos;Équipement</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography><strong>Nom :</strong> {equipment.nom}</Typography>
                <Typography><strong>Code Série :</strong> {equipment.serialCode}</Typography>
                <Typography><strong>Code EMDN :</strong> {equipment.emdnCode?.code}</Typography>
                <Typography><strong>Description EMDN :</strong> {equipment.emdnCode?.nom}</Typography>
                <Typography><strong>Fournisseur :</strong> {equipment.supplier}</Typography>
                <Typography><strong>Classe de Risque :</strong> {equipment.riskClass}</Typography>
                <Typography><strong>Montant :</strong> {equipment.amount} TND</Typography>
                <Typography><strong>Durée de vie :</strong> {equipment.lifespan} ans</Typography>
                <Typography><strong>Date d&apos;acquisition :</strong> {new Date(equipment.acquisitionDate).toLocaleDateString()}</Typography>
                <Typography><strong>Début de garantie :</strong> {new Date(equipment.startDateWarranty).toLocaleDateString()}</Typography>
                <Typography><strong>Fin de garantie :</strong> {new Date(equipment.endDateWarranty).toLocaleDateString()}</Typography>
                <Typography><strong>Statut :</strong> {equipment.status}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Hôpital */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Informations sur l&apos;Hôpital</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography><strong>Nom :</strong> {hospital.name}</Typography>
                <Typography><strong>Adresse :</strong> {hospital.address}</Typography>
                <Typography><strong>Téléphone :</strong> {hospital.phoneNumber}</Typography>
                <Typography><strong>Email :</strong> {hospital.email}</Typography>
                <Typography><strong>Site Web :</strong> {hospital.siteUrl}</Typography>
                <Typography><strong>Gouvernorat :</strong> {hospital.gouvernorat?.nom}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* SLA */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6">Informations SLA (Service Level Agreement)</Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography><strong>Nom :</strong> {sla.name}</Typography>
                <Typography><strong>Délai max de réponse :</strong> {sla.maxResponseTime} min</Typography>
                <Typography><strong>Délai max de résolution :</strong> {sla.maxResolutionTime} min</Typography>
                <Typography><strong>Montant pénalité :</strong> {sla.penaltyAmount} TND</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
      </div>
    </div>
  )
}

export default ConsultCorrectiveMaintenance
