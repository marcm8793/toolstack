import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { EcoSystem } from "@/types";
import { db } from "../firebase";

export const addNewEcosystem = async (
  id: string,
  name: string
): Promise<void> => {
  try {
    const ecosystemRef = doc(db, "ecosystems", id);
    const newEcosystem: EcoSystem = {
      id,
      name,
      created_at: serverTimestamp() as Timestamp,
      updated_at: serverTimestamp() as Timestamp,
    };
    await setDoc(ecosystemRef, newEcosystem);
  } catch (error) {
    console.error("Error adding new ecosystem: ", error);
    throw error;
  }
};
