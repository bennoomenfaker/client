import { useState, useEffect, useCallback } from 'react';
import NavBar from '../../components/NavBar';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgress, Alert, Typography, Grid, TextField, InputAdornment, Button, IconButton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { fetchAllMaintenancePlansByHospital, } from '../../redux/slices/maintenancePlanSlice ';
import { fetchEquipmentsByHospital } from "../../redux/slices/equipmentSlice";
import { DataGrid } from '@mui/x-data-grid';
import { CSVLink } from 'react-csv';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from "@mui/icons-material/Visibility";
import { fetchSparePartById } from '../../redux/slices/sparePartSlice';

export default function TrackMaintenance() {
    const [isNavOpen, setIsNavOpen] = useState(true);
    const dispatch = useDispatch();
    const { maintenancePlans, isLoading, error } = useSelector((state) => state.maintenancePlan);
    const { equipmentList } = useSelector((state) => state.equipment)
    const hospitalId = sessionStorage.getItem('hospitalId');
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const [filterType, setFilterType] = useState('all');
    const [filteredMaintennace, setFilteredMaintenance] = useState([]);

    useEffect(() => {
        dispatch(fetchAllMaintenancePlansByHospital(hospitalId));
        dispatch(fetchEquipmentsByHospital(hospitalId));
    }, [dispatch, hospitalId]);

        // Fonction pour récupérer le serialCode à partir de l'equipmentId
        const getSerialCodeByEquipmentId = useCallback((equipmentId) => {
          const equipment = equipmentList.find(e => e.id === equipmentId);
          return equipment ? equipment.serialCode : null;
      }, [equipmentList]);

    useEffect(() => {
        let filtered = maintenancePlans;
        const searchText = search.toLowerCase();

        if (filterType === 'equipment') {
            filtered = filtered.filter(row => row.equipmentId);
        } else if (filterType === 'sparePart') {
            filtered = filtered.filter(row => row.sparePartId);
        }

        filtered = filtered.filter(row => {
            return (
                (row.description && row.description.toLowerCase().includes(searchText)) ||
                (row.equipmentId && row.equipmentId.toLowerCase().includes(searchText)) ||
                (row.sparePartId && row.sparePartId.toLowerCase().includes(searchText)) ||
                getSerialCodeByEquipmentId(row.equipmentId)?.toLowerCase().includes(searchText)
            );
        });
        setFilteredMaintenance(filtered);
    }, [maintenancePlans, search, filterType, equipmentList, getSerialCodeByEquipmentId]);

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const handleFilterChange = (event, newFilter) => {
        if (newFilter !== null) {
            setFilterType(newFilter);
        }
    };



    const columns = [
       
        {
            field: 'maintenanceDate',
            headerName: 'Date',
            width: 150,
            valueGetter: (params) => {
                const date = new Date(params);
                return date.toLocaleDateString(); // Formater la date
            },
        },
        { field: 'description', headerName: 'Description', width: 409
         },
        {
            field: 'equipmentId',
            headerName: 'Équipement',
            width: 120,
            renderCell: (params) => (params.row.equipmentId ? 'Oui' : ''),
        },
        {
            field: 'sparePartId',
            headerName: 'Pièce de rechange',
            width: 150,
            renderCell: (params) => (params.row.sparePartId ? 'Oui' : ''),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => {
                const serialCode = getSerialCodeByEquipmentId(params.row.equipmentId);
                return (
                    <>
                        {params.row.equipmentId && (
                            <IconButton color="info" onClick={() => navigate(`/manage-equipment/update-equipment/${serialCode}`)}>
    <VisibilityIcon color="primary" />         
                       </IconButton>
                        )}
                        {params.row.sparePartId && (
                            <IconButton
                                color="info"
                                onClick={async () => {
                                    try {
                                        const actionResult = await dispatch(fetchSparePartById(params.row.sparePartId));
                                        const fetchedSparePart = actionResult.payload;
                                        navigate(`/manage-equipment/update-equipment/equipmentId/${params.row.sparePartId}/editSparePart`, {
                                            state: { sparePart: fetchedSparePart },
                                        });
                                    } catch (error) {
                                        console.error('Erreur lors de la récupération de la pièce de rechange:', error);
                                    }
                                }}
                            >
    <VisibilityIcon color="primary" />         
    </IconButton>
                        )}
                       
                    </>
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                 <NavBar onToggle={setIsNavOpen} />
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <NavBar onToggle={setIsNavOpen} />

            <Alert severity="error">{error?.message || "Une erreur est survenue"}</Alert>
            </div>
        );
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
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={8}>
                        <Typography variant="h4" gutterBottom color="primary">
                            Suivi maintenance
                        </Typography>
                    </Grid>
                </Grid>

                <Grid container spacing={2} alignItems="center" marginBottom={2}>
                    <Grid item>
                        <ToggleButtonGroup
                            value={filterType}
                            exclusive
                            onChange={handleFilterChange}
                            aria-label="text alignment"
                        >
                            <ToggleButton value="all" aria-label="left aligned">
                                Tous
                            </ToggleButton>
                            <ToggleButton value="equipment" aria-label="centered">
                                Équipements
                            </ToggleButton>
                            <ToggleButton value="sparePart" aria-label="right aligned">
                                Pièces de rechange
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    <Grid item xs>
                        <TextField
                            label="Rechercher"
                            variant="outlined"
                            value={search}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                        />
                    </Grid>
                    <Grid item>
                        <CSVLink data={filteredMaintennace} filename={'maintenance_plans.csv'}>
                            <Button variant="contained" color="primary">
                                Exporter CSV
                            </Button>
                        </CSVLink>
                    </Grid>
                </Grid>

                <div style={{ width: '83%', marginTop: '20px' }}>
                    <DataGrid
                        rows={filteredMaintennace}
                        columns={columns}
                        getRowId={(row) => row.id}
                        autoHeight // Ajuste la hauteur en fonction du contenu
                        sx={{
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f0f0f0',
                            },
                        }}
                    />
                </div>

              
            </div>
        </div>
    );
}