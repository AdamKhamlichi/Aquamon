
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { signIn, signUp } from "@/lib/auth";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords don't match!");
          return;
        }
        
        if (formData.username.length < 3) {
          toast.error("Username must be at least 3 characters long");
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.username);
        if (!error) {
          toast.success("Registration successful! Please check your email to verify your account.");
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (!error) {
          toast.success("Welcome back!");
          navigate("/");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 font-pixel animate-float">AquaQuest</h1>
          <p className="text-gray-600 font-pixel">Join the adventure to save our oceans</p>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full font-pixel text-sm"
                required
              />
            </div>
            {isRegistering && (
              <div>
                <Input
                  type="text"
                  name="username"
                  placeholder="Username (min 3 characters)"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full font-pixel text-sm"
                  required
                  minLength={3}
                />
              </div>
            )}
            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full font-pixel text-sm"
                required
              />
            </div>
            {isRegistering && (
              <div>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full font-pixel text-sm"
                  required
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-pixel"
              disabled={loading}
            >
              {loading ? "Loading..." : (isRegistering ? "Register" : "Login")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full font-pixel text-sm"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
            </Button>
          </form>
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-wave-pattern bg-repeat-x animate-wave opacity-50" />
    </div>
  );
};

export default Login;
