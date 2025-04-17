import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:9999/hospital-service";
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🚀 Récupérer tous les services
export const fetchServices = createAsyncThunk(
  "hospitalService/fetchServices",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/services`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Récupérer un service par ID
export const fetchServiceById = createAsyncThunk(
  "hospitalService/fetchServiceById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/services/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Ajouter un nouveau service
export const createService = createAsyncThunk(
  "hospitalService/createService",
  async (serviceData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/services`, serviceData, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Mettre à jour un service
export const updateService = createAsyncThunk(
  "hospitalService/updateService",
  async ({ id, serviceData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/services/${id}`, serviceData, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Supprimer un service
export const deleteService = createAsyncThunk(
  'hospitalService/deleteService',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/services/${id}`, {
        headers: getAuthHeaders(),
      });
      return id; // Retourner l'ID supprimé pour le retirer du state
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Erreur inconnue');
    }
  }
);


// 🚀 Récupérer les services par ID d'hôpital
export const fetchServicesByHospitalId = createAsyncThunk(
  "hospitalService/fetchServicesByHospitalId",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/services/hospital/${hospitalId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

const hospitalServiceSlice = createSlice({
  name: "hospitalService",
  initialState: {
    services: [],
    serviceByHospital: [],
    selectedService: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchServiceById.fulfilled, (state, action) => {
        state.selectedService = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchServiceById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.services.push(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.services.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.services[index] = action.payload;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.services = state.services.filter((s) => s.id !== action.payload);
        state.serviceByHospital =  state.serviceByHospital.filter((s) => s.id !== action.payload);
      })
      .addCase(fetchServicesByHospitalId.fulfilled, (state, action) => {
        state.serviceByHospital = action.payload;
      });
  },
});

export default hospitalServiceSlice.reducer;
