import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Shield,
  User,
  IdCard,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const CompleteRegistrationPage = () => {
  const [step, setStep] = useState(1);
  const [department, setDepartment] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forceShowForm, setForceShowForm] = useState(false);
  const [userRole, setUserRole] = useState(""); // Determined by email
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    user,
    checkAuth,
    getRoleBasedRoute,
    isCheckingAuth,
    forceResetAuthState,
  } = useAuthStore();
  const hasShownAuthToast = useRef(false);

  useEffect(() => {
    let isSubscribed = true;
    const authStatus = searchParams.get("auth");
    if (authStatus === "success" && !hasShownAuthToast.current) {
      toast.success("Successfully authenticated with Google!");
      hasShownAuthToast.current = true;
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (!user && !isCheckingAuth) {
      checkAuth();
    }

    const resetTimeout = setTimeout(() => {
      if (isCheckingAuth && !user && isSubscribed) {
        forceResetAuthState();
        setTimeout(() => isSubscribed && checkAuth(), 100);
      }
    }, 3000);

    const forceShowTimeout = setTimeout(() => {
      if (isCheckingAuth && !user && !forceShowForm && isSubscribed) {
        setForceShowForm(true);
      }
    }, 2000);

    return () => {
      isSubscribed = false;
      clearTimeout(resetTimeout);
      clearTimeout(forceShowTimeout);
    };
  }, [searchParams, user, isCheckingAuth, checkAuth, forceResetAuthState, forceShowForm]);

  useEffect(() => {
    if (user) {
      // Determine user role based on email
      let determinedRole;
      if (user.email === 'security@vnrvjiet.in') {
        determinedRole = 'security';
      } else if (user.email === '23071a7228@vnrvjiet.in') {
        determinedRole = 'admin';
      } else {
        determinedRole = 'faculty';
      }
      setUserRole(determinedRole);

      const isRegistrationComplete =
        user.role !== "pending" &&
        (user.role !== "faculty" || (user.department && user.facultyId));

      if (isRegistrationComplete) {
        // toast.success("Welcome back! Redirecting to your dashboard...");
        const route = getRoleBasedRoute();
        navigate(route, { replace: true });
      } else {
        // For security and admin users, skip to final step
        if (determinedRole === 'security' || determinedRole === 'admin') {
          setStep(2); // Skip department selection
        }
      }
    }
  }, [user, navigate, getRoleBasedRoute]);

  const departments = [
    { value: "CSE", label: "Computer Science Engineering" },
    { value: "EEE", label: "Electrical & Electronics Engineering" },
    { value: "CSE-AIML", label: "CSE - Artificial Intelligence & Machine Learning" },
    { value: "CSE_AIDS", label: "CSE - (CYS,DS) and AI&DS" },
    { value: "IoT", label: "Internet of Things" },
    { value: "ECE", label: "Electronics & Communication Engineering" },
    { value: "MECH", label: "Mechanical Engineering" },
    { value: "CIVIL", label: "Civil Engineering" },
    { value: "IT", label: "Information Technology" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden relative z-10">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
              Complete Registration
            </h2>
            <p className="text-gray-300">
              Step {step} of {userRole === 'faculty' ? 2 : 1}
            </p>
          </div>

          {/* Progress Bar */}
          {userRole === 'faculty' && (
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {[1, 2].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      stepNum <= step
                        ? "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
                        : "bg-gray-600 text-gray-400"
                    }`}
                  >
                    {stepNum < step ? <CheckCircle size={16} /> : stepNum}
                  </div>
                ))}
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 2) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Step Content */}
          {step === 1 && renderDepartmentSelection()}
          {step === 2 && renderFinalStep()}
        </div>
  </div>
    </div>
  );

  function handleDepartmentSelect() {
    if (userRole === 'faculty' && !department) {
      toast.error("Please select a department");
      return;
    }
    setStep(2);
  }

  async function handleCompleteRegistration() {
    if (userRole === "faculty" && (!department || !facultyId.trim())) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/auth`
        : import.meta.env.MODE === "dev"
        ? "http://localhost:6203/api/auth"
        : "/api/auth";
      const response = await fetch(`${API_URL}/complete-registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          department: userRole === "faculty" ? department : undefined,
          facultyId: userRole === "faculty" ? facultyId.trim() : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Registration completed successfully!");
        await checkAuth();
        const route = getRoleBasedRoute();
        navigate(route, { replace: true });
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Development utility retained for reference; disable unused var linting via comment
  /* eslint-disable no-unused-vars */
  async function clearUsers() {
    if (confirm('Are you sure you want to clear all users from the database? This cannot be undone.')) {
      try {
        const response = await fetch('/api/auth/clear-users', { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          toast.success(`Cleared ${data.deletedCount} users from database`);
        } else {
          toast.error('Failed to clear users');
        }
      } catch (error) {
        toast.error('Error clearing users');
      }
    }
  }
  /* eslint-enable no-unused-vars */

  function renderDepartmentSelection() {
    // For security and admin users, show a welcome message instead
    if (userRole === 'security' || userRole === 'admin') {
      return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            Welcome, {userRole === 'admin' ? 'Administrator' : 'Security Personnel'}!
          </h3>
          <p className="text-gray-300 mb-6">
            Your role has been automatically assigned based on your email address.
          </p>

          <div className="bg-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center mb-4">
              {userRole === 'admin' ? (
                <Shield className="w-12 h-12 text-pink-400" />
              ) : (
                <Shield className="w-12 h-12 text-green-400" />
              )}
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              {userRole === 'admin' ? 'Administrator' : 'Security Personnel'}
            </h4>
            <p className="text-gray-300">
              {userRole === 'admin'
                ? 'You have full administrative access to the system.'
                : 'You have access to security features and key management.'
              }
            </p>
          </div>

          <button
            onClick={handleDepartmentSelect}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium"
          >
            Continue
          </button>
        </motion.div>
      );
    }

    // For faculty users, show department selection
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">Select Your Department</h3>
        <p className="text-gray-300 mb-6">Please choose your department from the list below.</p>

        <div className="space-y-3 mb-6">
          {departments.map((dept) => (
            <motion.button
              key={dept.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setDepartment(dept.value)}
              className={`w-full p-4 rounded-xl text-white font-medium flex items-center justify-between border-2 transition-all ${
                department === dept.value
                  ? "bg-blue-600 border-blue-500"
                  : "bg-gray-700 hover:bg-gray-600 border-transparent hover:border-blue-500"
              }`}
            >
              <span>{dept.label}</span>
              {department === dept.value && <CheckCircle className="w-5 h-5" />}
            </motion.button>
          ))}
        </div>

        <button
          onClick={handleDepartmentSelect}
          disabled={!department}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-blue-600/50 disabled:to-indigo-600/50 text-white rounded-lg font-medium"
        >
          Continue
        </button>
      </motion.div>
    );
  }

  function renderFinalStep() {
    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
        <h3 className="text-xl font-semibold text-white mb-2">
          {userRole === "faculty" ? "Faculty Details" : "Complete Registration"}
        </h3>
        <p className="text-gray-300 mb-6">
          {userRole === "faculty"
            ? "Please enter your faculty ID"
            : "You're all set! Click continue to complete registration."}
        </p>

        {userRole === "faculty" && (
          <div className="mb-6">
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Faculty ID (e.g., 23071A1234)"
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Registration Summary:
          </h4>
          <div className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <span>Role:</span>
              <span className="text-white capitalize">
                {userRole === "admin" ? "Administrator" : userRole}
              </span>
            </div>
            {userRole === "faculty" && (
              <>
                <div className="flex justify-between">
                  <span>Department:</span>
                  <span className="text-white">
                    {departments.find((d) => d.value === department)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Faculty ID:</span>
                  <span className="text-white">{facultyId || "Not entered"}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep(1)}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white rounded-lg font-medium"
          >
            Back
          </button>
          <button
            onClick={handleCompleteRegistration}
            disabled={isLoading}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-blue-600/50 disabled:to-indigo-600/50 text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Complete Registration
              </>
            )}
          </button>
        </div>
      </motion.div>
    );
  }
};

export default CompleteRegistrationPage;
