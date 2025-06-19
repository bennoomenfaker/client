import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransfersByHospital } from '../../redux/slices/transferSlice';
import { fetchHospitals } from '../../redux/slices/hospitalSlice'; // Assure-toi que cette action existe
import { Box, TextField, InputAdornment, Button, MenuItem, Select } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';
import { CSVLink } from 'react-csv';
import NavBar from '../../components/NavBar';

const ConsultOldTransferedEquipmentByMS = () => {
  // eslint-disable-next-line no-unused-vars
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');

  const dispatch = useDispatch();
  const hospitals = useSelector(state => state.hospital.hospitals); // Liste des hôpitaux
  console.log(hospitals)
  const listOfOldTransfertEquiment = useSelector(state => state.transfer.transferList);
  const isLoading = useSelector(state => state.transfer.isLoading);
  
  useEffect(() => {
    dispatch(fetchHospitals()); // Récupérer tous les hôpitaux
  }, [dispatch]);

  useEffect(() => {
    if (selectedHospital) {
      dispatch(fetchTransfersByHospital(selectedHospital)); // Récupérer les équipements en fonction du hôpital sélectionné
    }
  }, [dispatch, selectedHospital]);

  const handleHospitalChange = (event) => {
    setSelectedHospital(event.target.value);
  };

  const filteredTransferEquipment = listOfOldTransfertEquiment.filter(item =>
    item?.equipment?.nom.toLowerCase().includes(search.toLowerCase()) ||
    item.oldHospitalName.toLowerCase().includes(search.toLowerCase()) ||
    item.newHospitalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex' }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: '100%', padding: '10px', marginTop: 60, marginLeft: '0.5%' }}>
        
        {/* Sélection de l'hôpital */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Select
            value={selectedHospital}
            onChange={handleHospitalChange}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>Sélectionnez un hôpital</MenuItem>
            {hospitals.map((hospital) => (
              <MenuItem key={hospital.id} value={hospital.id}>
                {hospital.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Recherche */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TextField
            label="Rechercher un équipement"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <CSVLink data={filteredTransferEquipment || []} filename="transferts_equipement.csv">
            <Button variant="outlined" color="primary">Exporter EXCEL</Button>
          </CSVLink>
        </Box>

        {/* Tableau des équipements transférés */}
        <DataGrid
          rows={filteredTransferEquipment || []}
          columns={[
            { field: 'type', headerName: 'Type de Transfert', width: 130 },
            { field: 'oldHospitalName', headerName: 'Hôpital Ancien', width: 160 },
            { field: 'newHospitalName', headerName: 'Hôpital Nouveau', width: 160 },
            { field: 'equipment', headerName: 'Équipement', width: 110, valueGetter: (params) => params?.serialNumber || 'N/A' },
            { field: 'description', headerName: 'Description', width: 330 },
            { field: 'initiatedByName', headerName: 'Initié Par', width: 160 },
            { field: 'createdAt', headerName: 'Date de transfert', width: 160 },
          ]}
          pageSize={5}
          getRowId={(row) => row.transferId}
          autoHeight
          loading={isLoading}
        />
      </div>
    </div>
  );
};

export default ConsultOldTransferedEquipmentByMS;