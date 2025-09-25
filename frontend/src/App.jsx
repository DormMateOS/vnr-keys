import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import CompleteRegistrationPage from "./pages/auth/CompleteRegistrationPage";
import LoadingSpinner from "./components/ui/LoadingSpinner";

// Security Dashboard Pages
import QRScannerPage from "./pages/dashboard/security/QRScannerPage";
import AvailableKeysPage from "./pages/dashboard/security/AvailableKeysPage";
import UnavailableKeysPage from "./pages/dashboard/security/UnavailableKeysPage";

// Faculty Dashboard Pages
import MyKeysPage from "./pages/dashboard/faculty/MyKeysPage";
import AllKeysPage from "./pages/dashboard/faculty/AllKeysPage";

// Dashboard Layout and Pages
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import OperatorDashboard from "./pages/dashboard/OperatorDashboard";
import ResponderDashboard from "./pages/dashboard/ResponderDashboard";
import SecurityDashboard from "./pages/dashboard/SecurityDashboard";
import FacultyDashboard from "./pages/dashboard/FacultyDashboard";
import CollectiveKeyReturnPage from "./pages/dashboard/CollectiveKeyReturnPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import AboutPage from "./pages/dashboard/AboutPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import ManageUsersPage from "./pages/admin/ManageUsersPage";
import ManageApiKeysPage from "./pages/admin/ManageApiKeysPage";
import SecuritySettingsPage from "./pages/admin/SecuritySettingsPage";
import ViewReportsPage from "./pages/admin/ViewReportsPage";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useKeyStore } from "./store/keyStore";
import { useEffect } from "react";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import RouteObserver from "./components/RouteObserver";
import { useNotificationStore } from "./store/notificationStore";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	// Check if user needs to complete registration
	if (user && (user.role === 'pending' || (user.role === 'faculty' && (!user.department || !user.facultyId)))) {
		return <Navigate to='/complete-registration' replace />;
	}

	return children;
};

// redirect authenticated users to the appropriate dashboard or last visited route
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user, getRoleBasedRoute } = useAuthStore();

	if (isAuthenticated && user) {
		// Check if user needs to complete registration
		if (user.role === 'pending' || (user.role === 'faculty' && (!user.department || !user.facultyId))) {
			return <Navigate to='/complete-registration' replace />;
		}

		// Check for last visited route
		const lastVisitedRoute = localStorage.getItem('lastVisitedRoute');
		if (lastVisitedRoute) {
			return <Navigate to={lastVisitedRoute} replace />;
		}

		const dashboardRoute = getRoleBasedRoute();
		return <Navigate to={dashboardRoute} replace />;
	}

	return children;
};

// Component to redirect to role-based dashboard
const RoleBasedRedirect = () => {
	const { getRoleBasedRoute } = useAuthStore();
	const dashboardRoute = getRoleBasedRoute();
	return <Navigate to={dashboardRoute} replace />;
};

function App() {
	const { isCheckingAuth, checkAuth, isAuthenticated } = useAuthStore();
	const { initializeSocket: initializeKeySocket, disconnectSocket: disconnectKeySocket } = useKeyStore();
	const { initializeSocket: initializeNotificationSocket, disconnectSocket: disconnectNotificationSocket } = useNotificationStore();

	useEffect(() => {
		checkAuth();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Only run once on mount

	// Initialize socket connections when user is authenticated
	useEffect(() => {
		if (isAuthenticated) {
			// Initialize both sockets
			initializeKeySocket();
			initializeNotificationSocket();
			
			// Fetch notifications immediately when authenticated
			useNotificationStore.getState().fetchNotifications();
		} else {
			// Disconnect both sockets
			disconnectKeySocket();
			disconnectNotificationSocket();
		}

		// Cleanup on unmount
		return () => {
			disconnectKeySocket();
			disconnectNotificationSocket();
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated]); // Only depend on isAuthenticated

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen bg-gray-900 relative overflow-hidden'>
			<RouteObserver />
			<Routes>
				{/* Role-based Dashboard Routes */}
				<Route
					path='/dashboard'
					element={
						<ProtectedRoute>
							<DashboardLayout />
						</ProtectedRoute>
					}
				>
					{/* Default dashboard - redirects to role-based dashboard */}
					<Route
						index
						element={<RoleBasedRedirect />}
					/>

					{/* Role-specific dashboard routes */}
					<Route
						path='admin'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<AdminDashboard />
							</RoleProtectedRoute>
						}
					/>

					{/* Admin-only feature pages */}
					<Route
						path='admin/users'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<ManageUsersPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='admin/keys'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<ManageApiKeysPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='admin/security'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<SecuritySettingsPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='admin/reports'
						element={
							<RoleProtectedRoute allowedRoles={['admin']}>
								<ViewReportsPage />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='operator'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'operator']}>
								<OperatorDashboard />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='responder'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'responder']}>
								<ResponderDashboard />
							</RoleProtectedRoute>
						}
					/>
					<Route
						path='security'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'security']}>
								<SecurityDashboard />
							</RoleProtectedRoute>
						}
					>
						{/* Nested routes for Security Dashboard */}
						<Route index element={<Navigate to="scanner" replace />} />
						<Route path="scanner" element={<QRScannerPage />} />
						<Route path="available" element={<AvailableKeysPage />} />
						<Route path="unavailable" element={<UnavailableKeysPage />} />
					</Route>
					<Route
						path='faculty'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'faculty']}>
								<FacultyDashboard />
							</RoleProtectedRoute>
						}
					>
						{/* Nested routes for Faculty Dashboard */}
						<Route index element={<Navigate to="taken" replace />} />
						<Route path="taken" element={<MyKeysPage />} />
						<Route path="keylist" element={<AllKeysPage />} />
					</Route>
					{/* Volunteer Key Return - accessible to Security and Faculty */}
					<Route
						path='collective-return'
						element={
							<RoleProtectedRoute allowedRoles={['admin', 'security', 'faculty']}>
								<CollectiveKeyReturnPage />
							</RoleProtectedRoute>
						}
					/>
					{/* Common dashboard routes accessible to all authenticated users */}
					<Route path='profile' element={<ProfilePage />} />
					<Route path='about' element={<AboutPage />} />
					<Route path='notifications' element={<NotificationsPage />} />
				</Route>

				{/* Root route - redirect to role-based dashboard */}
				<Route
					path='/'
					element={
						<ProtectedRoute>
							<RoleBasedRedirect />
						</ProtectedRoute>
					}
				/>

				{/* Auth Routes */}
				<Route
					path='/login'
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/complete-registration'
					element={<CompleteRegistrationPage />}
				/>

				{/* catch all routes */}
				<Route path='*' element={<Navigate to='/dashboard' replace />} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;