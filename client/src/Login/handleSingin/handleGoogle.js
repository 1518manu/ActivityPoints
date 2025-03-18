
import { signInWithGoogle } from "./AuthApi/GoogleAuth";

 export const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      const response = await signInWithGoogle("login");
      
      console.log(response);
      if (response.success) {
        
        // Fetch the role after login
        console.log(response.token); 
        const role = await fetchUserRole(user.email);
        console.log("role:",role);
        const email = response?.token?.email;
        console.log("email:",email);
        const userData = await fetchUserData(email, role);

        onLoginSuccess(response.token, userData);

        if (role) {
          localStorage.setItem("token", response.token);
          localStorage.setItem("role", role);
          localStorage.setItem("userData", JSON.stringify(userData));

          showNotification("Login Successful!", "success");
          console.log("Login Successful");

          // Redirect to the appropriate dashboard based on the role
          setTimeout(() => {
            if (role === "admin") {
              navigate("/AdminDashboard");
            } else if (role === "faculty") {
              navigate("/FacultyDashboard");
            } else if (role === "club") {
              navigate("/ClubDashboard");
            } else if (role == "student"){
              navigate("/StudentDashboard");
            }else{
              showNotification("User role not found!", "error");
              console.log("User role not found!");
            }
          }, 1400);
        } else {
          showNotification("User role not found!", "error");
          console.log("User role not found!");
        }

        console.log("Google Sign In");
      } else {
        showNotification(response.error || "Login Failed!", "error");
        console.log("Login Failed");
      }

    } catch (error) {
      showNotification("An error occurred. Please try again.", "error");
      console.log("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
    
  };