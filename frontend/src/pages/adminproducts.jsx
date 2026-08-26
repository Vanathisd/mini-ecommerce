import { useState, useEffect } from "react";

import {
    FiPlus,
    FiArrowLeft,
    FiEdit2,
    FiX,
    FiTrash2,
    FiArchive
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import "../styles/adminproducts.css";



function AdminProducts() {

    const navigate = useNavigate();



    const emptyProduct = {
        name: "",
        category: "",
        subcategory: "",
        description: "",
        price: "",
        stock: "",
        isNewArrival: false
    };



    const [product, setProduct] =
        useState(emptyProduct);



    const [products, setProducts] =
        useState([]);



    const [image, setImage] =
        useState(null);



    const [editingProductId, setEditingProductId] =
        useState(null);



    const [activeTab, setActiveTab] =
        useState("active");



    const [actionLoading, setActionLoading] =
        useState(null);



    const [searchTerm, setSearchTerm] =
        useState("");



    const [toast, setToast] = useState({
        message: "",
        type: ""
    });



    const showToast = (message, type = "success") => {

        setToast({
            message,
            type
        });



        setTimeout(() => {

            setToast({
                message: "",
                type: ""
            });

        }, 3000);

    };


    const subcategoryOptions = {

        Women: [
            "Dresses",
            "Tops",
            "Ethnic Wear"
        ],

        Men: [
            "Shirts",
            "Jeans",
            "jackets"
        ],

        Accessories: [
            "Watches",
            "bags",
            "Sunglasses",
            "wallets"
        ]

    };


    const fetchProducts = async () => {

        try {

            const token =
                localStorage.getItem("token");



            const response =
                await fetch(
                    "https://mini-ecommerce-backend-yxii.onrender.com/products/admin/all",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );



            const data =
                await response.json();



            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to fetch products"
                );

            }



            setProducts(data);



        } catch (error) {

            console.error(
                "Error fetching products:",
                error
            );



            showToast(
                error.message ||
                "Failed to fetch products",
                "error"
            );

        }

    };



    useEffect(() => {

        fetchProducts();

    }, []);


    const visibleProducts =
        products
            .filter((item) =>
                activeTab === "active"
                    ? !item.isDeleted
                    : item.isDeleted
            )
            .filter((item) => {

                const search =
                    searchTerm
                        .toLowerCase()
                        .trim();



                if (!search) {

                    return true;

                }



                return (

                    item.name
                        ?.toLowerCase()
                        .includes(search) ||

                    item.category
                        ?.toLowerCase()
                        .includes(search) ||

                    item.subcategory
                        ?.toLowerCase()
                        .includes(search)

                );

            });



    const womenProducts =
        visibleProducts.filter(
            (item) =>
                item.category === "Women"
        );



    const menProducts =
        visibleProducts.filter(
            (item) =>
                item.category === "Men"
        );



    const accessoryProducts =
        visibleProducts.filter(
            (item) =>
                item.category === "Accessories"
        );


    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;



        if (name === "category") {

            setProduct(
                (previous) => ({
                    ...previous,
                    category: value,
                    subcategory: ""
                })
            );

            return;

        }



        setProduct(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );

    };


    const handleImageChange = (e) => {

        const selectedImage =
            e.target.files[0];



        setImage(
            selectedImage || null
        );

    };



    const handleEdit = (selectedProduct) => {

        setEditingProductId(
            selectedProduct._id
        );



        setProduct({

            name:
                selectedProduct.name || "",

            category:
                selectedProduct.category || "",

            subcategory:
                selectedProduct.subcategory || "",

            description:
                selectedProduct.description || "",

            price:
                selectedProduct.price ?? "",

            stock:
                selectedProduct.stock ?? "",

            isNewArrival:
                selectedProduct.isNewArrival || false

        });



        setImage(null);



        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    };


    const handleCancelEdit = () => {

        setEditingProductId(null);

        setProduct({
            ...emptyProduct
        });

        setImage(null);

    };



    const handleSubmit = async (e) => {

        e.preventDefault();



        try {

            const token =
                localStorage.getItem("token");



            const formData =
                new FormData();



            formData.append(
                "name",
                product.name.trim()
            );



            formData.append(
                "category",
                product.category
            );



            formData.append(
                "subcategory",
                product.subcategory
            );



            formData.append(
                "description",
                product.description.trim()
            );



            formData.append(
                "price",
                product.price
            );



            formData.append(
                "stock",
                product.stock
            );



            formData.append(
                "isNewArrival",
                product.isNewArrival
            );



            if (image) {

                formData.append(
                    "image",
                    image
                );

            }



            if (editingProductId) {

                const response =
                    await fetch(
                        `https://mini-ecommerce-backend-yxii.onrender.com/products/${editingProductId}`,
                        {
                            method: "PUT",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            },

                            body: formData
                        }
                    );



                const data =
                    await response.json();



                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to update product"
                    );

                }



                setProducts(
                    (previousProducts) =>
                        previousProducts.map(
                            (item) =>
                                item._id ===
                                editingProductId
                                    ? data.product
                                    : item
                        )
                );



                showToast(
                    "Product updated successfully!",
                    "success"
                );



                handleCancelEdit();



                return;

            }


            const response =
                await fetch(
                    "https://mini-ecommerce-backend-yxii.onrender.com/products",
                    {
                        method: "POST",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        },

                        body: formData
                    }
                );



            const data =
                await response.json();



            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to add product"
                );

            }



            showToast(
                "Product added successfully!",
                "success"
            );



            setProducts(
                (previousProducts) => [
                    ...previousProducts,
                    data.product
                ]
            );



            setProduct({
                ...emptyProduct
            });

            setImage(null);



        } catch (error) {

            console.error(error);



            showToast(
                error.message ||
                "Something went wrong",
                "error"
            );

        }

    };

    const handleSoftDelete = async (productId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to archive this product?"
            );



        if (!confirmed) {

            return;

        }



        try {

            setActionLoading(productId);



            const token =
                localStorage.getItem("token");



            const response =
                await fetch(
                    `https://mini-ecommerce-backend-yxii.onrender.com/products/${productId}/soft-delete`,
                    {
                        method: "PATCH",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );



            const data =
                await response.json();



            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to archive product"
                );

            }



            setProducts(
                (currentProducts) =>
                    currentProducts.map(
                        (item) =>
                            item._id === productId
                                ? {
                                    ...item,
                                    isDeleted: true
                                }
                                : item
                    )
            );



            showToast(
                "Product archived successfully!",
                "success"
            );



        } catch (error) {

            console.error(
                "Archive product error:",
                error
            );



            showToast(
                error.message ||
                "Failed to archive product",
                "error"
            );



        } finally {

            setActionLoading(null);

        }

    };


    const handleRestore = async (productId) => {

        try {

            setActionLoading(productId);



            const token =
                localStorage.getItem("token");



            const response =
                await fetch(
                    `https://mini-ecommerce-backend-yxii.onrender.com/products/${productId}/restore`,
                    {
                        method: "PATCH",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );



            const data =
                await response.json();



            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to restore product"
                );

            }



            setProducts(
                (currentProducts) =>
                    currentProducts.map(
                        (item) =>
                            item._id === productId
                                ? {
                                    ...item,
                                    isDeleted: false
                                }
                                : item
                    )
            );



            showToast(
                "Product restored successfully!",
                "success"
            );



        } catch (error) {

            console.error(
                "Restore product error:",
                error
            );



            showToast(
                error.message ||
                "Failed to restore product",
                "error"
            );



        } finally {

            setActionLoading(null);

        }

    };

    const handleDelete = async (productId) => {

        const confirmDelete =
            window.confirm(
                "This will permanently delete the archived product from the database. This action cannot be undone. Continue?"
            );



        if (!confirmDelete) {

            return;

        }



        try {

            setActionLoading(productId);



            const token =
                localStorage.getItem("token");



            const response =
                await fetch(
                    `https://mini-ecommerce-backend-yxii.onrender.com/products/${productId}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );



            const data =
                await response.json();



            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to permanently delete product"
                );

            }



            setProducts(
                (previousProducts) =>
                    previousProducts.filter(
                        (item) =>
                            item._id !== productId
                    )
            );



            showToast(
                "Product permanently deleted!",
                "success"
            );



            if (
                editingProductId === productId
            ) {

                handleCancelEdit();

            }



        } catch (error) {

            console.error(
                "Permanent delete error:",
                error
            );



            showToast(
                error.message ||
                "Failed to permanently delete product",
                "error"
            );



        } finally {

            setActionLoading(null);

        }

    };


    const renderProductRows =
        (categoryProducts) => {

            if (
                categoryProducts.length === 0
            ) {

                return (

                    <div
                        className="admin-no-products"
                    >

                        No products found.

                    </div>

                );

            }



            return categoryProducts.map(
                (item) => (

                    <div
                        className="admin-product-row"
                        key={item._id}
                    >

                        {/* PRODUCT */}

                        <div
                            className="admin-product-info"
                        >

                            <img
                                src={
                                    item.image &&
                                    item.image.startsWith(
                                        "/uploads"
                                    )
                                        ? `https://mini-ecommerce-backend-yxii.onrender.com${item.image}`
                                        : item.image
                                }
                                alt={item.name}
                            />



                            <div>

                                <strong>
                                    {item.name}
                                </strong>



                                <span>
                                    {item.subcategory}
                                </span>

                            </div>

                        </div>



                        {/* CATEGORY */}

                        <span>
                            {item.category}
                        </span>



                        {/* PRICE */}

                        <span>
                            ₹{item.price}
                        </span>



                        {/* STOCK */}

                        <span>
                            {item.stock}
                        </span>



                        {/* ACTIONS */}

                        <div
                            className="admin-product-actions"
                        >

                            {/* ACTIVE PRODUCTS */}

                            {activeTab === "active" && (

                                <>

                                    <button
                                        type="button"
                                        className="edit-product-btn"
                                        onClick={() =>
                                            handleEdit(item)
                                        }
                                        disabled={
                                            actionLoading ===
                                            item._id
                                        }
                                        title="Edit Product"
                                    >

                                        <FiEdit2 />

                                    </button>



                                    <button
                                        type="button"
                                        className="archive-product-btn"
                                        onClick={() =>
                                            handleSoftDelete(
                                                item._id
                                            )
                                        }
                                        disabled={
                                            actionLoading ===
                                            item._id
                                        }
                                        title="Archive Product"
                                    >

                                        <FiArchive />

                                    </button>

                                </>

                            )}



                            {/* ARCHIVED PRODUCTS */}

                            {activeTab === "deleted" && (

                                <>

                                    <button
                                        type="button"
                                        className="restore-product-btn"
                                        onClick={() =>
                                            handleRestore(
                                                item._id
                                            )
                                        }
                                        disabled={
                                            actionLoading ===
                                            item._id
                                        }
                                        title="Restore Product"
                                    >

                                        Restore

                                    </button>



                                    <button
                                        type="button"
                                        className="delete-product-btn"
                                        onClick={() =>
                                            handleDelete(
                                                item._id
                                            )
                                        }
                                        disabled={
                                            actionLoading ===
                                            item._id
                                        }
                                        title="Permanently Delete"
                                    >

                                        <FiTrash2 />

                                    </button>

                                </>

                            )}

                        </div>

                    </div>

                )
            );

        };



    return (

        <div
            className="admin-products-page"
        >

            {/* TOAST */}

            {toast.message && (

                <div
                    className={`admin-toast ${toast.type}`}
                >

                    {toast.message}

                </div>

            )}



            {/* PAGE HEADING */}

            <div
                className="admin-products-heading"
            >

                <button
                    onClick={() =>
                        navigate("/admin")
                    }
                >

                    <FiArrowLeft />

                    Back to Dashboard

                </button>



                <div>

                    <p>
                        VELORA ADMIN
                    </p>



                    <h1>

                        {editingProductId
                            ? "Edit Product"
                            : "Add Product"
                        }

                    </h1>

                </div>

            </div>



            {/* ADD / EDIT FORM */}

            <form
                className="admin-product-form"
                onSubmit={handleSubmit}
            >

                {/* PRODUCT NAME */}

                <div className="form-group">

                    <label>
                        Product Name
                    </label>



                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        required
                    />

                </div>



                {/* CATEGORY + SUBCATEGORY */}

                <div className="form-row">

                    <div className="form-group">

                        <label>
                            Category
                        </label>



                        <select
                            name="category"
                            value={product.category}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select Category
                            </option>



                            <option value="Women">
                                Women
                            </option>



                            <option value="Men">
                                Men
                            </option>



                            <option value="Accessories">
                                Accessories
                            </option>

                        </select>

                    </div>



                    <div className="form-group">

                        <label>
                            Subcategory
                        </label>



                        <select
                            name="subcategory"
                            value={product.subcategory}
                            onChange={handleChange}
                            disabled={!product.category}
                            required
                        >

                            <option value="">
                                {product.category
                                    ? "Select Subcategory"
                                    : "Select Category First"
                                }
                            </option>



                            {product.category &&
                                subcategoryOptions[
                                    product.category
                                ]?.map(
                                    (subcategory) => (

                                        <option
                                            key={subcategory}
                                            value={subcategory}
                                        >

                                            {subcategory}

                                        </option>

                                    )
                                )
                            }

                        </select>

                    </div>

                </div>



                {/* DESCRIPTION */}

                <div className="form-group">

                    <label>
                        Description
                    </label>



                    <textarea
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        placeholder="Enter product description"
                        rows="5"
                        required
                    />

                </div>



                {/* PRICE + STOCK */}

                <div className="form-row">

                    <div className="form-group">

                        <label>
                            Price
                        </label>



                        <input
                            type="number"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            placeholder="₹ 0"
                            min="1"
                            required
                        />

                    </div>



                    <div className="form-group">

                        <label>
                            Stock
                        </label>



                        <input
                            type="number"
                            name="stock"
                            value={product.stock}
                            onChange={handleChange}
                            placeholder="Enter stock quantity"
                            min="0"
                            required
                        />

                    </div>

                </div>



                {/* NEW ARRIVAL */}

                <div className="form-group new-arrival-checkbox">

                    <label>

                        <input
                            type="checkbox"
                            name="isNewArrival"
                            checked={product.isNewArrival}
                            onChange={(e) =>
                                setProduct(
                                    (previous) => ({
                                        ...previous,
                                        isNewArrival:
                                            e.target.checked
                                    })
                                )
                            }
                        />

                        Mark as New Arrival

                    </label>

                </div>



                {/* IMAGE */}

                <div className="form-group">

                    <label>

                        Product Image

                        {editingProductId && (

                            <span
                                className="optional-image-text"
                            >

                                {" "}
                                (Optional - leave empty
                                to keep current image)

                            </span>

                        )}

                    </label>



                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!editingProductId}
                    />

                </div>



                {/* BUTTONS */}

                <div
                    className="admin-form-buttons"
                >

                    <button
                        type="submit"
                        className="add-product-btn"
                    >

                        {editingProductId
                            ? <FiEdit2 />
                            : <FiPlus />
                        }



                        {editingProductId
                            ? "Update Product"
                            : "Add Product"
                        }

                    </button>



                    {editingProductId && (

                        <button
                            type="button"
                            className="cancel-edit-btn"
                            onClick={
                                handleCancelEdit
                            }
                        >

                            <FiX />

                            Cancel

                        </button>

                    )}

                </div>

            </form>



            {/* PRODUCT MANAGEMENT */}

            <section
                className="admin-product-list"
            >

                <div
                    className="admin-product-list-main-heading"
                >

                    <div>

                        <p>
                            PRODUCT MANAGEMENT
                        </p>



                        <h2>
                            {activeTab === "active"
                                ? "Active Products"
                                : "Archived Products"
                            }
                        </h2>

                    </div>



                    <span>
                        {visibleProducts.length} Products
                    </span>

                </div>



                {/* TABS */}

                <div className="admin-product-tabs">

                    <button
                        type="button"
                        className={
                            activeTab === "active"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("active")
                        }
                    >

                        Active Products

                    </button>



                    <button
                        type="button"
                        className={
                            activeTab === "deleted"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab("deleted")
                        }
                    >

                        Archived Products

                    </button>

                </div>



                {/* SEARCH */}

                <div className="admin-product-search">

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                    />

                </div>



                {/* WOMEN */}

                <div
                    className="admin-product-category"
                >

                    <div
                        className="admin-product-list-heading"
                    >

                        <div>

                            <p>
                                PRODUCT CATEGORY
                            </p>



                            <h2>
                                Women
                            </h2>

                        </div>



                        <span>
                            {womenProducts.length}
                            {" "}Products
                        </span>

                    </div>



                    <div
                        className="admin-product-table"
                    >

                        <div
                            className="admin-product-table-header"
                        >

                            <span>
                                Product
                            </span>



                            <span>
                                Category
                            </span>



                            <span>
                                Price
                            </span>



                            <span>
                                Stock
                            </span>



                            <span>
                                Actions
                            </span>

                        </div>



                        {renderProductRows(
                            womenProducts
                        )}

                    </div>

                </div>



                {/* MEN */}

                <div
                    className="admin-product-category"
                >

                    <div
                        className="admin-product-list-heading"
                    >

                        <div>

                            <p>
                                PRODUCT CATEGORY
                            </p>



                            <h2>
                                Men
                            </h2>

                        </div>



                        <span>
                            {menProducts.length}
                            {" "}Products
                        </span>

                    </div>



                    <div
                        className="admin-product-table"
                    >

                        <div
                            className="admin-product-table-header"
                        >

                            <span>
                                Product
                            </span>



                            <span>
                                Category
                            </span>



                            <span>
                                Price
                            </span>



                            <span>
                                Stock
                            </span>



                            <span>
                                Actions
                            </span>

                        </div>



                        {renderProductRows(
                            menProducts
                        )}

                    </div>

                </div>



                {/* ACCESSORIES */}

                <div
                    className="admin-product-category"
                >

                    <div
                        className="admin-product-list-heading"
                    >

                        <div>

                            <p>
                                PRODUCT CATEGORY
                            </p>



                            <h2>
                                Accessories
                            </h2>

                        </div>



                        <span>
                            {accessoryProducts.length}
                            {" "}Products
                        </span>

                    </div>



                    <div
                        className="admin-product-table"
                    >

                        <div
                            className="admin-product-table-header"
                        >

                            <span>
                                Product
                            </span>



                            <span>
                                Category
                            </span>



                            <span>
                                Price
                            </span>



                            <span>
                                Stock
                            </span>



                            <span>
                                Actions
                            </span>

                        </div>



                        {renderProductRows(
                            accessoryProducts
                        )}

                    </div>

                </div>



            </section>

        </div>

    );

}



export default AdminProducts;