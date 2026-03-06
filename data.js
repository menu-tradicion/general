// data.js - Manejo de Datos y Configuración Inicial

const DB_KEY = 'brazaBravaData_v1';

// Datos iniciales por defecto (si es la primera vez que abres la app)
const initialData = {
    productos: [
        // Tardear
        { id: 1, nombre: 'Café', precio: 4000, categoria: 'Tardear', ingredientes: [{id: 'ing_cafe', cantidad: 20, unidad: 'g'}] },
        { id: 2, nombre: 'Waffle', precio: 12000, categoria: 'Tardear', ingredientes: [{id: 'ing_harina', cantidad: 100, unidad: 'g'}, {id: 'ing_huevo', cantidad: 1, unidad: 'u'}] },
        // Comida Rápida
        { id: 3, nombre: 'Hamburguesa', precio: 18000, categoria: 'Comida Rápida', ingredientes: [{id: 'ing_pan', cantidad: 1, unidad: 'u'}, {id: 'ing_carne', cantidad: 150, unidad: 'g'}, {id: 'ing_queso', cantidad: 1, unidad: 'u'}] },
        { id: 4, nombre: 'Salchipapas Personal', precio: 15000, categoria: 'Comida Rápida', ingredientes: [{id: 'ing_papa', cantidad: 200, unidad: 'g'}, {id: 'ing_salchicha', cantidad: 1, unidad: 'u'}] },
        { id: 5, nombre: 'Salchipapas Para Dos', precio: 28000, categoria: 'Comida Rápida', ingredientes: [{id: 'ing_papa', cantidad: 400, unidad: 'g'}, {id: 'ing_salchicha', cantidad: 2, unidad: 'u'}] },
        { id: 6, nombre: 'Salchipapas Familiar', precio: 40000, categoria: 'Comida Rápida', ingredientes: [{id: 'ing_papa', cantidad: 600, unidad: 'g'}, {id: 'ing_salchicha', cantidad: 3, unidad: 'u'}] },
        { id: 7, nombre: 'Perro Caliente', precio: 10000, categoria: 'Comida Rápida', ingredientes: [{id: 'ing_pan', cantidad: 1, unidad: 'u'}, {id: 'ing_salchicha', cantidad: 1, unidad: 'u'}] },
        { id: 8, nombre: 'Perro Rústico al Carbón', precio: 14000, categoria: 'Comida Rápida', ingredientes: [{id: 'ing_pan', cantidad: 1, unidad: 'u'}, {id: 'ing_carne', cantidad: 100, unidad: 'g'}] },
        { id: 9, nombre: 'Plato de la Casa', precio: 25000, categoria: 'Comida Rápida', ingredientes: [] }, // Ingredientes genéricos
        // Bebidas
        { id: 10, nombre: 'Gaseosa', precio: 5000, categoria: 'Bebidas', ingredientes: [] },
        { id: 11, nombre: 'Jugo Natural', precio: 8000, categoria: 'Bebidas', ingredientes: [{id: 'ing_fruta', cantidad: 200, unidad: 'g'}] },
        { id: 12, nombre: 'Cóctel Ron Añejo', precio: 18000, categoria: 'Bebidas', ingredientes: [{id: 'ing_ron', cantidad: 50, unidad: 'ml'}] }
    ],
    inventario: [
        { id: 'ing_carne', nombre: 'Carne', cantidad: 5000, unidad: 'g', min: 1000 },
        { id: 'ing_pan', nombre: 'Pan Hamburguesa/Perro', cantidad: 50, unidad: 'u', min: 10 },
        { id: 'ing_papa', nombre: 'Papas', cantidad: 10000, unidad: 'g', min: 2000 },
        { id: 'ing_salchicha', nombre: 'Salchichas', cantidad: 100, unidad: 'u', min: 20 },
        { id: 'ing_queso', nombre: 'Queso', cantidad: 50, unidad: 'u', min: 10 },
        { id: 'ing_salsas', nombre: 'Salsas', cantidad: 2000, unidad: 'ml', min: 500 },
        { id: 'ing_cafe', nombre: 'Café', cantidad: 1000, unidad: 'g', min: 200 },
        { id: 'ing_harina', nombre: 'Harina Waffle', cantidad: 2000, unidad: 'g', min: 500 },
        { id: 'ing_huevo', nombre: 'Huevos', cantidad: 60, unidad: 'u', min: 12 },
        { id: 'ing_fruta', nombre: 'Fruta Jugos', cantidad: 5000, unidad: 'g', min: 1000 },
        { id: 'ing_ron', nombre: 'Ron Añejo', cantidad: 1000, unidad: 'ml', min: 200 }
    ],
    caja: {
        inicial: 0,
        ingresosExtras: [],
        egresos: [],
        cierre: null
    },
    pedidos: [], // Historial de ventas
    configuracion: {
        nombreNegocio: 'Braza Brava',
        moneda: '$'
    }
};

// --- Funciones de Almacenamiento ---

function loadData() {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
        return JSON.parse(stored);
    } else {
        saveData(initialData);
        return initialData;
    }
}

function saveData(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function resetData() {
    if(confirm("¿Estás seguro de borrar todos los datos y reiniciar el sistema?")) {
        localStorage.removeItem(DB_KEY);
        location.reload();
    }
}

// Exportamos para usar en app.js
window.DB = {
    load: loadData,
    save: saveData,
    reset: resetData,
    initial: initialData
};