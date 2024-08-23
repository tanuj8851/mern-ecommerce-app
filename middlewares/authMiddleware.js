import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

//protected route token base
export const requireSignIn = async (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
  }
};

//admin check
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      return res.send({
        success: false,
        message: "UnAuthorised Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    res.send({
      success: false,
      error: error,
      message: "Error in Admin Middleware",
    });
  }
};
