import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = 'http://localhost:9999/hospital-service';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchGouvernorats = createAsyncThunk(
  "gouvernorat/fetchGouvernorats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gouvernorats`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchGouvernoratById = createAsyncThunk(
  "gouvernorat/fetchGouvernoratById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/gouvernorats/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const gouvernoratSlice = createSlice({
  name: "gouvernorat",
  initialState: {
    gouvernorats: [],
    selectedGouvernorat: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGouvernorats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchGouvernorats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.gouvernorats = action.payload;
      })
      .addCase(fetchGouvernorats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchGouvernoratById.fulfilled, (state, action) => {
        state.selectedGouvernorat = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchGouvernoratById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchGouvernoratById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default gouvernoratSlice.reducer;
