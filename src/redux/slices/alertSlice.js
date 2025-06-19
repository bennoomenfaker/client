import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:9999/equipment-service/api';

// 🔐 Headers avec JWT
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🔹 GET alerts by hospitalId
export const fetchAlertsByHospitalId = createAsyncThunk(
  'alerts/fetchByHospitalId',
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alerts/hospital/${hospitalId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors du chargement des alertes.");
    }
  }
);

// 🔹 GET alerts by equipmentId
export const fetchAlertsByEquipmentId = createAsyncThunk(
  'alerts/fetchByEquipmentId',
  async (equipmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alerts/equipment/${equipmentId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors du chargement des alertes.");
    }
  }
);

// 🔹 Slice d'alertes
const alertSlice = createSlice({
  name: 'alerts',
  initialState: {
    alerts: [],
    error: null,
  },
  reducers: {
    addAlert: (state, action) => {
  const exists = state.alerts.find(alert => alert._id === action.payload._id);
  if (!exists) {
    state.alerts.unshift(action.payload);
  }
},

    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(alert => alert._id !== action.payload);
    },
    setAlertError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlertsByHospitalId.fulfilled, (state, action) => {
        state.alerts = action.payload;
        state.error = null;
      })
      .addCase(fetchAlertsByHospitalId.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchAlertsByEquipmentId.fulfilled, (state, action) => {
        state.alerts = action.payload;
        state.error = null;
      })
      .addCase(fetchAlertsByEquipmentId.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});// ✅ Initialisation du WebSocket

let reconnectAttempts = 0;

export const initializeWebSocket = (dispatch) => {
  const connect = () => {
    const socket = new WebSocket("ws://localhost:8000/ws/alerts");

    socket.onopen = () => {
      console.log("✅ Connexion WebSocket établie");
      reconnectAttempts = 0;
    };

    socket.onmessage = (event) => {
      try {
        const alert = JSON.parse(event.data);
        dispatch(addAlert(alert));
      } catch (error) {
        console.error("❌ Erreur parsing :", error);
        dispatch(setAlertError("Erreur réception alerte"));
      }
    };

    socket.onclose = () => {
      console.log("🔌 Connexion WebSocket fermée, tentative de reconnexion...");
      reconnectAttempts++;
      setTimeout(connect, Math.min(5000, reconnectAttempts * 1000)); // backoff progressif
    };

    socket.onerror = (error) => {
      console.error("⚠️ Erreur WebSocket :", error);
      dispatch(setAlertError("Erreur WebSocket"));
      socket.close();
    };
  };

  connect();
};


// Export actions et reducer
export const { addAlert, removeAlert, setAlertError } = alertSlice.actions;
export default alertSlice.reducer;