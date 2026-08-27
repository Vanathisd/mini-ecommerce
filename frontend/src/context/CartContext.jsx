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


    // GET PRODUCT ID
    const getProductId = (product) => {
        return product._id || product.id;
    };


    // GET USER-SPECIFIC CART KEY
    const getCartKey = () => {

        if (user?.id) {
            return `cart_${user.id}`;
        }

        return "guest_cart";
    };


    // LOAD CART WHEN USER CHANGES
    useEffect(() => {

        setCartLoaded(false);

        const cartKey = getCartKey();

        const savedCart =
            localStorage.getItem(cartKey);

        if (savedCart) {

            try {

                const parsedCart =
                    JSON.parse(savedCart);

                setCart(
                    Array.isArray(parsedCart)
                        ? parsedCart
                        : []
                );

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

    }, [user]);


    // SAVE CART
    useEffect(() => {

        if (!cartLoaded) {
            return;
        }

        const cartKey = getCartKey();

        localStorage.setItem(
            cartKey,
            JSON.stringify(cart)
        );

    }, [cart, user, cartLoaded]);


    // ADD TO CART
    const addToCart = (product) => {

        const productId =
            getProductId(product);

        setCart((currentCart) => {

            const existingProduct =
                currentCart.find(
                    (item) =>
                        getProductId(item) ===
                        productId
                );


            if (existingProduct) {

                return currentCart.map((item) => {

                    const itemId =
                        getProductId(item);

                    return itemId === productId
                        ? {
                            ...item,
                            quantity:
                                item.quantity + 1
                        }
                        : item;

                });

            }


            return [
                ...currentCart,
                {
                    ...product,
                    quantity: 1
                }
            ];

        });

    };


    // REMOVE FROM CART
    const removeFromCart = (id) => {

        setCart((currentCart) =>

            currentCart.filter(
                (item) =>
                    getProductId(item) !== id
            )

        );

    };


    // INCREASE QUANTITY
    const increaseQuantity = (id) => {

        setCart((currentCart) =>

            currentCart.map((item) => {

                const itemId =
                    getProductId(item);

                return itemId === id
                    ? {
                        ...item,
                        quantity:
                            item.quantity + 1
                    }
                    : item;

            })

        );

    };


    // DECREASE QUANTITY
    const decreaseQuantity = (id) => {

        setCart((currentCart) =>

            currentCart
                .map((item) => {

                    const itemId =
                        getProductId(item);

                    return itemId === id
                        ? {
                            ...item,
                            quantity:
                                item.quantity - 1
                        }
                        : item;

                })
                .filter(
                    (item) =>
                        item.quantity > 0
                )

        );

    };


    // CART TOTAL
    const cartTotal = cart.reduce(

        (total, item) =>
            total +
            Number(item.price) *
            item.quantity,

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
                cartTotal
            }}
        >

            {children}

        </CartContext.Provider>

    );

}


export function useCart() {

    return useContext(CartContext);

}