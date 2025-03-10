import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { setPersistence, browserLocalPersistence } from "firebase/auth";

// Set Firebase auth to persist locally
setPersistence(auth, browserLocalPersistence);

interface AuthContextType {
  currentUser: any;
  userRole: string | null;
  isLoading: boolean;
  userEmail: string | null;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  isLoading: true,
  userEmail: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(() => {
    // Initialize from localStorage
    const cached = localStorage.getItem("userRole");
    return cached ? JSON.parse(cached) : null;
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    // Initialize from localStorage
    const cached = localStorage.getItem("userEmail");
    return cached ? JSON.parse(cached) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (email: string) => {
    try {
      // First check localStorage
      const cachedRole = localStorage.getItem("userRole");
      const cachedEmail = localStorage.getItem("userEmail");

      if (cachedRole && cachedEmail === email) {
        setUserRole(JSON.parse(cachedRole));
        window.name = email;
        return;
      }

      const userQuery = query(
        collection(db, "users"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(userQuery);
      const userData = querySnapshot.docs[0]?.data();

      if (userData) {
        setUserRole(userData.role || null);
        window.name = email;

        // Cache the role and email
        localStorage.setItem("userRole", JSON.stringify(userData.role));
        localStorage.setItem("userEmail", JSON.stringify(email));
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);

      if (user?.email) {
        setUserEmail(user.email);
        await fetchUserRole(user.email);
      } else {
        setUserRole(null);
        setUserEmail(null);
        window.name = "";
        // Clear cached data on logout
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, userRole, isLoading, userEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
