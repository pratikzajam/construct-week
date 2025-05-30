import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get all jobs
export const getJobs = createAsyncThunk(
  'jobs/getJobs',
  async ({ keyword = '', location = '', type = '', experience = '', pageNumber = '' }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `/api/jobs?keyword=${keyword}&location=${location}&type=${type}&experience=${experience}&pageNumber=${pageNumber}`
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

// Get job details
export const getJobDetails = createAsyncThunk(
  'jobs/getJobDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/jobs/${id}`);
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

// Create job
export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { getState, rejectWithValue }) => {
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

      const { data } = await axios.post('/api/jobs', jobData, config);
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

// Update job
export const updateJob = createAsyncThunk(
  'jobs/updateJob',
  async ({ id, jobData }, { getState, rejectWithValue }) => {
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

      const { data } = await axios.put(`/api/jobs/${id}`, jobData, config);
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

// Delete job
export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
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

      await axios.delete(`/api/jobs/${id}`, config);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get recruiter jobs
export const getRecruiterJobs = createAsyncThunk(
  'jobs/getRecruiterJobs',
  async (pageNumber = '', { getState, rejectWithValue }) => {
    try {
      const {
        auth: { userInfo },
      } = getState();

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/jobs/recruiter?pageNumber=${pageNumber}`,
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

// Get job statistics
export const getJobStats = createAsyncThunk(
  'jobs/getJobStats',
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

      const { data } = await axios.get('/api/jobs/stats', config);
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
  jobs: [],
  pages: 0,
  page: 0,
  total: 0,
  job: null,
  recruiterJobs: [],
  recruiterPages: 0,
  recruiterPage: 0,
  recruiterTotal: 0,
  stats: null,
  loading: false,
  error: null,
  success: false,
  deleteSuccess: false,
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
      state.deleteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all jobs
      .addCase(getJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs;
        state.pages = action.payload.pages;
        state.page = action.payload.page;
        state.total = action.payload.total;
      })
      .addCase(getJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get job details
      .addCase(getJobDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.job = action.payload;
      })
      .addCase(getJobDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create job
      .addCase(createJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update job
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        state.job = action.payload;
        state.success = true;
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete job
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        state.recruiterJobs = state.recruiterJobs.filter(
          (job) => job._id !== action.payload
        );
        state.deleteSuccess = true;
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get recruiter jobs
      .addCase(getRecruiterJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecruiterJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.recruiterJobs = action.payload.jobs;
        state.recruiterPages = action.payload.pages;
        state.recruiterPage = action.payload.page;
        state.recruiterTotal = action.payload.total;
      })
      .addCase(getRecruiterJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get job statistics
      .addCase(getJobStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getJobStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetSuccess } = jobSlice.actions;

export default jobSlice.reducer;