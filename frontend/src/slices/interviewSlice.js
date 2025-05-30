import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Schedule interview
export const scheduleInterview = createAsyncThunk(
  'interviews/scheduleInterview',
  async (interviewData, { getState, rejectWithValue }) => {
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

      const { data } = await axios.post('/api/interviews', interviewData, config);
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

// Get recruiter interviews
export const getRecruiterInterviews = createAsyncThunk(
  'interviews/getRecruiterInterviews',
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

      const { data } = await axios.get('/api/interviews/recruiter', config);
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

// Get applicant interviews
export const getApplicantInterviews = createAsyncThunk(
  'interviews/getApplicantInterviews',
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

      const { data } = await axios.get('/api/interviews/applicant', config);
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

// Get interview details
export const getInterviewDetails = createAsyncThunk(
  'interviews/getInterviewDetails',
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

      const { data } = await axios.get(`/api/interviews/${id}`, config);
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

// Update interview
export const updateInterview = createAsyncThunk(
  'interviews/updateInterview',
  async ({ id, interviewData }, { getState, rejectWithValue }) => {
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

      const { data } = await axios.put(`/api/interviews/${id}`, interviewData, config);
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

// Complete interview
export const completeInterview = createAsyncThunk(
  'interviews/completeInterview',
  async ({ id, feedback, rating }, { getState, rejectWithValue }) => {
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
        `/api/interviews/${id}/complete`,
        { feedback, rating },
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

// Cancel interview
export const cancelInterview = createAsyncThunk(
  'interviews/cancelInterview',
  async ({ id, reason }, { getState, rejectWithValue }) => {
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
        `/api/interviews/${id}/cancel`,
        { reason },
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
  interviews: [],
  applicantInterviews: [],
  interview: null,
  loading: false,
  error: null,
  success: false,
  updateSuccess: false,
};

const interviewSlice = createSlice({
  name: 'interviews',
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
      // Schedule interview
      .addCase(scheduleInterview.pending, (state) => {
        state.loading = true;
      })
      .addCase(scheduleInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(scheduleInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get recruiter interviews
      .addCase(getRecruiterInterviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecruiterInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = action.payload;
      })
      .addCase(getRecruiterInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get applicant interviews
      .addCase(getApplicantInterviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(getApplicantInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.applicantInterviews = action.payload;
      })
      .addCase(getApplicantInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get interview details
      .addCase(getInterviewDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInterviewDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.interview = action.payload;
      })
      .addCase(getInterviewDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update interview
      .addCase(updateInterview.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.interview = action.payload;
        state.updateSuccess = true;
        
        // Update interview in interviews list
        state.interviews = state.interviews.map((interview) =>
          interview._id === action.payload._id ? action.payload : interview
        );
      })
      .addCase(updateInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Complete interview
      .addCase(completeInterview.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.interview = action.payload;
        state.updateSuccess = true;
        
        // Update interview in interviews list
        state.interviews = state.interviews.map((interview) =>
          interview._id === action.payload._id ? action.payload : interview
        );
      })
      .addCase(completeInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel interview
      .addCase(cancelInterview.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.interview = action.payload;
        state.updateSuccess = true;
        
        // Update interview in interviews list
        state.interviews = state.interviews.map((interview) =>
          interview._id === action.payload._id ? action.payload : interview
        );
      })
      .addCase(cancelInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetSuccess } = interviewSlice.actions;

export default interviewSlice.reducer;