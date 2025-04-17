import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:9999/equipment-service/api";
// Fonction pour récupérer le token d'authentification
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Récupérer les marques d'un hôpital
export const fetchBrandsByHospital = createAsyncThunk(
  "brands/fetchBrandsByHospital",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/brands/hospital/${hospitalId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des marques.");
    }
  }
);

// Récupérer une marque par ID
export const fetchBrandById = createAsyncThunk(
  "brands/fetchBrandById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/brands/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération de la marque.");
    }
  }
);

// Créer une nouvelle marque
export const createBrand = createAsyncThunk(
  "brands/createBrand",
  async (brandData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/brands`, brandData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la création de la marque.");
    }
  }
);

// Mettre à jour une marque
export const updateBrand = createAsyncThunk(
  "brands/updateBrand",
  async ({ id, brandData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/brands/${id}`, brandData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la mise à jour de la marque.");
    }
  }
);

// Supprimer une marque
export const deleteBrand = createAsyncThunk(
  "brands/deleteBrand",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/brands/${id}`, {
        headers: getAuthHeaders(),
      });
      return id; // Retourne l'ID pour pouvoir la retirer du state
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la suppression de la marque.");
    }
  }
);

const brandsSlice = createSlice({
  name: "brands",
  initialState: {
    brandList: [],
    selectedBrand: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBrand: (state) => {
      state.selectedBrand = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrandsByHospital.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBrandsByHospital.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brandList = action.payload;
      })
      .addCase(fetchBrandsByHospital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchBrandById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBrandById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedBrand = action.payload;
      })
      .addCase(fetchBrandById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(createBrand.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brandList.push(action.payload);
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateBrand.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brandList = state.brandList.map((brand) =>
          brand.id === action.payload.id ? action.payload : brand
        );
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteBrand.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.isLoading = false;
        state.brandList = state.brandList.filter((brand) => brand.id !== action.payload);
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedBrand } = brandsSlice.actions;
export default brandsSlice.reducer;
