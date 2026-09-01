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


    const [cartLoaded, setCartLoaded] =
        useState(false);


    // ==================================================
    // GET PRODUCT ID
    // ==================================================

    const getProductId = (product) => {

        if (!product) {
            return null;
        }

        const id =
            product._id ||
            product.id;

        if (!id) {
            return null;
        }

        return String(id);

    };


    // ==================================================
    // GET CART KEY
    // ==================================================

    const getCartKey = () => {

        if (user?.id) {

            return `cart_${user.id}`;

        }

        return "guest_cart";

    };


    // ==================================================
    // LOAD CART
    // ==================================================

    useEffect(() => {

        setCartLoaded(false);


        const cartKey =
            getCartKey();


        const savedCart =
            localStorage.getItem(cartKey);


        if (savedCart) {

            try {

                const parsedCart =
                    JSON.parse(savedCart);


                if (
                    Array.isArray(parsedCart)
                ) {

                    setCart(parsedCart);

                }

                else {

                    setCart([]);

                }

            }

            catch (error) {

                console.error(
                    "Failed to load cart:",
                    error
                );

                setCart([]);

            }

        }

        else {

            setCart([]);

        }


        setCartLoaded(true);

    }, [user]);


    // ==================================================
    // SAVE CART
    // ==================================================

    useEffect(() => {

        if (!cartLoaded) {
            return;
        }


        const cartKey =
            getCartKey();


        localStorage.setItem(
            cartKey,
            JSON.stringify(cart)
        );

    }, [
        cart,
        user,
        cartLoaded
    ]);


    // ==================================================
    // ADD TO CART
    // ==================================================

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
                        getProductId(item) === productId
                );


            // ------------------------------------------
            // PRODUCT ALREADY EXISTS
            // ------------------------------------------

            if (existingProduct) {

                return currentCart.map(item => {

                    if (
                        getProductId(item) === productId
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


            // ------------------------------------------
            // NEW PRODUCT
            // ------------------------------------------

            return [

                ...currentCart,

                {

                    ...product,

                    quantity:
                        validQuantity

                }

            ];

        });

    };


    // ==================================================
    // CLEAR CART
    // ==================================================

    const clearCart = () => {

        setCart([]);

    };


    // ==================================================
    // REMOVE PRODUCT COMPLETELY
    // ==================================================

    const removeFromCart = (
        productId
    ) => {

        if (!productId) {
            return;
        }


        const normalizedId =
            String(productId);


        setCart(currentCart =>

            currentCart.filter(
                item =>
                    getProductId(item) !== normalizedId
            )

        );

    };


    // ==================================================
    // INCREASE QUANTITY
    // ==================================================

    const increaseQuantity = (
        productId
    ) => {

        if (!productId) {
            return;
        }


        const normalizedId =
            String(productId);


        console.log(
            "INCREASE CART PRODUCT ID:",
            normalizedId
        );


        setCart(prevCart =>

            prevCart.map(item => {

                const itemId =
                    getProductId(item);


                console.log(
                    "CHECK INCREASE:",
                    item.name,
                    itemId,
                    normalizedId
                );


                if (
                    itemId === normalizedId
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

            })

        );

    };


    // ==================================================
    // DECREASE QUANTITY
    // ==================================================

    const decreaseQuantity = (
        productId
    ) => {

        if (!productId) {
            return;
        }


        const normalizedId =
            String(productId);


        console.log(
            "DECREASE CART PRODUCT ID:",
            normalizedId
        );


        setCart(prevCart => {

            console.log(
                "CURRENT CART BEFORE DECREASE:",
                prevCart
            );


            return prevCart

                .map(item => {

                    const itemId =
                        getProductId(item);


                    console.log(
                        "CHECK DECREASE:",
                        item.name,
                        "ITEM ID:",
                        itemId,
                        "TARGET ID:",
                        normalizedId,
                        "QUANTITY:",
                        item.quantity
                    );


                    if (
                        itemId === normalizedId
                    ) {

                        const currentQuantity =
                            Number(
                                item.quantity || 1
                            );


                        return {

                            ...item,

                            quantity:
                                currentQuantity - 1

                        };

                    }


                    return item;

                })


                // --------------------------------------
                // Remove item if quantity reaches 0
                // --------------------------------------

                .filter(
                    item =>
                        Number(
                            item.quantity || 0
                        ) > 0
                );

        });

    };


    // ==================================================
    // CART TOTAL
    // ==================================================

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


    // ==================================================
    // PROVIDER
    // ==================================================

    return (

        <CartContext.Provider
            value={{

                cart,

                addToCart,

                removeFromCart,

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


// ==================================================
// USE CART
// ==================================================

export function useCart() {

    return useContext(
        CartContext
    );

}