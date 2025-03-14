import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  getAdditionalUserInfo, 
  linkWithCredential, 
  EmailAuthProvider 
} from "firebase/auth";


const auth = getAuth();
// ----------------------- Email/Password Signup -----------------------
export const handleEmailPasswordSignup = async (email, password) => {
  console.log("Email:", email);
  console.log ("Password:", password);
  try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Email/Password Sign-up successful:", userCredential.user);
      return userCredential.user;
  } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
          console.error("Email already in use. Attempting linking...");
          return handleExistingEmail(email);  // Handle linking logic
      }
      console.error("Email/Password Sign-up failed:", error);
      alert(`Error: ${error.message} (Code: ${error.code})`);
      throw error;
  }
};

// ----------------------- Google Signup -----------------------
const handleGoogleSignup = async () => {
  const provider = new GoogleAuthProvider();
  try {
      const result = await signInWithPopup(auth, provider);
      const additionalUserInfo = getAdditionalUserInfo(result);

      if (additionalUserInfo?.isNewUser) {
          console.log("Google Sign-up successful:", result.user);
      } else {
          console.log("Google Sign-in successful (existing user):", result.user);
      }
      return result.user;
  } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
          console.error("Account exists with different credential. Attempting linking...");
          return handleExistingEmail(error.customData.email); 
      }
      console.error("Google Sign-up/in failed:", error);
      alert(`Error: ${error.message} (Code: ${error.code})`);
      throw error;
  }
};

// ----------------------- Account Linking -----------------------
const handleExistingEmail = async (email) => {
  const password = prompt(`Email "${email}" is already registered. Enter your password to link accounts:`);

  if (!password) {
      alert("Password entry was canceled. Linking aborted.");
      throw new Error("Password entry aborted");
  }

  try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const provider = new GoogleAuthProvider();
      const result = await linkWithCredential(userCredential.user, provider.credential());
      
      console.log("Account linked successfully:", result.user);
      alert("Accounts linked successfully!");
      return result.user;
  } catch (error) {
      console.error("Account linking failed:", error);
      alert(`Error linking accounts: ${error.message}`);
      throw error;
  }
};

// Example Usage
 handleEmailPasswordSignup("220294@tkmce.ac.in", "B22CSA14");
// handleGoogleSignup();
