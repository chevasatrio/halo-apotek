document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("products-container");

    if (!window.productsData || window.productsData.length === 0) {
        container.innerHTML = '<p>Data Kosong</p>';
        return;
    }

    let html = "";

    window.productsData.forEach(product => {
        html += `
            <div class="col-6 mb-3">
                <div style="border: 2px solid red; padding: 10px; background: white;">
                    
                    <p style="font-size: 10px; word-break: break-all; color: blue;">
                        LINK: ${product.image_url}
                    </p>

                    <img src="${product.image_url}" 
                         style="width: 100px; height: 100px; object-fit: contain; background: #eee;">
                    
                    <h5 style="margin-top:5px;">${product.name}</h5>
                </div>
            </div>
        `;
    });

    // Pakai row bootstrap biar rapi dikit
    container.className = "row";
    container.innerHTML = html;
});