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


    const getCartKey = () => {

        if (user?.id) {

            return `cart_${user.id}`;

        }

        return "guest_cart";

    };


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



    const clearCart = () => {

        setCart([]);

    };



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
                item._id ||
                item.id;


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
                    item._id ||
                    item.id;


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