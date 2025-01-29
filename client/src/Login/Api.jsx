export async function mockAuthApi(email, password, action) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  
    // Mock authentication logic
    if (action === "login") {
      if (email === "user@example.com" && password === "password") {
        return { success: true, token: "mock_token_12345" }
      } else {
        return { success: false, message: "Invalid email or password" }
      }
    } else if (action === "register") {
      // In a real app, you'd check if the email is already registered
      // For this mock, we'll always succeed
      return { success: true, token: "mock_token_new_user" }
    }
  
    return { success: false, message: "Invalid action" }
  }
  
  