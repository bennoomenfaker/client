import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:9999/equipment-service/api/maintenance-plans";

// Fonction pour récupérer le token d'authentification
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Récupérer un plan de maintenance par ID et équipement
export const fetchMaintenancePlan = createAsyncThunk(
  "maintenancePlan/fetchById",
  async ({ equipmentId, maintenancePlanId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${equipmentId}/${maintenancePlanId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération du plan de maintenance.");
    }
  }
);

// Mettre à jour un plan de maintenance
export const updateMaintenancePlan = createAsyncThunk(
  "maintenancePlan/update",
  async ({ equipmentId, maintenancePlanId, newPlanDetails }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/${equipmentId}/${maintenancePlanId}`,
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

// Supprimer un plan de maintenance
export const deleteMaintenancePlan = createAsyncThunk(
  "maintenancePlan/delete",
  async ({maintenancePlanId}, { rejectWithValue }) => {
    
    try {
      await axios.delete(`${API_BASE_URL}/${maintenancePlanId}`, {
        headers: getAuthHeaders(),
      });
      return maintenancePlanId; // Retourner l'ID supprimé pour mise à jour du state
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la suppression du plan de maintenance.");
    }
  }
);


// Récupérer tous les plans de maintenance (équipements et pièces de rechange) d'un hôpital
export const fetchAllMaintenancePlansByHospital = createAsyncThunk(
  "maintenance/fetchAllByHospital",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/hospital/${hospitalId}/getAllMaintenance`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération de tous les plans de maintenance de l'hôpital.");
    }
  }
);

// Récupérer les plans de maintenance des pièces de rechange d'un hôpital
export const fetchSparePartMaintenancePlansByHospital = createAsyncThunk(
  "maintenance/fetchSparePartByHospital",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenances/spare-parts/hospital/${hospitalId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des plans de maintenance des pièces de rechange de l'hôpital.");
    }
  }
);
// Récupérer les plans de maintenance des équipements d'un hôpital
export const fetchEquipmentMaintenancePlansByHospital = createAsyncThunk(
  "maintenance/fetchEquipmentByHospital",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenances/equipments/hospital/${hospitalId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des plans de maintenance des équipements de l'hôpital.");
    }
  }
);



// Récupérer les plans de maintenance d'un équipement spécifique
export const fetchMaintenancePlansForEquipment = createAsyncThunk(
  "maintenance/fetchForEquipment",
  async (equipmentId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenances/equipments/${equipmentId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des plans de maintenance de l'équipement.");
    }
  }
);

// Récupérer les plans de maintenance d'une pièce de rechange spécifique
export const fetchMaintenancePlansForSparePart = createAsyncThunk(
  "maintenance/fetchForSparePart",
  async (sparePartId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/maintenances/spare-parts/${sparePartId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la récupération des plans de maintenance de la pièce de rechange.");
    }
  }
);

