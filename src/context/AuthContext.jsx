import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [logged, setLogged] = useState(false);
  const [currentRole, setCurrentRole] = useState("COPC Coordinator");
  const [user, setUser] = useState({ name: "Account", initials: "U", email: "" });

  function login(role, email = "") {
    setCurrentRole(role);
    setUser({ name: "Account", initials: "U", email });
    setLogged(true);
  }

  function logout() {
    setLogged(false);
  }

  return (
    <AuthContext.Provider value={{ logged, currentRole, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
