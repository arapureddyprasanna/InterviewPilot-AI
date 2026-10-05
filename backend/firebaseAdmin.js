
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import serviceAccount from "./firebaseAcc.json" with { type: "json" };

initializeApp({
  credential: cert(serviceAccount)
});

export const adminAuth = getAuth();