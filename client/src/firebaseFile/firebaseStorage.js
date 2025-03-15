import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebaseConfig"; // Ensure your Firebase config is imported

const storage = getStorage(app);

export const uploadCertificate = async (file, userId) => {
  if (!file) return null;

  try {
    const storageRef = ref(storage, `certificates/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const fileURL = await getDownloadURL(storageRef);
    return fileURL; // Return the uploaded file's URL
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
};
