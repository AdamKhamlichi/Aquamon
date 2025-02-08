
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Fish, Users, MessageSquare, Award, List, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const links = [
    { to: "/", icon: Fish, label: "Home" },
    { to: "/social", icon: Users, label: "Friends" },
    { to: "/chat", icon: MessageSquare, label: "Chat" },
    { to: "/pokedex", icon: List, label: "Aquarium" },
    { to: "/challenges", icon: Award, label: "Challenges" },
  ];

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate("/login");
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 py-2 px-4 md:top-0 md:bottom-auto">
      <div className="max-w-screen-xl mx-auto">
        <ul className="flex justify-around items-center">
          {links.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  className={`flex flex-col items-center p-2 transition-all duration-300 rounded-lg ${
                    isActive
                      ? "text-primary scale-110"
                      : "text-gray-600 hover:text-primary hover:scale-105"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1">{label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center p-2 transition-all duration-300 rounded-lg text-gray-600 hover:text-primary hover:scale-105"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-xs mt-1">Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
