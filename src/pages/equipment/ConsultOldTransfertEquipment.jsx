/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import NavBar from '../../components/NavBar';
import { fetchTransfersByHospital } from '../../redux/slices/transferSlice';
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

const ConsultOldTransfertEquipment = () => {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [search, setSearch] = useState('');
  const dispatch = useDispatch();
  const hospitalId = sessionStorage.getItem('hospitalId');
  
  // Récupérer les données de transferts depuis Redux
  const listOfOldTransfertEquiment = useSelector(state => state.transfer.transferList);
  const isLoading = useSelector(state => state.transfer.isLoading);

  useEffect(() => {
    dispatch(fetchTransfersByHospital(hospitalId));
  }, [dispatch, hospitalId]);

  // Filtrage de la liste selon la recherche
  const filteredTransferEquipment = listOfOldTransfertEquiment.filter(item => 
    item?.equipment?.nom.toLowerCase().includes(search.toLowerCase()) ||
    item.oldHospitalName.toLowerCase().includes(search.toLowerCase()) ||
    item.createdAt.toLowerCase().includes(search.toLowerCase()) ||
    item.newHospitalName.toLowerCase().includes(search.toLowerCase())
  );

  // Colonnes à afficher dans le DataGrid
  const columns = [
    { field: 'type', headerName: 'Type de Transfert', width: 130 },
    { field: 'oldHospitalName', headerName: 'Hôpital Ancien', width: 160 },
    { field: 'newHospitalName', headerName: 'Hôpital Nouveau', width: 160 },
    {
      field: 'equipment',
      headerName: 'Code Série',
      width: 110,
      valueGetter: (params) => params?.serialNumber || 'N/A',
    },
    { field: 'description', headerName: 'Description', width: 330 },
    { field: 'initiatedByName', headerName: 'Initié Par', width: 160 },
    {
      field: 'createdAt',
      headerName: 'Date de transfert',
      width: 160,
      renderCell: (params) => {
        const date = new Date(params.value);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      },
    },
  ];
  
  
  // En-têtes pour export CSV
  const headers = [
    { label: "ID Transfert", key: "transferId" },
    { label: "Type de Transfert", key: "type" },
    { label: "Hôpital Ancien", key: "oldHospitalName" },
    { label: "Hôpital Nouveau", key: "newHospitalName" },
    { label: "code série", key: "equipment.seialNumber" },
    { label: "Description", key: "description" },
    { label: "Initié Par", key: "initiatedByName" },
    { label: "Date de transfére", key: "createdAt" },
  ];

  return (
    <div style={{ display: 'flex' }}>
      <NavBar onToggle={setIsNavOpen} />
      <div style={{ width: '100%', padding: '10px', marginTop: 60 , marginLeft:'0.5%'}}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 , mr:"5%"}}>
          <TextField
            label="Rechercher un équipement"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 , ml:"-5%" , width:"100%" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <CSVLink
            data={filteredTransferEquipment || []}
            headers={headers}
            filename="transferts_equipement.csv"
            separator=";"
          >
            <Button variant="outlined" color="primary">
              Exporter CSV
            </Button>
          </CSVLink>
        </Box>

        <DataGrid
  style={{ marginLeft: '-5%' }}
  rows={filteredTransferEquipment || []}
  columns={columns}
  pageSize={5}
  getRowId={(row) => row.transferId}
  autoHeight
  loading={isLoading}
  columnHeaderHeight={40}
  disableColumnResize={true}
  sx={{
    width: '100%',
    overflowX: 'auto',
    '& .MuiDataGrid-cell': {
      borderRight: '1px solid rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      fontSize: '0.8rem', // ↓ Réduction de taille de police
      padding: '4px 8px', // ↓ Réduction du padding
    },
    '& .MuiDataGrid-columnHeaders': {
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
  );
};

export default ConsultOldTransfertEquipment;
/*   sx={{
            '& .MuiDataGrid-cell': {
              borderRight: '1px solid rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              fontSize: '0.8rem', // ↓ Réduction de taille de police
              padding: '4px 8px', // ↓ Réduction du padding
            },
            '& .MuiDataGrid-row': {
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
            },
            '& .MuiDataGrid-columnHeaders': {
              fontSize: '0.85rem', // ↓ Taille de texte pour en-têtes
              height: 40,
            },
          }}
        /> */