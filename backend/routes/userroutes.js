const express = require("express");

const User = require("../models/user");

const authMiddleware = require("../middleware/authmiddleware");
const adminMiddleware = require("../middleware/adminmiddleware");

const router = express.Router();


router.get(
    "/admin/all",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const users = await User.find()
                .select("-password")
                .sort({ createdAt: -1 });

            res.status(200).json({
                users
            });

        } catch (error) {

            console.error(
                "Fetch users error:",
                error
            );

            res.status(500).json({
                message: "Failed to fetch users"
            });

        }

    }
);


router.patch(
    "/admin/:id/soft-delete",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const user = await User.findById(
                req.params.id
            );

            if (!user) {

                return res.status(404).json({
                    message: "User not found"
                });

            }


            // Prevent deleting an admin
            if (user.role === "admin") {

                return res.status(400).json({
                    message: "Admin account cannot be deleted"
                });

            }


            user.isDeleted = true;

            await user.save();


            res.status(200).json({

                message:
                    "User moved to deleted users",

                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    role: user.role,
                    isDeleted: user.isDeleted
                }

            });

        } catch (error) {

            console.error(
                "Soft delete user error:",
                error
            );

            res.status(500).json({
                message: "Failed to delete user"
            });

        }

    }
);


router.patch(
    "/admin/:id/restore",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const user = await User.findById(
                req.params.id
            );

            if (!user) {

                return res.status(404).json({
                    message: "User not found"
                });

            }


            user.isDeleted = false;

            await user.save();


            res.status(200).json({

                message:
                    "User restored successfully",

                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    mobile: user.mobile,
                    role: user.role,
                    isDeleted: user.isDeleted
                }

            });

        } catch (error) {

            console.error(
                "Restore user error:",
                error
            );

            res.status(500).json({
                message: "Failed to restore user"
            });

        }

    }
);


router.delete(
    "/admin/:id/permanent",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {

        try {

            const user = await User.findById(
                req.params.id
            );

            if (!user) {

                return res.status(404).json({
                    message: "User not found"
                });

            }


            if (user.role === "admin") {

                return res.status(400).json({
                    message: "Admin account cannot be deleted"
                });

            }


            await User.findByIdAndDelete(
                req.params.id
            );


            res.status(200).json({

                message:
                    "User permanently deleted",

                userId:
                    req.params.id

            });

        } catch (error) {

            console.error(
                "Permanent delete user error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to permanently delete user"
            });

        }

    }
);


module.exports = router;