import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const API_BASE_URL = "http://localhost:9999/hospital-service";
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🚀 Récupérer tous les hôpitaux
export const fetchHospitals = createAsyncThunk(
  "hospital/fetchHospitals",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/hospitals`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Récupérer un hôpital par ID
export const fetchHospitalById = createAsyncThunk(
  "hospital/fetchHospitalById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/hospitals/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Ajouter un nouvel hôpital
export const createHospital = createAsyncThunk(
  "hospital/createHospital",
  async (hospitalData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/hospitals`, hospitalData, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Mettre à jour un hôpital
export const updateHospital = createAsyncThunk(
  "hospital/updateHospital",
  async ({id, hospitalData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/hospitals/${id}`, hospitalData, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Supprimer un hôpital
export const deleteHospital = createAsyncThunk(
  "hospital/deleteHospital",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/hospitals/${id}`, {
        headers: getAuthHeaders(),
      });
      return id; // Retourner l'ID supprimé pour le retirer du state
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);


// 🚀 Ajouter un service à un hôpital
export const addServiceToHospital = createAsyncThunk(
  "hospital/addServiceToHospital",
  async ({ hospitalId, serviceId }, { rejectWithValue }) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/hospitals/${hospitalId}/services/${serviceId}`,
        {},
        { headers: getAuthHeaders() }
      );
      return { hospitalId, serviceId };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Supprimer un service d'un hôpital
export const removeServiceFromHospital = createAsyncThunk(
  "hospital/removeServiceFromHospital",
  async ({ hospitalId, serviceId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/hospitals/${hospitalId}/services/${serviceId}`, {
        headers: getAuthHeaders(),
      });
      return { hospitalId, serviceId };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Ajouter un utilisateur à un hôpital
export const addUserToHospital = createAsyncThunk(
  "hospital/addUserToHospital",
  async ({ hospitalId, serviceId,userId }, { rejectWithValue }) => {
    try {
    const response =  await axios.post(
        `${API_BASE_URL}/api/hospitals/${hospitalId}/service/${serviceId}/users/${userId}`,
        {},
        { headers: getAuthHeaders() }
      );
      return  response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Supprimer un utilisateur d'un hôpital
export const removeUserFromHospital = createAsyncThunk(
  "hospital/removeUserFromHospital",
  async ({ hospitalId, serviceId,userId }, { rejectWithValue }) => {
    try {
     const response =  await axios.delete(`${API_BASE_URL}/api/hospitals/${hospitalId}/service/${serviceId}/users/${userId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

const hospitalSlice = createSlice({
  name: "hospital",
  initialState: {
    hospitals: [],
    selectedHospital: {services: [],
      userIds: [],},
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHospitals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHospitals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hospitals = action.payload;
      })
      .addCase(fetchHospitals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchHospitalById.fulfilled, (state, action) => {
        state.selectedHospital = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchHospitalById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHospitalById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createHospital.fulfilled, (state, action) => {
        state.hospitals.push(action.payload);
      })
      .addCase(updateHospital.fulfilled, (state, action) => {
        const index = state.hospitals.findIndex((h) => h.id === action.payload.id);
        if (index !== -1) state.hospitals[index] = action.payload;
      })
     
      .addCase(deleteHospital.fulfilled, (state, action) => {
        state.hospitals = state.hospitals.filter((h) => h.id !== action.payload);
      })
     // Ajouter un service à un hôpital
     .addCase(addServiceToHospital.fulfilled, (state, action) => {
      const { hospitalId, serviceId } = action.payload;
    
      // Mettre à jour la liste des hôpitaux
      const hospital = state.hospitals.find((h) => h.id === hospitalId);
      if (hospital) {
        // Ajouter l'ID du service temporairement
        hospital.services.push(serviceId);
      }
    
      // Rafraîchir l'hôpital sélectionné s'il est concerné
      if (state.selectedHospital?.id === hospitalId) {
        state.selectedHospital.services.push(serviceId);
      }
    
      
    })
// Supprimer un service d'un hôpital
// Supprimer un service d'un hôpital
.addCase(removeServiceFromHospital.fulfilled, (state, action) => {
  const { hospitalId, serviceId } = action.payload;
 
  // Mettre à jour la liste des hôpitaux
  const hospital = state.hospitals.find((h) => h.id === hospitalId);
  if (hospital) {
    hospital.services = hospital.services.filter((s) => s !== serviceId);
  }

  // Rafraîchir l'hôpital sélectionné s'il est concerné
  if (state.selectedHospital?.id === hospitalId) {
    state.selectedHospital.services = state.selectedHospital.services.filter(
      (s) => s !== serviceId
    );
  }
  })

     // Ajouter un utilisateur à un hôpital
     .addCase(addUserToHospital.fulfilled, (state, action) => {
      const { hospitalId, userId } = action.payload;

      // Mettre à jour la liste des hôpitaux
      const hospital = state.hospitals.find((h) => h.id === hospitalId);
      if (hospital) {
       // hospital.userIds.push(userId);
      }

      // Rafraîchir l'hôpital sélectionné s'il est concerné
      if (state.selectedHospital?.id === hospitalId) {
        state.selectedHospital.userIds.push(userId);
      }
    })
      // Supprimer un utilisateur d'un hôpital
      .addCase(removeUserFromHospital.fulfilled, () => {
     
        // Mettre à jour la liste des hôpitaux
       /* const hospital = state.hospitals.find((h) => h.id === hospitalId);
        if (hospital) {
          hospital.userIds = hospital.userIds.filter((u) => u !== userId);
        }*/

        // Rafraîchir l'hôpital sélectionné s'il est concerné
       /* if (state.selectedHospital?.id === hospitalId) {
          state.selectedHospital.userIds = state.selectedHospital.userIds.filter(
            (u) => u !== userId
          );
        }*/
      });
  },
});

export default hospitalSlice.reducer;
