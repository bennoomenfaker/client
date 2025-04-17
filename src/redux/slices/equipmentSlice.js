import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:9999/equipment-service/api";

// Fonction pour récupérer le token d'authentification
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchEquipmentBySerial = createAsyncThunk(
    "equipment/fetchBySerial",
    async (serialCode, { rejectWithValue }) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/equipments/serial/${serialCode}`, {
          headers: getAuthHeaders(),
        });
        return response.data;
      } catch (error) {
        return rejectWithValue(error.response?.data || "Erreur lors de la récupération de l'équipement");
      }
    }
  );

// Récupérer les équipements d'un hôpital
export const fetchEquipmentsByHospital = createAsyncThunk(
  "equipment/fetchByHospital",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipments/hospital/${hospitalId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des équipements.");
    }
  }
);

// Créer un nouvel équipement
export const createEquipment = createAsyncThunk(
  "equipment/create",
  async (equipmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/equipments`, equipmentData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      return response.data; // Retourne les données de l'API en cas de succès
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la création de l'équipement.");
    }
  }
);

// Mettre à jour un équipement
export const updateEquipment = createAsyncThunk(
  "equipment/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/equipments/${id}`, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la mise à jour de l'équipement.");
    }
  }
);

export const updateMaintenancePlanEqui = createAsyncThunk(
  "equipment/updateMaintenancePlan",
  async ({ equipmentId, maintenancePlanId, newPlanDetails }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/equipments/${equipmentId}/maintenance/${maintenancePlanId}`,
        newPlanDetails,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la mise à jour du plan de maintenance.");
    }
  }
);


// Ajouter un plan de maintenance
export const addMaintenancePlan = createAsyncThunk(
  "equipment/addMaintenancePlan",
  async ({ equipmentId, maintenancePlan }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/equipments/${equipmentId}/maintenance-plans`, maintenancePlan, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de l'ajout du plan de maintenance.");
    }
  }
);

// Récupérer les pièces détachées d'un équipement
export const fetchSparePartsByEquipmentId = createAsyncThunk(
  "equipment/fetchSpareParts",
  async (equipmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipments/${equipmentId}/spare-parts`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des pièces détachées.");
    }
  }
);

// Ajouter une pièce détachée à un équipement
export const addSparePart = createAsyncThunk(
  "equipment/addSparePart",
  async ({ equipmentId, sparePart }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/equipments/${equipmentId}/spare-parts`, sparePart, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de l'ajout de la pièce détachée.");
    }
  }
);

// Rechercher un équipement via son code EMDN
export const fetchEquipmentByEmdnCode = createAsyncThunk(
  "equipment/fetchByEmdnCode",
  async (code, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipments/${code}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Équipement introuvable avec ce code EMDN.");
    }
  }
);

// Récupérer les équipements non réceptionnés
export const fetchNonReceivedEquipment = createAsyncThunk(
  "equipment/fetchNonReceived",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipments/non-received`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des équipements non réceptionnés.");
    }
  }
);

export const assignSlaToEquipment = createAsyncThunk(
  "equipment/assignSla",
  async ({ equipmentId, slaId }, { rejectWithValue }) => {
      try {
          const response = await axios.put(`${API_BASE_URL}/equipments/${equipmentId}/assign-sla/${slaId}`, {}, {
              headers: getAuthHeaders(),
          });
          return response.data;
      } catch (error) {
          return rejectWithValue(error.response?.data || "Erreur lors de l'assignation du SLA à l'équipement.");
      }
  }
);

// Mettre à jour le plan de maintenance pour un équipement spécifique
export const updateMaintenancePlansForEquipment = createAsyncThunk(
  "equipment/updateMaintenancePlans",
  async ({ equipmentId, updatedPlans }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/equipments/${equipmentId}/maintenance-plans`, // Correction de l'URL
        updatedPlans, // Envoie la liste complète des plans
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la mise à jour des plans de maintenance.");
    }
  }
);

// Changer un équipement entre services
export const changeEquipmentInterService = createAsyncThunk(
  "equipment/changeService",
  async ({ equipmentId, newServiceId, description, user }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/equipments/${equipmentId}/service`,
        user, // user est envoyé dans le body
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          params: { newServiceId, description },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors du changement de service.");
    }
  }
);


// Changer un équipement entre hôpitaux
export const changeEquipmentInterHospital = createAsyncThunk(
  "equipment/changeHospital",
  async ({ equipmentId, newHospitalId, description, user }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/equipments/${equipmentId}/hospital`,
        user,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
          params: { newHospitalId, description },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors du changement d'hôpital.");
    }
  }
);

