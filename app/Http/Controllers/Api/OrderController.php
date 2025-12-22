<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::with(['items.product', 'prescription', 'payments', 'delivery']);

        // Role-based filtering
        if ($user->isPembeli()) {
            $query->where('user_id', $user->id);
        } elseif ($user->isKasir()) {
            // Kasir can see all orders
        } elseif ($user->isDriver()) {
            // Driver can see orders assigned to them
            $query->whereHas('delivery', function ($q) use ($user) {
                $q->where('driver_id', $user->id);
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->has('payment_status')) {
            $query->where('payment_status', $request->payment_status);
        }

        // Search by order number
        if ($request->has('order_number')) {
            $query->where('order_number', 'like', '%' . $request->order_number . '%');
        }

        // Sort by latest
        $query->latest();

        $perPage = $request->get('per_page', 15);
        $orders = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->isPembeli()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only pembeli can create orders'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'cart_id' => 'required|exists:carts,id',
            'shipping_address' => 'required|string',
            'notes' => 'nullable|string',
            'payment_method' => 'required|in:cash,transfer,credit_card,qris',
            'prescription_image' => 'nullable|image|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $cart = Cart::with('items.product')->find($request->cart_id);

            // Check if cart belongs to user
            if ($cart->user_id != $user->id) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cart does not belong to user'
                ], 403);
            }

            // Check if cart is empty
            if ($cart->items->isEmpty()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cart is empty'
                ], 400);
            }

            // Check product stock and prescription requirements
            $requiresPrescription = false;
            foreach ($cart->items as $cartItem) {
                $product = $cartItem->product;
                
                // Check stock
                if ($product->stock < $cartItem->quantity) {
                    return response()->json([
                        'status' => 'error',
                        'message' => "Product {$product->name} is out of stock or insufficient stock"
                    ], 400);
                }

                // Check if prescription is required
                if ($product->requires_prescription) {
                    $requiresPrescription = true;
                }
            }

            // Generate order number
            $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(uniqid());

            // Create order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $user->id,
                'total_amount' => $cart->total_price,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $request->payment_method,
                'notes' => $request->notes,
                'shipping_address' => $request->shipping_address,
                'shipping_cost' => 0 // Calculate based on distance if needed
            ]);

            // Create order items and reduce stock
            foreach ($cart->items as $cartItem) {
                $order->items()->create([
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price,
                    'subtotal' => $cartItem->price * $cartItem->quantity
                ]);

                // Reduce product stock
                $cartItem->product->decrement('stock', $cartItem->quantity);
            }

            // Handle prescription if required
            if ($requiresPrescription && $request->hasFile('prescription_image')) {
                $prescriptionPath = $request->file('prescription_image')->store('prescriptions', 'public');
                
                Prescription::create([
                    'order_id' => $order->id,
                    'prescription_image' => $prescriptionPath,
                    'doctor_notes' => $request->prescription_notes,
                    'status' => 'pending'
                ]);

                // Update order status to waiting for approval
                $order->update(['status' => 'waiting_approval']);
            }

            // Clear cart
            $cart->items()->delete();
            $cart->update(['total_price' => 0]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Order created successfully',
                'data' => $order->load(['items.product', 'prescription'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::with(['items.product', 'prescription', 'payments', 'delivery.driver', 'user'])->find($id);

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        // Authorization check
        if ($user->isPembeli() && $order->user_id != $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $order
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,approved,rejected,shipped,delivered,cancelled',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Authorization based on role
        if ($user->isAdmin()) {
            if (in_array($request->status, ['approved', 'rejected', 'processing'])) {
                $order->update([
                    'status' => $request->status,
                    'approved_by' => $user->id,
                    'approved_at' => now(),
                    'notes' => $request->notes
                ]);
            }
        } elseif ($user->isKasir()) {
            if (in_array($request->status, ['processing'])) {
                $order->update([
                    'status' => $request->status,
                    'processed_by' => $user->id,
                    'processed_at' => now()
                ]);
            }
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Order status updated successfully',
            'data' => $order
        ]);
    }

    public function dashboardStats(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        $firstDayOfMonth = Carbon::now()->firstOfMonth();
        $firstDayOfWeek = Carbon::now()->startOfWeek();

        $stats = [];

        if ($user->isAdmin()) {
            // Admin Dashboard Statistics
            $stats = [
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'waiting_approval_orders' => Order::where('status', 'waiting_approval')->count(),
                'processing_orders' => Order::where('status', 'processing')->count(),
                'today_orders' => Order::whereDate('created_at', $today)->count(),
                'week_orders' => Order::whereDate('created_at', '>=', $firstDayOfWeek)->count(),
                'month_orders' => Order::whereDate('created_at', '>=', $firstDayOfMonth)->count(),
                'total_revenue' => Order::where('payment_status', 'paid')->sum('total_amount'),
                'today_revenue' => Order::whereDate('created_at', $today)
                    ->where('payment_status', 'paid')
                    ->sum('total_amount'),
                'awaiting_prescription' => Prescription::where('status', 'pending')->count(),
                'low_stock_products' => \App\Models\Product::where('stock', '<', 10)->count(),
                'active_users' => \App\Models\User::where('is_active', true)->count(),
                'total_drivers' => \App\Models\User::where('role', 'driver')
                    ->where('is_active', true)
                    ->count(),
            ];

            // Recent orders for admin
            $recentOrders = Order::with(['user:id,name'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(['id', 'order_number', 'user_id', 'total_amount', 'status', 'created_at']);

            $stats['recent_orders'] = $recentOrders;

        } elseif ($user->isKasir()) {
            // Kasir Dashboard Statistics
            $stats = [
                'today_orders' => Order::whereDate('created_at', $today)->count(),
                'pending_payments' => Order::where('payment_status', 'pending')
                    ->whereIn('status', ['waiting_payment', 'pending'])
                    ->count(),
                'processing_orders' => Order::where('status', 'processing')->count(),
                'today_revenue' => Order::whereDate('created_at', $today)
                    ->where('payment_status', 'paid')
                    ->sum('total_amount'),
                'unprocessed_orders' => Order::where('status', 'approved')
                    ->whereNull('processed_by')
                    ->count(),
                'cash_transactions_today' => Order::whereDate('created_at', $today)
                    ->where('payment_method', 'cash')
                    ->where('payment_status', 'paid')
                    ->count(),
            ];

            // Orders waiting for processing
            $waitingProcessing = Order::with(['user:id,name'])
                ->where('status', 'approved')
                ->whereNull('processed_by')
                ->orderBy('created_at', 'asc')
                ->limit(10)
                ->get(['id', 'order_number', 'user_id', 'total_amount', 'payment_method', 'created_at']);

            $stats['waiting_processing'] = $waitingProcessing;

        } elseif ($user->isPembeli()) {
            // Pembeli Dashboard Statistics
            $stats = [
                'my_orders' => Order::where('user_id', $user->id)->count(),
                'pending_orders' => Order::where('user_id', $user->id)
                    ->whereIn('status', ['pending', 'waiting_approval', 'processing'])
                    ->count(),
                'completed_orders' => Order::where('user_id', $user->id)
                    ->whereIn('status', ['delivered', 'completed'])
                    ->count(),
                'cancelled_orders' => Order::where('user_id', $user->id)
                    ->where('status', 'cancelled')
                    ->count(),
                'total_spent' => Order::where('user_id', $user->id)
                    ->where('payment_status', 'paid')
                    ->sum('total_amount'),
                'last_order' => Order::where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->first(['order_number', 'status', 'created_at']),
            ];

            // Recent orders for pembeli
            $recentOrders = Order::with(['items.product:id,name'])
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['id', 'order_number', 'total_amount', 'status', 'payment_status', 'created_at']);

            $stats['recent_orders'] = $recentOrders;

        } elseif ($user->isDriver()) {
            // Driver Dashboard Statistics
            $stats = [
                'total_deliveries' => \App\Models\Delivery::where('driver_id', $user->id)->count(),
                'pending_deliveries' => \App\Models\Delivery::where('driver_id', $user->id)
                    ->where('status', 'pending')
                    ->count(),
                'today_deliveries' => \App\Models\Delivery::where('driver_id', $user->id)
                    ->whereDate('created_at', $today)
                    ->count(),
                'completed_deliveries' => \App\Models\Delivery::where('driver_id', $user->id)
                    ->where('status', 'delivered')
                    ->count(),
                'active_deliveries' => \App\Models\Delivery::where('driver_id', $user->id)
                    ->whereIn('status', ['accepted', 'picked_up', 'on_delivery'])
                    ->count(),
                'earnings_today' => \App\Models\Delivery::where('driver_id', $user->id)
                    ->whereDate('created_at', $today)
                    ->where('status', 'delivered')
                    ->count() * 15000, // Rp 15.000 per delivery contoh
            ];

            // Today's deliveries
            $todayDeliveries = \App\Models\Delivery::with(['order.user:id,name'])
                ->where('driver_id', $user->id)
                ->whereDate('created_at', $today)
                ->orderBy('created_at', 'desc')
                ->get(['id', 'order_id', 'status', 'delivery_address', 'created_at']);

            $stats['today_deliveries_list'] = $todayDeliveries;
        }

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }

    /**
     * Get order history for current user
     */
    public function history(Request $request)
    {
        $user = $request->user();
        
        $query = Order::with(['items.product:id,name,image', 'prescription'])
            ->where('user_id', $user->id);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                Carbon::parse($request->start_date)->startOfDay(),
                Carbon::parse($request->end_date)->endOfDay()
            ]);
        }

        // Search by order number
        if ($request->has('search')) {
            $query->where('order_number', 'like', '%' . $request->search . '%');
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    /**
     * Cancel order
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        // Check if user owns the order
        if ($user->isPembeli() && $order->user_id != $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if order can be cancelled
        if (!in_array($order->status, ['pending', 'waiting_approval', 'waiting_payment'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order cannot be cancelled at this stage'
            ], 400);
        }

        try {
            DB::beginTransaction();

            // Restore product stock
            foreach ($order->items as $item) {
                $item->product->increment('stock', $item->quantity);
            }

            // Update order status
            $order->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancelled_by' => $user->id,
                'cancellation_reason' => $request->reason
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Order cancelled successfully',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to cancel order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload payment proof
     */
    public function uploadPaymentProof(Request $request, $id)
    {
        $user = $request->user();
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        // Check if user owns the order
        if ($user->isPembeli() && $order->user_id != $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        // Check if payment proof can be uploaded
        if ($order->payment_status != 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment proof cannot be uploaded for this order'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'payment_proof' => 'required|image|max:5120',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Upload payment proof
            $proofPath = $request->file('payment_proof')->store('payment-proofs', 'public');

            // Create payment record
            $payment = \App\Models\Payment::create([
                'order_id' => $order->id,
                'payment_number' => 'PAY-' . date('Ymd') . '-' . strtoupper(uniqid()),
                'amount' => $order->total_amount,
                'method' => $order->payment_method,
                'payment_proof' => $proofPath,
                'status' => 'pending',
                'notes' => $request->notes
            ]);

            // Update order payment status
            $order->update([
                'payment_status' => 'waiting_verification'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Payment proof uploaded successfully',
                'data' => $payment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload payment proof: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order invoice
     */
    public function invoice($orderNumber)
    {
        $order = Order::with([
            'user:id,name,email,phone,address',
            'items.product:id,name,price',
            'payments'
        ])->where('order_number', $orderNumber)->first();

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        $invoiceData = [
            'invoice_number' => 'INV-' . $order->order_number,
            'order' => $order,
            'company' => [
                'name' => 'Halo Apotek',
                'address' => 'Jl. Apotek No. 123, Jakarta',
                'phone' => '(021) 1234-5678',
                'email' => 'info@haloapotek.com'
            ],
            'issued_date' => now()->format('d/m/Y'),
            'due_date' => now()->addDays(1)->format('d/m/Y')
        ];

        return response()->json([
            'status' => 'success',
            'data' => $invoiceData
        ]);
    }

    /**
     * Get order status timeline
     */
    public function statusTimeline($id)
    {
        $order = Order::with(['delivery'])->find($id);

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        $timeline = [];

        // Order created
        $timeline[] = [
            'status' => 'order_created',
            'title' => 'Pesanan Dibuat',
            'description' => 'Pesanan berhasil dibuat',
            'date' => $order->created_at,
            'completed' => true
        ];

        // Payment verification
        if ($order->payment_status == 'paid') {
            $payment = $order->payments()->where('status', 'verified')->first();
            $timeline[] = [
                'status' => 'payment_verified',
                'title' => 'Pembayaran Diverifikasi',
                'description' => 'Pembayaran telah diverifikasi oleh kasir',
                'date' => $payment ? $payment->verified_at : null,
                'completed' => true
            ];
        } elseif ($order->payment_status == 'waiting_verification') {
            $timeline[] = [
                'status' => 'payment_pending',
                'title' => 'Menunggu Verifikasi Pembayaran',
                'description' => 'Bukti pembayaran sedang diverifikasi',
                'date' => null,
                'completed' => false
            ];
        } else {
            $timeline[] = [
                'status' => 'payment_required',
                'title' => 'Menunggu Pembayaran',
                'description' => 'Silakan lakukan pembayaran',
                'date' => null,
                'completed' => false
            ];
        }

        // Prescription approval (if needed)
        if ($order->prescription) {
            if ($order->prescription->status == 'approved') {
                $timeline[] = [
                    'status' => 'prescription_approved',
                    'title' => 'Resep Disetujui',
                    'description' => 'Resep telah disetujui oleh apoteker',
                    'date' => $order->prescription->verified_at,
                    'completed' => true
                ];
            } elseif ($order->prescription->status == 'rejected') {
                $timeline[] = [
                    'status' => 'prescription_rejected',
                    'title' => 'Resep Ditolak',
                    'description' => $order->prescription->rejection_reason,
                    'date' => $order->prescription->verified_at,
                    'completed' => true,
                    'rejected' => true
                ];
            } else {
                $timeline[] = [
                    'status' => 'prescription_review',
                    'title' => 'Resep Dalam Review',
                    'description' => 'Resep sedang ditinjau oleh apoteker',
                    'date' => null,
                    'completed' => false
                ];
            }
        }

        // Order processing
        if ($order->status == 'processing') {
            $timeline[] = [
                'status' => 'order_processing',
                'title' => 'Pesanan Diproses',
                'description' => 'Pesanan sedang dipersiapkan oleh apotek',
                'date' => $order->processed_at,
                'completed' => true
            ];
        } elseif (in_array($order->status, ['approved', 'processing'])) {
            $timeline[] = [
                'status' => 'order_processing',
                'title' => 'Pesanan Diproses',
                'description' => 'Pesanan sedang dipersiapkan oleh apotek',
                'date' => null,
                'completed' => false
            ];
        }

        // Delivery
        if ($order->delivery) {
            $delivery = $order->delivery;
            
            switch ($delivery->status) {
                case 'pending':
                    $timeline[] = [
                        'status' => 'waiting_driver',
                        'title' => 'Menunggu Driver',
                        'description' => 'Pesanan menunggu driver untuk pengiriman',
                        'date' => null,
                        'completed' => false
                    ];
                    break;
                    
                case 'accepted':
                    $timeline[] = [
                        'status' => 'driver_assigned',
                        'title' => 'Driver Ditetapkan',
                        'description' => 'Driver telah ditetapkan untuk pengiriman',
                        'date' => $delivery->updated_at,
                        'completed' => true
                    ];
                    break;
                    
                case 'picked_up':
                    $timeline[] = [
                        'status' => 'order_picked',
                        'title' => 'Pesanan Diambil',
                        'description' => 'Driver telah mengambil pesanan dari apotek',
                        'date' => $delivery->picked_up_at,
                        'completed' => true
                    ];
                    break;
                    
                case 'on_delivery':
                    $timeline[] = [
                        'status' => 'on_delivery',
                        'title' => 'Dalam Pengiriman',
                        'description' => 'Pesanan sedang dalam perjalanan',
                        'date' => $delivery->updated_at,
                        'completed' => true
                    ];
                    break;
                    
                case 'delivered':
                    $timeline[] = [
                        'status' => 'delivered',
                        'title' => 'Pesanan Dikirim',
                        'description' => 'Pesanan telah sampai di tujuan',
                        'date' => $delivery->delivered_at,
                        'completed' => true
                    ];
                    break;
            }
        }

        // Order completed
        if ($order->status == 'delivered') {
            $timeline[] = [
                'status' => 'order_completed',
                'title' => 'Pesanan Selesai',
                'description' => 'Pesanan telah selesai',
                'date' => $order->updated_at,
                'completed' => true
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $timeline
        ]);
    }

    /**
     * Get sales report
     */
    public function salesReport(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && !$user->isKasir()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'group_by' => 'sometimes|in:daily,weekly,monthly'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $startDate = Carbon::parse($request->start_date)->startOfDay();
        $endDate = Carbon::parse($request->end_date)->endOfDay();
        $groupBy = $request->get('group_by', 'daily');

        $query = Order::whereBetween('created_at', [$startDate, $endDate])
            ->where('payment_status', 'paid');

        // Group by period
        if ($groupBy == 'daily') {
            $query->select(
                DB::raw('DATE(created_at) as period'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as total_revenue'),
                DB::raw('AVG(total_amount) as avg_order_value')
            )->groupBy('period');
        } elseif ($groupBy == 'weekly') {
            $query->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('WEEK(created_at) as week'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as total_revenue'),
                DB::raw('AVG(total_amount) as avg_order_value')
            )->groupBy('year', 'week');
        } else { // monthly
            $query->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(total_amount) as total_revenue'),
                DB::raw('AVG(total_amount) as avg_order_value')
            )->groupBy('year', 'month');
        }

        $report = $query->orderBy('period', 'asc')->get();

        // Top products
        $topProducts = \App\Models\OrderItem::select(
            'product_id',
            DB::raw('SUM(quantity) as total_quantity'),
            DB::raw('SUM(subtotal) as total_revenue')
        )
        ->whereHas('order', function ($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate])
              ->where('payment_status', 'paid');
        })
        ->with('product:id,name')
        ->groupBy('product_id')
        ->orderBy('total_quantity', 'desc')
        ->limit(10)
        ->get();

        // Payment method distribution
        $paymentMethods = Order::select(
            'payment_method',
            DB::raw('COUNT(*) as count'),
            DB::raw('SUM(total_amount) as total_amount')
        )
        ->whereBetween('created_at', [$startDate, $endDate])
        ->where('payment_status', 'paid')
        ->groupBy('payment_method')
        ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'period' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'group_by' => $groupBy
                ],
                'summary' => [
                    'total_orders' => $report->sum('total_orders'),
                    'total_revenue' => $report->sum('total_revenue'),
                    'avg_order_value' => $report->avg('avg_order_value')
                ],
                'trends' => $report,
                'top_products' => $topProducts,
                'payment_methods' => $paymentMethods
            ]
        ]);
    }

    /**
     * Get orders that need approval (for admin)
     */
    public function pendingApproval(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $orders = Order::with(['user:id,name', 'prescription'])
            ->where(function ($query) {
                $query->where('status', 'waiting_approval')
                      ->orWhere(function ($q) {
                          $q->where('payment_status', 'waiting_verification')
                            ->where('status', 'pending');
                      });
            })
            ->orderBy('created_at', 'asc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }

    /**
     * Assign driver to order
     */
    public function assignDriver(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && !$user->isKasir()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'status' => 'error',
                'message' => 'Order not found'
            ], 404);
        }

        // Check if order is ready for delivery
        if ($order->status != 'processing' && $order->payment_status != 'paid') {
            return response()->json([
                'status' => 'error',
                'message' => 'Order is not ready for delivery'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'driver_id' => 'required|exists:users,id',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user is a driver
        $driver = \App\Models\User::find($request->driver_id);
        if (!$driver->isDriver()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Selected user is not a driver'
            ], 400);
        }

        try {
            // Create or update delivery record
            $delivery = \App\Models\Delivery::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'driver_id' => $request->driver_id,
                    'tracking_number' => 'TRK-' . strtoupper(uniqid()),
                    'status' => 'pending',
                    'delivery_address' => $order->shipping_address,
                    'notes' => $request->notes
                ]
            );

            // Update order status
            $order->update(['status' => 'shipped']);

            return response()->json([
                'status' => 'success',
                'message' => 'Driver assigned successfully',
                'data' => $delivery
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to assign driver: ' . $e->getMessage()
            ], 500);
        }
    }
}