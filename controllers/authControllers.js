import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import jwt from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    if (!name) {
      return res.send({ message: `Name Not Found` });
    }
    if (!email) {
      return res.send({ message: `Email Not Found` });
    }
    if (!password) {
      return res.send({ message: `Password Not Found` });
    }
    if (!phone) {
      return res.send({ message: `Phone Not Found` });
    }
    if (!address) {
      return res.send({ message: `Address Not Found` });
    }
    if (!answer) {
      return res.send({ message: `Answer Not Found` });
    }

    //check User
    const existingUser = await userModel.findOne({ email });
    // existingUSer
    if (existingUser) {
      return res.send({
        success: true,
        message: "Already Registered please Login.",
      });
    }

    //register user

    const hashedPassword = await hashPassword(password);

    //save
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "User created Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: "Failed to Register", error });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.send({ error: `Email and Password are required.` });
    }

    // check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.send({ success: false, message: "Failed to Login", error });
    }

    //compare password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.send({
        success: false,
        message: "Password Not Matched.",
        error,
      });
    }

    //token generation
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).send({
      success: true,
      message: " Login Successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: "Failed to Login", error });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    if (!email) {
      res.status(400).send({ message: "Email is Required." });
    }

    if (!answer) {
      res.status(400).send({ message: "Answer is Required." });
    }

    if (!newPassword) {
      res.status(400).send({ message: "New Password is Required." });
    }

    //check
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      res.status(400).send({
        success: false,
        message: "Wrong Email or Answer",
        error,
      });
    }

    //hashing new password
    const hashed = await hashPassword(newPassword);

    // updating new password
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Rest Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong.",
      error,
    });
  }
};

export const testController = (req, res) => {
  res.send("Protected ROutes");
};

//update profile controller
export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;
    const user = await userModel.findById(req.user._id);

    //password
    if (password && password.length < 6) {
      return res.json({ error: "Password is required and 6 character long." });
    }
    const hashedPassword = password ? await hashPassword(password) : undefined;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        phone: phone || user.phone,
        address: address || user.address,
      },
      {
        new: true,
      }
    );

    res.status(200).send({
      success: true,
      message: "Profile Updated Successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong. while profile updating.",
      error,
    });
  }
};

//getOrdersController
export const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.status(200).send(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong. while Fetching Orders ",
      error,
    });
  }
};

//getALLOrdersController
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name");

    res.status(200).send(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong. while Fetching Orders ",
      error,
    });
  }
};

//change order status controller
export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.status(200).send(orders);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong. while Updating Orders status ",
      error,
    });
  }
};
