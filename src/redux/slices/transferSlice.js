import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "http://localhost:9999/equipment-service/api/equipment-transfers";

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAllTransfers = createAsyncThunk(
  "transfers/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/all`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors du chargement des transferts.");
    }
  }
);

export const fetchTransfersByHospital = createAsyncThunk(
  "transfers/fetchByHospital",
  async (hospitalId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/by-hospital/${hospitalId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors du chargement des transferts par hôpital.");
    }
  }
);

export const fetchTransfersByService = createAsyncThunk(
  "transfers/fetchByService",
  async (serviceId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/by-service/${serviceId}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Erreur lors du chargement des transferts par service.");
    }
  }
);

const transferSlice = createSlice({
  name: "transfers",
  initialState: {
    transferList: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTransfers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllTransfers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transferList = action.payload;
      })
      .addCase(fetchAllTransfers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTransfersByHospital.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransfersByHospital.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transferList = action.payload;
      })
      .addCase(fetchTransfersByHospital.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTransfersByService.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTransfersByService.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transferList = action.payload;
      })
      .addCase(fetchTransfersByService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default transferSlice.reducer;
