import { Router } from "express";
import { isProductive, getProductive, getProductiveByID, deleteProductiveByID, updateProductiveByID } from "../controllers/productive.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()



router.route("/add").post(verifyJWT, isProductive)
router.route("/get").get(verifyJWT, getProductive)
router.route("/getById").get(verifyJWT, getProductiveByID)
router.route("/delete").delete(verifyJWT, deleteProductiveByID)
router.route("/update").put(verifyJWT, updateProductiveByID)


export default router