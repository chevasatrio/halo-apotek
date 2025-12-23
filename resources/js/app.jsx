import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Alpine from 'alpinejs';
import CustomerBeranda from './components/CustomerBeranda';
import KeranjangPage from './components/KeranjangPage';

window.Alpine = Alpine;
Alpine.start();

const mount = (id, Component) => {
    const el = document.getElementById(id);
    if (el) createRoot(el).render(<Component />);
};

mount('berandakami-root', CustomerBeranda);
mount('keranjang-root', KeranjangPage);
