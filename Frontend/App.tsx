// Frontend/App.tsx
import React, {
  useState,
  createContext,
  useContext,
  useEffect,
  ReactNode,
} from "react";

import "./styles/index.css";


import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Prediction from "./pages/Prediction";
import ForgotPassword from "./pages/ForgotPassword";

// ================== Auth Context Types ==================
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// ================== Auth Provider ==================
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ================== Protected Route ==================
const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// ================== Main App ==================
function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/prediction"
                element={
                  <ProtectedRoute>
                    <Prediction />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Chatbot />
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
