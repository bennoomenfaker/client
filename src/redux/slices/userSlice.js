import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateAuthUser } from './authSlice';
const API_BASE_URL = 'http://localhost:9999/auth-user-service/api/users';

//  Récupérer un utilisateur par ID
export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (id, { rejectWithValue }) => {
    const token = sessionStorage.getItem('token');
    if (!token) return rejectWithValue('Token manquant. Veuillez vous reconnecter.');

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Échec de récupération de l’utilisateur.');

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//  Récupérer les administrateurs des hopitaux (Ministry Admin uniquement)
export const getUsersGetHospitalsAdmin = createAsyncThunk('user/getUsersGetHospitalsAdmin', async (_, { rejectWithValue }) => {
  const token = sessionStorage.getItem('token');
  if (!token) return rejectWithValue('Token manquant. Veuillez vous reconnecter.');

  try {
    const response = await fetch(`${API_BASE_URL}/admins-hopitaux`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs.');

    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});
// Récupérer les utilisateurs par serviceId et hospitalId
export const getUsersByServiceIdAndHospitalId = createAsyncThunk(
  'user/getUsersByServiceIdAndHospitalId',
  async ({ hospitalId, serviceId }, { rejectWithValue }) => {
    const token = sessionStorage.getItem('token');
    if (!token) return rejectWithValue('Token manquant. Veuillez vous reconnecter.');
    try {
      const response = await fetch(`${API_BASE_URL}/hospital/${hospitalId}/service/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs.');

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Récupérer les utilisateurs par hospitalId
export const getUsersByHospitalId = createAsyncThunk(
  'user/getUsersByHospitalId',
  async (hospitalId, { rejectWithValue }) => {
    const token = sessionStorage.getItem('token');
    if (!token) return rejectWithValue('Token manquant. Veuillez vous reconnecter.');
    try {
      const response = await fetch(`${API_BASE_URL}/hospital/${hospitalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs.');

      return  response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//  Récupérer les administrateurs des hopitaux (Ministry Admin uniquement)
export const getUsers = createAsyncThunk('user/getUsers', async (_, { rejectWithValue }) => {
  const token = sessionStorage.getItem('token');
  if (!token) return rejectWithValue('Token manquant. Veuillez vous reconnecter.');

  try {
    const response = await fetch(`${API_BASE_URL}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des utilisateurs.');

    return await response.json();
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

//  Modifier un utilisateur
export const modifyUser = createAsyncThunk(
  'users/modifyUser',
  async ({ id, userData }, { rejectWithValue, dispatch }) => {
    const token = sessionStorage.getItem('token');
    if (!token) return rejectWithValue('Token manquant. Veuillez vous reconnecter.');

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error('Échec de modification de l’utilisateur.');

      const updatedUser = await response.json();
      
      dispatch(updateAuthUser(updatedUser)); // Mise à jour du user dans authSlice
      
      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
//  Modifier un utilisateur
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }, { rejectWithValue }) => {
    const token = sessionStorage.getItem('token');
    if (!token) return rejectWithValue('Token manquant. Veuillez vous reconnecter.');

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

    
      
      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 🔹 Supprimer un utilisateur
export const deleteUser = createAsyncThunk('user/deleteUser', async (id, { rejectWithValue }) => {
  const token = sessionStorage.getItem('token');
  if (!token) return rejectWithValue('Token manquant. Veuillez vous reconnecter.');

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Erreur lors de la suppression de l’utilisateur.');

    return `Utilisateur ${id} supprimé avec succès.`;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

// 🔹 Activer un utilisateur (si applicable)
export const activateUser = createAsyncThunk('user/activateUser', async (id, { rejectWithValue }) => {
  const token = sessionStorage.getItem('token');
  if (!token) return rejectWithValue('Token manquant. Veuillez vous reconnecter.');

  try {
    const response = await fetch(`${API_BASE_URL}/activate/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Erreur lors de l’activation de l’utilisateur.');

    return `Utilisateur ${id} activé avec succès.`;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});
export const updateUserHospitalAndService = createAsyncThunk(
  'user/updateUserHospitalAndService',
  async ({ id, hospitalId, serviceId }, { rejectWithValue, dispatch }) => {
    const token = sessionStorage.getItem('token');
    if (!token) return rejectWithValue('Token manquant. Veuillez vous reconnecter.');

    try {
      const response = await fetch(`${API_BASE_URL}/${id}/update-hospital-service`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ hospitalId, serviceId }),
      });

      if (!response.ok) throw new Error('Échec de mise à jour de l’hôpital et du service de l’utilisateur.');

      const updatedUser = await response.json();

      dispatch(updateAuthUser(updatedUser)); // Met à jour le user dans authSlice

      return updatedUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

//  Slice Redux
export const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: sessionStorage.getItem('token') || null,
    isLoading: false,
    users: [],
    allUsers: [],
    hospitalsAdmins: [],
    usersByHospital: [],
    usersByServiceAndHospital: [],
    userInfo: null,
    userSelected: null,
    error: null,
  },
  reducers: {
   
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = action.payload;
        state.userSelected = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUsersGetHospitalsAdmin.fulfilled, (state, action) => {
        state.hospitalsAdmins = action.payload;
        state.isLoading = false;
      })
      .addCase(getUsersGetHospitalsAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsersGetHospitalsAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload;
        state.isLoading = false;
      })
      .addCase(getUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(modifyUser.fulfilled, (state, action) => {
        state.userInfo = action.payload;
        state.isLoading = false;
      })
      .addCase(modifyUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(modifyUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter((user) => user.id !== action.meta.arg);
      })
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(activateUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(activateUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(activateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUsersByServiceIdAndHospitalId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsersByServiceIdAndHospitalId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usersByServiceAndHospital = action.payload;
      })
      .addCase(getUsersByServiceIdAndHospitalId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUsersByHospitalId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUsersByHospitalId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.usersByHospital = action.payload;
      })
      .addCase(getUsersByHospitalId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateUserHospitalAndService.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserHospitalAndService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userInfo = action.payload; // Met à jour l'utilisateur courant
        state.userSelected = action.payload;
      })
      .addCase(updateUserHospitalAndService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
      
  },
});

// Export des actions et du reducer
export const { updateUserData } = userSlice.actions;
export default userSlice.reducer;