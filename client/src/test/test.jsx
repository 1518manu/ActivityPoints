import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

async function loginUser(email, password) {
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
}

// Example usage:
const email = "test@example.com";  // Replace with actual input
const password = "password123";    // Replace with actual input

loginUser(email, password).then((result) => {
  if (result.success) {
    console.log("Login successful:", result.user);
  } else {
    console.log("Login failed:", result.error);
  }
});
