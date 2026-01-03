@extends('layouts.frontend.app')

@section('title', 'Bayar Order - Halo Apotek')

@section('content')
<div class="container mt-5">
    <h2>Bayar Order #{{ $order->id }}</h2>

    <h4>Status Order: {{ $order->status }}</h4>

    @if($order->status == 'waiting_payment')
        <form action="{{ url('/api/transaction/' . $transaction->id . '/pay') }}" method="POST" enctype="multipart/form-data">
            @csrf
            <div class="mb-3">
                <label for="payment_receipt" class="form-label">Unggah Bukti Pembayaran</label>
                <input type="file" name="payment_receipt" id="payment_receipt" class="form-control" required>
            </div>

            <button type="submit" class="btn btn-primary">Konfirmasi Pembayaran</button>
        </form>
    @else
        <p>Order ini tidak memerlukan pembayaran lagi.</p>
    @endif
</div>
@endsection

@section('scripts')
<script>
    document.getElementById('paymentForm').addEventListener('submit', function(event) {
        event.preventDefault();

        // Ambil data form
        const formData = new FormData();
        formData.append('payment_receipt', document.getElementById('payment_receipt').files[0]);

        // Ambil order_id
        const orderId = {{ $order->id }};  // Pastikan ID order sudah ada di view

        // Kirim data pembayaran
        fetch(`/api/bayar-order/${orderId}`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('userToken'), // Gunakan token autentikasi
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Bukti pembayaran berhasil diupload') {
                alert('Pembayaran berhasil diunggah!');
                window.location.href = '/riwayat-order'; // Redirect ke halaman riwayat order
            } else {
                alert('Gagal mengunggah bukti pembayaran: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan, coba lagi.');
        });
    });
</script>
@endsection