import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:9999/auth-user-service/api';
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};
export const signUp = createAsyncThunk(
  'auth/signUp',
  async (signUpData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, signUpData, {
        headers: getAuthHeaders(),
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(handleError(error));
    }
  }
);


const initialState = {
  user: null,
  token: sessionStorage.getItem('token') || null,
  userId: sessionStorage.getItem('userId') || null,
  email: sessionStorage.getItem('email') || null,
  role: sessionStorage.getItem('role') || null,  
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Fonction pour gérer les erreurs
const handleError = (error) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || 'Une erreur est survenue';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erreur inconnue';
};
export const signIn = createAsyncThunk(
  'auth/signIn',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, userData, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { token, id, email, role } = response.data;

      // Stocker les informations dans sessionStorage, y compris le rôle
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('userId', id);
      sessionStorage.setItem('email', email);
      sessionStorage.setItem('role', role.name);  // Sauvegarde le rôle

      return { token, userId: id, email, role: role.name };  // Retourne le rôle
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Une erreur est survenue');
    }
  }
);


// Async thunk pour vérifier si l'email existe
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (email, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/exists`, {
        params: {email} // Passer en tant que paramètre
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(handleError(error));
    }
  }
);




// Action pour récupérer le profil de l'utilisateur connecté
export const getProfile = createAsyncThunk('auth/getProfile', async (_, thunkAPI) => {
  try {
    const token = sessionStorage.getItem('token');

    if (!token) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    sessionStorage.setItem('hospitalId', response.data.hospitalId); 
    sessionStorage.setItem('serviceId', response.data.serviceId); // Sauvegarde le rôle

    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(handleError(error));
  }
});

// Action pour récupérer le mot de passe oublié
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, thunkAPI) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/mail/forgot-password?email=${email}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(handleError(error));
    }
  }
);

// Action pour réinitialiser le mot de passe
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword }, thunkAPI) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/mail/reset-password`, null, {
        params: { token, newPassword },
      });

      return response.data;
    } catch (error) {
      // Retourner le message d'erreur spécifique du backend
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

// Slice Redux
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.userId = null;
      state.email = null;
      state.isAuthenticated = false;
      sessionStorage.clear();
    },
    updateAuthUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }; // Fusionner les nouvelles données
      state.email = action.payload.email || state.email; // Mettre à jour email si changé
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.userId = action.payload.userId;
        state.email = action.payload.email;
        state.role = action.payload.role;  
        state.isAuthenticated = true;

      })      
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;

      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout , updateAuthUser  } = authSlice.actions;
export default authSlice.reducer;
