import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

//createCategory controller
export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .send({ success: false, message: "Name is required" })
        .status(401);
    }

    const existingCategory = await categoryModel.findOne({ name });
    if (existingCategory) {
      return res
        .send({ success: false, message: "Category Already Exists." })
        .status(401);
    }

    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    res
      .status(201)
      .send({ success: true, message: "New Category Created", category });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ success: false, error, message: "Error In Category Creation." });
  }
};

//update category controller
export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name: slugify(name) },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Category Updated Successfully.",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Updating Categories.",
      error,
    });
  }
};

//get all categories controller
export const categoryController = async (req, res) => {
  try {
    const category = await categoryModel.find();
    res.status(200).send({
      success: true,
      message: "All Categories Fetched Successfully.",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While getting all  Categories.",
      error,
    });
  }
};

//get a single category controller
export const singleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.find({ slug: req.params.slug });
    res.status(200).send({
      success: true,
      message: "Single Categories Fetched Successfully.",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While getting all  Categories.",
      error,
    });
  }
};

//delete a single category controller
export const deleteCategoryController = async (req, res) => {
  try {
    await categoryModel.findByIdAndDelete({ _id: req.params.id });
    res.status(200).send({
      success: true,
      message: "Single Categories Deleted Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While getting all  Categories.",
      error,
    });
  }
};
