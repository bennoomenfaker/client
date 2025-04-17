/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { logout, getProfile } from '../redux/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import GroupIcon from '@mui/icons-material/Group';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import DomainIcon from '@mui/icons-material/Domain';
import { fetchNotifications, updateNotificationAsRead, deleteNotification } from '../redux/slices/notificationSlice';
import { triggerEquipmentMaintenanceCheck, triggerSparePartMaintenanceCheck } from '../redux/slices/maintenancePlanSlice ';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

import { Badge, Menu, MenuItem, Modal } from '@mui/material';
import NotificationsIcon from "@mui/icons-material/Notifications";
import CircleIcon from "@mui/icons-material/Circle";
import AssignmentIcon from '@mui/icons-material/Assignment'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { GridMoreVertIcon } from '@mui/x-data-grid';
import HandymanIcon from '@mui/icons-material/Handyman';






const drawerWidth = 200;
NavBar.propTypes = {
  onToggle: PropTypes.func.isRequired, // Définition et validation de la prop
};
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: "80%",
  justifyContent: 'flex-end',
  height: 50, // Même hauteur que l'AppBar
  padding: theme.spacing(0, 1),
}));


const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  height: 50,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    fontSize: "15px",
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': {
        width: open ? drawerWidth : `calc(${theme.spacing(8)} + 1px)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Centrage du contenu
        paddingTop: theme.spacing(2),
      },
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function NavBar({ onToggle }) {
  const userInfo = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileFetched, setProfileFetched] = useState(false);
  const notifications = useSelector((state) => state.notifications.list); // Récupérer la liste des notifications
  const [lastSeenNotificationTime, setLastSeenNotificationTime] = useState(null);

  const unreadCount = useMemo(() => {
    if (!lastSeenNotificationTime) return notifications.filter((n) => !n.read).length;
  
    return notifications.filter((n) => !n.read && new Date(n.createdAt) > new Date(lastSeenNotificationTime)).length;
  }, [notifications, lastSeenNotificationTime]);
  // État pour le menu et le modal
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const handleClose = () => setAnchorEl(null);
  const email = sessionStorage.getItem("email");
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [shouldNotifyToday, setShouldNotifyToday] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setLastSeenNotificationTime(new Date().toISOString());
  };
  

  useEffect(() => {
    if (email) {
      dispatch(fetchNotifications(email));
    }

  }, [dispatch, email]);

  useEffect(() => {
    const lastNotificationDate = localStorage.getItem('lastNotificationDate');
    const today = new Date().toLocaleDateString();

    if (lastNotificationDate !== today) {
      // Nouvelle journée, afficher la notification et mettre à jour la date
      setShouldNotifyToday(true);
      localStorage.setItem('lastNotificationDate', today);
    } else {
      // Déjà notifié aujourd'hui
      setShouldNotifyToday(false);
    }
  }, []); // S'exécute une seule fois au montage

  // Ouvrir le modal et mettre à jour la notification comme lue
  const handleNotificationClick = (notif) => {
    setSelectedNotification(notif);
    if (!notif.read) {
      dispatch(updateNotificationAsRead(notif.id)); // Marquer comme lue
    }
  };


  const handleOpenDeleteConfirmation = (event, notifId) => {
    event.stopPropagation(); // Empêcher la propagation du clic à la ListItem
    setNotificationToDelete(notifId);
    setDeleteConfirmationOpen(true);
  };

  const handleCloseDeleteConfirmation = () => {
    setNotificationToDelete(null);
    setDeleteConfirmationOpen(false);
  };

  const handleCloseModal = () => {
    setSelectedNotification(null);
  };
  useEffect(() => {
    const lastNotificationDate = localStorage.getItem('lastNotificationDate');
    const today = new Date().toLocaleDateString();

    if (lastNotificationDate !== today) {
      setShouldNotifyToday(true);
      localStorage.setItem('lastNotificationDate', today);
    } else {
      setShouldNotifyToday(false);
    }
  }, []);

  // Déclencher les actions une seule fois par jour
  useEffect(() => {
    const lastTriggerDate = localStorage.getItem('lastTriggerDate');
    const today = new Date().toLocaleDateString();

    if (lastTriggerDate !== today) {
      dispatch(triggerEquipmentMaintenanceCheck());
      dispatch(triggerSparePartMaintenanceCheck());
      localStorage.setItem('lastTriggerDate', today);
    }
  }, [dispatch]);
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} secondes`;
    } else if (diffInSeconds < 3600) {
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const diffInHours = Math.floor(diffInSeconds / 3600);
      return `${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleViewAllNotifications = () => {
    navigate("/notifications");
    handleClose();
  };

  const handleDeleteNotification = () => {
    if (notificationToDelete) {
      dispatch(deleteNotification(notificationToDelete));
      setNotificationToDelete(null);
      setDeleteConfirmationOpen(false);
    }
  };
  useEffect(() => {
    if (!profileFetched && !userInfo) {
      async function fetchData() {
        try {
          const profileInfo = await dispatch(getProfile());
          if (!profileInfo.payload) {
            toast.error('Erreur lors de la récupération du profil.');
            return;
          }
          setProfileFetched(true);
        } catch (error) {
          console.error("Une erreur s'est produite lors de la récupération du profil:", error);
          toast.error("Une erreur s'est produite lors de la récupération du profil.");
        }
      }
      fetchData();
    }
  }, [dispatch, userInfo, profileFetched]);

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      toast.success('Au revoir');
      navigate('/');
    } catch (error) {
      console.error("Une erreur s'est produite lors de la déconnexion:", error);
    }
  };

  const handleEditUser = () => {
    navigate(`/manage-users/manage-account/${userInfo.id}`);
  };

  const handleEditHospital = () => {
    navigate(`/manage-hospitals/consult-list-hospitals`);
  };
  const handleEditHospitalServices = () => {
    navigate(`/manage-service/services`);
  };

  const handleManageDashboard = () => {
    navigate('/');
  };
  const handleConsultListUsers = () => {
    navigate('/manage-users/consult-users-by-ms');
  };
  const handleConsultListUsersHospitalAdmins = () => {
    navigate('/manage-users/consult-users-by-hospital-admins');
  };

  const handleConsultListEquipments = () => {
    navigate('/manage-equipment/equipments');
  };
  const handleConsultListEquipmentsOfHospitals = () => {
    navigate('/manage-equipment/equipmentsOfHospital');
  };
  const handleConsultListBrands = () => {
    navigate('/manage-brands/brands');

  }
  const handleConsultListNomenclature = () => {
    navigate('/emdn-nomenclature');

  }
  const handleTrackMaintenance = () => {
    // Navigation vers le suivi des maintenances
    navigate('/manage-maintenance/trackMaintenance');
  };         
  const handleTrackMaintenanceCorrective = () => {
    // Navigation vers le suivi des maintenances
    navigate('/manageCorrectiveMaintenance');
  };   

  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(!open);
    onToggle(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const getRoleDisplayName = (role) => {
    const roleMapping = {
      ROLE_MINISTRY_ADMIN: "Ministére de santé",
      ROLE_HOSPITAL_ADMIN: "Administrateur de l'hopital",
      ROLE_SERVICE_SUPERVISOR: "Surveillance de service",
      ROLE_MAINTENANCE_ENGINEER: "Ingénieur maintenance",
      ROLE_MAINTENANCE_COMPANY: "Société de maintenance",
    };
    return roleMapping[role] || "Utilisateur"; // Par défaut, affiche "Utilisateur" si le rôle n'est pas trouvé
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="body1" noWrap component="div">
            {userInfo?.firstName || ''} {userInfo?.lastName || ''} - {getRoleDisplayName(userInfo?.role?.name)}
          </Typography>
          {/* Icône Notifications avec Badge */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleClick}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{
              '& .MuiPaper-root': {
                width: 400,
                maxHeight: '60vh',
                borderRadius: 2,
                boxShadow: 3,
                overflowY: 'auto',
                mt: 1,
                '&::-webkit-scrollbar': {
                  width: '6px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'divider',
                  borderRadius: '3px'
                }
              }
            }}
          >
            <Typography variant="h6" sx={{ p: 2 }}>
              Notifications
            </Typography>
            <Divider />

            {sortedNotifications.length === 0 ? (
              <MenuItem disabled>Aucune notification</MenuItem>
            ) : (
              <List>
                {sortedNotifications.slice(0, 20).map((notif, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleNotificationClick(notif)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 1,
                      padding: 2,
                      borderBottom: '1px solid #e0e0e0',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {!notif.read && <CircleIcon fontSize="small" color="error" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#333' }}>
                            {notif.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                            {notif.message}
                          </Typography>
                        }
                        sx={{ flex: 1 }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#999',
                          whiteSpace: 'nowrap',
                          fontSize: '0.75rem',
                          marginLeft: 2,
                        }}
                      >
                        {formatTimeAgo(notif.createdAt)}
                      </Typography>
                      <IconButton
                        aria-label="more"
                        aria-controls={`notification-menu-${notif.id}`}
                        aria-haspopup="true"
                        onClick={(event) => handleOpenDeleteConfirmation(event, notif.id)}
                        sx={{ marginLeft: 1 }}
                      >
                        <GridMoreVertIcon />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}

            <Divider />
            <MenuItem onClick={handleViewAllNotifications} sx={{ justifyContent: "center", fontWeight: "bold" }}>
              Voir toutes les notifications
            </MenuItem>
          </Menu>

          <Modal open={!!selectedNotification} onClose={handleCloseModal}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 400,
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
              }}
            >
              {selectedNotification && (
                <>
                  <Typography variant="h6">{selectedNotification.title}</Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>{selectedNotification.message}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
                    {new Date(selectedNotification.createdAt).toLocaleString()}
                  </Typography>
                </>
              )}
            </Box>
          </Modal>
          {/* Confirmation de suppression */}
          <Dialog
            open={deleteConfirmationOpen}
            onClose={handleCloseDeleteConfirmation}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Supprimer la notification ?"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Êtes-vous sûr de vouloir supprimer cette notification ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteConfirmation}>Annuler</Button>
              <Button onClick={handleDeleteNotification} autoFocus color="error">
                Supprimer
              </Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose} >
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={handleManageDashboard} sx={{ justifyContent: open ? 'initial' : 'center' }}>
              <Tooltip title="Dashboard" placement="right">
                <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                  <DashboardIcon />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Dashboard" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={handleEditUser} sx={{ justifyContent: open ? 'initial' : 'center' }}>
              <Tooltip title="Gérer son compte" placement="right">

                <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                  <AccountCircleIcon />
                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Gérer son compte" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            {userInfo?.ministryAdmin && ( // Vérification du rôle admin
              <ListItemButton onClick={handleEditHospital} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Gérer les Hôpitaux" placement="right">

                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <DomainIcon /> {/* Nouvelle icône */}
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Gérer les Hôpitaux" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            {userInfo?.hospitalAdmin && ( // Vérification du rôle admin
              <ListItemButton onClick={handleEditHospitalServices} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Gérer les services" placement="right">

                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <MedicalServicesIcon /> {/* Nouvelle icône */}
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Gérer les services" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            {(userInfo?.ministryAdmin) && ( // Vérification pour Admin et SuperAdmin
              <ListItemButton onClick={handleConsultListUsers} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Gérer les Utilisateurs" placement="right">

                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <GroupIcon /> {/* Icône pour gérer les utilisateurs */}
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Gérer les Utilisateurs" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            {(userInfo?.hospitalAdmin) && ( // Vérification pour Admin et SuperAdmin
              <ListItemButton onClick={handleConsultListUsersHospitalAdmins} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Gérer les Utilisateurs" placement="right">

                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <GroupIcon /> {/* Icône pour gérer les utilisateurs */}
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Gérer les Utilisateurs" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}
          </ListItem>

          <Divider />


          <ListItem disablePadding sx={{ display: 'block' }}>
            {(userInfo?.ministryAdmin) && ( // Vérification pour Admin et SuperAdmin
              <ListItemButton onClick={handleConsultListEquipments} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Gérer les équipements" placement="right">

                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <InventoryIcon />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Gérer les équipements" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            {(userInfo?.hospitalAdmin || userInfo?.maintenanceEngineer || userInfo?.serviceSupervisor || userInfo?.maintenanceEngineer) && (
              <ListItemButton onClick={handleConsultListEquipmentsOfHospitals} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Gérer les équipements" placement="right">
                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <InventoryIcon />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Gérer les équipements" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}

          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            {userInfo?.hospitalAdmin && ( // Vérification pour Admin et SuperAdmin
              <ListItemButton onClick={handleConsultListBrands} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Gérer les marques" placement="right">

                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <StorefrontIcon />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Gérer les marques" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}

          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            {(userInfo?.hospitalAdmin || userInfo?.ministryAdmin || userInfo?.maintenanceEngineer || userInfo?.maintenanceCompanyStaff) && ( // Vérification pour Admin et SuperAdmin
              <ListItemButton onClick={handleConsultListNomenclature} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Nomenclature EMDN" placement="right">

                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <CategoryIcon />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Nomenclature EMDN " primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}
          </ListItem>

          {/* Nouvel élément de liste pour le suivi des maintenances */}
          <ListItem disablePadding sx={{ display: 'block' }}>
            {(userInfo?.hospitalAdmin || userInfo?.ministryAdmin || userInfo?.maintenanceEngineer || userInfo?.maintenanceCompanyStaff) && (
              <ListItemButton onClick={handleTrackMaintenance} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Suivi des Maintenances préventives" placement="right">
                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <AssignmentIcon />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Suivi Maintenances préventives" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            {  userInfo?.maintenanceCompanyStaff && (
              <ListItemButton onClick={handleTrackMaintenanceCorrective} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Maintenances correctives" placement="right">
                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <HandymanIcon/>
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Maintennace correctives" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            {(userInfo?.ministryAdmin || userInfo?.hospitalAdmin || userInfo?.serviceSupervisor || userInfo?.maintenanceEngineer) && (
              <ListItemButton onClick={() => navigate('/manage-incident/consultListOfIncident')} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Consulter les incidents" placement="right">
                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <ReportProblemIcon />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Consulter les incidents" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}
          </ListItem>
          <ListItem disablePadding sx={{ display: 'block' }}>
            { userInfo?.maintenanceCompanyStaff && (
              <ListItemButton onClick={() => navigate('/manageSla/consltSlaByMaintennaceProvider')} sx={{ justifyContent: open ? 'initial' : 'center' }}>
                <Tooltip title="Consulter les SLA" placement="right">
                  <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 0 : 'auto' }}>
                    <ReportProblemIcon />
                  </ListItemIcon>
                </Tooltip>
                <ListItemText primary="Consulter les SLA" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            )}
          </ListItem>
          <Divider />
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton onClick={handleLogout} sx={{ justifyContent: open ? 'initial' : 'center' }}>
              <Tooltip title="Se déconnecter" placement="right">

                <ListItemIcon sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: open ? 1 : 'auto' }}>
                  <LogoutIcon />

                </ListItemIcon>
              </Tooltip>
              <ListItemText primary="Se déconnecter" primaryTypographyProps={{ variant: 'body2' }} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
      </Box>
    </Box>
  );
}