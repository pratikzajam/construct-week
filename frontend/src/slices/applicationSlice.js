import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create application
export const createApplication = createAsyncThunk(
  'applications/createApplication',
  async (applicationData, { getState, rejectWithValue }) => {
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

      const { data } = await axios.post('/api/applications', applicationData, config);
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

// Get job applications
export const getJobApplications = createAsyncThunk(
  'applications/getJobApplications',
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

      const { data } = await axios.get(`/api/applications/job/${jobId}`, config);
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

// Get application details
export const getApplicationDetails = createAsyncThunk(
  'applications/getApplicationDetails',
  async (id, { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(`/api/applications/${id}`, config);
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

// Update application status
export const updateApplicationStatus = createAsyncThunk(
  'applications/updateApplicationStatus',
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
        `/api/applications/${id}/status`,
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

// Add application feedback
export const addApplicationFeedback = createAsyncThunk(
  'applications/addApplicationFeedback',
  async ({ id, feedback }, { getState, rejectWithValue }) => {
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

      const { data } = await axios.post(
        `/api/applications/${id}/feedback`,
        feedback,
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

// Get user applications
export const getUserApplications = createAsyncThunk(
  'applications/getUserApplications',
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

      const { data } = await axios.get('/api/applications/user', config);
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

// Get recruiter applications
export const getRecruiterApplications = createAsyncThunk(
  'applications/getRecruiterApplications',
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

      const { data } = await axios.get('/api/applications/recruiter', config);
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

// Rank job applications
export const rankJobApplications = createAsyncThunk(
  'applications/rankJobApplications',
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

      const { data } = await axios.get(`/api/applications/job/${jobId}/rank`, config);
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
  applications: [],
  application: null,
  userApplications: [],
  recruiterApplications: [],
  rankedApplications: [],
  loading: false,
  error: null,
  success: false,
  updateSuccess: false,
};

const applicationSlice = createSlice({
  name: 'applications',
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
      // Create application
      .addCase(createApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(createApplication.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get job applications
      .addCase(getJobApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(getJobApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get application details
      .addCase(getApplicationDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getApplicationDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.application = action.payload;
      })
      .addCase(getApplicationDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update application status
      .addCase(updateApplicationStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.application = action.payload;
        state.updateSuccess = true;
        
        // Update application in applications list
        state.applications = state.applications.map((app) =>
          app._id === action.payload._id ? action.payload : app
        );
        
        // Update application in recruiter applications list
        state.recruiterApplications = state.recruiterApplications.map((app) =>
          app._id === action.payload._id ? action.payload : app
        );
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add application feedback
      .addCase(addApplicationFeedback.pending, (state) => {
        state.loading = true;
      })
      .addCase(addApplicationFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.application = action.payload;
        state.updateSuccess = true;
      })
      .addCase(addApplicationFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get user applications
      .addCase(getUserApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.userApplications = action.payload;
      })
      .addCase(getUserApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get recruiter applications
      .addCase(getRecruiterApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecruiterApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.recruiterApplications = action.payload;
      })
      .addCase(getRecruiterApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Rank job applications
      .addCase(rankJobApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(rankJobApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.rankedApplications = action.payload;
      })
      .addCase(rankJobApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetSuccess } = applicationSlice.actions;

export default applicationSlice.reducer;