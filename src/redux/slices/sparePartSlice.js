import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:9999/equipment-service";
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🚀 Créer une pièce de rechange
export const createSparePart = createAsyncThunk(
  "sparePart/createSparePart",
  async (sparePartData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/spare-parts`, sparePartData, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Récupérer une pièce de rechange par ID
export const fetchSparePartById = createAsyncThunk(
  "sparePart/fetchSparePartById",
  async (sparePartId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/spare-parts/${sparePartId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Récupérer toutes les pièces de rechange d'un équipement
export const fetchSparePartsByEquipmentId = createAsyncThunk(
  "sparePart/fetchSparePartsByEquipmentId",
  async (equipmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/spare-parts/equipment/${equipmentId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Mettre à jour une pièce de rechange
export const updateSparePart = createAsyncThunk(
  "sparePart/updateSparePart",
  async ({ sparePartId, sparePartData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/spare-parts/${sparePartId}`, sparePartData, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Supprimer une pièce de rechange d'un équipement spécifique
export const deleteSparePart = createAsyncThunk(
  "sparePart/deleteSparePart",
  async ({ equipmentId, sparePartId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/spare-parts/${equipmentId}/spareParts/${sparePartId}`, {
        headers: getAuthHeaders(),
      });
      return { equipmentId, sparePartId }; // Retourner les IDs supprimés pour mettre à jour le state
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Mettre à jour les plans de maintenance d'une pièce de rechange
export const updateSparePartMaintenancePlans = createAsyncThunk(
  "sparePart/updateSparePartMaintenancePlans",
  async ({ sparePartId, maintenancePlans }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/spare-parts/${sparePartId}/maintenance-plans`, maintenancePlans, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

const sparePartSlice = createSlice({
  name: "sparePart",
  initialState: {
    spareParts: [],
    selectedSparePart: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    resetSelectedSparePart: (state) => {
      state.selectedSparePart = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSparePart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSparePart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spareParts.push(action.payload);
      })
      .addCase(createSparePart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSparePartById.fulfilled, (state, action) => {
        state.selectedSparePart = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSparePartById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSparePartById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSparePartsByEquipmentId.fulfilled, (state, action) => {
        state.spareParts = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSparePartsByEquipmentId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSparePartsByEquipmentId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateSparePart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSparePart.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.spareParts.findIndex((sparePart) => sparePart.id === action.payload.id);
        if (index !== -1) {
          state.spareParts[index] = action.payload;
        }
      })
      .addCase(updateSparePart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteSparePart.fulfilled, (state, action) => {
        state.spareParts = state.spareParts.filter((sparePart) => sparePart.id !== action.payload);
      })
      .addCase(deleteSparePart.rejected, (state, action) => {
        state.error = action.payload;
      })
   
      .addCase(updateSparePartMaintenancePlans.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSparePartMaintenancePlans.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.spareParts.findIndex((sparePart) => sparePart.id === action.payload.id);
        if (index !== -1) {
          state.spareParts[index] = action.payload;
        }
      })
      .addCase(updateSparePartMaintenancePlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetSelectedSparePart } = sparePartSlice.actions;
export default sparePartSlice.reducer;
