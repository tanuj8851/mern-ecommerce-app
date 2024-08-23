import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import formidable from "express-formidable";
import {
  brainTreePaymentController,
  brainTreeTokenController,
  createProductController,
  deleteProductController,
  getAllProductController,
  getSingleProductController,
  productCategoryController,
  productCountController,
  productFilterController,
  productListController,
  productPhotoController,
  relatedProductController,
  searchProductController,
  updateProductController,
} from "../controllers/productController.js";

const router = express.Router();

//Routes
//create product route
router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

//update product route
router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//get all products route
router.get("/get-products", getAllProductController);

//get single product route
router.get("/single-product/:slug", getSingleProductController);

//get product photo
router.get("/product-photo/:pid", productPhotoController);

//delete single product route
router.delete("/delete-product/:pid", deleteProductController);

//filter product
router.post("/product-filters", productFilterController);

//product count
router.get("/product-count", productCountController);

//product per page
router.get("/product-list/:page", productListController);

//search product route
router.get("/search/:keyword", searchProductController);

//relatedProduct route
router.get("/related-product/:pid/:cid", relatedProductController);

//category wise product
router.get("/product-category/:slug", productCategoryController);

//payments routes
//token
router.get("/braintree/token", brainTreeTokenController);

router.post("/braintree/payment", requireSignIn, brainTreePaymentController);

export default router;
