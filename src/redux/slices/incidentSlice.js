import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Nouvelle URL pour l'API
const API_BASE_URL = "http://localhost:9999/equipment-service/api";

// Fonction pour récupérer le token d'authentification
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Thunk pour signaler un incident
export const reportIncident = createAsyncThunk(
  "incidents/reportIncident",
  async ({ equipmentId,description , reportedBy }, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/incidents/report?equipmentId=${encodeURIComponent(equipmentId)}&reportedBy=${encodeURIComponent(reportedBy)}&description=${encodeURIComponent(description)}`;
      
      const response = await axios.post(url, null, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Erreur lors de la déclaration de l'incident"
      );
    }
  }
);



// ✅ Thunk pour résoudre un incident
export const resolveIncident = createAsyncThunk(
  "incidents/resolveIncident",
  async ({ incidentId, validatedBy, resolutionDetails }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/incidents/resolve/${incidentId}`, {
        validatedBy,
        resolutionDetails,
      }, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la résolution de l'incident");
    }
  }
);

// ✅ Thunk pour récupérer les incidents par hôpital et service
export const fetchIncidentsByHospitalAndService = createAsyncThunk(
  "incidents/fetchIncidentsByHospitalAndService",
  async ({ hospitalId, serviceId }, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/incidents/hospital/${encodeURIComponent(hospitalId)}/service/${encodeURIComponent(serviceId)}`;
      const response = await axios.get(url, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des incidents");
    }
  }
);

// ✅ Thunk pour récupérer les incidents par hôpital
export const fetchIncidentsByHospital = createAsyncThunk(
  "incidents/fetchIncidentsByHospital",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/incidents/hospital/${encodeURIComponent(hospitalId)}`;
      const response = await axios.get(url, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des incidents");
    }
  }
);

// ✅ Thunk pour récupérer tous les incidents
export const fetchAllIncidents = createAsyncThunk(
  "incidents/fetchAllIncidents",
  async (_, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/incidents/all`;
      const response = await axios.get(url, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des incidents");
    }
  }
);
// ✅ Thunk pour mettre à jour un incident
export const updateIncident = createAsyncThunk(
  "incidents/updateIncident",
  async ({ incidentId, updatedData, user }, { rejectWithValue }) => {  // Ajout du paramètre 'user'
       console.log({ incidentId, updatedData, user })
    try {
      const response = await axios.put(
        `${API_BASE_URL}/incidents/update/${incidentId}`,
        {updatedData, user },  // Ajout de l'utilisateur dans le corps de la requête
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Erreur lors de la mise à jour de l'incident"
      );
    }
  }
);



// ✅ Thunk pour mettre à jour un incident
export const deleteIncident = createAsyncThunk(
  "incidents/deleteIncident",
  async ( selectedIncidentId , { rejectWithValue }) => {
    try {
     await axios.delete(
        `${API_BASE_URL}/incidents/delete/${selectedIncidentId}`,
        
        { headers: getAuthHeaders() }
      );
      return selectedIncidentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Erreur lors de la mise à jour de l'incident"
      );
    }
  }
);

export const validateIncident = createAsyncThunk(
  "incidents/validateIncident",
  async ({ incidentId, engineerId, severity, updatedData }, { rejectWithValue }) => {
    try {
      const url = `${API_BASE_URL}/incidents/validate/${encodeURIComponent(incidentId)}?engineerId=${encodeURIComponent(engineerId)}&severity=${encodeURIComponent(severity)}`;
      const response = await axios.put(url, updatedData, { // Envoyer updatedData dans le corps de la requête
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Erreur lors de la validation de l'incident"
      );
    }
  }
);



// Initialisation du WebSocket
let socket = null;

const incidentSlice = createSlice({
  name: "incidents",
  initialState: {
    list: [],
    all: [],
    listByHospitalAndService:[],
    error: null,
    isLoading: false,
  },
  reducers: {
    setIncidents: (state, action) => {
      state.list = action.payload;
    },
    initWebSocket: (state, action) => {
      if (!socket) {
        socket = new WebSocket(`ws://localhost:9999/equipment-service/ws/incidents?userId=${action.payload}`);

        socket.onmessage = (event) => {
          const newIncident = JSON.parse(event.data);
          state.list.push(newIncident);
        };

        socket.onerror = (error) => {
          console.error("WebSocket Error:", error);
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Récupération des incidents
      .addCase(reportIncident.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(reportIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.push(action.payload); // Ajouter l'incident signalé
      })
      .addCase(reportIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Résolution d'un incident
      .addCase(resolveIncident.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resolveIncident.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = state.list.map((incident) =>
          incident.id === action.payload.id ? { ...incident, ...action.payload } : incident
        );
      })
      .addCase(resolveIncident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
       // Récupération des incidents par hôpital et service
       .addCase(fetchIncidentsByHospitalAndService.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchIncidentsByHospitalAndService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.listByHospitalAndService = action.payload;
      })
      .addCase(fetchIncidentsByHospitalAndService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
       // Récupération des incidents par hôpital
       .addCase(fetchIncidentsByHospital.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchIncidentsByHospital.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchIncidentsByHospital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Récupération de tous les incidents
      .addCase(fetchAllIncidents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllIncidents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.all = action.payload;
      })
      .addCase(fetchAllIncidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Validation d’un incident
.addCase(validateIncident.pending, (state) => {
  state.isLoading = true;
})
.addCase(validateIncident.fulfilled, (state, action) => {
  state.isLoading = false;
  state.list = state.list.map((incident) =>
    incident.id === action.payload.id ? { ...incident, ...action.payload } : incident
  );
})
.addCase(validateIncident.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})
// Suppression d’un incident
.addCase(deleteIncident.pending, (state) => {
  state.isLoading = true;
})
.addCase(deleteIncident.fulfilled, (state, action) => {
  state.isLoading = false;
  // On filtre la liste pour enlever l'incident supprimé
  state.list = state.list.filter((incident) => incident.incident.id !== action.payload);
})
.addCase(deleteIncident.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})


            // Mise à jour d'un incident
            .addCase(updateIncident.pending, (state) => {
              state.isLoading = true;
            })
            .addCase(updateIncident.fulfilled, (state, action) => {
              state.isLoading = false;
              state.list = state.list.map((incident) =>
                incident.id === action.payload.id ? { ...incident, ...action.payload } : incident
              );
            })
            .addCase(updateIncident.rejected, (state, action) => {
              state.isLoading = false;
              state.error = action.payload;
            });
      
  },
});

export const { setIncidents, initWebSocket } = incidentSlice.actions;
export default incidentSlice.reducer;
