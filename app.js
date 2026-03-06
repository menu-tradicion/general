// app.js - Lógica de la Aplicación

let appData = DB.load();
let currentCart = [];
let chartInstances = {};

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    renderDashboard();
    renderPOS();
    renderInventory();
    renderMenuConfig();
    renderCaja();
    updateHeader();
});

function updateHeader() {
    document.querySelector('.brand').textContent = appData.configuracion.nombreNegocio;
}

// --- Navegación SPA ---
function initNavigation() {
    const buttons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('section');
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Cerrar menú en móvil
            sidebar.classList.remove('open');
            
            // Actualizar botones
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Mostrar sección
            const targetId = btn.getAttribute('data-target');
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            // Acciones específicas al cargar sección
            if(targetId === 'dashboard') renderDashboard();
            if(targetId === 'pos') renderPOS();
            if(targetId === 'inventory') renderInventory();
            if(targetId === 'menu-config') renderMenuConfig();
            if(targetId === 'caja') renderCaja();
            if(targetId === 'gastos') renderGastos();
            if(targetId === 'reportes') renderReportes();
        });
    });
}

// --- Módulo POS ---
function renderPOS() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    // Filtros de categoría (Simplificado para demo)
    const categorias = ['Tardear', 'Comida Rápida', 'Bebidas'];
    
    // Renderizar botones de filtro
    let filterHTML = `<div style="margin-bottom:15px; display:flex; gap:10px; overflow-x:auto;">`;
    filterHTML += `<button class="btn-primary" onclick="filterPOS('all')">Todos</button>`;
    categorias.forEach(cat => {
        filterHTML += `<button class="btn-primary" style="background:#444" onclick="filterPOS('${cat}')">${cat}</button>`;
    });
    filterHTML += `</div>`;
    grid.innerHTML += filterHTML;

    appData.productos.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => addToCart(prod.id);
        card.innerHTML = `
            <span class="name">${prod.nombre}</span>
            <span class="price">$${prod.precio.toLocaleString()}</span>
        `;
        grid.appendChild(card);
    });
    updateCartUI();
}

function filterPOS(cat) {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        if(cat === 'all') card.style.display = 'block';
        else {
            // Lógica simple de filtrado visual basada en texto (para demo)
            // En prod real se usaría data-attributes
            const name = card.querySelector('.name').innerText;
            const prod = appData.productos.find(p => p.nombre === name);
            card.style.display = (prod.categoria === cat) ? 'block' : 'none';
        }
    });
}

