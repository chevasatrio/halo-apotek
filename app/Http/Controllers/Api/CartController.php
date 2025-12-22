<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    /**
     * Get user's cart
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $cart = Cart::with(['items.product:id,name,price,image,stock,requires_prescription'])
            ->where('user_id', $user->id)
            ->first();

        if (!$cart) {
            $cart = Cart::create([
                'user_id' => $user->id,
                'total_price' => 0
            ]);
        }

        return response()->json([
            'status' => 'success',
            'data' => $cart
        ]);
    }

    /**
     * Add item to cart
     */
    public function addItem(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $product = Product::find($request->product_id);

        // Check stock
        if ($product->stock < $request->quantity) {
            return response()->json([
                'status' => 'error',
                'message' => 'Insufficient stock'
            ], 400);
        }

        try {
            // Get or create cart
            $cart = Cart::firstOrCreate(
                ['user_id' => $user->id],
                ['total_price' => 0]
            );

            // Check if item already in cart
            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->first();

            if ($cartItem) {
                // Update quantity
                $cartItem->increment('quantity', $request->quantity);
            } else {
                // Add new item
                $cartItem = CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'quantity' => $request->quantity,
                    'price' => $product->price
                ]);
            }

            // Update cart total
            $this->updateCartTotal($cart);

            return response()->json([
                'status' => 'success',
                'message' => 'Item added to cart',
                'data' => $cart->load('items.product')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to add item to cart: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function updateItem(Request $request, $itemId)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $cartItem = CartItem::with(['cart', 'product'])
            ->whereHas('cart', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->find($itemId);

        if (!$cartItem) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cart item not found'
            ], 404);
        }

        // Check stock
        if ($cartItem->product->stock < $request->quantity) {
            return response()->json([
                'status' => 'error',
                'message' => 'Insufficient stock'
            ], 400);
        }

        try {
            $cartItem->update(['quantity' => $request->quantity]);
            
            // Update cart total
            $this->updateCartTotal($cartItem->cart);

            return response()->json([
                'status' => 'success',
                'message' => 'Cart item updated',
                'data' => $cartItem->cart->load('items.product')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update cart item: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove item from cart
     */
    public function removeItem(Request $request, $itemId)
    {
        $user = $request->user();

        $cartItem = CartItem::with('cart')
            ->whereHas('cart', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->find($itemId);

        if (!$cartItem) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cart item not found'
            ], 404);
        }

        try {
            $cart = $cartItem->cart;
            $cartItem->delete();
            
            // Update cart total
            $this->updateCartTotal($cart);

            return response()->json([
                'status' => 'success',
                'message' => 'Item removed from cart',
                'data' => $cart->load('items.product')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to remove item from cart: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear cart
     */
    public function clear(Request $request)
    {
        $user = $request->user();

        $cart = Cart::where('user_id', $user->id)->first();

        if (!$cart) {
            return response()->json([
                'status' => 'success',
                'message' => 'Cart is already empty'
            ]);
        }

        try {
            $cart->items()->delete();
            $cart->update(['total_price' => 0]);

            return response()->json([
                'status' => 'success',
                'message' => 'Cart cleared successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to clear cart: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper method to update cart total
     */
    private function updateCartTotal(Cart $cart)
    {
        $total = $cart->items->sum(function ($item) {
            return $item->quantity * $item->price;
        });

        $cart->update(['total_price' => $total]);
    }
}