// Action Redux asynchrone pour déclencher la vérification de maintenance des équipements
export const triggerEquipmentMaintenanceCheck = createAsyncThunk(
  "maintenancePlan/triggerEquipmentMaintenance",
  async (_, { rejectWithValue }) => {
      try {
          const response = await axios.post(
              `${API_BASE_URL}/trigger/equipments`,
              {}, // Pas de corps nécessaire pour cette requête POST
              {
                  headers: getAuthHeaders(),
              }
          );
          return response.data; // Vous pouvez retourner la réponse si nécessaire
      } catch (error) {
          return rejectWithValue(error.response?.data || "Erreur lors du déclenchement de la vérification de maintenance des équipements.");
      }
  }
);
// Créer un plan de maintenance
export const createMaintenancePlan = createAsyncThunk(
  "maintenancePlan/create",
  async ({ equipmentId, maintenancePlanData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${equipmentId}`,
        maintenancePlanData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors de la création du plan de maintenance.");
    }
  }
);


//  Action Redux asynchrone pour déclencher la vérification de maintenance des pièces de rechange
export const triggerSparePartMaintenanceCheck = createAsyncThunk(
  "maintenancePlan/triggerSparePartMaintenance",
  async (_, { rejectWithValue }) => {
      try {
          const response = await axios.post(
              `${API_BASE_URL}/trigger/spare-parts`,
              {}, // Pas de corps nécessaire pour cette requête POST
              {
                  headers: getAuthHeaders(),
              }
          );
          return response.data; // Vous pouvez retourner la réponse si nécessaire
      } catch (error) {
          return rejectWithValue(error.response?.data || "Erreur lors du déclenchement de la vérification de maintenance des pièces de rechange.");
      }
  }
);

const maintenancePlanSlice = createSlice({
    name: "maintenancePlan",
    initialState: {
      maintenancePlan: null,
      isLoading: false,
      maintenancePlans: [],
      error: null,
      isTriggeringEquipment: false, // Nouvel état pour le déclenchement de la maintenance des équipements
      triggerEquipmentError: null, // Nouvel état pour les erreurs de déclenchement des équipements
      isTriggeringSparePart: false, // Nouvel état pour le déclenchement de la maintenance des pièces de rechange
      triggerSparePartError: null, // Nouvel état pour les erreurs de déclenchement des pièces de rechange
    },
    reducers: {
      clearMaintenancePlan: (state) => {
        state.maintenancePlan = null;
      },
      clearError: (state) => {
        state.error = null;
        state.triggerEquipmentError = null;
        state.triggerSparePartError = null;
      },
    },
    extraReducers: (builder) => {
      builder
        // Récupérer un plan de maintenance
        .addCase(fetchMaintenancePlan.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchMaintenancePlan.fulfilled, (state, action) => {
          state.isLoading = false;
          state.maintenancePlan = action.payload;
        })
        .addCase(fetchMaintenancePlan.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        })
  
        // Mettre à jour un plan de maintenance
        .addCase(updateMaintenancePlan.fulfilled, (state, action) => {
          state.maintenancePlan = action.payload;
        })


         // Supprimer un plan de maintenance
      .addCase(deleteMaintenancePlan.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMaintenancePlan.fulfilled, (state , action) => {
        state.isLoading = false;
         // Filtrer la liste des plans pour supprimer celui qui a été supprimé
         state.maintenancePlans = state.maintenancePlans.filter(
          (plan) => plan.id !== action.payload
      );
        // Vous pouvez mettre à jour votre state ici si nécessaire
        // Par exemple, si vous avez une liste de plans, vous pouvez la filtrer pour supprimer l'élément supprimé
        // state.maintenancePlanList = state.maintenancePlanList.filter(plan => plan.id !== action.payload);
        state.maintenancePlan = null; // Si vous affichez un plan unique, vous pouvez le réinitialiser
      })
      .addCase(deleteMaintenancePlan.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchMaintenancePlansForEquipment.fulfilled, (state, action) => {
        state.maintenancePlans = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchMaintenancePlansForEquipment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMaintenancePlansForEquipment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchMaintenancePlansForSparePart.fulfilled, (state, action) => {
        state.maintenancePlans = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchMaintenancePlansForSparePart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMaintenancePlansForSparePart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchEquipmentMaintenancePlansByHospital.fulfilled, (state, action) => {
        state.maintenancePlans = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchEquipmentMaintenancePlansByHospital.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEquipmentMaintenancePlansByHospital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchSparePartMaintenancePlansByHospital.fulfilled, (state, action) => {
        state.maintenancePlans = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchSparePartMaintenancePlansByHospital.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSparePartMaintenancePlansByHospital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllMaintenancePlansByHospital.fulfilled, (state, action) => {
        state.maintenancePlans = action.payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchAllMaintenancePlansByHospital.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllMaintenancePlansByHospital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
        // Déclenchement de la vérification de maintenance des équipements
        .addCase(triggerEquipmentMaintenanceCheck.pending, (state) => {
          state.isTriggeringEquipment = true;
          state.triggerEquipmentError = null;
      })
      .addCase(triggerEquipmentMaintenanceCheck.fulfilled, (state) => {
          state.isTriggeringEquipment = false;
          // Vous pouvez ajouter une logique supplémentaire ici si nécessaire,
          // comme afficher un message de succès dans votre state.
      })
      .addCase(triggerEquipmentMaintenanceCheck.rejected, (state, action) => {
          state.isTriggeringEquipment = false;
          state.triggerEquipmentError = action.payload;
      })
            // Créer un plan de maintenance
            .addCase(createMaintenancePlan.pending, (state) => {
              state.isLoading = true;
              state.error = null;
            })
            .addCase(createMaintenancePlan.fulfilled, (state, action) => {
              state.isLoading = false;
              state.maintenancePlans.push(action.payload); // ajoute le plan créé à la liste
            })
            .addCase(createMaintenancePlan.rejected, (state, action) => {
              state.isLoading = false;
              state.error = action.payload;
            })
      
      // Déclenchement de la vérification de maintenance des pièces de rechange
      .addCase(triggerSparePartMaintenanceCheck.pending, (state) => {
          state.isTriggeringSparePart = true;
          state.triggerSparePartError = null;
      })
      .addCase(triggerSparePartMaintenanceCheck.fulfilled, (state) => {
          state.isTriggeringSparePart = false;
          // Vous pouvez ajouter une logique supplémentaire ici si nécessaire.
      })
      .addCase(triggerSparePartMaintenanceCheck.rejected, (state, action) => {
          state.isTriggeringSparePart = false;
          state.triggerSparePartError = action.payload;
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
  
  export const { clearMaintenancePlan, clearError } = maintenancePlanSlice.actions;
  export default maintenancePlanSlice.reducer;
  