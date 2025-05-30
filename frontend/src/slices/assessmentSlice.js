import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create assessment
export const createAssessment = createAsyncThunk(
  'assessments/createAssessment',
  async (assessmentData, { getState, rejectWithValue }) => {
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

      const { data } = await axios.post('/api/assessments', assessmentData, config);
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

// Get job assessments
export const getJobAssessments = createAsyncThunk(
  'assessments/getJobAssessments',
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

      const { data } = await axios.get(`/api/assessments/job/${jobId}`, config);
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

// Get assessment details
export const getAssessmentDetails = createAsyncThunk(
  'assessments/getAssessmentDetails',
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

      const { data } = await axios.get(`/api/assessments/${id}`, config);
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

// Update assessment
export const updateAssessment = createAsyncThunk(
  'assessments/updateAssessment',
  async ({ id, assessmentData }, { getState, rejectWithValue }) => {
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

      const { data } = await axios.put(`/api/assessments/${id}`, assessmentData, config);
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

// Submit assessment result
export const submitAssessmentResult = createAsyncThunk(
  'assessments/submitAssessmentResult',
  async ({ id, resultData }, { getState, rejectWithValue }) => {
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
        `/api/assessments/${id}/submit`,
        resultData,
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

// Get job assessment results
export const getJobAssessmentResults = createAsyncThunk(
  'assessments/getJobAssessmentResults',
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

      const { data } = await axios.get(`/api/assessments/job/${jobId}/results`, config);
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

// Get assessment result details
export const getAssessmentResultDetails = createAsyncThunk(
  'assessments/getAssessmentResultDetails',
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

      const { data } = await axios.get(`/api/assessments/results/${id}`, config);
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

// Update assessment result
export const updateAssessmentResult = createAsyncThunk(
  'assessments/updateAssessmentResult',
  async ({ id, resultData }, { getState, rejectWithValue }) => {
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
        `/api/assessments/results/${id}`,
        resultData,
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
  assessments: [],
  assessment: null,
  results: [],
  result: null,
  loading: false,
  error: null,
  success: false,
  updateSuccess: false,
  submitSuccess: false,
};

const assessmentSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetSuccess: (state) => {
      state.success = false;
      state.updateSuccess = false;
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create assessment
      .addCase(createAssessment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get job assessments
      .addCase(getJobAssessments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(getJobAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get assessment details
      .addCase(getAssessmentDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAssessmentDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.assessment = action.payload;
      })
      .addCase(getAssessmentDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update assessment
      .addCase(updateAssessment.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAssessment.fulfilled, (state, action) => {
        state.loading = false;
        state.assessment = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateAssessment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Submit assessment result
      .addCase(submitAssessmentResult.pending, (state) => {
        state.loading = true;
      })
      .addCase(submitAssessmentResult.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
        state.submitSuccess = true;
      })
      .addCase(submitAssessmentResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get job assessment results
      .addCase(getJobAssessmentResults.pending, (state) => {
        state.loading = true;
      })
      .addCase(getJobAssessmentResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(getJobAssessmentResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get assessment result details
      .addCase(getAssessmentResultDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAssessmentResultDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(getAssessmentResultDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update assessment result
      .addCase(updateAssessmentResult.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAssessmentResult.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updateAssessmentResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetSuccess } = assessmentSlice.actions;

export default assessmentSlice.reducer;