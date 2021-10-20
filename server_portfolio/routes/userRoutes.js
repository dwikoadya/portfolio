const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");
const userMiddleware = require("../middlewares/userMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/logout", authController.logout);
router.post("/register", authController.signup);
router.post("/login", authController.login);

router.use(authMiddleware.checkLoggedUser);

router.get("/me", userMiddleware.getMe, userController.getUser);
router.patch("/update-me", userController.updateMe);

router.use(authMiddleware.routeGuard("admin", "owner"));

router.patch("/make-admin", userController.makeAdmin);
router.patch("/revoke-admin", userController.revokeAdmin);

module.exports = router;
