import express from "express";

const router = express.Router();

router.post("/api/users/signout", (req, res) => {
  req.session = null;
  console.log("user is being signed out.");
  res.status(200).send({});
});

export { router as signoutRouter };
