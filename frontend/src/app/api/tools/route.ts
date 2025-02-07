import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDoc,
  query,
  limit,
  startAfter,
  orderBy,
  DocumentSnapshot,
} from "firebase/firestore";

// Store last document reference in memory (note: this will reset on server restart)
const lastDocumentSnapshots: { [key: string]: DocumentSnapshot } = {};

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from request
    const searchParams = request.nextUrl.searchParams;
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const pageKey = searchParams.get("pageKey") || "";
    const direction = searchParams.get("direction") || "next";

    // Base query
    const toolsRef = collection(db, "tools");
    let toolsQuery = query(toolsRef, orderBy("name"), limit(pageSize));

    // Handle pagination based on direction
    if (pageKey && lastDocumentSnapshots[pageKey]) {
      if (direction === "next") {
        toolsQuery = query(
          toolsRef,
          orderBy("name"),
          startAfter(lastDocumentSnapshots[pageKey]),
          limit(pageSize)
        );
      }
      // You could add 'previous' handling here if needed
    }

    // Execute query
    const toolsSnapshot = await getDocs(toolsQuery);

    // Store the last document for next page
    const newPageKey = Math.random().toString(36).substring(7);
    if (toolsSnapshot.docs.length > 0) {
      lastDocumentSnapshots[newPageKey] =
        toolsSnapshot.docs[toolsSnapshot.docs.length - 1];

      // Cleanup old keys (optional)
      const keys = Object.keys(lastDocumentSnapshots);
      if (keys.length > 100) {
        // Keep only last 100 page keys
        delete lastDocumentSnapshots[keys[0]];
      }
    }

    // Process tools data
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
          category,
          ecosystem,
        };
      })
    );

    // Fetch categories and ecosystems as before
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

    // Return response with pagination metadata
    return NextResponse.json({
      tools,
      categories,
      ecosystems,
      pagination: {
        hasMore: tools.length === pageSize,
        nextPageKey: tools.length === pageSize ? newPageKey : null,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
