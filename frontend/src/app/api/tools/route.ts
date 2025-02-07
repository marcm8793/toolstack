import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc } from "firebase/firestore";

export async function GET() {
  try {
    const toolsSnapshot = await getDocs(collection(db, "tools"));
    const toolsData = toolsSnapshot.docs.map((doc) => doc.data());

    // Batch fetch all unique categories and ecosystems
    const categoryRefs = Array.from(
      new Set(toolsData.map((t) => t.category).filter((ref) => ref?.id))
    );
    const ecosystemRefs = Array.from(
      new Set(toolsData.map((t) => t.ecosystem).filter((ref) => ref?.id))
    );

    // Parallel fetch all categories and ecosystems
    const [categoryDocs, ecosystemDocs] = await Promise.all([
      Promise.all(categoryRefs.map((ref) => getDoc(ref))),
      Promise.all(ecosystemRefs.map((ref) => getDoc(ref))),
    ]);

    // Create lookup maps
    const categoriesMap = new Map(
      categoryDocs.map((docSnap, index) => [
        categoryRefs[index].id,
        docSnap.exists()
          ? { id: docSnap.id, ...(docSnap.data() as object) }
          : null,
      ])
    );

    const ecosystemsMap = new Map(
      ecosystemDocs.map((docSnap, index) => [
        ecosystemRefs[index].id,
        docSnap.exists()
          ? { id: docSnap.id, ...(docSnap.data() as object) }
          : null,
      ])
    );

    // Process tools with cached data
    const tools = toolsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        category: data.category ? categoriesMap.get(data.category.id) : null,
        ecosystem: data.ecosystem ? ecosystemsMap.get(data.ecosystem.id) : null,
      };
    });

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