function addToCart(id) {
    const product = appData.productos.find(p => p.id === id);
    const existing = currentCart.find(item => item.id === id);

    if (existing) {
        existing.cantidad++;
    } else {
        currentCart.push({ ...product, cantidad: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    container.innerHTML = '';
    
    let total = 0;

    currentCart.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <strong>${item.nombre}</strong><br>
                <small>$${item.precio.toLocaleString()} x ${item.cantidad}</small>
            </div>
            <div class="cart-controls">
                <button onclick="changeQty(${index}, -1)">-</button>
                <span style="margin:0 5px">${item.cantidad}</span>
                <button onclick="changeQty(${index}, 1)">+</button>
                <button onclick="removeFromCart(${index})" style="background:var(--danger); margin-left:5px;">x</button>
            </div>
        `;
        container.appendChild(div);
    });

    totalEl.innerText = `$${total.toLocaleString()}`;
    window.cartTotalValue = total; // Variable global para el modal de pago
}

function changeQty(index, delta) {
    currentCart[index].cantidad += delta;
    if (currentCart[index].cantidad <= 0) currentCart.splice(index, 1);
    updateCartUI();
}

function removeFromCart(index) {
    currentCart.splice(index, 1);
    updateCartUI();
}

function openPaymentModal() {
    if(currentCart.length === 0) return alert("El carrito está vacío");
    document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

function processPayment(method) {
    const total = window.cartTotalValue;
    const now = new Date();
    
    // 1. Registrar Pedido
    const pedido = {
        id: Date.now(),
        fecha: now.toISOString(),
        items: [...currentCart],
        total: total,
        metodoPago: method,
        estado: 'pagado'
    };
    
    appData.pedidos.push(pedido);

    // 2. Descontar Inventario
    currentCart.forEach(item => {
        if(item.ingredientes) {
            item.ingredientes.forEach(ing => {
                const invItem = appData.inventario.find(i => i.id === ing.id);
                if(invItem) {
                    invItem.cantidad -= (ing.cantidad * item.cantidad);
                }
            });
        }
    });

    // 3. Registrar en Caja (Ingreso)
    appData.caja.ingresosExtras.push({
        fecha: now.toISOString(),
        concepto: `Venta #${pedido.id}`,
        monto: total,
        tipo: method
    });

    // 4. Guardar y Limpiar
    DB.save(appData);
    currentCart = [];
    updateCartUI();
    closePaymentModal();
    alert("¡Venta registrada con éxito!");
    renderInventory(); // Actualizar alertas de inventario
}

// --- Módulo Dashboard ---
function renderDashboard() {
    const today = new Date().toISOString().split('T')[0];
    
    // Filtrar ventas de hoy
    const ventasHoy = appData.pedidos.filter(p => p.fecha.startsWith(today));
    const totalVentas = ventasHoy.reduce((sum, p) => sum + p.total, 0);
    
    // Calcular desglose métodos
    const efectivo = ventasHoy.filter(p => p.metodoPago === 'efectivo').reduce((s,p)=>s+p.total,0);
    const tarjeta = ventasHoy.filter(p => p.metodoPago === 'tarjeta').reduce((s,p)=>s+p.total,0);
    const transfe = ventasHoy.filter(p => p.metodoPago === 'transferencia').reduce((s,p)=>s+p.total,0);

    // Actualizar DOM
    document.getElementById('dash-ventas').innerText = `$${totalVentas.toLocaleString()}`;
    document.getElementById('dash-pedidos').innerText = ventasHoy.length;
    document.getElementById('dash-efectivo').innerText = `$${efectivo.toLocaleString()}`;
    document.getElementById('dash-tarjeta').innerText = `$${tarjeta.toLocaleString()}`;
    document.getElementById('dash-transfe').innerText = `$${transfe.toLocaleString()}`;

    renderCharts(ventasHoy);
}

function renderCharts(ventasHoy) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Destruir gráfico anterior si existe
    if(chartInstances.sales) chartInstances.sales.destroy();

    // Datos para gráfico (últimos 7 días simplificado)
    const labels = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const data = [0,0,0,0,0,0,0]; // Lógica real requeriría agrupar por día de la semana
    
    // Simulación visual para demo (en prod real se calcula dinámico)
    data[new Date().getDay()] = ventasHoy.reduce((s,p)=>s+p.total,0);

    chartInstances.sales = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas Semanales',
                data: data,
                backgroundColor: '#ff6b6b'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}

