import { Router } from "express";
import { isProductive, getProductive, getProductiveByID } from "../controllers/productive.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()



router.route("/add").post(verifyJWT, isProductive)
router.route("/get").get(verifyJWT, getProductive)
router.route("/getById").get(verifyJWT, getProductiveByID)



export default router