const express = require("express");
const multer = require("multer");

const Product = require("../models/product");

const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminmiddleware");

const router = express.Router();


const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);

    }

});

const upload = multer({
    storage: storage
});



router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),

    async (req, res) => {

        try {

            const {
                name,
                category,
                subcategory,
                description,
                price,
                stock,
                isNewArrival
            } = req.body;


            if (
                !name ||
                !category ||
                !subcategory ||
                !description ||
                price === undefined ||
                stock === undefined
            ) {
                return res.status(400).json({
                    message: "All product fields are required"
                });
            }


            if (!req.file) {

                return res.status(400).json({
                    message: "Product image is required"
                });

            }


            const product = new Product({

                name,
                category,
                subcategory,
                description,

                price: Number(price),

                stock: Number(stock),

                image: `/uploads/${req.file.filename}`,

                isNewArrival: isNewArrival === "true",

            });


            const savedProduct = await product.save();


            res.status(201).json({

                message: "Product added successfully",

                product: savedProduct

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message: "Failed to add product",

                error: error.message

            });

        }

    }
);

router.get("/", async (req, res) => {

    try {

        const products = await Product.find({
            $or: [
                { isDeleted: false },
                { isDeleted: { $exists: false } }
            ]
        });

        res.status(200).json(products);

    } catch (error) {

        console.error("Fetch products error:", error);

        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message
        });

    }

});


router.get(
    "/admin/all",
    authMiddleware,
    adminMiddleware,

    async (req, res) => {

        try {

            const products =
                await Product.find();

            res.status(200).json(products);

        } catch (error) {

            console.error(
                "Fetch admin products error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to fetch admin products",

                error:
                    error.message

            });

        }

    }
);

router.get("/new-arrivals", async (req, res) => {

    try {

        const products = await Product.find({
            isNewArrival: true,
            $or: [
                { isDeleted: false },
                { isDeleted: { $exists: false } }
            ]
        }).sort({
            createdAt: -1
        });

        res.status(200).json(products);

    } catch (error) {

        console.error(
            "Fetch new arrivals error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch new arrivals",
            error: error.message
        });

    }

});

router.get("/:id", async (req, res) => {

    try {

        const product = await Product.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }

        res.status(200).json(product);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch product",
            error: error.message
        });

    }

});




router.put(
    "/:id/rating",
    authMiddleware,

    async (req, res) => {

        try {

            const { rating } = req.body;

            const newRating = Number(rating);

            if (
                !newRating ||
                newRating < 1 ||
                newRating > 5
            ) {

                return res.status(400).json({
                    message: "Rating must be between 1 and 5"
                });

            }



            const product =
                await Product.findById(req.params.id);

            if (!product) {

                return res.status(404).json({
                    message: "Product not found"
                });

            }



            const userId = req.user.id;



            if (!Array.isArray(product.ratings)) {

                product.ratings = [];

            }



            const existingRating =
                product.ratings.find(
                    (item) => {

                        const itemUserId =
                            item.user?._id ||
                            item.user;

                        return (
                            itemUserId &&
                            itemUserId.toString() ===
                            userId.toString()
                        );

                    }
                );


            if (existingRating) {

                return res.status(400).json({
                    message:
                        "You have already rated this product"
                });

            }



            product.ratings.push({

                user: userId,

                rating: newRating

            });


            const currentReviews =
                Number(product.reviews) || 0;

            const newReviewCount =
                currentReviews + 1;


            product.reviews =
                newReviewCount;


          

            const totalRatings =
                product.ratings.length;


            const totalScore =
                product.ratings.reduce(
                    (sum, item) => {

                        return (
                            sum +
                            Number(item.rating)
                        );

                    },
                    0
                );


            

            if (totalRatings > 0) {

                const averageRating =
                    totalScore / totalRatings;

                product.rating =
                    Number(
                        averageRating.toFixed(1)
                    );

            }

            const savedProduct =
                await product.save();


            return res.status(200).json({

                message:
                    "Rating submitted successfully",

                product:
                    savedProduct

            });


        } catch (error) {

            console.error(
                "Rating error:",
                error
            );

            return res.status(500).json({

                message:
                    "Failed to submit rating",

                error:
                    error.message

            });

        }

    }
);

router.put(
    "/:id",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),

    async (req, res) => {

        try {

            const {
                name,
                category,
                subcategory,
                description,
                price,
                stock
            } = req.body;


            const product =
                await Product.findById(req.params.id);


            if (!product) {

                return res.status(404).json({
                    message: "Product not found"
                });

            }


            product.name = name;
            product.category = category;
            product.subcategory = subcategory;
            product.description = description;
            product.price = Number(price);
            product.stock = Number(stock);




            if (req.file) {

                product.image =
                    `/uploads/${req.file.filename}`;

            }


            const updatedProduct =
                await product.save();


            res.status(200).json({

                message:
                    "Product updated successfully",

                product: updatedProduct

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({

                message:
                    "Failed to update product",

                error:
                    error.message

            });

        }

    }
);


router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,

    async (req, res) => {

        try {

            const product =
                await Product.findById(
                    req.params.id
                );


            if (!product) {

                return res.status(404).json({

                    message:
                        "Product not found"

                });

            }


            await Product.findByIdAndDelete(
                req.params.id
            );


            return res.status(200).json({

                message:
                    "Product deleted successfully",

                productId:
                    req.params.id

            });


        } catch (error) {

            console.error(
                "Delete product error:",
                error
            );


            return res.status(500).json({

                message:
                    "Failed to delete product",

                error:
                    error.message

            });

        }

    }
);


router.patch(
    "/:id/soft-delete",
    authMiddleware,
    adminMiddleware,

    async (req, res) => {

        try {

            const product =
                await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            product.isDeleted = true;

            await product.save();

            return res.status(200).json({
                message: "Product archived successfully",
                product
            });

        } catch (error) {

            console.error(
                "Archive product error:",
                error
            );

            return res.status(500).json({
                message: "Failed to archive product",
                error: error.message
            });

        }

    }
);

router.patch(
    "/:id/restore",
    authMiddleware,
    adminMiddleware,

    async (req, res) => {

        try {

            const product =
                await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            product.isDeleted = false;

            await product.save();

            return res.status(200).json({
                message: "Product restored successfully",
                product
            });

        } catch (error) {

            console.error(
                "Restore product error:",
                error
            );

            return res.status(500).json({
                message: "Failed to restore product",
                error: error.message
            });

        }

    }
);


module.exports = router;