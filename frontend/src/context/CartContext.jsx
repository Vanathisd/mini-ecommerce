import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { useAuth } from "./authContext.jsx";

const CartContext = createContext();

export function CartProvider({ children }) {

    const { user } = useAuth();

    const [cart, setCart] = useState([]);

    const [cartLoaded, setCartLoaded] = useState(false);


    // ==========================================
    // GET PRODUCT ID
    // ==========================================

    const getProductId = (product) => {

        if (!product) {
            return null;
        }

        return String(
            product._id ||
            product.id ||
            product.productId ||
            ""
        );

    };


    // ==========================================
    // GET CART KEY
    // ==========================================

    const getCartKey = () => {

        if (user?.id) {
            return `cart_${user.id}`;
        }

        return "guest_cart";

    };


    // ==========================================
    // LOAD CART
    // ==========================================

    useEffect(() => {

        setCartLoaded(false);

        const cartKey = getCartKey();

        const savedCart =
            localStorage.getItem(cartKey);

        console.log(
            "📦 LOADING CART:",
            cartKey,
            savedCart
        );

        if (savedCart) {

            try {

                const parsedCart =
                    JSON.parse(savedCart);

                if (Array.isArray(parsedCart)) {

                    setCart(parsedCart);

                } else {

                    setCart([]);

                }

            } catch (error) {

                console.error(
                    "Failed to load cart:",
                    error
                );

                setCart([]);

            }

        } else {

            setCart([]);

        }

        setCartLoaded(true);

    }, [user?.id]);


    // ==========================================
    // SAVE CART
    // ==========================================

    useEffect(() => {

        if (!cartLoaded) {
            return;
        }

        const cartKey = getCartKey();

        localStorage.setItem(
            cartKey,
            JSON.stringify(cart)
        );

        console.log(
            "💾 SAVED CART:",
            cart
        );

    }, [
        cart,
        user?.id,
        cartLoaded
    ]);


    // ==========================================
    // ADD SINGLE PRODUCT
    // ==========================================

    const addToCart = (
        product,
        quantity = 1
    ) => {

        if (!product) {
            return;
        }

        const productId =
            getProductId(product);

        if (!productId) {

            console.error(
                "❌ PRODUCT ID MISSING:",
                product
            );

            return;
        }

        const requestedQuantity =
            Number(quantity);

        const validQuantity =
            Number.isFinite(requestedQuantity) &&
            requestedQuantity > 0
                ? Math.floor(requestedQuantity)
                : 1;


        setCart(currentCart => {

            const existingIndex =
                currentCart.findIndex(
                    item =>
                        getProductId(item) ===
                        productId
                );


            // Product already exists
            if (existingIndex !== -1) {

                return currentCart.map(
                    (item, index) => {

                        if (
                            index ===
                            existingIndex
                        ) {

                            return {
                                ...item,
                                quantity:
                                    Number(
                                        item.quantity || 0
                                    ) +
                                    validQuantity
                            };

                        }

                        return item;

                    }
                );

            }


            // New product
            return [
                ...currentCart,
                {
                    ...product,
                    quantity: validQuantity
                }
            ];

        });

    };


    // ==========================================
    // ADD MULTIPLE PRODUCTS
    // ==========================================

    const addMultipleToCart = (products) => {

        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            console.error(
                "❌ INVALID MULTIPLE PRODUCTS:",
                products
            );

            return;
        }


        console.log(
            "🟢 ADD MULTIPLE START:",
            products
        );


        setCart(currentCart => {

            let updatedCart =
                [...currentCart];


            products.forEach(product => {

                if (!product) {
                    return;
                }


                const productId =
                    getProductId(product);


                console.log(
                    "➕ PRODUCT:",
                    product.name,
                    "ID:",
                    productId
                );


                if (!productId) {

                    console.error(
                        "❌ PRODUCT HAS NO ID:",
                        product
                    );

                    return;
                }


                const existingIndex =
                    updatedCart.findIndex(
                        item =>
                            getProductId(item) ===
                            productId
                    );


                if (existingIndex !== -1) {

                    // Already in cart
                    updatedCart =
                        updatedCart.map(
                            (item, index) => {

                                if (
                                    index ===
                                    existingIndex
                                ) {

                                    return {
                                        ...item,
                                        quantity:
                                            Number(
                                                item.quantity || 0
                                            ) + 1
                                    };

                                }

                                return item;

                            }
                        );

                } else {

                    // New product
                    updatedCart.push({

                        ...product,

                        quantity: 1

                    });

                }

            });


            console.log(
                "🟢 CART AFTER MULTIPLE ADD:",
                updatedCart
            );


            return updatedCart;

        });

    };


    // ==========================================
    // REMOVE SINGLE PRODUCT
    // ==========================================

    const removeFromCart = (productId) => {

        if (!productId) {
            return;
        }


        const normalizedId =
            String(productId);


        setCart(currentCart => {

            const updatedCart =
                currentCart.filter(
                    item =>
                        getProductId(item) !==
                        normalizedId
                );


            console.log(
                "🔴 CART AFTER SINGLE REMOVE:",
                updatedCart
            );


            return updatedCart;

        });

    };


    // ==========================================
    // REMOVE MULTIPLE PRODUCTS
    // ==========================================

    const removeMultipleFromCart = (products) => {

        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            console.error(
                "❌ INVALID REMOVE PRODUCTS:",
                products
            );

            return;

        }


        console.log(
            "🔴 REMOVE MULTIPLE START:",
            products
        );


        const idsToRemove =
            products
                .map(product =>
                    getProductId(product)
                )
                .filter(id => id);


        const namesToRemove =
            products
                .map(product =>
                    String(
                        product?.name || ""
                    )
                        .trim()
                        .toLowerCase()
                )
                .filter(name => name);


        console.log(
            "🆔 IDS TO REMOVE:",
            idsToRemove
        );

        console.log(
            "🏷️ NAMES TO REMOVE:",
            namesToRemove
        );


        setCart(currentCart => {

            console.log(
                "🛒 CART BEFORE REMOVE:",
                currentCart
            );


            const updatedCart =
                currentCart.filter(item => {

                    const itemId =
                        getProductId(item);

                    const itemName =
                        String(
                            item?.name || ""
                        )
                            .trim()
                            .toLowerCase();


                    const removeById =
                        idsToRemove.includes(
                            itemId
                        );


                    const removeByName =
                        namesToRemove.includes(
                            itemName
                        );


                    const shouldRemove =
                        removeById ||
                        removeByName;


                    console.log(
                        "CHECK:",
                        item.name,
                        "| ID:",
                        itemId,
                        "| remove:",
                        shouldRemove
                    );


                    return !shouldRemove;

                });


            console.log(
                "🔴 CART AFTER REMOVE:",
                updatedCart
            );


            return updatedCart;

        });

    };


    // ==========================================
    // INCREASE QUANTITY
    // ==========================================

    const increaseQuantity = (
        productId,
        amount = 1
    ) => {

        const validAmount =
            Number(amount) > 0
                ? Math.floor(Number(amount))
                : 1;


        setCart(currentCart => {

            return currentCart.map(item => {

                if (
                    getProductId(item) ===
                    String(productId)
                ) {

                    return {
                        ...item,
                        quantity:
                            Number(
                                item.quantity || 1
                            ) +
                            validAmount
                    };

                }

                return item;

            });

        });

    };


    // ==========================================
    // DECREASE QUANTITY
    // ==========================================

    const decreaseQuantity = (
        productId,
        amount = 1
    ) => {

        const validAmount =
            Number(amount) > 0
                ? Math.floor(Number(amount))
                : 1;


        setCart(currentCart => {

            return currentCart

                .map(item => {

                    if (
                        getProductId(item) ===
                        String(productId)
                    ) {

                        return {
                            ...item,
                            quantity:
                                Number(
                                    item.quantity || 1
                                ) -
                                validAmount
                        };

                    }

                    return item;

                })

                .filter(
                    item =>
                        Number(
                            item.quantity || 0
                        ) > 0
                );

        });

    };


    // ==========================================
    // CLEAR CART
    // ==========================================

    const clearCart = () => {

        console.log(
            "🗑️ CLEAR CART"
        );

        setCart([]);

    };


    // ==========================================
    // CART TOTAL
    // ==========================================

    const cartTotal =
        cart.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    Number(
                        item.price || 0
                    ) *
                    Number(
                        item.quantity || 0
                    )
                );

            },
            0
        );


    // ==========================================
    // PROVIDER
    // ==========================================

    return (

        <CartContext.Provider
            value={{

                cart,

                addToCart,

                addMultipleToCart,

                removeFromCart,

                removeMultipleFromCart,

                increaseQuantity,

                decreaseQuantity,

                clearCart,

                cartTotal

            }}
        >

            {children}

        </CartContext.Provider>

    );

}


export function useCart() {

    return useContext(
        CartContext
    );

}