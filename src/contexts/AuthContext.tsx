import { auth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
interface AuthContextType {
  currentUser: any;
  userRole: string | null;
  userEmail: string | null;
  userName: string | null;
  allocatedHours: number | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRole: null,
  userEmail: null,
  userName: null,
  allocatedHours: null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const cached = localStorage.getItem("authUser");
    return cached ? JSON.parse(cached) : null;
  });
  const [userRole, setUserRole] = useState<string | null>(() => {
    const cached = localStorage.getItem("userRole");
    return cached ? JSON.parse(cached) : null;
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    const cached = localStorage.getItem("userEmail");
    return cached ? JSON.parse(cached) : null;
  });
  const [userName, setUserName] = useState<string | null>(() => {
    const cached = localStorage.getItem("userName");
    return cached ? JSON.parse(cached) : null;
  });
  const [allocatedHours, setAllocatedHours] = useState<number | null>(() => {
    const cached = localStorage.getItem("allocatedHours");
    return cached ? JSON.parse(cached) : null;
  });

  const fetchUserRole = async (email: string) => {
    try {
      // First check localStorage
      const cachedRole = localStorage.getItem("userRole");
      if (cachedRole) {
        setUserRole(JSON.parse(cachedRole));
        setUserEmail(email);
        window.name = email;
        return;
      }

      // Only if no cached role, try to fetch from Firestore
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(userQuery);
      const userData = querySnapshot.docs[0]?.data();

      if (userData) {
        setUserRole(userData.role || null);
        setUserEmail(email);
        setUserName(userData.name || null);
        setAllocatedHours(userData.allocated_hours || null);
        window.name = email;

        // Cache all user data
        localStorage.setItem("userRole", JSON.stringify(userData.role));
        localStorage.setItem("userEmail", JSON.stringify(email));
        localStorage.setItem("userName", JSON.stringify(userData.name));
        localStorage.setItem(
          "allocatedHours",
          JSON.stringify(userData.allocated_hours)
        );
        localStorage.setItem("authUser", JSON.stringify({ email }));
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      // If offline and no cached role, try to use cached data
      const cachedRole = localStorage.getItem("userRole");
      const cachedEmail = localStorage.getItem("userEmail");
      if (cachedRole && cachedEmail === email) {
        setUserRole(JSON.parse(cachedRole));
        setUserEmail(email);
        window.name = email;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear all auth data
      setCurrentUser(null);
      setUserRole(null);
      setUserEmail(null);
      setUserName(null);
      setAllocatedHours(null);
      window.name = "";

      // Clear cached data
      localStorage.removeItem("authUser");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userName");
      localStorage.removeItem("allocatedHours");

      // Force a page reload to clear any remaining state
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    // Check for cached auth first
    const cachedAuth = localStorage.getItem("authUser");
    const cachedRole = localStorage.getItem("userRole");

    if (cachedAuth && cachedRole) {
      const auth = JSON.parse(cachedAuth);
      setCurrentUser(auth);
      setUserRole(JSON.parse(cachedRole));
      setUserEmail(auth.email);
      window.name = auth.email;
      return;
    }

    // Only listen to auth changes if no cached data
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user?.email) {
        setCurrentUser(user);
        await fetchUserRole(user.email);
      } else {
        // Clear everything if no user
        setCurrentUser(null);
        setUserRole(null);
        setUserEmail(null);
        setUserName(null);
        setAllocatedHours(null);
        window.name = "";
        localStorage.removeItem("authUser");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("allocatedHours");
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        userEmail,
        userName,
        allocatedHours,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
