
import { db } from "../../firebaseFile/firebaseConfig"; // Make sure to import your db configuration
import { collection, query, where, getDocs } from "firebase/firestore";

export const fetchUserData = async (email) => {
  try {
    console.log("Fetching user role for email:", email);
    const usersRef = await collection(db, "Users"); // Assuming "users" is your collection
    const q = await query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    console.log("querySnapshot:" , querySnapshot);
    
    if (!querySnapshot.empty) {
      console.log("Data found:", querySnapshot.docs[0].data());
      return querySnapshot.docs[0].data(); // Assuming the role is stored in the "role" field
    } else {
      throw new Error("Role not found");
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};