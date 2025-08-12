import { motion } from "framer-motion";
import { Menu, X, User, LogOut, Bell } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-gray-900 bg-opacity-95 backdrop-filter backdrop-blur-lg border-b border-gray-800 px-4 py-3 sticky top-0 z-50"
    >
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and Logo */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          <Link to="/dashboard"  className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="logo"
                style={{
                  width: "100%", 
                  height: "40px", 
                  borderRadius: "15%",   
                  objectFit: "cover",    
                }} 
              />
          </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text hidden sm:block">
              Vnr Keys
            </h1>
          </Link>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.name}</span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-gray-700">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 w-full p-2 text-left text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
