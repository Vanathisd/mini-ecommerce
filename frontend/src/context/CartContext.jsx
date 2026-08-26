import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

    const [cart, setCart] = useState([]);


    // GET PRODUCT ID
    const getProductId = (product) => {
        return product._id || product.id;
    };


    // ADD TO CART
    const addToCart = (product) => {

        const productId = getProductId(product);

        setCart((currentCart) => {

            const existingProduct = currentCart.find(
                (item) =>
                    getProductId(item) === productId
            );


            if (existingProduct) {

                return currentCart.map((item) => {

                    const itemId = getProductId(item);

                    return itemId === productId
                        ? {
                            ...item,
                            quantity: item.quantity + 1
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

                const itemId = getProductId(item);

                return itemId === id
                    ? {
                        ...item,
                        quantity: item.quantity + 1
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

                    const itemId = getProductId(item);

                    return itemId === id
                        ? {
                            ...item,
                            quantity: item.quantity - 1
                        }
                        : item;

                })
                .filter(
                    (item) => item.quantity > 0
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