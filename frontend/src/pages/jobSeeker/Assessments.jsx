import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getJobAssessments } from '../../slices/assessmentSlice';
import Loader from '../../components/Loader';
import Message from '../../components/Message';

const Assessments = () => {
  const dispatch = useDispatch();
  const { loading, error, assessments } = useSelector((state) => state.assessments);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getJobAssessments());
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">My Assessments</h2>
        <p className="mt-2 text-gray-600">
          Complete assessments to showcase your skills to potential employers
        </p>
      </div>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : assessments.length === 0 ? (
        <Message variant="info">No assessments available at this time.</Message>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((assessment) => (
            <div
              key={assessment._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <ClipboardList className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assessment.title}
                    </h3>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      assessment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : assessment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {assessment.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{assessment.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Time Limit: {assessment.timeLimit} minutes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    {assessment.passed ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                    )}
                    <span>
                      Passing Score: {assessment.passingScore}%
                    </span>
                  </div>
                </div>

                <Link
                  to={`/dashboard/assessments/${assessment._id}`}
                  className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {assessment.status === 'completed'
                    ? 'View Results'
                    : 'Start Assessment'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Assessments;