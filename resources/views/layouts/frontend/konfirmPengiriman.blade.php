@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Konfirmasi Pengiriman</h2>
    
    @if($transaction->status === 'shipping')
    <form action="{{ url('/api/transaction/' . $transaction->id . '/complete') }}" method="POST" enctype="multipart/form-data">
        @csrf
        <div class="form-group">
            <label for="image">Upload Bukti Pengiriman</label>
            <input type="file" class="form-control" id="image" name="image" required>
        </div>

        <button type="submit" class="btn btn-success">Konfirmasi Pengiriman</button>
    </form>
    @else
        <p>Transaksi ini tidak memerlukan pengiriman.</p>
    @endif
</div>
@endsection