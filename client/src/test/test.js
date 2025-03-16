
  
  const handleSubmit = async (e) => {
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

        const role = await fetchUserRole(email);
        console.log(response.token); 
        onLoginSuccess(response.token);
        if (role) {
          localStorage.setItem("token", response.token);
          localStorage.setItem("role", role); // Save the role in localStorage

          showNotification("Login Successful!", "success");

          // Redirect to the appropriate dashboard based on the role
          setTimeout(() => {
            if (role === "admin") {
              navigate("/AdminDashboard");
            } else if (role === "faculty") {
              navigate("/FacultyDashboard");
            } else if (role === "club") {
              navigate("/ClubDashboard");
            } else {
              navigate("/StudentDashboard");
            }
          }, 1400);
        } else {
          showNotification("User role not found!", "error");
        }
      } else {
        showNotification(response.message || "Login Failed!", "error");
      }
    } catch (error) {
      showNotification("An error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
    
  };