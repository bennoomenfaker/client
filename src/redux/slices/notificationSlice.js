import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:4040/api/notifications";

// Fonction pour récupérer le token d'authentification
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Thunk pour récupérer les notifications
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${userId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des notifications");
    }
  }
);

// ✅ Thunk pour marquer une notification comme lue
export const updateNotificationAsRead = createAsyncThunk(
  "notifications/updateNotificationAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      await axios.put(`${API_BASE_URL}/${notificationId}/read`, {
        headers: getAuthHeaders(),
      });
      return { notificationId };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la mise à jour de la notification");
    }
  }
);


// ✅ Thunk pour marquer une notification comme lue
export const deleteNotification = createAsyncThunk(
  "notifications/deleteNotification",
  async (notificationId, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:9999/equipment-service/api/maintenance-plans/${notificationId}`, {
        headers: getAuthHeaders(),
      });
      return { notificationId };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la mise à jour de la notification");
    }
  }
);

// Initialisation du WebSocket
let socket = null;

const notificationSlice = createSlice({
  name: "notifications",
  initialState: {
    list: JSON.parse(localStorage.getItem("notifications")) || [],
    error: null,
    isLoading: false,
  },
  reducers: {
    addNotification: (state, action) => {
      state.list.push(action.payload);
      localStorage.setItem("notifications", JSON.stringify(state.list));
    },
    removeNotification: (state, action) => {
      state.list = state.list.filter((notif) => notif.id !== action.payload);
      localStorage.setItem("notifications", JSON.stringify(state.list));
    },
    setNotifications: (state, action) => {
      state.list = action.payload;
      localStorage.setItem("notifications", JSON.stringify(state.list));
    },
    initWebSocket: (state, action) => {
      if (!socket) {
        socket = new WebSocket(`ws://localhost:4040/ws/notifications?userId=${action.payload}`);

        socket.onmessage = (event) => {
          const newNotification = JSON.parse(event.data);
          state.list.push(newNotification);
          localStorage.setItem("notifications", JSON.stringify(state.list));
        };

        socket.onerror = (error) => {
          console.error("WebSocket Error:", error);
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Récupération des notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
        localStorage.setItem("notifications", JSON.stringify(action.payload));
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Mise à jour d'une notification comme lue
      .addCase(updateNotificationAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateNotificationAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.map((notif) =>
          notif.id === action.payload.notificationId ? { ...notif, read: true } : notif
        );
        localStorage.setItem("notifications", JSON.stringify(state.list));
      })
      .addCase(updateNotificationAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
       // Suppression d'une notification
       .addCase(deleteNotification.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.isDeleting = false;
        // Filtrer la notification supprimée de la liste
        state.list = state.list.filter((notif) => notif.id !== action.payload.notificationId);
        localStorage.setItem("notifications", JSON.stringify(state.list));
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Actions exportées
export const { addNotification, removeNotification, setNotifications, initWebSocket } = notificationSlice.actions;
export default notificationSlice.reducer;
