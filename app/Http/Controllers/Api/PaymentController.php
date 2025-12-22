<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Get list of payments
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Payment::with(['order.user:id,name', 'verifier:id,name']);

        // Role-based filtering
        if ($user->isPembeli()) {
            $query->whereHas('order', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        // Search by payment number
        if ($request->has('payment_number')) {
            $query->where('payment_number', 'like', '%' . $request->payment_number . '%');
        }

        $payments = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $payments
        ]);
    }

    /**
     * Verify payment (for kasir/admin)
     */
    public function verify(Request $request, $id)
    {
        $user = $request->user();
        
        if (!$user->isKasir() && !$user->isAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized'
            ], 403);
        }

        $payment = Payment::with('order')->find($id);

        if (!$payment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:verified,rejected',
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
            $payment->update([
                'status' => $request->status,
                'verified_by' => $user->id,
                'verified_at' => now(),
                'notes' => $request->notes
            ]);

            // Update order payment status
            if ($request->status == 'verified') {
                $payment->order->update([
                    'payment_status' => 'paid'
                ]);
            } else {
                $payment->order->update([
                    'payment_status' => 'failed'
                ]);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Payment verification completed',
                'data' => $payment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to verify payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get payment details
     */
    public function show($id)
    {
        $payment = Payment::with([
            'order.items.product:id,name',
            'order.user:id,name,email,phone',
            'verifier:id,name'
        ])->find($id);

        if (!$payment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $payment
        ]);
    }
}