// SidebarWrapper.jsx
import {
  ChevronFirst,
  ChevronLast,
  MoreVertical,
  User,
  Loader2,
  LogOutIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { createContext, useContext, useState, cloneElement } from "react";
import { useNavigate } from "react-router-dom";
import { userAuthenticatedStore, useSideBarStore } from "../store";
import { useQuery } from "@tanstack/react-query";
import { getUser } from "../Services";

const SidebarContext = createContext();

export default function Sidebar({ children, user, logo }) {
  const sideBarState = useSideBarStore((state) => state.isSideBarOpen);
  const { toggleSideBar } = useSideBarStore();
  const [expanded, setExpanded] = useState(sideBarState);
  const [isHidden, setIsHidden] = useState(false);
  const { isAuthenticated } = userAuthenticatedStore();
  const navigate = useNavigate();

  const isLoggedIn = userAuthenticatedStore((state) => state.isAuthenticated);
  const userId = userAuthenticatedStore((state) => state.userId);
  const logout = userAuthenticatedStore((state) => state.logoutUser);

  const { isPending, error, data } = useQuery({
    queryKey: ["user-data", userId],
    queryFn: () => getUser(userId),
    enabled: !!userId && isAuthenticated, // Only fetch if userId exists and user is authenticated
  });

  // Use fetched data if available, fallback to prop user
  const currentUser = data?.user || user || {};

  // Show button to reopen sidebar when hidden
  if (isHidden) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsHidden(false)}
          className={`p-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 bg-white hover:bg-gray-50 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600`}
          title="Show Sidebar"
        >
          <PanelLeftOpen
            size={20}
            className={`text-gray-700 dark:text-white`}
          />
        </button>
      </div>
    );
  }

  return (
    <aside
      className={`h-screen transition-all duration-300 ease-in-out dark:bg-gray-900 bg-white ${
        isHidden ? "w-0 overflow-hidden" : ""
      }`}
    >
      <nav
        className={`h-full flex flex-col border-r shadow-lg transition-colors duration-200 border-gray-200 shadow-gray-200/50 dark:border-gray-700 dark:shadow-gray-900/20`}
      >
        {/* Top Logo + Toggle */}
        <div
          className={`p-4 pb-2 flex justify-between items-center transition-colors duration-200 bg-white dark:bg-gray-900`}
        >
          {/* TOP-LEFT LOGO */}
          {/* <img
            onClick={()=>navigate("/")}
            src={logo}
            alt="Brand Logo"
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expanded ? "w-32 opacity-100" : "w-0 opacity-0"
            }`}
          /> */}
          <button
            onClick={() => {
              toggleSideBar();
              setExpanded((curr) => !curr);
            }}
            className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 bg-gray-100 hover:bg-gray-200 border border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700`}
          >
            {expanded ? (
              <div className="cursor-pointer">
                <ChevronFirst
                  size={18}
                  className={`transition-colors duration-200 text-gray-700 dark:text-white`}
                />
              </div>
            ) : (
              <div className="cursor-pointer">
                <ChevronLast
                  size={18}
                  className={`transition-colors duration-200 text-gray-700 dark:text-white`}
                />
              </div>
            )}
          </button>
        </div>

        {/* Sidebar items */}
        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 py-2">{children}</ul>
        </SidebarContext.Provider>

        {/* Hide Sidebar Button - positioned above user profile */}
        <div className={`px-3 pb-2`}>
          <button
            onClick={() => {
              setIsHidden(true);
            }}
            className={`w-full flex items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 group`}
            title="Hide Sidebar"
          >
            <PanelLeftClose
              size={18}
              className={`text-gray-600 group-hover:text-gray-700 dark:text-white dark:group-hover:text-gray-300 transition-colors duration-200`}
            />
            <span
              className={`overflow-hidden transition-all duration-300 font-medium text-sm ml-3 ${
                expanded ? "w-40 opacity-100" : "w-0 ml-0 opacity-0"
              } text-gray-600 group-hover:text-gray-700 dark:text-white dark:group-hover:text-gray-300`}
            >
              Hide Sidebar
            </span>
          </button>
        </div>

        {/* User profile at bottom - only show if authenticated */}
        {isAuthenticated ? (
          <div
            className={`border-t flex p-3 transition-colors duration-200 border-gray-200 dark:border-gray-700`}
          >
            <div className="relative">
              {/* Loading state for profile picture */}
              {isPending ? (
                <div
                  className={`w-10 h-10 rounded-lg shadow-md flex items-center justify-center bg-gray-100 dark:bg-gray-800`}
                >
                  <Loader2
                    size={16}
                    className={`animate-spin text-gray-600 dark:text-white`}
                  />
                </div>
              ) : (
                <div
                  className={`w-10 h-10 rounded-lg shadow-md flex items-center justify-center bg-gray-100 dark:bg-gray-800 cursor-pointer`}
                >
                  <User size={20} className={`text-gray-600 dark:text-white`} />
                </div>
              )}
            </div>

            <div
              className={`flex justify-between items-center overflow-hidden transition-all duration-300 ${
                expanded ? "w-52 ml-3 opacity-100" : "w-0 opacity-0"
              }`}
            >
              <div className="leading-4 min-w-0 flex-1">
                {/* Loading state for user info */}
                {isPending ? (
                  <div className="space-y-2">
                    <div
                      className={`h-3 rounded animate-pulse bg-gray-300 dark:bg-gray-700`}
                      style={{ width: "80%" }}
                    ></div>
                    <div
                      className={`h-2 rounded animate-pulse bg-gray-300 dark:bg-gray-700`}
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                ) : error ? (
                  <div>
                    <h4
                      className={`font-semibold text-sm transition-colors duration-200 text-red-600 dark:text-red-400`}
                    >
                      Error loading
                    </h4>
                    <span
                      className={`text-xs transition-colors duration-200 text-gray-500`}
                    >
                      Failed to fetch user
                    </span>
                  </div>
                ) : (
                  <div>
                    <h4
                      className={`font-semibold text-sm transition-colors duration-200 truncate text-gray-900 dark:text-white`}
                      title={currentUser.fullName || currentUser.name || "User"}
                    >
                      {currentUser.fullName || currentUser.name || "User"}
                    </h4>
                    <span
                      className={`text-xs transition-colors duration-200 truncate block text-gray-600 dark:text-gray-300`}
                      title={
                        currentUser.Email || currentUser.email || "No email"
                      }
                    >
                      {currentUser.Email || currentUser.email || "No email"}
                    </span>
                  </div>
                )}
              </div>

              {/* Only show more options when not loading */}
              {!isPending && (
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to logout?")) {
                      await logout();
                      window.location.reload();
                    }
                  }}
                  className={`p-1 rounded-md transition-colors duration-200 flex-shrink-0 ml-2 hover:bg-gray-200 text-gray-600 hover:text-gray-700 dark:hover:bg-gray-800 dark:text-white dark:hover:text-gray-300`}
                  title="User options"
                >
                  <LogOutIcon size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Sign in prompt for unauthenticated users */
          <div
            className={`border-t flex p-3 transition-colors duration-200 hover:bg-opacity-50 border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800`}
            onClick={() => navigate("/auth/signin")}
          >
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-lg shadow-md flex items-center justify-center bg-gray-100 dark:bg-gray-800`}
              >
                <User size={20} className={`text-gray-600 dark:text-white`} />
              </div>
            </div>

            <div
              className={`flex justify-between items-center overflow-hidden transition-all duration-300 ${
                expanded ? "w-52 ml-3 opacity-100" : "w-0 opacity-0"
              }`}
            >
              <div className="leading-4">
                <h4
                  className={`font-semibold text-sm transition-colors duration-200 text-gray-700 dark:text-white`}
                >
                  Sign In
                </h4>
                <span
                  className={`text-xs transition-colors duration-200 text-gray-500 dark:text-gray-300`}
                >
                  Click to authenticate
                </span>
              </div>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}

