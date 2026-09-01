import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import { useAuth } from "./authContext.jsx";


const CartContext =
    createContext();


export function CartProvider({ children }) {

    const { user } = useAuth();


    const [cart, setCart] =
        useState([]);


    const [cartLoaded, setCartLoaded] =
        useState(false);


    // ==================================================
    // GET PRODUCT ID
    // ==================================================

    const getProductId = (product) => {

        return product?._id || product?.id;

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
            localStorage.getItem(
                cartKey
            );


        if (savedCart) {

            try {

                const parsedCart =
                    JSON.parse(
                        savedCart
                    );


                setCart(
                    Array.isArray(
                        parsedCart
                    )
                        ? parsedCart
                        : []
                );

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

            JSON.stringify(
                cart
            )

        );

    }, [
        cart,
        user,
        cartLoaded
    ]);



    const addToCart = (
        product,
        quantity = 1
    ) => {

        if (!product) {

            return;

        }


        const productId =
            getProductId(
                product
            );


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
            Number.isFinite(
                requestedQuantity
            ) &&
            requestedQuantity > 0

                ? Math.floor(
                    requestedQuantity
                )

                : 1;


        setCart(
            currentCart => {

                const existingProduct =
                    currentCart.find(
                        item =>
                            getProductId(
                                item
                            ) === productId
                    );



                if (existingProduct) {

                    return currentCart.map(
                        item => {

                            if (
                                getProductId(
                                    item
                                ) === productId
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


                return [

                    ...currentCart,

                    {

                        ...product,

                        quantity:
                            validQuantity

                    }

                ];

            }
        );

    };


const clearCart = () => {

    setCart([]);

};

    const removeFromCart = (
        productId
    ) => {

        if (!productId) {

            return;

        }


        setCart(
            currentCart =>

                currentCart.filter(
                    item =>
                        getProductId(
                            item
                        ) !== productId
                )

        );

    };


    const increaseQuantity = (
        productId
    ) => {

        setCart(
            currentCart =>

                currentCart.map(
                    item =>

                        getProductId(
                            item
                        ) === productId

                            ? {

                                ...item,

                                quantity:
                                    Number(
                                        item.quantity || 0
                                    ) + 1

                            }

                            : item
                )

        );

    };


    const decreaseQuantity = (
        productId
    ) => {

        setCart(
            currentCart =>

                currentCart

                    .map(
                        item =>

                            getProductId(
                                item
                            ) === productId

                                ? {

                                    ...item,

                                    quantity:
                                        Number(
                                            item.quantity || 0
                                        ) - 1

                                }

                                : item
                    )

                    .filter(
                        item =>
                            item.quantity > 0
                    )

        );

    };



    const cartTotal =
        cart.reduce(

            (total, item) =>

                total +
                Number(
                    item.price || 0
                ) *
                Number(
                    item.quantity || 0
                ),

            0

        );


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


export function useCart() {

    return useContext(
        CartContext
    );

}