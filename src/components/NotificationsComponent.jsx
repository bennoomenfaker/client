import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, updateNotificationAsRead } from "../redux/slices/notificationSlice";
import { Container, List, ListItem, ListItemText, ListItemIcon, Typography, Box, Modal, Divider, Paper } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import NavBar from "./NavBar";

const Notification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications.list);
  const email = sessionStorage.getItem("email");
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    if (email) {
      dispatch(fetchNotifications(email));
    }
  }, [dispatch, email]);

  // Ouvrir le modal et mettre à jour la notification comme lue
  const handleNotificationClick = (notif) => {
    setSelectedNotification(notif);
    if (!notif.read) {
      dispatch(updateNotificationAsRead(notif.id));
    }
  };

  return (
    <>
      <NavBar />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          📩 Toutes les Notifications
        </Typography>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, maxHeight: "70vh", overflowY: "auto" }}>
          {notifications.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: "center", mt: 2 }}>
              Aucune notification pour le moment.
            </Typography>
          ) : (
            <List>
              {notifications.map((notif, index) => (
                <React.Fragment key={index}>
                  <ListItem button onClick={() => handleNotificationClick(notif)}>
                    <ListItemIcon>
                      {!notif.read && <CircleIcon fontSize="small" color="error" />} {/* Point rouge si non lue */}
                    </ListItemIcon>
                    <ListItemText primary={notif.title} secondary={notif.message} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>

      {/* Modal pour afficher les détails d'une notification */}
      <Modal open={!!selectedNotification} onClose={() => setSelectedNotification(null)}>
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
    </>
  );
};

export default Notification;
