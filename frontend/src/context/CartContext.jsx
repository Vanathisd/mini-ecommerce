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

        const id =
            product._id ||
            product.id ||
            product.productId;

        if (!id) {
            return null;
        }

        return String(id);
    };


    // ==========================================
    // CART STORAGE KEY
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
            "💾 CART SAVED:",
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
                "Product ID missing:",
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

            const existingProduct =
                currentCart.find(
                    item =>
                        getProductId(item) ===
                        productId
                );


            if (existingProduct) {

                return currentCart.map(item => {

                    if (
                        getProductId(item) ===
                        productId
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

                });

            }


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
            return;
        }

        console.log(
            "🛒 ADD MULTIPLE:",
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


                if (!productId) {

                    console.error(
                        "Product ID missing:",
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
                                                item.quantity ||
                                                0
                                            ) + 1
                                    };

                                }

                                return item;

                            }
                        );

                } else {

                    updatedCart.push({

                        ...product,

                        quantity: 1

                    });

                }

            });


            console.log(
                "🛒 UPDATED AFTER MULTIPLE ADD:",
                updatedCart
            );

            return updatedCart;

        });

    };


    // ==========================================
    // CLEAR CART
    // ==========================================

    const clearCart = () => {

        console.log(
            "🗑️ CLEARING CART"
        );

        setCart([]);

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
                "🗑️ CART AFTER SINGLE REMOVE:",
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

            console.log(
                "⚠️ No products received for multiple remove"
            );

            return;
        }


        console.log(
            "🗑️ PRODUCTS RECEIVED FOR REMOVE:",
            products
        );


        const productIds =
            products
                .map(product =>
                    getProductId(product)
                )
                .filter(Boolean)
                .map(id =>
                    String(id)
                );


        console.log(
            "🆔 IDS TO REMOVE:",
            productIds
        );


        if (productIds.length === 0) {

            console.error(
                "❌ No valid product IDs found:",
                products
            );

            return;
        }


        setCart(currentCart => {

            console.log(
                "🛒 CART BEFORE MULTIPLE REMOVE:",
                currentCart
            );


            const updatedCart =
                currentCart.filter(item => {

                    const itemId =
                        getProductId(item);

                    const shouldRemove =
                        productIds.includes(
                            String(itemId)
                        );


                    console.log(
                        `Product: ${item.name} | ID: ${itemId} | Remove: ${shouldRemove}`
                    );


                    return !shouldRemove;

                });


            console.log(
                "🛒 CART AFTER MULTIPLE REMOVE:",
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

        const quantityToIncrease =
            Number(amount);

        const validAmount =
            Number.isFinite(quantityToIncrease) &&
            quantityToIncrease > 0
                ? Math.floor(quantityToIncrease)
                : 1;


        setCart(prevCart =>
            prevCart.map(item => {

                const id =
                    getProductId(item);


                if (
                    String(id) ===
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

            })
        );

    };


    // ==========================================
    // DECREASE QUANTITY
    // ==========================================

    const decreaseQuantity = (
        productId,
        amount = 1
    ) => {

        const quantityToDecrease =
            Number(amount);

        const validAmount =
            Number.isFinite(quantityToDecrease) &&
            quantityToDecrease > 0
                ? Math.floor(quantityToDecrease)
                : 1;


        setCart(prevCart =>

            prevCart

                .map(item => {

                    const id =
                        getProductId(item);


                    if (
                        String(id) ===
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
                )

        );

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

                cartTotal,

                clearCart

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