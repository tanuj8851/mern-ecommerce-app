import slugify from "slugify";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from "fs";
import braintree from "braintree";

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !name:
        return res
          .status(500)
          .send({ success: false, message: "Name is required" });
      case !description:
        return res
          .status(500)
          .send({ success: false, message: "description is required" });
      case !price:
        return res
          .status(500)
          .send({ success: false, message: "price is required" });
      case !category:
        return res
          .status(500)
          .send({ success: false, message: "category is required" });
      case !quantity:
        return res
          .status(500)
          .send({ success: false, message: "quantity is required" });
      case photo && photo.size > 1000000:
        return res.status(500).send({
          success: false,
          message: "Photo is required and should be less than 1mb.",
        });
    }

    const products = new productModel({ ...req.fields, slug: slugify(name) });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();
    res.status(201).send({
      success: true,
      message: "Product Created Successfully.",
      products,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "Failed to create Product", error });
  }
};

//update product controller
export const updateProductController = async (req, res) => {
  try {
    const { name, slug, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    //validation
    switch (true) {
      case !name:
        return res
          .status(500)
          .send({ success: false, message: "Name is required" });
      case !description:
        return res
          .status(500)
          .send({ success: false, message: "description is required" });
      case !price:
        return res
          .status(500)
          .send({ success: false, message: "price is required" });
      case !category:
        return res
          .status(500)
          .send({ success: false, message: "category is required" });
      case !quantity:
        return res
          .status(500)
          .send({ success: false, message: "quantity is required" });
      case photo && photo.size > 1000000:
        return res.status(500).send({
          success: false,
          message: "Photo is required and should be less than 1mb.",
        });
    }

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }

    await products.save();
    res.status(201).send({
      success: true,
      message: "Product updated Successfully.",
      products,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "Failed to update Product", error });
  }
};

//get all products controller
export const getAllProductController = async (req, res) => {
  try {
    const product = await productModel
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.status(201).send({
      success: true,
      totalCount: product.length,
      message: "All Products Fetched Successfully.",
      product,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, message: "Failed to fetch All Products", error });
  }
};

//get single products controller
export const getSingleProductController = async (req, res) => {
  try {
    const Product = await productModel
      .find({ slug: req.params.slug })
      .populate("category")
      .select("-photo");

    res.status(201).send({
      success: true,
      message: "Single Products Fetched Successfully.",
      Product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch single Product.",
      error,
    });
  }
};

//get product photo controller
export const productPhotoController = async (req, res) => {
  try {
    const Product = await productModel.findById(req.params.pid).select("photo");

    if (Product.photo.data) {
      res.set("Content-type", Product.photo.contentType);
      return res.status(200).send(Product.photo.data);
    }

    res.status(200).send({
      success: true,
      message: "Single Products Fetched Successfully.",
      Product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to fetch single Product Photo.",
      error,
    });
  }
};

//delete product controller
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");

    res.status(201).send({
      success: true,
      message: "product Deleted Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to Delete single Product.",
      error,
    });
  }
};

//filter products
export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};

    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await productModel.find(args);
    res.status(201).send({
      success: true,
      totalCount: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to Filter Products.",
      error,
    });
  }
};

export const productCountController = async (req, res) => {
  try {
    const total = await productModel.find({}).estimatedDocumentCount();

    res.status(200).send({ success: true, total });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to Count Products.",
      error,
    });
  }
};

export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;

    const products = await productModel
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).send({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to Provide List of  Products.",
      error,
    });
  }
};

// search product controller
export const searchProductController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await productModel
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");

    res.status(200).send({ success: true, count: results.length, results });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to Provide Products.",
      error,
    });
  }
};

// relatedProduct Controller
export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await productModel
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3)
      .populate("category");

    res.status(200).send({ success: true, products });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to Provide Related  Products.",
      error,
    });
  }
};

//get product by category
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel
      .find({ category })
      .select("-photo")
      .populate("category");

    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Failed to Provide  Products.",
      error,
    });
  }
};

//payment controllers

export const brainTreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.send(err).status(500);
      } else {
        res.send(response).status(200);
      }
    });
  } catch (error) {
    res
      .send({ success: false, message: "Error while payment token" })
      .status(500);
    console.log(error);
  }
};

export const brainTreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
