/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { fetchSlasByProvider } from '../../redux/slices/slaSlice';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  InputAdornment,
  Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';
import { CSVLink } from 'react-csv';
import { fetchHospitalById } from '../../redux/slices/hospitalSlice';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';




const ConsultSlaByProvider = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [search, setSearch] = useState('');
  const sla = useSelector((state) => state.sla.slasByProvider);
  const isLoading = useSelector((state) => state.sla.isLoading);
  const maintenanceProviderId = sessionStorage.getItem('userId');
  const dispatch = useDispatch();
  const hospital = useSelector((state) => state.hospital.selectedHospital);
  const [slasWithNames, setSlasWithNames] = useState([]);
  const filteredSlas = slasWithNames?.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDuration = (totalMinutes) => {
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}j`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || parts.length === 0) parts.push(`${minutes}min`);

    return parts.join('');
  };


  const csvData = filteredSlas?.map((sla) => ({
    name: sla.name,
    equipment: sla.equipment?.serialNumber || 'N/A',
    hospitalName: sla.hospitalName,
    maxResponseTime: formatDuration(sla.maxResponseTime),
    maxResolutionTime: formatDuration(sla.maxResolutionTime),
    penaltyAmount: sla.penaltyAmount,
  }));
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData); // données déjà prêtes
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SLAs');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'slas_by_provider.xlsx');
  };



  useEffect(() => {
    const fetchHospitalNames = async () => {
      const promises = sla.map((s) =>
        dispatch(fetchHospitalById(s.hospitalId)).unwrap().then((hospital) => ({
          hospitalId: s.hospitalId,
          hospitalName: hospital.name,
        }))
      );

      const results = await Promise.all(promises);

      const hospitalMap = {};
      results.forEach((res) => {
        hospitalMap[res.hospitalId] = res.hospitalName;
      });

      // Mets à jour les SLAs avec le nom de l'hôpital
      const slasWithHospitalNames = sla.map((s) => ({
        ...s,
        hospitalName: hospitalMap[s.hospitalId] || s.hospitalId,
      }));

      setSlasWithNames(slasWithHospitalNames);
    };

    if (sla.length > 0) {
      fetchHospitalNames();
    }
  }, [sla, dispatch]);

  useEffect(() => {
    dispatch(fetchSlasByProvider(maintenanceProviderId));

  }, [dispatch, maintenanceProviderId]);



  const columns = [
    { field: 'name', headerName: 'Nom SLA', flex: 1 },
    {
      field: "equipment",
      headerName: 'Code Série',
      flex: 1,
      valueGetter: (params) => {
        const serialNumber = params.serialNumber; // ou params.row.equipment.serialNumber selon votre structure
        // console.log(serialNumber); // Pour le débogage
        return serialNumber || 'N/A';
      },
    }
    ,
    { field: 'hospitalName', headerName: 'Nom Hôpital', flex: 1 },
    {
      field: 'maxResponseTime',
      headerName: 'Temps max réponse',
      flex: 1,
      valueGetter: (params) => formatDuration(params),
    },
    {
      field: 'maxResolutionTime',
      headerName: 'Temps max résolution',
      flex: 1,
      valueGetter: (params) => formatDuration(params),
    },

  ];



  const headers = [
    { label: 'Nom SLA', key: 'name' },
    { label: 'Code Série', key: 'equipment' }, // Corrigé ici
    { label: 'Nom Hôpital', key: 'hospitalName' },
    { label: 'Temps max réponse', key: 'maxResponseTime' },
    { label: 'Temps max résolution', key: 'maxResolutionTime' },
    { label: 'Pénalité (dt/h)', key: 'penaltyAmount' },
  ];




  return (
    <div style={{ display: 'flex' }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: '90%', padding: '20px', marginTop: 50 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <TextField
            label="Rechercher un SLA"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <CSVLink
            data={csvData || []}
            headers={headers}
            filename="slas_by_provider.csv"
            separator=";"
          >
            <Button variant="outlined" color="primary">
              Exporter CSV
            </Button>
            <Button variant="outlined" color="primary" onClick={() => exportToExcel()}>
              Exporter Excel
            </Button>

          </CSVLink>

        </Box>

        <DataGrid
          rows={filteredSlas || []}
          columns={columns}
          pageSize={5}
          getRowId={(row) => row.id}
          autoHeight
          loading={isLoading}
          sx={{
            '& .MuiDataGrid-cell': {
              borderRight: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            },
            '& .MuiDataGrid-row': {
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            },
          }}
        />
      </div>
    </div>
  );
};

export default ConsultSlaByProvider;
