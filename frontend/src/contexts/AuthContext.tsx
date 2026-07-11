import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { auth, db } from "../config/firebase";
import { onIdTokenChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

type AppUser = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "loan_officer" | "shop_owner" | "user";
} | null;

interface AuthContextType {
  user: AppUser;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubDoc: (() => void) | undefined;

    const unsubscribeAuth = onIdTokenChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      
      if (unsubDoc) {
        unsubDoc();
        unsubDoc = undefined;
      }

      if (currentUser) {
        // Sync Firebase token with localStorage so our backend services can read it
        try {
          const token = await currentUser.getIdToken();
          localStorage.setItem("access_token", token);
        } catch (e) {
          console.error("Failed to get ID token", e);
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        
        // Listen to the Firestore document in real-time
        unsubDoc = onSnapshot(
          userDocRef,
          (userDoc) => {
            if (userDoc.exists()) {
              setUser({ id: currentUser.uid, ...userDoc.data() } as AppUser);
            } else {
              // User is in Firebase Auth but not in Firestore (yet)
              // This happens momentarily during sign up
              setUser(null);
            }
            setIsLoading(false);
          },
          (error) => {
            console.error("Error fetching user data from Firestore:", error);
            setUser(null);
            setIsLoading(false);
          }
        );
      } else {
        localStorage.removeItem("access_token");
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const logout = async () => {
    try {
      // The backend token is managed by Firebase, but clear any old state
      localStorage.removeItem("access_token");
      await signOut(auth);
      // Optional: If you want to force clear all React Query caches you could use queryClient.clear() 
      // but here we just ensure a hard reload or state reset via location
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isAuthenticated: !!user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
