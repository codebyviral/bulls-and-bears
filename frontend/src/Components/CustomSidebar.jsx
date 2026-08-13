import {
  LayoutDashboard,
  Home,
  Settings,
  Moon,
  Sun,
  Crown,
  LifeBuoy,
  Wallet,
  NotebookPen,
  CalendarRange,
  TrendingDown,
} from "lucide-react";
import Sidebar, { SidebarItem } from "./SidebarWrapper";
import bnblogo from "../assets/bnblogo.png";
import { useEffect } from "react";
import { useDarkModeStore, useNavigationStore } from "../store/store";
import { useLocation, useNavigate } from "react-router-dom";

function CustomSidebar() {
  const { globalDarkState, toggleDarkMode } = useDarkModeStore();
  const { active, setActive } = useNavigationStore();

  const dummyUser = {
    name: "Signin",
    email: "janesmith@example.com",
    avatar: "./assets/bnblogo.png",
    role: "Administrator",
    status: "Online",
  };

  // Keep DOM class synced with Zustand state
  useEffect(() => {
    if (globalDarkState) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [globalDarkState]);

  const navigate = useNavigate();
  const location = useLocation();

  // Update active tab based on current path
  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith("/bazaar")) setActive("dashboard");
    else if (path.startsWith("/leaderboard-updates")) setActive("leaderboard");
    else if (path.startsWith("/my-transactions")) setActive("transactions");
    else if (path.startsWith("/my-positions")) setActive("positions");
    else if (path.startsWith("/ipo")) setActive("Ipo");
    else if (path.startsWith("/settings")) setActive("settings");
    else if (path.startsWith("/help")) setActive("help");
    else setActive("home"); // default
  }, [location.pathname, setActive]);

  const changeTab = (tab) => {
    setActive(tab);
    tab === "dashboard"
      ? navigate("/bazaar")
      : tab === "leaderboard"
      ? navigate("/leaderboard-updates")
      : tab === "transactions"
      ? navigate("/my-transactions")
      : tab === "positions"
      ? navigate("/my-positions")
      : tab === "Ipo"
      ? navigate("/ipo")
      : tab === "settings"
      ? navigate("/settings")
      : tab === "help"
      ? navigate("/help")
      : navigate("/"); // default fallback
  };

  return (
    <Sidebar darkMode={globalDarkState} logo={bnblogo} user={dummyUser}>
      {/* HOME */}
      {/* <SidebarItem
        onRun={() => {
          changeTab("home");
        }}
        active={active === "home"}
        icon={<Home size={20} />}
        text="Home"
        alert
      /> */}
      <SidebarItem
        onRun={() => {
          changeTab("dashboard");
        }}
        icon={<LayoutDashboard size={20} />}
        text="Dashboard"
        active={active === "dashboard"}
      />
      <SidebarItem
        onRun={() => {
          changeTab("leaderboard");
        }}
        active={active === "leaderboard"}
        icon={<Crown size={20} />}
        text="Leaderboard"
        alert
      />
      <SidebarItem
        onRun={() => {
          changeTab("transactions");
        }}
        active={active === "transactions"}
        icon={<Wallet size={20} />}
        text="Transactions"
      />
      <SidebarItem
        onRun={() => {
          changeTab("positions");
        }}
        active={active === "positions"}
        icon={<NotebookPen size={20} />}
        text="Positions"
      />
      <SidebarItem
        onRun={() => {
          changeTab("Ipo");
        }}
        active={active === "Ipo"}
        icon={<CalendarRange size={20} />}
        text="IPOs"
      />
      <hr className="my-3" />
      {/* <SidebarItem
        onRun={() => {
          changeTab("settings");
        }}
        active={active === "settings"}
        icon={<Settings size={20} />}
        text="Settings"
      /> */}
      {globalDarkState ? (
        <SidebarItem
          icon={<Sun size={20} />}
          text="Light Mode"
          onRun={toggleDarkMode}
        />
      ) : (
        <SidebarItem
          icon={<Moon size={20} />}
          text="Dark Mode"
          onRun={toggleDarkMode}
        />
      )}
      {/* <SidebarItem
        onRun={() => {
          changeTab("help");
        }}
        active={active === "help"}
        icon={<LifeBuoy size={20} />}
        text="Help"
      /> */}
    </Sidebar>
  );
}

export default CustomSidebar;
