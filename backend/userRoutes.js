import express from "express";
import User from "./models/user.js";
import { verifyToken } from "./authMiddleware.js";

const router = express.Router();

router.post("/sync", verifyToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email: email,
        name: name || "User"
      });
    }

    res.status(200).json({
      message: "User synced successfully",
      user
    });

  } catch (error) {
    console.error("User sync error:", error);

    res.status(500).json({
      message: "Failed to sync user"
    });
  }
});

export default router;