import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:9999/equipment-service/api";

// Fonction pour récupérer le token d'authentification
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Récupérer toutes les maintenances correctives
export const fetchAllCorrectiveMaintenances = createAsyncThunk(
  "correctiveMaintenances/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/corrective-maintenances`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des maintenances.");
    }
  }
);

// Récupérer les maintenances correctives assignées à une société (assignedTo)
export const fetchCorrectiveMaintenancesByCompany = createAsyncThunk(
  "correctiveMaintenances/fetchByCompany",
  async (userIdCompany, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/corrective-maintenances/company/${userIdCompany}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des maintenances de la société.");
    }
  }
);

// Mettre à jour une maintenance corrective
export const updateCorrectiveMaintenance = createAsyncThunk(
  "correctiveMaintenances/update",
  async ({ id, maintenanceData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/corrective-maintenances/${id}`, maintenanceData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la mise à jour de la maintenance.");
    }
  }
);

// Supprimer une maintenance corrective
export const deleteCorrectiveMaintenance = createAsyncThunk(
  "correctiveMaintenances/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/corrective-maintenances/${id}`, {
        headers: getAuthHeaders(),
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la suppression de la maintenance.");
    }
  }
);

// Récupérer les maintenances correctives par hospitalId
export const fetchCorrectiveMaintenancesByHospital = createAsyncThunk(
  "correctiveMaintenances/fetchByHospital",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/corrective-maintenances/by-hospital/${hospitalId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des maintenances de l'hôpital.");
    }
  }
);


const correctiveMaintenanceSlice = createSlice({
  name: "correctiveMaintenances",
  initialState: {
    list: [],
    isLoading: false,
    error: null,
    listCorr : []
  },
  reducers: {
    clearMaintenanceError: (state) => {
      state.error = null;
    },
     clearMaintenance: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllCorrectiveMaintenances.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllCorrectiveMaintenances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchAllCorrectiveMaintenances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchCorrectiveMaintenancesByCompany.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCorrectiveMaintenancesByCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchCorrectiveMaintenancesByCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(updateCorrectiveMaintenance.fulfilled, (state, action) => {
        const updated = action.payload;
        console.log(updated)
        state.list = state.list.map((m) => (m.id === updated.id ? updated : m));
      })
      .addCase(updateCorrectiveMaintenance.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(deleteCorrectiveMaintenance.fulfilled, (state, action) => {
        state.list = state.list.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteCorrectiveMaintenance.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchCorrectiveMaintenancesByHospital.pending, (state) => {
  state.isLoading = true;
})
.addCase(fetchCorrectiveMaintenancesByHospital.fulfilled, (state, action) => {
  state.isLoading = false;
  state.listCorr = action.payload;
})
.addCase(fetchCorrectiveMaintenancesByHospital.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
});

  },
});

export const { clearMaintenanceError } = correctiveMaintenanceSlice.actions;
export default correctiveMaintenanceSlice.reducer;
