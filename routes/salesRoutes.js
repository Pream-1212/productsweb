const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const salesModel = require("../models/salesModel.js");

// Ensure upload folder exists
const uploadPath = "public/uploads";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- Helper Functions ---

// Calculate total value of products in stock
const calculateInStockValue = (products) => {
  return products
    .filter((product) => product.quantity > 0)
    .reduce((sum, product) => sum + product.quantity * product.price, 0);
};

// Count products that are out of stock
const countOutOfStock = (products) => {
  return products.filter((product) => product.quantity <= 0).length;
};

// --- ROUTES ---

// GET / - Show products and stats
router.get("/", async (req, res) => {
  try {
    const products = await salesModel.find().sort({ createdAt: 1 });

    res.render("index", {
      title: "Products App",
      products,
      inStockValue: calculateInStockValue(products),
      outOfStockCount: countOutOfStock(products),
      message: null,
      errors: null,
      formData: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// POST / - Add new product
router.post("/", upload.single("productImage"), async (req, res) => {
  try {
    const { productName, category, price, quantity, color } = req.body;
    const errors = [];

    // --- Validation ---
    if (!productName) errors.push("Product Name is required");
    if (!category) errors.push("Category is required");
    if (!price || isNaN(price) || Number(price) <= 0)
      errors.push("Price must be a positive number");
    if (!quantity || isNaN(quantity) || Number(quantity) < 0)
      errors.push("Quantity must be a non-negative number");
    if (!color) errors.push("Color is required");
    if (!req.file) errors.push("Product image is required");

    if (errors.length > 0) {
      const products = await salesModel.find().sort({ createdAt: 1 });
      return res.render("index", {
        title: "Products App",
        products,
        inStockValue: calculateInStockValue(products),
        outOfStockCount: countOutOfStock(products),
        message: null,
        errors,
        formData: req.body,
      });
    }

    // --- Generate sequential product ID ---
    const latest = await salesModel.findOne().sort({ _id: -1 });
    let newProductId = "#645341";
    if (latest && latest.productId) {
      const lastId = parseInt(latest.productId.replace("#", ""));
      if (!isNaN(lastId)) {
        newProductId = "#" + (lastId + 1);
      }
    }

    // --- Create and save new product ---
    const product = new salesModel({
      productId: newProductId,
      productName,
      category,
      price: Number(price),
      quantity: Number(quantity),
      color,
      productImage: req.file.path.replace(/\\/g, "/"),
    });

    await product.save();

    const products = await salesModel.find().sort({ createdAt: 1 });
    res.render("index", {
      title: "Products App",
      products,
      inStockValue: calculateInStockValue(products),
      outOfStockCount: countOutOfStock(products),
      message: "Product has been added successfully!",
      errors: null,
      formData: null,
    });
  } catch (err) {
    console.error(err);
    const products = await salesModel.find().sort({ createdAt: 1 });
    res.render("index", {
      title: "Products App",
      products,
      inStockValue: calculateInStockValue(products),
      outOfStockCount: countOutOfStock(products),
      message: "Failed to add product",
      errors: null,
      formData: req.body,
    });
  }
});

module.exports = router;
