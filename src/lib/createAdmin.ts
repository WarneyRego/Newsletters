import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { app } from "./firebase";

/**
 * 
 * 
 * @param name N
 * @param email 
 * @param password 
 * @returns 
 */
export async function createAdminUser(name: string, email: string, password: string) {
  try {
    
    const auth = getAuth(app);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    
    return { 
      success: true, 
      user: userCredential.user,
      error: null 
    };
  } catch (error) {
    return { 
      success: false, 
      user: null,
      error: { 
        message: error instanceof Error ? error.message : String(error) 
      } 
    };
  }
} 