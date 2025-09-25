import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useKeyStore } from "../../store/keyStore";
import { useSidebar } from "../../components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { config } from "../../utils/config";
import {
    Users,
    Shield,
    Activity,
    UserCheck,
    UserX,
    Settings,
    BarChart3,
    Key,
    User,
    TrendingUp,
    Clock,
    Filter,
    Calendar
} from "lucide-react";

const AdminDashboard = () => {
  const { user, fetchDashboardData } = useAuthStore();
  const { keys, fetchKeys } = useKeyStore();
  const { sidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    keyUsage: null,
    activeUsers: null,
    peakUsage: null
  });
  const [filters, setFilters] = useState({
    timeRange: '7d',
    department: 'all',
    role: 'all'
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data.data);
        await fetchKeys();
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchDashboardData, fetchKeys]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [keyUsageRes, activeUsersRes, peakUsageRes] = await Promise.all([
        axios.get(`${config.api.baseUrl}/dashboard/analytics/key-usage`, {
          params: { timeRange: filters.timeRange, department: filters.department },
          withCredentials: true
        }),
        axios.get(`${config.api.baseUrl}/dashboard/analytics/active-users`, {
          params: { timeRange: filters.timeRange, role: filters.role, department: filters.department },
          withCredentials: true
        }),
        axios.get(`${config.api.baseUrl}/dashboard/analytics/peak-usage`, {
          params: { timeRange: filters.timeRange, department: filters.department },
          withCredentials: true
        })
      ]);

      setAnalyticsData({
        keyUsage: keyUsageRes.data.data,
        activeUsers: activeUsersRes.data.data,
        peakUsage: peakUsageRes.data.data
      });
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchAnalytics();
    }
  }, [filters, loading]);

  // Admin action handlers
  const handleManageUsers = () => {
    navigate("/dashboard/admin/users");
  };

  const handleSecuritySettings = () => {
    navigate("/dashboard/admin/security");
  };

  const handleViewReports = () => {
    navigate("/dashboard/admin/reports");
  };

  const handleManageKeys = () => {
    navigate('/dashboard/admin/keys');
  };

  const adminStats = dashboardData?.stats || {
    totalUsers: 0,
    totalKeys: 0,
    activeKeys: 0,
    inactiveKeys: 0,
    usersByRole: { admin: 0, security: 0, faculty: 0 },
  };

  // Calculate real-time key statistics
  const totalKeys = keys.length;
  const activeKeys = keys.filter(k => k.status === 'unavailable').length;
  const availableKeys = keys.filter(k => k.status === 'available').length;
  const peakUsagePercentage = analyticsData.peakUsage?.usagePercentage || 0;

  const statsCards = [
    {
      icon: Key,
      label: "Total Keys",
      value: totalKeys,
      change: `${totalKeys} keys`,
      color: "text-white"
    },
    {
      icon: Activity,
      label: "Active Keys",
      value: activeKeys,
      change: `${activeKeys} in use`,
      color: "text-green-400"
    },
    {
      icon: UserCheck,
      label: "Available Keys", 
      value: availableKeys,
      change: `${availableKeys} available`,
      color: "text-blue-400"
    },
    {
      icon: TrendingUp,
      label: "Peak Usage",
      value: `${peakUsagePercentage.toFixed(1)}%`,
      change: `Usage rate`,
      color: "text-purple-400"
    },
  ];

  const roleDistribution = [
    { role: "Security", count: adminStats.usersByRole.operator || 0, color: "bg-blue-500" },
    { role: "Faculty", count: adminStats.usersByRole.responder || 0, color: "bg-green-500" },
    { role: "Admins", count: adminStats.usersByRole.admin || 0, color: "bg-purple-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 transition-all duration-300 ${sidebarOpen ? "ml-0" : "ml-0"}`}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center space-x-4"
      >
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="text-white h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome back, {user?.name}</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4
 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.change}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-700">
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-400" />
          Analytics Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="CSE_AIDS">CSE</option>
              {/* <option value="CSE_CYS">CSE_CYS</option>
              <option value="CSE_DS">CSE_DS</option> */}
              <option value="EEE">EEE</option>
              <option value="AIML">AIML</option>
              <option value="IoT">IoT</option>
              <option value="ECE">ECE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="IT">IT</option>
              <option value="ADMIN">ADMIN</option>
              <option value="RESEARCH">RESEARCH</option>
              <option value="COMMON">COMMON</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">User Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="security">Security</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Peak Usage Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
            Peak Usage
          </h3>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {analyticsData.peakUsage?.usagePercentage?.toFixed(1) || 0}%
                </div>
                <div className="text-sm text-gray-400">Current Usage Rate</div>
              </div>
              <div className="space-y-2">
                {analyticsData.peakUsage?.peakHours?.slice(0, 3).map((peak, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{peak.timeLabel}</span>
                    <span className="text-purple-400 font-medium">{peak.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Active Users Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-green-400" />
            Active Users
          </h3>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">
                  {analyticsData.activeUsers?.activeUsersCount || 0}
                </div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
              <div className="space-y-2">
                {analyticsData.activeUsers?.usersByDepartment?.slice(0, 3).map((dept, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{dept._id}</span>
                    <span className="text-green-400 font-medium">{dept.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Key Usage Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 text-blue-400" />
            Key Usage
          </h3>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {analyticsData.keyUsage?.totalUsage || 0}
                </div>
                <div className="text-sm text-gray-400">Total Usage</div>
              </div>
              <div className="space-y-2">
                {analyticsData.keyUsage?.mostUsedKeys?.slice(0, 3).map((key, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{key.keyNumber}</span>
                    <span className="text-blue-400 font-medium">{key.usageCount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
            User Role Distribution
          </h3>
          <div className="space-y-4">
            {roleDistribution.map((item) => (
              <div key={item.role} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                  <span className="text-gray-300">{item.role}</span>
                </div>
                <span className="text-white font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-blue-400" />
            Recent Users
          </h3>
          <div className="space-y-3">
            {dashboardData?.recentUsers?.slice(0, 5).map((recentUser) => (
              <div key={recentUser.id} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-semibold">
                      {recentUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{recentUser.name}</p>
                    <p className="text-gray-400 text-xs">{recentUser.role}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {recentUser.isVerified ? (
                    <UserCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <UserX className="h-4 w-4 text-orange-500" />
                  )}
                </div>
              </div>
            )) || (
              <p className="text-gray-400 text-center py-4">No recent users</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Admin Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-8 bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all"
      >
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-blue-400" />
          Admin Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleManageUsers}
            className="flex items-center justify-center p-4 bg-gray-700 hover:bg-blue-600 rounded-lg transition-colors"
          >
            <Users className="h-5 w-5 mr-2 text-blue-400" />
            <span className="text-white font-medium">Manage Users</span>
          </button>
          <button
            onClick={handleManageKeys}
            className="flex items-center justify-center p-4 bg-gray-700 hover:bg-indigo-600 rounded-lg transition-colors"
          >
            <Key className="h-5 w-5 mr-2 text-blue-400" />
            <span className="text-white font-medium">Manage Keys</span>
          </button>
          <button
            onClick={handleSecuritySettings}
            className="flex items-center justify-center p-4 bg-gray-700 hover:bg-green-600 rounded-lg transition-colors"
          >
            <Shield className="h-5 w-5 mr-2 text-blue-400" />
            <span className="text-white font-medium">Security Settings</span>
          </button>
          <button
            onClick={handleViewReports}
            className="flex items-center justify-center p-4 bg-gray-700 hover:bg-purple-600 rounded-lg transition-colors"
          >
            <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
            <span className="text-white font-medium">View Reports</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