export function SidebarItem({ icon, text, active, alert, onRun }) {
  const { expanded } = useContext(SidebarContext);

  // Enhanced icon styling with proper color handling
  const styledIcon = icon
    ? cloneElement(icon, {
        size: 20,
        className: `transition-colors duration-200 ${
          active
            ? "text-indigo-700 dark:text-indigo-300"
            : "text-gray-600 group-hover:text-gray-700 dark:text-white dark:group-hover:text-gray-300"
        }`,
      })
    : null;

  return (
    <li
      onClick={onRun}
      className={`relative flex items-center justify-center py-3 px-3 my-1 font-medium rounded-lg cursor-pointer transition-all duration-200 group ${
        active
          ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 dark:from-indigo-600 dark:to-indigo-700"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-white dark:bg-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
      }`}
    >
      <div className="flex-shrink-0">{styledIcon}</div>
      <span
        className={`overflow-hidden transition-all duration-300 font-medium ${
          expanded ? "w-52 ml-3 opacity-100" : "w-0 ml-0 opacity-0"
        } ${
          active
            ? "text-white"
            : "text-gray-700 group-hover:text-gray-900 dark:text-white dark:group-hover:text-white"
        }`}
      >
        {text}
      </span>

      {alert && (
        <div
          className={`absolute right-3 w-2 h-2 rounded-full transition-all duration-200 ${
            expanded ? "" : "right-1/2 transform translate-x-1/2 top-2"
          }`}
        />
      )}

      {/* Enhanced tooltip */}
      {!expanded && (
        <div
          className={`absolute left-full rounded-lg px-3 py-2 ml-6 text-sm z-50
          invisible opacity-0 -translate-x-3 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
         bg-white text-gray-900 border border-gray-200 shadow-lg shadow-gray-900/10 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:shadow-gray-900/50`}
        >
          {text}
          {/* Tooltip arrow */}
          <div
            className={`absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-white border-l border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700`}
          />
        </div>
      )}
    </li>
  );
}
