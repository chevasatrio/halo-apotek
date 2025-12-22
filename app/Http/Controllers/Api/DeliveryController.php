<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class DeliveryController extends Controller
{
    /**
     * Get list of deliveries
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Delivery::with([
            'order:id,order_number,user_id,total_amount,status,shipping_address',
            'order.user:id,name,phone',
            'driver:id,name,phone'
        ]);

        // Role-based filtering
        if ($user->isDriver()) {
            $query->where('driver_id', $user->id);
        } elseif ($user->isPembeli()) {
            $query->whereHas('order', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }
        // Admin and Kasir can see all deliveries

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // Search by tracking number
        if ($request->has('tracking_number')) {
            $query->where('tracking_number', 'like', '%' . $request->tracking_number . '%');
        }

        // Sort by priority: pending first, then by creation date
        $query->orderByRaw("FIELD(status, 'pending', 'accepted', 'picked_up', 'on_delivery', 'delivered', 'cancelled')")
              ->orderBy('created_at', 'desc');

        $deliveries = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $deliveries
        ]);
    }

    /**
     * Get delivery details
     */
    public function show($id)
    {
        $delivery = Delivery::with([
            'order:id,order_number,user_id,total_amount,status,shipping_address,notes',
            'order.user:id,name,email,phone,address',
            'order.items.product:id,name,price,image',
            'driver:id,name,phone,vehicle_number,driver_license',
            'order.payments:id,order_id,status,payment_proof'
        ])->find($id);

        if (!$delivery) {
            return response()->json([
                'status' => 'error',
                'message' => 'Delivery not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $delivery
        ]);
    }

    /**
     * Accept delivery assignment (for drivers)
     */
    public function accept(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only drivers can accept deliveries'
            ], 403);
        }

        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json([
                'status' => 'error',
                'message' => 'Delivery not found'
            ], 404);
        }

        // Check if delivery is already assigned to another driver
        if ($delivery->driver_id && $delivery->driver_id != $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Delivery already assigned to another driver'
            ], 400);
        }

        // Check if delivery is in pending status
        if ($delivery->status != 'pending') {
            return response()->json([
                'status' => 'error',
                'message' => 'Delivery cannot be accepted in current status'
            ], 400);
        }

        try {
            $delivery->update([
                'driver_id' => $user->id,
                'status' => 'accepted',
                'accepted_at' => now()
            ]);

            // Update order status to "on_delivery"
            $delivery->order->update([
                'status' => 'on_delivery'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Delivery accepted successfully',
                'data' => $delivery
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to accept delivery: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update delivery status (for drivers)
     */
    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only drivers can update delivery status'
            ], 403);
        }

        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json([
                'status' => 'error',
                'message' => 'Delivery not found'
            ], 404);
        }

        // Check if delivery is assigned to this driver
        if ($delivery->driver_id != $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Delivery not assigned to you'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:picked_up,on_delivery,delivered,cancelled',
            'notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validate status transition
        $validTransitions = [
            'accepted' => ['picked_up', 'cancelled'],
            'picked_up' => ['on_delivery', 'cancelled'],
            'on_delivery' => ['delivered', 'cancelled'],
            'delivered' => [],
            'cancelled' => []
        ];

        if (!in_array($request->status, $validTransitions[$delivery->status] ?? [])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid status transition from ' . $delivery->status . ' to ' . $request->status
            ], 400);
        }

        try {
            $updateData = [
                'status' => $request->status,
                'notes' => $request->notes ?? $delivery->notes
            ];

            // Set timestamps based on status
            switch ($request->status) {
                case 'picked_up':
                    $updateData['picked_up_at'] = now();
                    break;
                    
                case 'delivered':
                    $updateData['delivered_at'] = now();
                    
                    // Update order status to delivered
                    $delivery->order->update([
                        'status' => 'delivered',
                        'delivered_at' => now()
                    ]);
                    break;
                    
                case 'cancelled':
                    // Update order status back to processing
                    $delivery->order->update([
                        'status' => 'processing'
                    ]);
                    break;
            }

            $delivery->update($updateData);

            return response()->json([
                'status' => 'success',
                'message' => 'Delivery status updated successfully',
                'data' => $delivery
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update delivery status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload delivery evidence (proof of delivery)
     */
    public function uploadEvidence(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only drivers can upload delivery evidence'
            ], 403);
        }

        $delivery = Delivery::find($id);

        if (!$delivery) {
            return response()->json([
                'status' => 'error',
                'message' => 'Delivery not found'
            ], 404);
        }

        // Check if delivery is assigned to this driver
        if ($delivery->driver_id != $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Delivery not assigned to you'
            ], 403);
        }

        // Check if delivery is in delivered status
        if ($delivery->status != 'delivered') {
            return response()->json([
                'status' => 'error',
                'message' => 'Can only upload evidence for delivered orders'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'evidence_type' => 'required|in:signature,photo,both',
            'signature_image' => 'required_if:evidence_type,signature,both|image|max:2048',
            'delivery_photo' => 'required_if:evidence_type,photo,both|image|max:5120',
            'receiver_name' => 'required|string|max:100',
            'receiver_phone' => 'required|string|max:15',
            'notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $evidenceData = [
                'receiver_name' => $request->receiver_name,
                'receiver_phone' => $request->receiver_phone,
                'evidence_uploaded_at' => now(),
                'notes' => $request->notes
            ];

            // Upload signature image
            if ($request->hasFile('signature_image')) {
                $signaturePath = $request->file('signature_image')->store('delivery/signatures', 'public');
                $evidenceData['signature_image'] = $signaturePath;
            }

            // Upload delivery photo
            if ($request->hasFile('delivery_photo')) {
                $photoPath = $request->file('delivery_photo')->store('delivery/photos', 'public');
                $evidenceData['delivery_photo'] = $photoPath;
            }

            // Update delivery with evidence
            $delivery->update($evidenceData);

            return response()->json([
                'status' => 'success',
                'message' => 'Delivery evidence uploaded successfully',
                'data' => $delivery
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload delivery evidence: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available deliveries for drivers
     */
    public function availableDeliveries(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only drivers can view available deliveries'
            ], 403);
        }

        $query = Delivery::with([
            'order:id,order_number,user_id,total_amount,shipping_address',
            'order.user:id,name'
        ])
        ->where('status', 'pending')
        ->where(function ($q) use ($user) {
            $q->whereNull('driver_id')
              ->orWhere('driver_id', $user->id);
        });

        // Filter by distance (simplified - based on area/zone)
        if ($request->has('area')) {
            // This would typically integrate with maps API
            $query->where('delivery_address', 'like', '%' . $request->area . '%');
        }

        // Filter by order value
        if ($request->has('min_amount')) {
            $query->whereHas('order', function ($q) use ($request) {
                $q->where('total_amount', '>=', $request->min_amount);
            });
        }

        $deliveries = $query->orderBy('created_at', 'asc')
            ->paginate($request->get('per_page', 10));

        return response()->json([
            'status' => 'success',
            'data' => $deliveries
        ]);
    }

    /**
     * Get driver statistics
     */
    public function driverStats(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only drivers can view driver statistics'
            ], 403);
        }

        $today = now()->startOfDay();
        $weekStart = now()->startOfWeek();
        $monthStart = now()->startOfMonth();

        $stats = [
            'total_deliveries' => Delivery::where('driver_id', $user->id)->count(),
            'completed_today' => Delivery::where('driver_id', $user->id)
                ->where('status', 'delivered')
                ->whereDate('delivered_at', $today)
                ->count(),
            'completed_week' => Delivery::where('driver_id', $user->id)
                ->where('status', 'delivered')
                ->where('delivered_at', '>=', $weekStart)
                ->count(),
            'completed_month' => Delivery::where('driver_id', $user->id)
                ->where('status', 'delivered')
                ->where('delivered_at', '>=', $monthStart)
                ->count(),
            'pending_deliveries' => Delivery::where('driver_id', $user->id)
                ->whereIn('status', ['accepted', 'picked_up', 'on_delivery'])
                ->count(),
            'earnings_today' => Delivery::where('driver_id', $user->id)
                ->where('status', 'delivered')
                ->whereDate('delivered_at', $today)
                ->count() * 15000, // Rp 15.000 per delivery
            'earnings_week' => Delivery::where('driver_id', $user->id)
                ->where('status', 'delivered')
                ->where('delivered_at', '>=', $weekStart)
                ->count() * 15000,
            'earnings_month' => Delivery::where('driver_id', $user->id)
                ->where('status', 'delivered')
                ->where('delivered_at', '>=', $monthStart)
                ->count() * 15000,
            'rating' => 4.8, // This would come from a ratings system
            'active_hours' => '08:00 - 17:00', // This would come from driver schedule
        ];

        // Recent deliveries
        $recentDeliveries = Delivery::with(['order:id,order_number'])
            ->where('driver_id', $user->id)
            ->where('status', 'delivered')
            ->orderBy('delivered_at', 'desc')
            ->limit(5)
            ->get(['id', 'order_id', 'status', 'delivered_at', 'delivery_address']);

        $stats['recent_deliveries'] = $recentDeliveries;

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }

    /**
     * Update driver location (real-time tracking)
     */
    public function updateLocation(Request $request)
    {
        $user = $request->user();
        
        if (!$user->isDriver()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only drivers can update location'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'delivery_id' => 'nullable|exists:deliveries,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Store location in database or Redis for real-time tracking
            $locationData = [
                'driver_id' => $user->id,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'delivery_id' => $request->delivery_id,
                'updated_at' => now()
            ];

            // Here you would typically store in Redis or a separate locations table
            // For now, we'll update the driver's current delivery if applicable
            if ($request->delivery_id) {
                $delivery = Delivery::find($request->delivery_id);
                if ($delivery && $delivery->driver_id == $user->id) {
                    $delivery->update([
                        'current_latitude' => $request->latitude,
                        'current_longitude' => $request->longitude,
                        'location_updated_at' => now()
                    ]);
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Location updated successfully',
                'data' => $locationData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update location: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get delivery tracking information
     */
    public function trackDelivery($trackingNumber)
    {
        $delivery = Delivery::with([
            'order:id,order_number,user_id,shipping_address',
            'driver:id,name,phone,vehicle_number',
            'order.user:id,name,phone'
        ])->where('tracking_number', $trackingNumber)->first();

        if (!$delivery) {
            return response()->json([
                'status' => 'error',
                'message' => 'Delivery not found'
            ], 404);
        }

        // Get tracking timeline
        $timeline = $this->getDeliveryTimeline($delivery);

        // Get estimated delivery time
        $estimatedDelivery = $this->calculateEstimatedDelivery($delivery);

        $trackingInfo = [
            'delivery' => $delivery,
            'timeline' => $timeline,
            'estimated_delivery' => $estimatedDelivery,
            'current_location' => [
                'latitude' => $delivery->current_latitude,
                'longitude' => $delivery->current_longitude,
                'updated_at' => $delivery->location_updated_at
            ]
        ];

        return response()->json([
            'status' => 'success',
            'data' => $trackingInfo
        ]);
    }

    /**
     * Helper method to get delivery timeline
     */
    private function getDeliveryTimeline($delivery)
    {
        $timeline = [];

        // Order created
        $timeline[] = [
            'event' => 'order_created',
            'title' => 'Pesanan Dibuat',
            'description' => 'Pesanan telah dibuat oleh customer',
            'timestamp' => $delivery->order->created_at,
            'completed' => true
        ];

        // Delivery assigned
        if ($delivery->driver_id) {
            $timeline[] = [
                'event' => 'driver_assigned',
                'title' => 'Driver Ditetapkan',
                'description' => 'Driver ' . $delivery->driver->name . ' telah ditetapkan',
                'timestamp' => $delivery->updated_at,
                'completed' => true
            ];
        }

        // Delivery status events
        switch ($delivery->status) {
            case 'accepted':
                $timeline[] = [
                    'event' => 'delivery_accepted',
                    'title' => 'Driver Menerima Pengiriman',
                    'description' => 'Driver telah menerima tugas pengiriman',
                    'timestamp' => $delivery->accepted_at,
                    'completed' => true
                ];
                break;
                
            case 'picked_up':
                $timeline[] = [
                    'event' => 'picked_up',
                    'title' => 'Pesanan Diambil',
                    'description' => 'Driver telah mengambil pesanan dari apotek',
                    'timestamp' => $delivery->picked_up_at,
                    'completed' => true
                ];
                break;
                
            case 'on_delivery':
                $timeline[] = [
                    'event' => 'on_delivery',
                    'title' => 'Dalam Perjalanan',
                    'description' => 'Pesanan sedang dalam perjalanan ke tujuan',
                    'timestamp' => $delivery->updated_at,
                    'completed' => true
                ];
                break;
                
            case 'delivered':
                $timeline[] = [
                    'event' => 'delivered',
                    'title' => 'Pesanan Dikirim',
                    'description' => 'Pesanan telah sampai di tujuan',
                    'timestamp' => $delivery->delivered_at,
                    'completed' => true
                ];
                break;
        }

        return $timeline;
    }

    /**
     * Helper method to calculate estimated delivery time
     */
    private function calculateEstimatedDelivery($delivery)
    {
        if ($delivery->status == 'delivered') {
            return [
                'estimated_time' => $delivery->delivered_at,
                'status' => 'delivered',
                'message' => 'Pesanan telah dikirim'
            ];
        }

        $baseTime = $delivery->created_at;
        
        // Add estimated times based on status
        switch ($delivery->status) {
            case 'pending':
                $estimatedTime = $baseTime->addMinutes(30); // 30 minutes to assign driver
                break;
                
            case 'accepted':
                $estimatedTime = $baseTime->addMinutes(60); // 60 minutes to pick up
                break;
                
            case 'picked_up':
                $estimatedTime = $delivery->picked_up_at->addMinutes(45); // 45 minutes for delivery
                break;
                
            case 'on_delivery':
                $estimatedTime = now()->addMinutes(30); // 30 minutes from now
                break;
                
            default:
                $estimatedTime = $baseTime->addHours(2); // Default 2 hours
        }

        return [
            'estimated_time' => $estimatedTime,
            'status' => 'estimated',
            'message' => 'Estimasi pengiriman: ' . $estimatedTime->format('H:i')
        ];
    }
}