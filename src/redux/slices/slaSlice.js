import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:9999/equipment-service";
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🚀 Créer un SLA
export const createSla = createAsyncThunk(
  "sla/createSla",
  async (slaData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/slas`, slaData, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);
// 🚀 Récupérer les SLAs d'un hôpital avec les infos des équipements associés
export const fetchSlasByHospitalWithEquipment = createAsyncThunk(
  "sla/fetchSlasByHospitalWithEquipment",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/slas/hospital/${hospitalId}`,
        { headers: getAuthHeaders() }
      );
      return response.data; // tableau de SLADetailsDTO
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Récupérer un SLA par ID
export const fetchSlaById = createAsyncThunk(
  "sla/fetchSlaById",
  async (slaId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/slas/${slaId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Récupérer le SLA d'un équipement
export const fetchSlaByEquipmentId = createAsyncThunk(
  "sla/fetchSlaByEquipmentId",
  async (equipmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/slas/equipment/${equipmentId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Lister les SLA d'un prestataire de maintenance
export const fetchSlasByProvider = createAsyncThunk(
  "sla/fetchSlasByProvider",
  async (maintenanceProviderId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/slas/provider/${maintenanceProviderId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);

// 🚀 Supprimer un SLA
export const deleteSla = createAsyncThunk(
  "sla/deleteSla",
  async (slaId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/slas/${slaId}`, {
        headers: getAuthHeaders(),
      });
      return slaId; // Retourner l'ID supprimé pour le retirer du state
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);
// 🚀 Mettre à jour un SLA
export const updateSla = createAsyncThunk(
  "sla/updateSla",
  async ({ slaId, slaData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/slas/${slaId}`, slaData, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);


// 🚀 Vérifier la conformité d'un SLA pour un incident
export const checkSlaCompliance = createAsyncThunk(
  "sla/checkSlaCompliance",
  async (incidentId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/slas/check-compliance/${incidentId}`, 
        {}, // pas de body, juste un appel
        {
          headers: {  ...getAuthHeaders() },
        }
      );
      //console.log(response)
      return response.data; // On peut retourner l'incident mis à jour si tu veux
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur inconnue");
    }
  }
);





// 📊 1. Obtenir les statistiques de conformité SLA d’un hôpital
export const fetchSlaComplianceStats = createAsyncThunk(
  "sla/fetchSlaComplianceStats",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/slas/compliance/${hospitalId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur SLA compliance");
    }
  }
);

// 📊 2. Total des pénalités par hôpital
export const fetchPenaltiesByHospital = createAsyncThunk(
  "sla/fetchPenaltiesByHospital",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/slas/penalties/hospital/${hospitalId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur total pénalités hôpital");
    }
  }
);

// 📊 3. Total des pénalités par prestataire
export const fetchPenaltiesByCompany = createAsyncThunk(
  "sla/fetchPenaltiesByCompany",
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/slas/penalties/company/${companyId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur total pénalités prestataire");
    }
  }
);

// 📊 4. Top 5 équipements les plus pénalisés
export const fetchTopPenalizedEquipments = createAsyncThunk(
  "sla/fetchTopPenalizedEquipments",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/slas/top-penalized-equipment/${hospitalId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur top équipements pénalisés");
    }
  }
);


const slaSlice = createSlice({
  name: "sla",
  initialState: {
    slas: [],
    selectedSla: null,
    slasByProvider: [],
    isLoading: false,
    error: null,
    slaComplianceStatus: null,
    slasByHospital: [],
  penaltiesByHospital: null,
  penaltiesByCompany: null,
  topPenalizedEquipments: [],

  },
  reducers: {
    resetSelectedSla: (state) => {
      state.selectedSla = null;
    },
    resetSlaComplianceStatus: (state) => {
      state.slaComplianceStatus = null; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSla.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSla.fulfilled, (state, action) => {
        state.isLoading = false;
        state.slas.push(action.payload);
      })
      .addCase(createSla.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSlaById.fulfilled, (state, action) => {
        state.selectedSla = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSlaById.pending, (state) => {
        state.isLoading = true;
        state.selectedSla = null
      })
      .addCase(fetchSlaById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(checkSlaCompliance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkSlaCompliance.fulfilled, (state , action) => {
        state.isLoading = false;
        state.slaComplianceStatus = action.payload; 

       
      })
      .addCase(checkSlaCompliance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchSlaByEquipmentId.fulfilled, (state, action) => {
        state.selectedSla = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSlaByEquipmentId.pending, (state) => {
        state.isLoading = true;
        state.selectedSla = null;
        resetSelectedSla()
      })
      .addCase(fetchSlaByEquipmentId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSlasByProvider.fulfilled, (state, action) => {
        state.slasByProvider = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSlasByProvider.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSlasByProvider.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteSla.fulfilled, (state, action) => {
        state.slas = state.slas.filter((sla) => sla.id !== action.payload);
      })
      // Gestion de l'update du SLA
      .addCase(updateSla.pending, (state) => {
        state.isLoading = true;
        state.selectedSla = null
      })
      .addCase(updateSla.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.slas.findIndex((sla) => sla.id === action.payload.id);
        if (index !== -1) {
          state.slas[index] = action.payload; // Met à jour le SLA dans le tableau
        }
      })
      .addCase(updateSla.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSlasByHospitalWithEquipment.pending, (state) => {
  state.isLoading = true;
  state.slasByHospital = [];
})
.addCase(fetchSlasByHospitalWithEquipment.fulfilled, (state, action) => {
  state.isLoading = false;
  state.slasByHospital = action.payload;
})
.addCase(fetchSlasByHospitalWithEquipment.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})






// 🎯 Compliance stats
.addCase(fetchSlaComplianceStats.pending, (state) => {
  state.isLoading = true;
})
.addCase(fetchSlaComplianceStats.fulfilled, (state, action) => {
  state.isLoading = false;
  state.slaComplianceStatus = action.payload;
})
.addCase(fetchSlaComplianceStats.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})

// 💰 Total pénalités hôpital
.addCase(fetchPenaltiesByHospital.pending, (state) => {
  state.isLoading = true;
})
.addCase(fetchPenaltiesByHospital.fulfilled, (state, action) => {
  state.isLoading = false;
  state.penaltiesByHospital = action.payload;
})
.addCase(fetchPenaltiesByHospital.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})

// 💼 Total pénalités prestataire
.addCase(fetchPenaltiesByCompany.pending, (state) => {
  state.isLoading = true;
})
.addCase(fetchPenaltiesByCompany.fulfilled, (state, action) => {
  state.isLoading = false;
  state.penaltiesByCompany = action.payload;
})
.addCase(fetchPenaltiesByCompany.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})

// 🏆 Top équipements pénalisés
.addCase(fetchTopPenalizedEquipments.pending, (state) => {
  state.isLoading = true;
})
.addCase(fetchTopPenalizedEquipments.fulfilled, (state, action) => {
  state.isLoading = false;
  state.topPenalizedEquipments = action.payload;
})
.addCase(fetchTopPenalizedEquipments.rejected, (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
})


  },
});
export const { resetSelectedSla, resetSlaComplianceStatus } = slaSlice.actions;
export default slaSlice.reducer;
