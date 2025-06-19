/* eslint-disable no-unused-vars */
import { useDispatch, useSelector } from "react-redux";
import NavBar from "../../components/NavBar";
import { fetchSlasByHospitalWithEquipment } from "../../redux/slices/slaSlice";
import { useEffect, useState } from "react";
import { Box, Button, InputAdornment, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
const ConsultSLAByHospitalId = () => {
  const hospitalid = sessionStorage.getItem("hospitalId");
  const { slasByHospital, isLoading } = useSelector((state) => state.sla);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  

  const [isNavOpen, setIsNavOpen] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (hospitalid) {
      dispatch(fetchSlasByHospitalWithEquipment(hospitalid));
    }
  }, [dispatch, hospitalid]);

const filtredSLA = slasByHospital
  .map((item) => ({
    id: item.sla.id,
    slaName: item.sla.name,
    equipmentName: item.equipmentNom,
    serialCode: item.serialCode,
    providerName: item.sla.userIdCompany,
    maxResponseTime: item.sla.maxResponseTime,
    maxResolutionTime: item.sla.maxResolutionTime,
    penaltyAmount: item.sla.penaltyAmount,
  }))
  .filter((sla) => {
    const searchValue = search.toLowerCase();
    return Object.values(sla).some(value =>
      String(value).toLowerCase().includes(searchValue)
    );
  });

const convertMinutesToTimeFormat = (minutes) => {
  if (minutes === null || minutes === undefined) return 'N/A';
    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;
    const parts = [];
    if (days > 0) parts.push(`${days}j`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0 || parts.length === 0) parts.push(`${mins}min`);
    return parts.join(' ');
    };



  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filtredSLA);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SLAs');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'slas_by_hospital.xlsx');
  };

const columns = [
 { field: 'serialCode', headerName: 'Code Série', width: 180 },

  { field: 'slaName', headerName: 'Nom du SLA', width: 200 },
  { field: 'equipmentName', headerName: "Nom de l'équipement", width: 200 },
 {
  field: 'maxResponseTime',
  headerName: 'Temps max. réponse',
  width: 200,
  valueFormatter: (params) => convertMinutesToTimeFormat(params),
},
{
  field: 'maxResolutionTime',
  headerName: 'Temps max. résolution',
  width: 200,
  valueFormatter: (params) => convertMinutesToTimeFormat(params),
},

  { field: 'penaltyAmount', headerName: 'Pénalité (dt)', width: 130 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 140,
    renderCell: (params) => (
      <Button
        variant="contained"
        color="warning"
        size="small"
        startIcon={<EditIcon />}
onClick={() => navigate(`/managesla/edit/${params.row.id}/equipment/${params.row.serialCode}`, { state: { row: params.row } })}
      >
        Modifier
      </Button>
    )
  }
];


  return (
    <div style={{ display: "flex" }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: '90%', padding: '10px', marginTop: 60 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 , ml:"-5%" , width:"100%"}}>
         

          <TextField
            label="Rechercher un équipement"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, width: "100%" }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />

          <Button
            variant="outlined"
            color="primary"
            onClick={exportToExcel}
            style={{ display: "flex", height: "7vh", width: "400px", marginLeft: "5%" }}
          >
            Exporter Excel
          </Button>
        </Box>
                <div style={{ height: 470, width: "105.4%" , marginLeft:"-5%"}}>

        <DataGrid
          rows={filtredSLA}
          columns={columns}
          paginationMode="client"
          pageSize={5}
          disableSelectionOnClick
          loading={isLoading}
          getRowId={(row) => row.id || row.slaId}
     sx={{
  width: '100%',
  '& .MuiDataGrid-cell': {
    borderRight: '1px solid rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: '0.8rem',
    padding: '4px 8px',
  },
  '& .MuiDataGrid-columnHeaders': {
    color: '#333333', // texte gris foncé
    fontWeight: 'bold',
    fontSize: '0.85rem',
    height: 40,
    whiteSpace: 'normal',
    lineHeight: 1.3,
    textAlign: 'center',
  },
  '& .MuiDataGrid-root': {
    maxWidth: '100%',
  },
  '& .MuiDataGrid-row': {
    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
  },
}}

        />
        </div>
      </div>
    </div>
  );
};

export default ConsultSLAByHospitalId;
