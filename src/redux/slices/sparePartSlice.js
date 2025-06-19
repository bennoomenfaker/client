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
      const response = await axios.get(`${API_BASE_URL}/api/spare-parts/by-equipment/${equipmentId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Supprimer une pièce de rechange
export const deleteSparePart = createAsyncThunk(
  "sparePart/deleteSparePart",
  async (sparePartId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/spare-parts/${sparePartId}`, {
        headers: getAuthHeaders(),
      });
      return sparePartId;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Mettre à jour une pièce de rechange
export const updateSparePart = createAsyncThunk(
  "sparePart/updateSparePart",
  async ({ id, updatedSparePart }, { rejectWithValue }) => {
    try {
      console.log(updatedSparePart)
      const response = await axios.put(`${API_BASE_URL}/api/spare-parts/${id}`, updatedSparePart , {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);
// 🚀 Récupérer toutes les pièces d’un hôpital + code EMDN
export const fetchSparePartsByHospitalAndEmdnCode = createAsyncThunk(
  "sparePart/fetchSparePartsByHospitalAndEmdnCode",
  async ({ hospitalId, code }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/spare-parts/by-hospital-and-emdn`,
        {
          params: { hospitalId, code },
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);


// 🚀 Récupérer toutes les pièces de rechange d'un hôpital
export const fetchSparePartsByHospitalId = createAsyncThunk(
  "sparePart/fetchSparePartsByHospitalId",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/spare-parts/by-hospital/${hospitalId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Ajouter un lot à une pièce de rechange
export const addLotToSparePart = createAsyncThunk(
  "sparePart/addLotToSparePart",
  async ({ sparePartId, lotData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/spare-parts/${sparePartId}/lots`,
        lotData,
        { headers: { "Content-Type": "application/json", ...getAuthHeaders() } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Supprimer un lot d'une pièce de rechange
export const removeLotFromSparePart = createAsyncThunk(
  "sparePart/removeLotFromSparePart",
  async ({ sparePartId, lotData }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/api/spare-parts/${sparePartId}/lots`,
        {
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          data: lotData, // Utilisation de "data" pour envoyer un corps avec DELETE
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Récupérer toutes les pièces compatibles à un code EMDN (code fourni par le front)
export const fetchSparePartsByEmdnCode = createAsyncThunk(
  "sparePart/fetchSparePartsByEmdnCode",
  async (code, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/spare-parts/by-emdn-code`,
        {
          params: { code },
          headers: getAuthHeaders(),
        }
      );
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
      // Create
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

      // Get by ID
      .addCase(fetchSparePartById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSparePartById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedSparePart = action.payload;
      })
      .addCase(fetchSparePartById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get by Equipment
      .addCase(fetchSparePartsByEquipmentId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSparePartsByEquipmentId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spareParts = action.payload;
      })
      .addCase(fetchSparePartsByEquipmentId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateSparePart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSparePart.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.spareParts.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.spareParts[index] = action.payload;
      })
      .addCase(updateSparePart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteSparePart.fulfilled, (state, action) => {
        state.spareParts = state.spareParts.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteSparePart.rejected, (state, action) => {
        state.error = action.payload;
      })
            // Get by Hospital and Nomenclature
     // fetchSparePartsByEmdnCode
.addCase(fetchSparePartsByEmdnCode.pending, (state) => {
  state.isLoading = true;
})
.addCase(fetchSparePartsByEmdnCode.fulfilled, (state, action) => {
  state.isLoading = false;
  state.spareParts = action.payload;
})
.addCase(fetchSparePartsByEmdnCode.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})

// fetchSparePartsByHospitalAndEmdnCode
.addCase(fetchSparePartsByHospitalAndEmdnCode.pending, (state) => {
  state.isLoading = true;
})
.addCase(fetchSparePartsByHospitalAndEmdnCode.fulfilled, (state, action) => {
  state.isLoading = false;
  state.spareParts = action.payload;
})
.addCase(fetchSparePartsByHospitalAndEmdnCode.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})

      // Get by Hospital
.addCase(fetchSparePartsByHospitalId.pending, (state) => {
  state.isLoading = true;
})
.addCase(fetchSparePartsByHospitalId.fulfilled, (state, action) => {
  state.isLoading = false;
  state.spareParts = action.payload;
})
.addCase(fetchSparePartsByHospitalId.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})

// Add Lot
.addCase(addLotToSparePart.fulfilled, (state, action) => {
  const index = state.spareParts.findIndex((s) => s.id === action.payload.id);
  if (index !== -1) state.spareParts[index] = action.payload;
})

// Remove Lot
.addCase(removeLotFromSparePart.fulfilled, (state, action) => {
  const index = state.spareParts.findIndex((s) => s.id === action.payload.id);
  if (index !== -1) state.spareParts[index] = action.payload;
})


  },
});

export const { resetSelectedSparePart } = sparePartSlice.actions;
export default sparePartSlice.reducer;
