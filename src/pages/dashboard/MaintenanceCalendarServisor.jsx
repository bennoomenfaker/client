/* eslint-disable no-unused-vars */
import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Paper, Grid, Chip, Modal, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Divider } from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import PropTypes from 'prop-types';


const MaintenanceCalendarServisor = ({ maintenancePlans, correctiveMaintenances }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const events = useMemo(() => {
    const allEvents = [];

    maintenancePlans.forEach(plan => {
      if (plan.equipmentId && plan.maintenanceDate) {
        allEvents.push({
          title: `Plan: ${plan.description?.substring(0, 20)}...`,
          start: plan.maintenanceDate,
          end: plan.maintenanceDate,
          extendedProps: {
            type: 'plan',
            description: plan.description,
            id: plan.id,
            status: 'Planifié',
            equipmentId: plan.equipmentId
          },
          backgroundColor: '#2196F3',
          borderColor: '#2196F3'
        });
      }
    });

    correctiveMaintenances.forEach(corr => {
      if (corr.plannedDate) {
        let color = '#9E9E9E';
        if (corr.status === 'Terminé') color = '#4CAF50';
        else if (corr.status === 'En cours') color = '#FFC107';
        else if (corr.status === 'En attente') {
          color = new Date(corr.plannedDate) < new Date() ? '#F44336' : '#FF9800';
        }

        allEvents.push({
          title: `Corr: ${corr.description?.substring(0, 20)}...`,
          start: corr.plannedDate,
          end: corr.completedDate || corr.plannedDate,
          extendedProps: {
            type: 'corrective',
            description: corr.description,
            id: corr.id,
            status: corr.status,
            equipmentId: corr.equipmentId,
            resolutionDetails: corr.resolutionDetails,
            plannedDate: corr.plannedDate,
            completedDate: corr.completedDate,
            assignedTo: corr.assignedTo
          },
          backgroundColor: color,
          borderColor: color
        });
      }
    });

    return allEvents;
  }, [maintenancePlans, correctiveMaintenances]);


  const handleDateClick = (arg) => {
    setSelectedDate(arg.date);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedEvent(null);
  };

  return (
    <Box sx={{  
      p: 3, 
      width: '100%', 
      mx: 'auto', 
      mt: 1,
      backgroundColor: 'background.paper',
      borderRadius: 4,
      boxShadow: 3
    }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ 
        mb: 2,
        letterSpacing: 0.5
      }}>
        Calendrier des Maintenances
      </Typography>
      
      <Paper elevation={5} sx={{ 
        p: 2, 
        borderRadius: 3, 
        mb: 3,
        backgroundColor: 'background.default'
      }}>
        <FullCalendar
         height="auto" // au lieu de height fixe
  contentHeight="auto"
  aspectRatio={1.7} // adapte le ratio largeur/hauteur
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locales={[frLocale]}
          locale="fr"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          nowIndicator={true}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDisplay="block"
          eventContent={(eventInfo) => (
            <Box sx={{ 
              p: 0.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              

            }}>
              <Typography variant="caption" sx={{ 
                fontWeight: 'bold',
                color: 'text.primary',
                lineHeight: 1.2
              }}>
                {eventInfo.event.title}
              </Typography>
              <Chip 
                label={eventInfo.event.extendedProps.status} 
                size="small" 
                sx={{ 
                  color: 'white', 
                  backgroundColor: eventInfo.event.backgroundColor,
                  height: '18px',
                  fontSize: '0.65rem',
                  mt: 0.5,
                  fontWeight: 'bold'
                }} 
              />
            </Box>
          )}
        />
      </Paper>

      {/* Modal pour les détails de la maintenance */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        {selectedEvent && (
          <>
            <DialogTitle sx={{ bgcolor: selectedEvent.backgroundColor, color: 'white' }}>
              Détails de la maintenance
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <DialogContentText fontWeight="bold">Type:</DialogContentText>
                  <Typography>{selectedEvent.extendedProps.type === 'plan' ? 'Maintenance planifiée' : 'Maintenance corrective'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <DialogContentText fontWeight="bold">Statut:</DialogContentText>
                  <Chip 
                    label={selectedEvent.extendedProps.status} 
                    sx={{ 
                      color: 'white', 
                      backgroundColor: selectedEvent.backgroundColor,
                      fontWeight: 'bold'
                    }} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={6}>
                  <DialogContentText fontWeight="bold">Date prévue:</DialogContentText>
                  <Typography>
                    {new Date(selectedEvent.extendedProps.plannedDate || selectedEvent.start).toLocaleString()}
                  </Typography>
                </Grid>
                {selectedEvent.extendedProps.completedDate && (
                  <Grid item xs={6}>
                    <DialogContentText fontWeight="bold">Date de réalisation:</DialogContentText>
                    <Typography>
                      {new Date(selectedEvent.extendedProps.completedDate).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <DialogContentText fontWeight="bold">Description:</DialogContentText>
                  <Typography>{selectedEvent.extendedProps.description}</Typography>
                </Grid>
                {selectedEvent.extendedProps.resolutionDetails && (
                  <>
                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>
                    <Grid item xs={12}>
                      <DialogContentText fontWeight="bold">Détails de résolution:</DialogContentText>
                      <Typography>{selectedEvent.extendedProps.resolutionDetails}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal} color="primary">
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Box sx={{ 
        mt: 3, 
        p: 3, 
        backgroundColor: 'background.paper', 
        borderRadius: 3, 
        boxShadow: 2,
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Légende des statuts :
        </Typography>
        <Grid container spacing={2}>
          {[
            { label: "Terminé", color: '#4CAF50' },
            { label: "En cours", color: '#FFC107' },
            { label: "En attente (dans les temps)", color: '#FF9800' },
            { label: "En attente (date dépassée)", color: '#F44336' },
            { label: "Planifié", color: '#2196F3' }
          ].map((item, index) => (
            <Grid item key={index}>
              <Chip 
                label={item.label} 
                sx={{ 
                  bgcolor: item.color, 
                  color: 'white',
                  px: 2,
                  py: 1,
                  fontSize: '0.875rem'
                }} 
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};
MaintenanceCalendarServisor.propTypes = {
  maintenancePlans: PropTypes.array.isRequired,
  correctiveMaintenances: PropTypes.array.isRequired
};

export default MaintenanceCalendarServisor
