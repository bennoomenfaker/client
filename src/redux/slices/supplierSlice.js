import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:9999/equipment-service/api/suppliers";

// Fonction pour récupérer le token d'authentification (à adapter si nécessaire)
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Récupérer tous les fournisseurs d'un hôpital
export const fetchSuppliersByHospital = createAsyncThunk(
  "supplier/fetchByHospital",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hospital/${hospitalId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data ||
          "Erreur lors de la récupération des fournisseurs de l'hôpital."
      );
    }
  }
);

// Récupérer un fournisseur par son ID
export const fetchSupplierById = createAsyncThunk(
  "supplier/fetchById",
  async (supplierId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${supplierId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Erreur lors de la récupération du fournisseur."
      );
    }
  }
);

// Créer un nouveau fournisseur
export const createSupplier = createAsyncThunk(
  "supplier/create",
  async (supplierData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_BASE_URL, supplierData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Erreur lors de la création du fournisseur."
      );
    }
  }
);

// Mettre à jour un fournisseur existant
export const updateSupplier = createAsyncThunk(
  "supplier/update",
  async ({ supplierId, supplierData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${supplierId}`,
        supplierData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Erreur lors de la mise à jour du fournisseur."
      );
    }
  }
);

// Supprimer un fournisseur
export const deleteSupplier = createAsyncThunk(
  "supplier/delete",
  async (supplierId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/${supplierId}`, {
        headers: getAuthHeaders(),
      });
      return supplierId; // Retourner l'ID supprimé pour mise à jour du state
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Erreur lors de la suppression du fournisseur."
      );
    }
  }
);

const supplierSlice = createSlice({
  name: "supplier",
  initialState: {
    supplier: null,
    suppliers: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearSupplier: (state) => {
      state.supplier = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Récupérer les fournisseurs par hôpital
      .addCase(fetchSuppliersByHospital.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuppliersByHospital.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suppliers = action.payload;
      })
      .addCase(fetchSuppliersByHospital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Récupérer un fournisseur par ID
      .addCase(fetchSupplierById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSupplierById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.supplier = action.payload;
      })
      .addCase(fetchSupplierById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Créer un fournisseur
      .addCase(createSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suppliers.push(action.payload);
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mettre à jour un fournisseur
      .addCase(updateSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        state.supplier = action.payload;
        // Mettre à jour le fournisseur dans la liste si elle existe
        state.suppliers = state.suppliers.map((supplier) =>
          supplier.id === action.payload.id ? action.payload : supplier
        );
      })
      .addCase(updateSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Supprimer un fournisseur
      .addCase(deleteSupplier.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suppliers = state.suppliers.filter(
          (supplier) => supplier.id !== action.payload
        );
        state.supplier = null;
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Gestion des erreurs globales
      .addMatcher(
        (action) => action.type.endsWith("rejected"),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearSupplier, clearError } = supplierSlice.actions;
export default supplierSlice.reducer;