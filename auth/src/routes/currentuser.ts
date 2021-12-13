import express from "express";
import { getCurrentUser } from "@thabet-ticketing/common";

const router = express.Router();

router.get("/api/users/currentuser", getCurrentUser, (req, res) => {
  console.log("looking for current user");
  res.status(200).send({ currentUser: req.currentUser || null });
});

export { router as currentuserRouter };
