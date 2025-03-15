import { getAuth, signInWithPopup, GoogleAuthProvider, linkWithCredential } from "firebase/auth";

const auth = getAuth();
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (action) => {
    if (action === "login") {
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const result = await signInWithPopup(auth, googleProvider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            console.log("User signed in with Google:", user);
            console.log("Access token:", token);
            console.log("Credential:", credential);
            console.log("Result:", result);

            return { success: true, token, user };
        } catch (error) {
            if (error.code === 'auth/account-exists-with-different-credential') {
                const credential = GoogleAuthProvider.credentialFromError(error);
                try {
                    await linkWithCredential(auth.currentUser, credential);
                    alert("Accounts linked successfully!");
                    return { success: true, token: auth.currentUser };
                } catch (linkError) {
                    console.error("Error linking accounts:", linkError);
                    alert("Error linking accounts. Please try again.");
                    return { success: false, error: linkError.message };
                }
            } else {
                console.error("Error during Google sign-in:", error);
                alert(`Error: ${error.message} (Code: ${error.code})`);
                return { success: false, error: error.message };
            }
        }
    } else if (action === "register") {
        return { success: true, token: "mock_token_new_user" };
    } else {
        console.log("Invalid action");
        return { success: false, message: "Invalid action" };
    }
};
