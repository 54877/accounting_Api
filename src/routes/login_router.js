import express from "express";
import { LoginUser, registerUser } from "../controllers/controller.js";

export const authRouter = express.Router();

authRouter.use((req, res, next) => {
  console.log("🔥 AUTH ROUTER HIT:", req.url);
  next();
});
//註冊帳號
authRouter.post("/register", registerUser);

//登入帳號
authRouter.post("/login", LoginUser);
