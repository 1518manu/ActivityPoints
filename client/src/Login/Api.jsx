import { getAuth, signInWithEmailAndPassword } from "../firebaseFile/firebaseConfid";

const auth = getAuth();

export async function mockAuthApi(email, password, action) {
 // Simulate API delay
 await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log("Email:", email);
  console.log("Password:", password);
  console.log("Action:", action);   // login or register

  if (action === "login") {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User signed in:", userCredential.user);

      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Error signing in:", error.code, error.message);

      return { success: false, error: error.message };
    }
  } else if (action === "register") {
      // Simulating successful registration
      return { success: true, token: "mock_token_new_user" };
  }

  return { success: false, message: "Invalid action" };
}
