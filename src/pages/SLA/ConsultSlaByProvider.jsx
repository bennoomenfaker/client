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



const ConsultSlaByProvider = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [search, setSearch] = useState('');
  const sla = useSelector((state) => state.sla.slasByProvider);
  const isLoading = useSelector((state) => state.sla.isLoading);
  const maintenanceProviderId = sessionStorage.getItem('userId');
  const dispatch = useDispatch();
  const hospital = useSelector((state) => state.hospital.selectedHospital);
  const [slasWithNames, setSlasWithNames] = useState([]);


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
      field: 'equipment',
      headerName: 'Code Série',
      flex: 1,
      valueGetter: (params) => {params?.serialNumber || 'N/A', console.log(params.serialNumber)},
    },
    { field: 'hospitalName', headerName: 'Nom Hôpital', flex: 1 },
    { field: 'maxResponseTime', headerName: 'Temps max réponse (min)', flex: 1 },
    { field: 'maxResolutionTime', headerName: 'Temps max résolution (min)', flex: 1 },
    { field: 'penaltyAmount', headerName: 'Pénalité (dt)', flex: 1 },
  ];
  
  

  const headers = [
    { label: 'Nom SLA', key: 'name' },
    { label: 'Code Série', key: 'equipment' }, // Corrigé ici
    { label: 'Nom Hôpital', key: 'hospitalName' },
    { label: 'Temps max réponse (min)', key: 'maxResponseTime' },
    { label: 'Temps max résolution (min)', key: 'maxResolutionTime' },
    { label: 'Pénalité (dt)', key: 'penaltyAmount' },
  ];
  
  
  const filteredSlas = slasWithNames?.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  

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
            data={filteredSlas || []}
            headers={headers}
            filename="slas_by_provider.csv"
            separator=";"
          >
            <Button variant="outlined" color="primary">
              Exporter CSV
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
