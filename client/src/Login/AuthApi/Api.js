import { getAuth, signInWithEmailAndPassword, linkWithCredential, EmailAuthProvider } from "firebase/auth";

const auth = getAuth();

export async function mockAuthApi(email, password, action) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Action:", action); 

    if (action === "login") {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("User signed in with Email/Password:", userCredential.user);
            return { success: true, token: userCredential.user };
        } catch (error) {
            if (error.code === 'auth/account-exists-with-different-credential') {
                const credential = EmailAuthProvider.credential(email, password);
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
                console.error("Error signing in with Email/Password:", error);
                return { success: false, error: error.message };
            }
        }
    } else if (action === "register") {
        return { success: true, token: "mock_token_new_user" };
    }

    return { success: false, message: "Invalid action" };
}
