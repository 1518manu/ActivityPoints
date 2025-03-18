
import { db } from "../../firebaseFile/firebaseConfig"; // Make sure to import your db configuration
import { collection, query, where, getDocs } from "firebase/firestore";

export const fetchUserData = async (email, role) => {
  try {
    console.log(`Fetching user role '${role}' for email:`, email);
    const usersRef = await collection(db, "Students"); // Assuming "users" is your collection
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
    console.error(`Error fetching user role ${role}:`, error);
    return null;
  }
};


export const fetchUserRole = async (email) => {
  try {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data().role; // Only return the role
    } else {
      console.error("Role not found for email:", email);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};
