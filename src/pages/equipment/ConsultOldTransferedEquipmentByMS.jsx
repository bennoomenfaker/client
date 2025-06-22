import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransfersByHospital } from '../../redux/slices/transferSlice';
import { fetchHospitals } from '../../redux/slices/hospitalSlice'; // Assure-toi que cette action existe
import { Box, TextField, InputAdornment, Button, MenuItem, Select, FormControl, InputLabel, Paper, Typography } from '@mui/material';
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
  console.log(listOfOldTransfertEquiment)

  const filteredTransferEquipment = listOfOldTransfertEquiment.filter(item =>
    item?.equipment?.nom.toLowerCase().includes(search.toLowerCase()) ||
    item.oldHospitalName.toLowerCase().includes(search.toLowerCase()) ||
    item?.equipment?.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    item?.description.toLowerCase().includes(search.toLowerCase()) ||
    item?.type.toLowerCase().includes(search.toLowerCase()) ||
    item?.initiatedByName.toLowerCase().includes(search.toLowerCase()) ||
    item.newHospitalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex" }}>
  <NavBar onToggle={setIsNavOpen} />

      <div style={{ width: '95%', padding: '10px', marginTop: 60 , marginLeft: '-5%' }}>

    {/* Barre supérieure : Select + Recherche + Export */}
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        mb: 3,
        gap: 2,
      }}
    >
      {/* Sélection hôpital - largeur réduite */}
      <FormControl sx={{ minWidth: 250 }}>
        <InputLabel>Hôpital</InputLabel>
        <Select
          value={selectedHospital}
          onChange={handleHospitalChange}
          label="Hôpital"
          displayEmpty
        >
          <MenuItem value="" disabled>
            Sélectionnez un hôpital
          </MenuItem>
          {hospitals.map((hospital) => (
            <MenuItem key={hospital.id} value={hospital.id}>
              {hospital.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Barre de recherche */}
      <TextField
        label="Rechercher un équipement"
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

      {/* Bouton Export */}
      <CSVLink data={filteredTransferEquipment || []} filename="transferts_equipement.csv" style={{ textDecoration: 'none' }}>
        <Button variant="contained" color="primary">
          Exporter EXCEL
        </Button>
      </CSVLink>
    </Box>

    {/* Tableau stylisé dans un Paper */}
    <Paper elevation={3} sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="h6" gutterBottom>
        Équipements transférés
      </Typography>

      <DataGrid
        rows={filteredTransferEquipment || []}
        columns={[
          { field: 'type', headerName: 'Type de Transfert', width: 160 },
          { field: 'oldHospitalName', headerName: 'Hôpital Ancien', width: 160 },
          { field: 'newHospitalName', headerName: 'Hôpital Nouveau', width: 160 },
          {
            field: 'equipment',
            headerName: 'Équipement',
            width: 130,
            valueGetter: (params) => params?.serialNumber || 'N/A',
          },
          { field: 'description', headerName: 'Description', width: 330 },
          { field: 'initiatedByName', headerName: 'Initié Par', width: 160 },
          { field: 'createdAt', headerName: 'Date de transfert', width: 180 },
        ]}
        pageSize={5}
        getRowId={(row) => row.transferId}
        autoHeight
        loading={isLoading}
        sx={{
          mt: 2,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f0f8ff',
          },
        }}
      />
    </Paper>
  </div>
</Box>

  );
};

export default ConsultOldTransferedEquipmentByMS;