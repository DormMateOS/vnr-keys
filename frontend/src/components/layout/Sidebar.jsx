// src/components/layout/Sidebar.jsx
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, Info, Users, Shield, BarChart3, KeyRound, Bell } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuthStore();

  // Detect mobile and FORCE-CLOSE sidebar on mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");

    const handleChange = (e) => {
      setIsMobile(e.matches);
      if (e.matches) setSidebarOpen(false); // close whenever we enter mobile
    };

    // initial
    setIsMobile(mq.matches);
    if (mq.matches) setSidebarOpen(false);

    // subscribe
    if (mq.addEventListener) mq.addEventListener("change", handleChange);
    else mq.addListener(handleChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handleChange);
      else mq.removeListener(handleChange);
    };
  }, [setSidebarOpen]);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMobile, sidebarOpen]);

  const baseMenuItems = [
    { 
      icon: Home, 
      label: "Home", 
      path: user?.role === "faculty" ? "/dashboard/faculty/taken" : "/dashboard"
    },
    { icon: Bell, label: "Notifications", path: "/dashboard/notifications" },
    { icon: User, label: "Profile", path: "/dashboard/profile" },
    { icon: Info, label: "About Us", path: "/dashboard/about" },
  ];

  const adminMenuItems = [
    { icon: Users, label: "Manage Users", path: "/dashboard/admin/users" },
    { icon: KeyRound, label: "Manage Keys", path: "/dashboard/admin/keys" },
    // { icon: Shield, label: "Security Settings", path: "/dashboard/admin/security" },
    { icon: BarChart3, label: "View Reports", path: "/dashboard/admin/reports" },
  ];

  // Volunteer Key Return menu item for Security and Faculty
  const collectiveKeyReturnItem = {
    icon: KeyRound,
    label: "Volunteer Key Return",
    path: "/dashboard/collective-return"
  };

  // Slide variants (same for mobile/desktop; desktop typically kept open by parent)
  const sidebarVariants = {
    open: { x: 0, transition: { type: "tween", ease: "easeInOut", duration: 0.35 } },
    closed: { x: "-100%", transition: { type: "tween", ease: "easeInOut", duration: 0.3 } },
  };

  // When sidebar open state changes, broadcast to other components (notifications)
  useEffect(() => {
    const OPEN = "vnr:sidebar:open";
    const CLOSED = "vnr:sidebar:closed";
    if (sidebarOpen) {
      window.dispatchEvent(new CustomEvent(OPEN));
    } else {
      window.dispatchEvent(new CustomEvent(CLOSED));
    }
  }, [sidebarOpen]);

  // Close sidebar when notifications open elsewhere
  useEffect(() => {
    const onNotificationsOpen = () => {
      if (sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("vnr:notifications:open", onNotificationsOpen);
    return () => window.removeEventListener("vnr:notifications:open", onNotificationsOpen);
  }, [sidebarOpen, setSidebarOpen]);

  // Render nothing when closed (both mobile & desktop)
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            key="sb-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="sb-panel"
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            style={{
              background:
                "radial-gradient(circle at 50% 30%, #1e293b 0%, #0f172a 100%)",
            }}
            className={`${
              isMobile
                ? "fixed left-0 top-[64px] h-[calc(100%-64px)] w-52 z-50"
                : "relative w-64 h-[calc(100vh-4rem)]"
            } backdrop-blur-xl border border-gray-700 rounded-2xl shadow-lg`}
          >
            <div className="flex flex-col h-full">
              <nav className="flex-1 p-4">
                <ul className="space-y-3">
                  {baseMenuItems.map((item, index) => (
                    <motion.li
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                    >
                      <NavLink
                        to={item.path}
                        end={item.path === "/dashboard"}
                        onClick={() => isMobile && setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 border border-gray-700 text-gray-300
                          ${
                            isActive
                              ? "text-white border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.7)]"
                              : "hover:text-white hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                          }`
                        }
                      >
                        <item.icon size={20} />
                        <span className="font-medium text-sm lg:text-base">{item.label}</span>
                      </NavLink>
                    </motion.li>
                  ))}

                  {/* Volunteer Key Return - visible to Faculty */}
                  {(user?.role === "faculty") && (
                    <motion.li
                      key={collectiveKeyReturnItem.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: baseMenuItems.length * 0.08 }}
                    >
                      <NavLink
                        to={collectiveKeyReturnItem.path}
                        onClick={() => isMobile && setSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 border border-gray-700 text-gray-300
                          ${
                            isActive
                              ? "text-white border-blue-400 bg-blue-500/10"
                              : "hover:text-white hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                          }`
                        }
                      >
                        <collectiveKeyReturnItem.icon size={20} />
                        <span className="font-medium text-sm lg:text-base">{collectiveKeyReturnItem.label}</span>
                      </NavLink>
                    </motion.li>
                  )}

                  {user?.role === "admin" &&
                    adminMenuItems.map((item, index) => (
                      <motion.li
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (baseMenuItems.length + index + 1) * 0.08 }}
                      >
                        <NavLink
                          to={item.path}
                          onClick={() => isMobile && setSidebarOpen(false)}
                          className="flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 border border-gray-700 text-gray-300 hover:text-white hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                        >
                          <item.icon size={20} />
                          <span className="font-medium text-sm lg:text-base">{item.label}</span>
                        </NavLink>
                      </motion.li>
                    ))}
                </ul>
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
