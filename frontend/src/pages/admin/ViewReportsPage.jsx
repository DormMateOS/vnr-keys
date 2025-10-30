import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Activity,
  Download,
  RefreshCw,
  TrendingUp,
  Key,
  Calendar,
  Filter,
  LineChart,
  Building
} from 'lucide-react';
import axios from 'axios';
import { useKeyStore } from '../../store/keyStore';
import { handleError, handleSuccess } from '../../utils/errorHandler';
import { config } from '../../utils/config';
import jsPDF from 'jspdf';

const ViewReportsPage = () => {
  const { keys, fetchKeys } = useKeyStore();
  const [reports, setReports] = useState(null);
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
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchKeys();
        await fetchReports();
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchKeys]);

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

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${config.api.baseUrl}/dashboard/reports`, {
        params: { timeRange: filters.timeRange },
        withCredentials: true
      });
      setReports(response.data.data);
    } catch (error) {
      handleError(error, 'Failed to fetch reports');
    }
  };

  const handleExportReport = async () => {
    if (!reports) return;

    try {
      // Fetch logbook entries for the report
      let logbookEntries = [];
      try {
        const logbookResponse = await axios.get(`${config.api.baseUrl}/logbook/admin/entries`, {
          params: { 
            limit: 100,
            sortBy: 'createdAt',
            sortOrder: 'desc'
          },
          withCredentials: true
        });
        logbookEntries = logbookResponse.data.data.entries || [];
      } catch (error) {
        console.error('Failed to fetch logbook entries:', error);
      }

      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add new page if needed
      const checkNewPage = (spaceNeeded = 30) => {
        if (yPosition > pageHeight - spaceNeeded) {
          pdf.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Helper function to draw table
      const drawTable = (headers, rows, startY) => {
        const colWidth = (pageWidth - 40) / headers.length;
        yPosition = startY;

        // Draw header
        pdf.setFillColor(139, 69, 19);
        pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        
        headers.forEach((header, i) => {
          pdf.text(header, 22 + (i * colWidth), yPosition + 7);
        });

        yPosition += 10;

        // Draw rows
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        rows.forEach((row, rowIndex) => {
          checkNewPage(15);
          
          // Alternate row colors
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(245, 245, 245);
            pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
          }

          row.forEach((cell, i) => {
            pdf.text(String(cell), 22 + (i * colWidth), yPosition + 6);
          });
          
          yPosition += 8;
        });

        return yPosition;
      };

      // Add header
      pdf.setFontSize(22);
      pdf.setTextColor(139, 69, 19);
      pdf.setFont(undefined, 'bold');
      pdf.text('VNR Keys - System Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;

      // Add line under header
      pdf.setDrawColor(139, 69, 19);
      pdf.setLineWidth(0.5);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      // Add metadata
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont(undefined, 'normal');
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const currentTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      pdf.text(`Generated on: ${currentDate} at ${currentTime}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Time Range: ${filters.timeRange === '7d' ? 'Last 7 days' : filters.timeRange === '30d' ? 'Last 30 days' : filters.timeRange === '90d' ? 'Last 90 days' : 'Last 24 hours'}`, 20, yPosition);
      yPosition += 6;
      pdf.text('VNRVJIET Key Management System', 20, yPosition);
      yPosition += 15;

      // System Overview Section
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text('System Overview', 20, yPosition);
      yPosition += 10;

      const overviewHeaders = ['Metric', 'Value', 'Details'];
      const overviewRows = [
        ['Total Users', String(reports?.userAnalytics?.totalUsers || 0), `+${reports?.userAnalytics?.newUsers || 0} new this period`],
        ['Active Users', String(reports?.userAnalytics?.activeUsers || 0), `${((reports?.userAnalytics?.activeUsers / reports?.userAnalytics?.totalUsers * 100) || 0).toFixed(1)}% of total`],
        ['Total Keys', String(keys?.length || 0), 'All keys in system'],
        ['Keys in Use', String(keys?.filter(k => k.status === 'unavailable').length || 0), 'Currently unavailable'],
        ['Available Keys', String(keys?.filter(k => k.status === 'available').length || 0), 'Ready to use'],
        ['Usage Rate', `${(analyticsData?.peakUsage?.usagePercentage || 0).toFixed(1)}%`, 'Peak usage percentage']
      ];

      yPosition = drawTable(overviewHeaders, overviewRows, yPosition);
      yPosition += 15;

      // Most Used Keys Section
      checkNewPage(40);
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text('Most Used Keys', 20, yPosition);
      yPosition += 10;

      const mostUsedKeys = analyticsData?.keyUsage?.mostUsedKeys || [];
      if (mostUsedKeys.length > 0) {
        const keyHeaders = ['Key Number', 'Key Name', 'Department', 'Usage Count'];
        const keyRows = mostUsedKeys.slice(0, 10).map(key => [
          key.keyNumber || 'N/A',
          key.keyName || 'N/A',
          key.department || 'N/A',
          String(key.usageCount || 0)
        ]);
        yPosition = drawTable(keyHeaders, keyRows, yPosition);
      } else {
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text('No usage data available', 20, yPosition);
      }
      yPosition += 15;

      // Peak Usage Hours Section
      checkNewPage(40);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text('Peak Usage Hours', 20, yPosition);
      yPosition += 10;

      const peakHours = analyticsData?.peakUsage?.peakHours || [];
      if (peakHours.length > 0) {
        const peakHeaders = ['Time Period', 'Usage Count', 'Rank'];
        const peakRows = peakHours.map((peak, index) => [
          peak.timeLabel || 'N/A',
          String(peak.count || 0),
          `#${index + 1}`
        ]);
        yPosition = drawTable(peakHeaders, peakRows, yPosition);
      } else {
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text('No peak usage data available', 20, yPosition);
      }
      yPosition += 15;

      // Department Usage Section
      checkNewPage(40);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text('Usage by Department', 20, yPosition);
      yPosition += 10;

      const deptUsers = analyticsData?.activeUsers?.usersByDepartment || [];
      if (deptUsers.length > 0) {
        const deptHeaders = ['Department', 'Active Users', 'Percentage'];
        const totalDeptUsers = deptUsers.reduce((sum, dept) => sum + dept.count, 0);
        const deptRows = deptUsers.map(dept => [
          dept._id || 'N/A',
          String(dept.count || 0),
          `${((dept.count / totalDeptUsers * 100) || 0).toFixed(1)}%`
        ]);
        yPosition = drawTable(deptHeaders, deptRows, yPosition);
      } else {
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text('No department data available', 20, yPosition);
      }
      yPosition += 15;

      // User Registration Trend Section
      checkNewPage(40);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text('User Registration Trend', 20, yPosition);
      yPosition += 10;

      if (reports?.userAnalytics?.registrationTrend && reports.userAnalytics.registrationTrend.length > 0) {
        const trendHeaders = ['Date', 'New Registrations'];
        const trendRows = reports.userAnalytics.registrationTrend.map(day => [
          new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          String(day.count || 0)
        ]);
        yPosition = drawTable(trendHeaders, trendRows, yPosition);
      } else {
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text('No registration trend data available', 20, yPosition);
      }
      yPosition += 15;

      // Key Usage Over Time Section
      checkNewPage(40);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text('Key Usage Over Time', 20, yPosition);
      yPosition += 10;

      const usageOverTime = analyticsData?.keyUsage?.usageOverTime || [];
      if (usageOverTime.length > 0) {
        const usageHeaders = ['Period', 'Keys Used'];
        const usageRows = usageOverTime.map(item => [
          item._id || item.period || 'N/A',
          String(item.count || 0)
        ]);
        yPosition = drawTable(usageHeaders, usageRows, yPosition);
      } else {
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text('No usage timeline data available', 20, yPosition);
      }
      yPosition += 15;

      // Logbook Entries Section
      checkNewPage(40);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont(undefined, 'bold');
      pdf.text('Recent Logbook Entries', 20, yPosition);
      yPosition += 10;

      if (logbookEntries.length > 0) {
        // Create logbook table with landscape-style layout
        const logbookHeaders = ['S.No', 'Key Name', 'Taken By', 'Taken Time', 'Returned By', 'Return Time'];
        const logbookRows = logbookEntries.map((entry, index) => {
          const takenTime = entry.takenAt 
            ? new Date(entry.takenAt).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : 'N/A';
          
          const returnTime = entry.returnedAt 
            ? new Date(entry.returnedAt).toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : entry.status === 'unavailable' ? 'Not Returned' : 'N/A';

          const takenBy = entry.takenBy?.name || 'N/A';
          const returnedBy = entry.returnedBy?.name || (entry.status === 'unavailable' ? 'Pending' : 'N/A');

          return [
            String(index + 1),
            entry.keyName || 'N/A',
            takenBy,
            takenTime,
            returnedBy,
            returnTime
          ];
        });

        // Custom table drawing for logbook with smaller font
        const colWidths = [10, 30, 30, 30, 30, 30]; // Adjusted column widths
        let currentY = yPosition;

        // Draw header
        pdf.setFillColor(139, 69, 19);
        pdf.rect(20, currentY, pageWidth - 40, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'bold');
        
        let xPos = 22;
        logbookHeaders.forEach((header, i) => {
          pdf.text(header, xPos, currentY + 7);
          xPos += colWidths[i];
        });

        currentY += 10;

        // Draw rows
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        logbookRows.forEach((row, rowIndex) => {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = 20;
            
            // Redraw header on new page
            pdf.setFillColor(139, 69, 19);
            pdf.rect(20, currentY, pageWidth - 40, 10, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.setFont(undefined, 'bold');
            
            xPos = 22;
            logbookHeaders.forEach((header, i) => {
              pdf.text(header, xPos, currentY + 7);
              xPos += colWidths[i];
            });
            
            currentY += 10;
            pdf.setFont(undefined, 'normal');
            pdf.setTextColor(0, 0, 0);
          }
          
          // Alternate row colors
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(245, 245, 245);
            pdf.rect(20, currentY, pageWidth - 40, 8, 'F');
          }

          xPos = 22;
          row.forEach((cell, i) => {
            // Truncate text if too long
            const maxWidth = colWidths[i] - 4;
            let displayText = String(cell);
            
            if (pdf.getTextWidth(displayText) > maxWidth) {
              while (pdf.getTextWidth(displayText + '...') > maxWidth && displayText.length > 0) {
                displayText = displayText.slice(0, -1);
              }
              displayText += '...';
            }
            
            pdf.text(displayText, xPos, currentY + 6);
            xPos += colWidths[i];
          });
          
          currentY += 8;
        });

        yPosition = currentY;
      } else {
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 150);
        pdf.text('No logbook entries available', 20, yPosition);
      }

      // Add footer to all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont(undefined, 'normal');
        pdf.text(
          'VNR Keys Management System - Confidential Report',
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: 'right' }
        );
      }

      // Save the PDF
      const fileName = `vnr-keys-report-${filters.timeRange}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      handleSuccess('PDF report exported successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      handleError(error, 'Failed to export PDF report');
    }
  };



  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-white mt-4">Loading reports...</p>
        </div>
      </div>
    );
  }

  // Calculate real-time statistics
  const totalKeys = keys.length;
  const activeKeys = keys.filter(k => k.status === 'unavailable').length;
  const availableKeys = keys.filter(k => k.status === 'available').length;
  const peakUsagePercentage = analyticsData.peakUsage?.usagePercentage || 0;

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-purple-400 mr-4" />
            <h1 className="text-3xl font-bold text-white">Analytics & Reports</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fetchAnalytics()}
              className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className="h-5 w-5 text-gray-300" />
            </button>
            <button
              onClick={handleExportReport}
              className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Analytics Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-purple-400" />
            Analytics Filters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="EEE">EEE</option>
                <option value="AIML">AIML</option>
                <option value="IoT">IoT</option>
                <option value="CSE_AIDS">CSE-(CYS,DS and AI&DS)</option>
                {/* <option value="CSE_CYS">CSE_CYS</option>
                <option value="CSE_DS">CSE_DS</option> */}
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="security">Security</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Keys"
            value={totalKeys}
            change={null}
            changeLabel={`${totalKeys} keys total`}
            icon={Key}
            color="blue"
          />
          <StatCard
            title="Active Keys"
            value={activeKeys}
            change={null}
            changeLabel={`${activeKeys} in use`}
            icon={Activity}
            color="green"
          />
          <StatCard
            title="Available Keys"
            value={availableKeys}
            change={null}
            changeLabel={`${availableKeys} available`}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Peak Usage"
            value={`${peakUsagePercentage.toFixed(1)}%`}
            change={null}
            changeLabel="Usage rate"
            icon={TrendingUp}
            color="orange"
          />
        </div> */}

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Peak Usage Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
              Peak Usage Analytics
            </h3>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <SimpleLineChart 
                data={analyticsData.peakUsage?.hourlyUsage || []}
                color="rgb(168, 85, 247)"
                label="Usage Count"
                height={200}
              />
            )}
          </motion.div>

          {/* Active Users Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-400" />
              Active Users Trend
            </h3>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <SimpleLineChart 
                data={analyticsData.activeUsers?.loginActivity || []}
                color="rgb(34, 197, 94)"
                label="Active Users"
                height={200}
              />
            )}
          </motion.div>

          {/* Key Usage Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 lg:col-span-2"
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2 text-blue-400" />
              Key Usage Over Time
            </h3>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <SimpleLineChart 
                data={analyticsData.keyUsage?.usageOverTime || []}
                color="rgb(59, 130, 246)"
                label="Keys Used"
                height={250}
              />
            )}
          </motion.div>
        </div>

        {/* Detailed Reports */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <OverviewReport 
            reports={reports} 
            analyticsData={analyticsData}
            keys={keys}
          />
        </div>
      </motion.div>
    </div>
  );
};

// Simple Line Chart Component
const SimpleLineChart = ({ data, color, label, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.count || 0));
  const minValue = Math.min(...data.map(d => d.count || 0));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (((item.count || 0) - minValue) / range) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative">
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>{label}</span>
        <span>Max: {maxValue}</span>
      </div>
      
      <svg
        width="100%"
        height={height}
        viewBox="0 0 100 100"
        className="border border-gray-600 rounded bg-gray-900/50"
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        
        {/* Data line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="drop-shadow-sm"
        />
        
        {/* Data points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - (((item.count || 0) - minValue) / range) * 80;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              className="drop-shadow-sm"
            >
              <title>{`${item._id || item.period}: ${item.count}`}</title>
            </circle>
          );
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        {data.slice(0, 5).map((item, index) => (
          <span key={index} className="truncate">
            {item._id || item.period || `Point ${index + 1}`}
          </span>
        ))}
      </div>
    </div>
  );
};

// Overview Report Component
const OverviewReport = ({ reports, analyticsData, keys }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-semibold text-white mb-6">Detailed Analytics Report</h3>
    
    {/* Most Used Keys */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Key className="w-5 h-5 mr-2 text-blue-400" />
          Most Used Keys
        </h4>
        <div className="space-y-3">
          {analyticsData?.keyUsage?.mostUsedKeys?.slice(0, 5).map((key, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <div className="font-medium text-white">{key.keyNumber}</div>
                <div className="text-sm text-gray-400">{key.keyName}</div>
                <div className="text-xs text-gray-500">{key.department}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-400">{key.usageCount}</div>
                <div className="text-xs text-gray-400">uses</div>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-400 py-8">
              <Key className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No usage data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Peak Usage Hours */}
      <div className="bg-gray-700/50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
          Peak Usage Hours
        </h4>
        <div className="space-y-3">
          {analyticsData?.peakUsage?.peakHours?.map((peak, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div>
                <div className="font-medium text-white">{peak.timeLabel}</div>
                <div className="text-sm text-gray-400">Peak Hour #{index + 1}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-400">{peak.count}</div>
                <div className="text-xs text-gray-400">keys used</div>
              </div>
            </div>
          )) || (
            <div className="text-center text-gray-400 py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No peak usage data available</p>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Department Usage */}
    <div className="bg-gray-700/50 rounded-lg p-6">
      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Building className="w-5 h-5 mr-2 text-green-400" />
        Usage by Department
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {analyticsData?.activeUsers?.usersByDepartment?.map((dept, index) => (
          <div key={index} className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{dept._id}</div>
                <div className="text-sm text-gray-400">Department</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-400">{dept.count}</div>
                <div className="text-xs text-gray-400">active users</div>
              </div>
            </div>
          </div>
        )) || (
          <div className="col-span-full text-center text-gray-400 py-8">
            <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No department data available</p>
          </div>
        )}
      </div>
    </div>

    {/* System Statistics */}
    <div className="bg-gray-700/50 rounded-lg p-6">
      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-orange-400" />
        System Statistics
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{keys?.length || 0}</div>
          <div className="text-sm text-gray-400">Total Keys</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {keys?.filter(k => k.status === 'unavailable').length || 0}
          </div>
          <div className="text-sm text-gray-400">Keys in Use</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {keys?.filter(k => k.status === 'available').length || 0}
          </div>
          <div className="text-sm text-gray-400">Available Keys</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {analyticsData?.peakUsage?.usagePercentage?.toFixed(1) || 0}%
          </div>
          <div className="text-sm text-gray-400">Usage Rate</div>
        </div>
      </div>
    </div>
  </div>
);

// Reusable Stat Card Component
const StatCard = ({ title, value, change, changeLabel, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    red: 'text-red-400 bg-red-500/10'
  };

  return (
    <div className="bg-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
          {change !== null && (
            <p className="text-sm text-gray-400">
              {change} {changeLabel}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

export default ViewReportsPage;
