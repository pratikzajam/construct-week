import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slices/authSlice';
import {
  Building,
  User,
  Briefcase,
  FileText,
  Calendar,
  ClipboardList,
  Users,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Share2,
} from 'lucide-react';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const jobSeekerLinks = [
    { name: 'Dashboard', icon: <BarChart2 className="h-5 w-5" />, path: '/dashboard' },
    { name: 'Profile', icon: <User className="h-5 w-5" />, path: '/dashboard/profile' },
    { name: 'Applications', icon: <FileText className="h-5 w-5" />, path: '/dashboard/applications' },
    { name: 'Interviews', icon: <Calendar className="h-5 w-5" />, path: '/dashboard/interviews' },
    { name: 'Assessments', icon: <ClipboardList className="h-5 w-5" />, path: '/dashboard/assessments' },
    { name: 'Referrals', icon: <Share2 className="h-5 w-5" />, path: '/dashboard/referrals' },
  ];

  const recruiterLinks = [
    { name: 'Dashboard', icon: <BarChart2 className="h-5 w-5" />, path: '/recruiter' },
    { name: 'Profile', icon: <User className="h-5 w-5" />, path: '/recruiter/profile' },
    { name: 'Jobs', icon: <Briefcase className="h-5 w-5" />, path: '/recruiter/jobs' },
    { name: 'Applications', icon: <FileText className="h-5 w-5" />, path: '/recruiter/applications' },
    { name: 'Candidates', icon: <Users className="h-5 w-5" />, path: '/recruiter/candidates' },
    { name: 'Interviews', icon: <Calendar className="h-5 w-5" />, path: '/recruiter/interviews' },
    { name: 'Assessments', icon: <ClipboardList className="h-5 w-5" />, path: '/recruiter/assessments' },
    { name: 'Referrals', icon: <Share2 className="h-5 w-5" />, path: '/recruiter/referrals' },
    { name: 'Analytics', icon: <BarChart2 className="h-5 w-5" />, path: '/recruiter/analytics' },
  ];

  const links = userInfo.role === 'recruiter' ? recruiterLinks : jobSeekerLinks;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">HireHub</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive(link.path)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className={`mr-4 ${isActive(link.path) ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 group block w-full flex items-center"
            >
              <div className="flex items-center">
                <div>
                  <LogOut className="inline-block h-9 w-9 rounded-full text-gray-500 p-2" />
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    Logout
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Building className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">HireHub</span>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(link.path)
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className={`mr-3 ${isActive(link.path) ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                      {link.icon}
                    </span>
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="flex-shrink-0 w-full group block"
              >
                <div className="flex items-center">
                  <div>
                    <LogOut className="inline-block h-9 w-9 rounded-full text-gray-500 p-2" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      Logout
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-center pb-5 border-b border-gray-200">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {links.find((link) => isActive(link.path))?.name || 'Dashboard'}
                </h1>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                        {userInfo.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="ml-3 text-gray-700 text-sm font-medium hidden lg:block">
                        {userInfo.name}
                      </span>
                      {dropdownOpen ? (
                        <ChevronUp className="ml-1 h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="ml-1 h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </button>
                  {dropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Link
                        to={userInfo.role === 'recruiter' ? '/recruiter/profile' : '/dashboard/profile'}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to={userInfo.role === 'recruiter' ? '/recruiter' : '/dashboard'}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;