import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = 'http://localhost:9999/equipment-service/api/emdn';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchEMDNCodes = createAsyncThunk(
  "emdnCode/fetchEMDNCodes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/nomenclatures`,{
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const emdnNomenclatureSlice = createSlice({
  name: "emdnNomenclature",
  initialState: {
    emdnCodeList: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEMDNCodes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEMDNCodes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emdnCodeList = action.payload;
      })
      .addCase(fetchEMDNCodes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default emdnNomenclatureSlice.reducer;