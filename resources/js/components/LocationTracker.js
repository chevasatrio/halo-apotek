class LocationTracker {
    constructor() {
        this.map = null;
        this.marker = null;
        this.pharmacyLocation = {
            lat: -6.2088, // Jakarta coordinates (default)
            lng: 106.8456
        };
        this.pharmacyAddress = "Jl. Contoh No. 123, Jakarta";
    }

    initMap() {
        if (!document.getElementById('locationMap')) {
            return;
        }

        this.map = new google.maps.Map(document.getElementById('locationMap'), {
            center: this.pharmacyLocation,
            zoom: 15,
            styles: [
                {
                    featureType: 'poi',
                    elementType: 'labels',
                    stylers: [{ visibility: 'off' }]
                }
            ]
        });

        this.marker = new google.maps.Marker({
            position: this.pharmacyLocation,
            map: this.map,
            title: 'Halo Apotek',
            icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }
        });

        // Info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h6><i class="fas fa-pills"></i> Halo Apotek</h6>
                    <p style="margin: 0;">${this.pharmacyAddress}</p>
                    <p style="margin: 5px 0 0 0;">
                        <i class="fas fa-phone"></i> (021) 1234-5678<br>
                        <i class="fas fa-clock"></i> Buka: 08:00 - 22:00
                    </p>
                </div>
            `
        });

        this.marker.addListener('click', () => {
            infoWindow.open(this.map, this.marker);
        });

        // Get user location if available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    // Add user location marker
                    new google.maps.Marker({
                        position: userLocation,
                        map: this.map,
                        title: 'Lokasi Anda',
                        icon: {
                            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                        }
                    });

                    // Calculate distance
                    const distance = this.calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        this.pharmacyLocation.lat,
                        this.pharmacyLocation.lng
                    );

                    // Show route
                    const directionsService = new google.maps.DirectionsService();
                    const directionsRenderer = new google.maps.DirectionsRenderer();
                    directionsRenderer.setMap(this.map);

                    directionsService.route({
                        origin: userLocation,
                        destination: this.pharmacyLocation,
                        travelMode: google.maps.TravelMode.DRIVING
                    }, (result, status) => {
                        if (status === 'OK') {
                            directionsRenderer.setDirections(result);
                            const route = result.routes[0];
                            const leg = route.legs[0];
                            
                            // Update address with distance
                            const addressElement = document.getElementById('pharmacyAddress');
                            if (addressElement) {
                                addressElement.innerHTML = `
                                    ${this.pharmacyAddress}<br>
                                    <strong>Jarak: ${distance.toFixed(2)} km</strong><br>
                                    <small>Waktu tempuh: ${leg.duration.text}</small>
                                `;
                            }
                        }
                    });
                },
                (error) => {
                    console.log('Error getting location:', error);
                }
            );
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance;
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    showLocation() {
        const modal = document.getElementById('locationModal');
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            // Initialize map when modal is shown
            const mapElement = document.getElementById('locationMap');
            if (mapElement) {
                // Set default message first
                mapElement.innerHTML = `
                    <div class="d-flex align-items-center justify-content-center h-100 bg-light">
                        <div class="text-center p-4">
                            <i class="fas fa-map-marked-alt fa-3x text-muted mb-3"></i>
                            <p class="text-muted mb-2">Google Maps API belum dikonfigurasi</p>
                            <small class="text-muted">Fitur lokasi akan aktif setelah API key dikonfigurasi</small>
                            <div class="mt-3">
                                <p class="mb-1"><strong>Alamat Apotek:</strong></p>
                                <p class="mb-0">${this.pharmacyAddress}</p>
                                <p class="mt-2 mb-0"><i class="fas fa-phone"></i> (021) 1234-5678</p>
                                <p class="mb-0"><i class="fas fa-clock"></i> Buka: 08:00 - 22:00</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            modal.addEventListener('shown.bs.modal', () => {
                setTimeout(() => {
                    if (typeof google !== 'undefined' && google.maps) {
                        this.initMap();
                    } else {
                        // Already set default message above, no need to do anything
                        console.log('Google Maps API belum dikonfigurasi. Fitur lokasi akan aktif setelah API key ditambahkan.');
                    }
                }, 100);
            }, { once: true });
        }
    }
}

export default LocationTracker;

