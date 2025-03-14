import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();
const auth = getAuth();

export const signInWithGoogle = async (action) => {
    if (action === "login") {
        try {
            
            await new Promise((resolve) => setTimeout(resolve, 1000));
                    
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            console.log("User signed in:", user);
            console.log("Access token:", token);
            console.log("Credential:", credential);
            console.log("Result:", result);

            
            return { success: true, token, user };
            
        } catch (error) {
            
                    
            console.error("Error during sign-in:", error);

            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData?.email;
            const credential = GoogleAuthProvider.credentialFromError(error);

            // Display user-friendly error messages or perform recovery actions.
            
            alert(`Error: ${errorMessage} (Code: ${errorCode})`);
            console.log(`Error: ${errorMessage} (Code: ${errorCode})`);
            console.log("Email:", email);
            console.log("Credential:", credential);
            
            return { success: false, error: errorMessage };
        }
    } else if (action === "register") {
        // Simulating successful registration
        return { success: true, token: "mock_token_new_user" };
    } else {
        console.log("Invalid action");
        return { success: false, message: "Invalid action" };
    }
    
};

