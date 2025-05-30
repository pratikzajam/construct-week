import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get job seekers
export const getJobSeekers = createAsyncThunk(
  'users/getJobSeekers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get('/api/users/job-seekers', config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get recruiters
export const getRecruiters = createAsyncThunk(
  'users/getRecruiters',
  async (_, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get('/api/users/recruiters', config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const initialState = {
  jobSeekers: [],
  recruiters: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get job seekers
      .addCase(getJobSeekers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobSeekers.fulfilled, (state, action) => {
        state.loading = false;
        state.jobSeekers = action.payload;
      })
      .addCase(getJobSeekers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get recruiters
      .addCase(getRecruiters.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecruiters.fulfilled, (state, action) => {
        state.loading = false;
        state.recruiters = action.payload;
      })
      .addCase(getRecruiters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = userSlice.actions;

export default userSlice.reducer;