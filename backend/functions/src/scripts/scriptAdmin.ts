/* eslint-disable require-jsdoc */
/* eslint-disable object-curly-spacing */
import { UserRecord } from "firebase-admin/auth";
import * as admin from "firebase-admin";
import { resolve } from "path";
import { readFile } from "fs/promises";

async function setAdminRole(uid: string, callerUid: string | null = null) {
  if (!uid || typeof uid !== "string" || uid.length === 0) {
    throw new Error("Invalid UID provided");
  }

  try {
    const serviceAccountPath = resolve(__dirname, "../../pkFirebase-prod.json");
    const serviceAccount = JSON.parse(
      await readFile(serviceAccountPath, "utf-8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    // If callerUid is null, we're setting up the first admin
    if (callerUid !== null) {
      // Check if the caller is an admin
      const callerClaims = await admin
        .auth()
        .getUser(callerUid)
        .then((user: UserRecord) => user.customClaims);
      if (!callerClaims || !callerClaims.admin) {
        throw new Error("Caller does not have admin privileges");
      }
    } else {
      // Check if there are any existing admins
      const existingAdmins = await admin
        .auth()
        .listUsers()
        .then((listUsersResult: any) =>
          listUsersResult.users.filter(
            (user: UserRecord) => user.customClaims && user.customClaims.admin
          )
        );

      if (existingAdmins.length > 0) {
        throw new Error(
          "An admin already exists. Use the regular process to add more admins."
        );
      }
    }

    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Admin role set successfully for user ${uid}`);
  } catch (error) {
    console.error("Error setting admin role:", error);
    throw error;
  }
}

// Function to set up the first admin
async function setupFirstAdmin(uid: string) {
  try {
    await setAdminRole(uid, null);
    console.log(`First admin (${uid}) has been set up successfully.`);
  } catch (error) {
    console.error("Failed to set up first admin:", error);
  }
}

// Usage:
// Replace 'first-admin-uid' with the actual UID of the user you want
// to make the first admin
// READ THIS CAREFULLY: CHANGE THE ID BELOW TO THE UID OF THE USER YOU
// WANT TO MAKE THE FIRST ADMIN
setupFirstAdmin("IDOFUSER");
