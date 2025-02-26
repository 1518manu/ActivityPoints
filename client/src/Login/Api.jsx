
export async function mockAuthApi(email, password, action) {

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log("Email:", email);
  // Email pattern: Starts with digits and ends with "@tkmce.ac.in"
  const emailPattern = /^(\d+)@tkmce\.ac\.in$/;
  const passwordPattern = /^B\d{2}CSB\d{2}$/; // Example: "B22CSB76"

  if (action === "login") {
      if (emailPattern.test(email) && passwordPattern.test(password)) {
        
        return { success: true, token: "mock_token_12345" };

      } else {

        return { success: false, message: "Invalid email or password" };

      }
  } else if (action === "register") {
      // Simulating successful registration
      return { success: true, token: "mock_token_new_user" };
  }

  return { success: false, message: "Invalid action" };
}
