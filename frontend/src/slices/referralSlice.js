import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create referral
export const createReferral = createAsyncThunk(
  'referrals/createReferral',
  async (referralData, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post('/api/referrals', referralData, config);
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

// Get job referrals
export const getJobReferrals = createAsyncThunk(
  'referrals/getJobReferrals',
  async (jobId, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(`/api/referrals/job/${jobId}`, config);
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

// Get user referrals
export const getUserReferrals = createAsyncThunk(
  'referrals/getUserReferrals',
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

      const { data } = await axios.get('/api/referrals/user', config);
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

// Update referral status
export const updateReferralStatus = createAsyncThunk(
  'referrals/updateReferralStatus',
  async ({ id, status }, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/referrals/${id}/status`,
        { status },
        config
      );
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

// Update referral reward
export const updateReferralReward = createAsyncThunk(
  'referrals/updateReferralReward',
  async ({ id, amount, paid }, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/referrals/${id}/reward`,
        { amount, paid },
        config
      );
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
  referrals: [],
  userReferrals: [],
  loading: false,
  error: null,
  success: false,
  updateSuccess: false,
};

const referralSlice = createSlice({
  name: 'referrals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create referral
      .addCase(createReferral.pending, (state) => {
        state.loading = true;
      })
      .addCase(createReferral.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createReferral.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get job referrals
      .addCase(getJobReferrals.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobReferrals.fulfilled, (state, action) => {
        state.loading = false;
        state.referrals = action.payload;
      })
      .addCase(getJobReferrals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get user referrals
      .addCase(getUserReferrals.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserReferrals.fulfilled, (state, action) => {
        state.loading = false;
        state.userReferrals = action.payload;
      })
      .addCase(getUserReferrals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update referral status
      .addCase(updateReferralStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReferralStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        
        // Update referral in referrals list
        state.referrals = state.referrals.map((referral) =>
          referral._id === action.payload._id ? action.payload : referral
        );
      })
      .addCase(updateReferralStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update referral reward
      .addCase(updateReferralReward.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateReferralReward.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        
        // Update referral in referrals list
        state.referrals = state.referrals.map((referral) =>
          referral._id === action.payload._id ? action.payload : referral
        );
      })
      .addCase(updateReferralReward.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetSuccess } = referralSlice.actions;

export default referralSlice.reducer;