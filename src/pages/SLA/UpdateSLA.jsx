/* eslint-disable no-unused-vars */
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { fetchSlaById, updateSla } from "../../redux/slices/slaSlice"; 
import { getUsersByHospitalId } from "..//../redux/slices/userSlice";
import NavBar from "../../components/NavBar";

const UpdateSla = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, serialCode } = useParams();

  const hospitalId = sessionStorage.getItem("hospitalId");
  const hospitalUsers = useSelector((state) => state.user.usersByHospital);
  const selectedSla = useSelector((state) => state.sla.selectedSla);

  const [slaData, setSlaData] = useState({
    name: "",
    maxResponseTime: 0,
    maxResolutionTime: 0,
    penaltyAmount: 0,
    userIdCompany: "",
  });

  const [responseDays, setResponseDays] = useState(0);
  const [responseHours, setResponseHours] = useState(0);
  const [responseMinutes, setResponseMinutes] = useState(0);
  const [resolutionDays, setResolutionDays] = useState(0);
  const [resolutionHours, setResolutionHours] = useState(0);
  const [resolutionMinutes, setResolutionMinutes] = useState(0);

  useEffect(() => {
    dispatch(getUsersByHospitalId(hospitalId));
    dispatch(fetchSlaById(id));
  }, [dispatch, id, hospitalId]);

  useEffect(() => {
    if (selectedSla) {
      setSlaData(selectedSla);

      const responseD = Math.floor(selectedSla.maxResponseTime / (60 * 24));
      const responseH = Math.floor((selectedSla.maxResponseTime % (60 * 24)) / 60);
      const responseM = selectedSla.maxResponseTime % 60;
      setResponseDays(responseD);
      setResponseHours(responseH);
      setResponseMinutes(responseM);

      const resolutionD = Math.floor(selectedSla.maxResolutionTime / (60 * 24));
      const resolutionH = Math.floor((selectedSla.maxResolutionTime % (60 * 24)) / 60);
      const resolutionM = selectedSla.maxResolutionTime % 60;
      setResolutionDays(resolutionD);
      setResolutionHours(resolutionH);
      setResolutionMinutes(resolutionM);
    }
  }, [selectedSla]);
    const [isNavOpen, setIsNavOpen] = useState(true);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSlaData({ ...slaData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...slaData,
      maxResponseTime: responseDays * 24 * 60 + responseHours * 60 + responseMinutes,
      maxResolutionTime: resolutionDays * 24 * 60 + resolutionHours * 60 + resolutionMinutes,
      penaltyAmount: parseFloat(slaData.penaltyAmount),
    };

    try {
      await dispatch(updateSla({ slaId:id, slaData: payload })).unwrap();
      toast.success("SLA mis à jour avec succès !");
      navigate("/manageSla/consltSlaByMaintennaceByHospitalId"); // ou une autre route pertinente
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du SLA.");
      console.error(error);
    }
  };

  const maintenanceCompanies = hospitalUsers
    ? hospitalUsers.filter(
        (user) => user.role && user.role.name === "ROLE_MAINTENANCE_COMPANY"
      )
    : [];

  return (
     <div style={{ display: "flex" }}>
          <NavBar onToggle={setIsNavOpen} />
                <div style={{ width: '90%', padding: '10px', marginTop: 60 }}>

    <Box>
      <Typography variant="h6">Mettre à jour le SLA pour l&apos;équipement {serialCode}</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Nom"
          name="name"
          value={slaData.name}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Typography variant="subtitle1">Temps de réponse max</Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="Jours"
            type="number"
            value={responseDays}
            onChange={(e) => setResponseDays(Number(e.target.value))}
          />
          <TextField
            label="Heures"
            type="number"
            value={responseHours}
            onChange={(e) => setResponseHours(Number(e.target.value))}
          />
          <TextField
            label="Minutes"
            type="number"
            value={responseMinutes}
            onChange={(e) => setResponseMinutes(Number(e.target.value))}
          />
        </Box>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>
          Temps de résolution max
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="Jours"
            type="number"
            value={resolutionDays}
            onChange={(e) => setResolutionDays(Number(e.target.value))}
          />
          <TextField
            label="Heures"
            type="number"
            value={resolutionHours}
            onChange={(e) => setResolutionHours(Number(e.target.value))}
          />
          <TextField
            label="Minutes"
            type="number"
            value={resolutionMinutes}
            onChange={(e) => setResolutionMinutes(Number(e.target.value))}
          />
        </Box>

        <TextField
          label="Pénalité (dt/h)"
          name="penaltyAmount"
          type="number"
          value={slaData.penaltyAmount}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <Select
          name="userIdCompany"
          value={slaData.userIdCompany}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        >
          {maintenanceCompanies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.firstName} {company.lastName}
            </MenuItem>
          ))}
        </Select>
        <Button type="submit" variant="contained" color="success">
          Mettre à jour le SLA
        </Button>
      </form>
    </Box>
    </div>
    </div>
  );
};

export default UpdateSla;
