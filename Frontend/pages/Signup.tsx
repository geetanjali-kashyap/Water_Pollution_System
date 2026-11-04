import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/auth.css";
import API_BASE_URL from "../utils/api";

const Signup: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");

    // basic client-side checks (optional but helpful)
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      alert("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      console.log("Signup → calling:", `${API_BASE_URL}/api/auth/register`);

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        // ❌ IMPORTANT: ye line hata di – isi se CORS ka
        // “Access-Control-Allow-Credentials” wala error aa raha tha
        // credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({} as any));
      console.log("Signup → response:", response.status, data);

      if (!response.ok || data.success === false) {
        alert(data.message || "Signup failed.");
        return;
      }

      setSuccess("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Signup error:", err);
      alert("Something went wrong while signing up.");
    }
  };

  return (
    <motion.div
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="form-container"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          className="form-box"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="form-content">
            <motion.h1
              className="auth-title"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Create Account
            </motion.h1>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div
                className="input-group"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                />
                <i className="bx bxs-user input-icon"></i>
              </motion.div>

              <motion.div
                className="input-group"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.55 }}
              >
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                />
                <i className="bx bxs-envelope input-icon"></i>
              </motion.div>

              <motion.div
                className="input-group"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.65 }}
              >
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                />
                <i className="bx bxs-lock-alt input-icon"></i>
              </motion.div>

              <motion.div
                className="input-group"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.75 }}
              >
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="input-field"
                />
                <i className="bx bxs-lock-alt input-icon"></i>
              </motion.div>

              {success && (
                <motion.p
                  className="success-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {success}
                </motion.p>
              )}

              <motion.button
                type="submit"
                className="auth-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.85 }}
              >
                Sign up
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
