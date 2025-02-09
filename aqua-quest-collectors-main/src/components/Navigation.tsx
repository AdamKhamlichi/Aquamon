// File: src/components/Navigation.tsx

import { Link, useLocation, useNavigate } from "react-router-dom";
import { Fish, Users, MessageCircle, Award, List, LogOut, Settings, HelpCircle } from "lucide-react";
import { signOut } from "@/lib/auth";
import { useInteractionSound } from "@/hooks/use-interaction-sound";

const Navigation = () => {
  const { handlers } = useInteractionSound();
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: "/", icon: Fish, label: "Home" },
    { to: "/social", icon: Users, label: "Friends" },
    { to: "/chat", icon: MessageCircle, label: "Chat" },
    { to: "/pokedex", icon: List, label: "Aquarium" },
    { to: "/challenges", icon: Award, label: "Challenges" },
    { to: "/settings", icon: Settings, label: "Settings" },
    { to: "/about", icon: HelpCircle, label: "About" }
  ];

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate("/login");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 py-2 px-4 md:top-0 md:bottom-auto z-50">
      <div className="max-w-screen-xl mx-auto">
        <ul className="flex justify-around items-center">
          {links.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  {...handlers}
                  className={`flex flex-col items-center p-2 transition-all duration-300 rounded-lg ${isActive
                    ? "text-cyan-300 scale-110 bg-white/20"
                    : "text-white/80 hover:text-cyan-200 hover:scale-105 hover:bg-white/10"
                    }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1 font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleLogout}
              {...handlers}
              className="flex flex-col items-center p-2 transition-all duration-300 rounded-lg text-white/80 hover:text-cyan-200 hover:scale-105 hover:bg-white/10"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;