// --- Módulo Inventario ---
function renderInventory() {
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = '';

    appData.inventario.forEach(item => {
        let statusClass = 'status-ok';
        let statusText = 'Bien';
        
        if(item.cantidad <= item.min) {
            statusClass = 'status-crit';
            statusText = 'Crítico';
        } else if (item.cantidad <= (item.min * 1.5)) {
            statusClass = 'status-low';
            statusText = 'Bajo';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.cantidad} ${item.unidad}</td>
            <td class="${statusClass}">${statusText}</td>
            <td><button class="btn-primary" style="padding:5px 10px; font-size:0.8rem" onclick="addStock('${item.id}')">+</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function addStock(id) {
    const amount = prompt("Cantidad a agregar:");
    if(amount) {
        const item = appData.inventario.find(i => i.id === id);
        item.cantidad += parseFloat(amount);
        DB.save(appData);
        renderInventory();
    }
}

// --- Módulo Caja y Gastos ---
function renderCaja() {
    // Calcular totales
    const ingresosVentas = appData.pedidos.reduce((s,p) => s + p.total, 0);
    const otrosIngresos = appData.caja.ingresosExtras.filter(i => i.tipo !== 'venta').reduce((s,i)=>s+i.monto, 0);
    const egresos = appData.caja.egresos.reduce((s,e) => s + e.monto, 0);
    
    const totalIngresos = ingresosVentas + otrosIngresos; // Simplificación: asume caja inicial 0 o gestionada aparte
    const cajaFinal = totalIngresos - egresos;

    document.getElementById('caja-ingresos').innerText = `$${totalIngresos.toLocaleString()}`;
    document.getElementById('caja-egresos').innerText = `$${egresos.toLocaleString()}`;
    document.getElementById('caja-final').innerText = `$${cajaFinal.toLocaleString()}`;
}

function registrarGasto() {
    const concepto = document.getElementById('gasto-concepto').value;
    const monto = parseFloat(document.getElementById('gasto-monto').value);
    
    if(concepto && monto) {
        appData.caja.egresos.push({
            fecha: new Date().toISOString(),
            concepto: concepto,
            monto: monto
        });
        DB.save(appData);
        document.getElementById('gasto-concepto').value = '';
        document.getElementById('gasto-monto').value = '';
        renderCaja();
        renderGastos();
        alert("Gasto registrado");
    }
}

function renderGastos() {
    const tbody = document.getElementById('gastos-body');
    tbody.innerHTML = '';
    // Mostrar últimos 10 gastos
    appData.caja.egresos.slice().reverse().slice(0, 10).forEach(g => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(g.fecha).toLocaleDateString()}</td>
            <td>${g.concepto}</td>
            <td class="status-crit">-$${g.monto.toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Módulo Configuración Menú ---
function renderMenuConfig() {
    const tbody = document.getElementById('menu-body');
    tbody.innerHTML = '';
    appData.productos.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.nombre}</td>
            <td>$${p.precio}</td>
            <td>${p.categoria}</td>
            <td><button class="btn-danger" onclick="deleteProduct(${p.id})">Borrar</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function addProduct() {
    const nombre = prompt("Nombre del producto:");
    const precio = parseFloat(prompt("Precio:"));
    const categoria = prompt("Categoría (Tardear, Comida Rápida, Bebidas):");
    
    if(nombre && precio && categoria) {
        appData.productos.push({
            id: Date.now(),
            nombre, precio, categoria,
            ingredientes: [] // Simplificado para demo
        });
        DB.save(appData);
        renderMenuConfig();
        renderPOS();
    }
}

function deleteProduct(id) {
    if(confirm("¿Eliminar producto?")) {
        appData.productos = appData.productos.filter(p => p.id !== id);
        DB.save(appData);
        renderMenuConfig();
        renderPOS();
    }
}

// --- Reportes y WhatsApp ---
function renderReportes() {
    // Lógica simple de resumen
    const totalVentas = appData.pedidos.reduce((s,p) => s + p.total, 0);
    const totalGastos = appData.caja.egresos.reduce((s,e) => s + e.monto, 0);
    const ganancia = totalVentas - totalGastos;

    document.getElementById('rep-ventas').innerText = `$${totalVentas.toLocaleString()}`;
    document.getElementById('rep-gastos').innerText = `$${totalGastos.toLocaleString()}`;
    document.getElementById('rep-ganancia').innerText = `$${ganancia.toLocaleString()}`;
}

function generateWhatsApp() {
    const totalVentas = appData.pedidos.reduce((s,p) => s + p.total, 0);
    const totalPedidos = appData.pedidos.length;
    const totalGastos = appData.caja.egresos.reduce((s,e) => s + e.monto, 0);
    const ganancia = totalVentas - totalGastos;

    const texto = `
*Resumen del día – ${appData.configuracion.nombreNegocio}* 🍔☕

💰 Ventas totales: $${totalVentas.toLocaleString()}
📦 Pedidos realizados: ${totalPedidos}
📉 Egresos: $${totalGastos.toLocaleString()}
💵 Ganancia estimada: $${ganancia.toLocaleString()}

_Generado automáticamente por BrazaPOS_
    `.trim();

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
}