export const deleteEquipment = createAsyncThunk(
  "equipment/delete",
  async (equipmentId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/equipments/${equipmentId}`, {
        headers: getAuthHeaders(),
      });
      return equipmentId; // Retourner l'ID pour mise à jour du state
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la suppression de l'équipement.");
    }
  }
);
// ❌ Ce n’est pas une suppression !
export const fetchEquipmentById = createAsyncThunk(
  "equipment/fetchEquipmentById",
  async (equipmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/equipments/by-id/${equipmentId}`, {
        headers: getAuthHeaders(),
      });
      return response.data; // Retourne l'équipement
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération de l'équipement.");
    }
  }
);




// Création du slice Redux Toolkit
const equipmentSlice = createSlice({
  name: "equipment",
  initialState: {
    equipmentList: [],
    selectedEquipment: null,
    nonReceivedEquipment: [],
    spareParts: [],
    isLoading: false,
    error: null,
    
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedEquipment: (state) => {
      state.selectedEquipment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Récupérer les équipements d'un hôpital
      .addCase(fetchEquipmentsByHospital.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEquipmentsByHospital.fulfilled, (state, action) => {
        state.isLoading = false;
        state.equipmentList = action.payload;
      })
      .addCase(fetchEquipmentsByHospital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Récupérer les équipements non réceptionnés
      .addCase(fetchNonReceivedEquipment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNonReceivedEquipment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nonReceivedEquipment = action.payload; // Stocker les équipements non réceptionnés
      })
      .addCase(fetchNonReceivedEquipment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
            // Mettre à jour un plan de maintenance
            .addCase(updateMaintenancePlanEqui.fulfilled, (state, action) => {
              if (state.selectedEquipment && state.selectedEquipment.maintenancePlans) {
                state.selectedEquipment.maintenancePlans = state.selectedEquipment.maintenancePlans.map((plan) =>
                  plan.id === action.payload.id ? action.payload : plan
                );
              }
            })
      

      // Créer un équipement
      .addCase(createEquipment.fulfilled, (state, action) => {
        state.equipmentList.push(action.payload);
      })

      // Mettre à jour un équipement
      .addCase(updateEquipment.fulfilled, (state, action) => {
        state.equipmentList = state.equipmentList.map((eq) =>
          eq.id === action.payload.id ? action.payload : eq
        );
      })

      // Ajouter un plan de maintenance
      .addCase(addMaintenancePlan.fulfilled, (state, action) => {
        state.selectedEquipment = action.payload;
      })

      // Récupérer les pièces détachées
      .addCase(fetchSparePartsByEquipmentId.fulfilled, (state, action) => {
        state.spareParts = action.payload;
      })

      // Ajouter une pièce détachée
      .addCase(addSparePart.fulfilled, (state, action) => {
        state.spareParts.push(action.payload);
      })

      // Rechercher un équipement par code EMDN
      .addCase(fetchEquipmentByEmdnCode.fulfilled, (state, action) => {
        state.selectedEquipment = action.payload;
      })

     
      .addCase(fetchEquipmentBySerial.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchEquipmentBySerial.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.equipment = action.payload;
      })
      .addCase(fetchEquipmentBySerial.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Assigner un SLA à un équipement
      .addCase(assignSlaToEquipment.pending, (state) => {
        state.isLoading = true;
    })
    .addCase(assignSlaToEquipment.fulfilled, (state, action) => {
        state.isLoading = false;
        // Mettre à jour l'équipement dans la liste ou l'équipement sélectionné
        if (state.equipmentList) {
            state.equipmentList = state.equipmentList.map(eq =>
                eq.id === action.payload.id ? action.payload : eq
            );
        }
        if (state.selectedEquipment && state.selectedEquipment.id === action.payload.id) {
            state.selectedEquipment = action.payload;
        }
    })
    .addCase(assignSlaToEquipment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
    })
    .addCase(changeEquipmentInterService.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(changeEquipmentInterService.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedEquipment = action.payload;
    })
    .addCase(changeEquipmentInterService.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    .addCase(changeEquipmentInterHospital.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(changeEquipmentInterHospital.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedEquipment = action.payload;
    })
    .addCase(changeEquipmentInterHospital.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    .addCase(deleteEquipment.fulfilled, (state, action) => {
      state.equipmentList = state.equipmentList.filter(eq => eq.id !== action.payload);
    })
    .addCase(fetchEquipmentById.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(fetchEquipmentById.fulfilled, (state, action) => {
      state.isLoading = false;
      state.selectedEquipment = action.payload; // stocker l'équipement dans selectedEquipment
    })
    .addCase(fetchEquipmentById.rejected, (state, action) => {
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

export const { clearError, clearSelectedEquipment } = equipmentSlice.actions;
export default equipmentSlice.reducer;
