<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\Order;

class PrescriptionController extends Controller
{
    /**
     * Get list of prescriptions
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Prescription::with(['order.user:id,name', 'verifier:id,name']);

        // Role-based filtering
        if ($user->isPembeli()) {
            $query->whereHas('order', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->isAdmin()) {
            // Admin can see all prescriptions
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $prescriptions = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $prescriptions
        ]);
    }

    /**
     * Verify prescription (for admin)
     */
    public function verify(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only admin can verify prescriptions'
            ], 403);
        }

        $prescription = Prescription::with('order')->find($id);

        if (!$prescription) {
            return response()->json([
                'status' => 'error',
                'message' => 'Prescription not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'rejection_reason' => 'required_if:status,rejected|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $prescription->update([
                'status' => $request->status,
                'verified_by' => $user->id,
                'verified_at' => now(),
                'rejection_reason' => $request->rejection_reason
            ]);

            // Update order status
            if ($request->status == 'approved') {
                $prescription->order->update([
                    'status' => 'pending'
                ]);
            } else {
                $prescription->order->update([
                    'status' => 'rejected'
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Prescription verification completed',
                'data' => $prescription
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to verify prescription: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload prescription (alternative endpoint)
     */
    public function upload(Request $request, $orderId)
    {
        $user = $request->user();
        $order = Order::find($orderId);

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

        // Check if prescription is required
        if (!$order->is_prescription_required) {
            return response()->json([
                'status' => 'error',
                'message' => 'This order does not require prescription'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'prescription_image' => 'required|image|max:5120',
            'doctor_notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Upload prescription image
            $imagePath = $request->file('prescription_image')->store('prescriptions', 'public');

            // Create prescription record
            $prescription = Prescription::create([
                'order_id' => $order->id,
                'prescription_image' => $imagePath,
                'doctor_notes' => $request->doctor_notes,
                'status' => 'pending'
            ]);

            // Update order status
            $order->update(['status' => 'waiting_approval']);

            return response()->json([
                'status' => 'success',
                'message' => 'Prescription uploaded successfully',
                'data' => $prescription
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to upload prescription: ' . $e->getMessage()
            ], 500);
        }
    }
}