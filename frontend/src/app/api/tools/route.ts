import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc } from "firebase/firestore";

export async function GET() {
  try {
    // Fetch tools with their full category and ecosystem data
    const toolsSnapshot = await getDocs(collection(db, "tools"));
    const tools = await Promise.all(
      toolsSnapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Fetch full category data if it exists
        let category = null;
        if (data.category?.id) {
          const categoryDoc = await getDoc(data.category);
          category = categoryDoc.exists()
            ? { id: categoryDoc.id, ...(categoryDoc.data() as object) }
            : null;
        }

        // Fetch full ecosystem data if it exists
        let ecosystem = null;
        if (data.ecosystem?.id) {
          const ecosystemDoc = await getDoc(data.ecosystem);
          ecosystem = ecosystemDoc.exists()
            ? { id: ecosystemDoc.id, ...(ecosystemDoc.data() as object) }
            : null;
        }

        return {
          id: doc.id,
          ...data,
          category: category,
          ecosystem: ecosystem,
        };
      })
    );

    // Fetch all categories and ecosystems for filtering
    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const ecosystemsSnapshot = await getDocs(collection(db, "ecosystems"));
    const ecosystems = ecosystemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      tools,
      categories,
      ecosystems,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
