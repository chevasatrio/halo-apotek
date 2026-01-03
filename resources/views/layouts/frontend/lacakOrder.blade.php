@extends('layouts.frontend.app')

@section('title', 'Lacak Order - Halo Apotek')

@section('content')
<div class="container mt-5">
    <h2>Lacak Order #{{ $order->id }}</h2>

    <h4>Status Pesanan: {{ $order->status }}</h4>

    <h5>Timeline Status:</h5>
    <ul class="list-group">
        <li class="list-group-item">Order dibuat: {{ $order->created_at->format('d M Y H:i') }}</li>
        <li class="list-group-item">Menunggu validasi: {{ optional($order->validating_at)->format('d M Y H:i') ?? 'Belum ada' }}</li>
        <li class="list-group-item">Diproses: {{ optional($order->processed_at)->format('d M Y H:i') ?? 'Belum ada' }}</li>
        <li class="list-group-item">Dikirim: {{ optional($order->shipped_at)->format('d M Y H:i') ?? 'Belum ada' }}</li>
        <li class="list-group-item">Selesai: {{ optional($order->completed_at)->format('d M Y H:i') ?? 'Belum ada' }}</li>
    </ul>

    <p><strong>Estimasi Pengiriman:</strong> {{ $order->estimated_delivery ? $order->estimated_delivery->format('d M Y') : 'Belum ada' }}</p>
</div>
@endsection