
import { mockAuthApi } from "../AuthApi/Api";

  export const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification("Please fill in all fields", "error");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await mockAuthApi(email, password, isLogin ? "login" : "register");
      console.log(response);
      if (response.success) {
        // Fetch the role after login

        const email = response?.token?.email;
        console.log("email:", email);

        const role =  await fetchUserRole(email);
        console.log(role);
        const userData = await fetchUserData(email, role);
        onLoginSuccess(response.token, userData);

        
        if (role) {
          localStorage.setItem("token", response.token);
          localStorage.setItem("role", role);
          localStorage.setItem("userData", JSON.stringify(userData));

          showNotification("Login Successful!", "success");
          console.log("Login Successful!");

          // Redirect to the appropriate dashboard based on the role
          
          setTimeout(() => {
            switch (role) {
              case "admin":
                console.log("Admin role found!");
                navigate("/AdminDashboard");
                break;
              case "faculty":
                console.log("Faculty role found!");
                navigate("/FacultyDashboard");
                break;
              case "club":
                console.log("Club role found!");
                navigate("/ClubDashboard");
                break;
              case "student":
                console.log("Student role found!");
                navigate("/StudentDashboard");
                break; 
              default:
                showNotification("User role not found!", "error");
                console.log("User role not found!");
            }
          }, 1400);

        } else {
          showNotification("User role not found!", "error");
          console.log("User role not found!");
        }
      } else {
        showNotification(response.message || "Login Failed!", "error");
        console.log(response.message || "Login Failed!");
      }
    } catch (error) {
      showNotification("An error occurred. Please try again.", "error");
      console.log("An error occurred. Please try again");
    } finally {
      setIsLoading(false);
    }
    
  };
  