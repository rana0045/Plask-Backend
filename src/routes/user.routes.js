import { Router } from "express";
import { registerUser, loginUser, updateUser, logoutUser, googleRegister, googleLogin } from "../controllers/user.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";



const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/update").put(
    verifyJWT,
    updateUser
)
router.route("/logout").post(
    verifyJWT,
    logoutUser
)
router.route("/googleregister").post(googleRegister)
router.route("/googlelogin").post(googleLogin)


export default router 