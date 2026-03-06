let pedido=[]
let ventas=[]

function mostrar(id){

document.querySelectorAll("section").forEach(s=>s.classList.add("hidden"))

document.getElementById(id).classList.remove("hidden")

}

function cargarProductos(){

let select=document.getElementById("producto")
let selectD=document.getElementById("productoD")

productos.forEach((p,i)=>{

let op=document.createElement("option")
op.value=i
op.text=p.nombre+" $"+p.precio

select.appendChild(op)

let op2=op.cloneNode(true)

selectD.appendChild(op2)

})

}

cargarProductos()

function agregarPedido(){

let p=productos[document.getElementById("producto").value]

let c=parseInt(document.getElementById("cantidad").value)

pedido.push({nombre:p.nombre,precio:p.precio,cantidad:c})

mostrarPedido()

}

function mostrarPedido(){

let cont=document.getElementById("pedidoActual")

cont.innerHTML=""

let total=0

pedido.forEach(p=>{

cont.innerHTML+=p.nombre+" x"+p.cantidad+"<br>"

total+=p.precio*p.cantidad

})

document.getElementById("totalPedido").innerText=total

}

function finalizarPedido(){

let total=0

pedido.forEach(p=>{

total+=p.precio*p.cantidad

})

ventas.push(total)

pedido=[]

mostrarPedido()

actualizarDashboard()

}

function actualizarDashboard(){

let total=0

ventas.forEach(v=>total+=v)

document.getElementById("ventasHoy").innerText="$"+total

}

function crearMesas(){

let cont=document.getElementById("listaMesas")

for(let i=1;i<=10;i++){

let div=document.createElement("div")

div.className="mesa"

div.innerText="Mesa "+i

cont.appendChild(div)

}

}

crearMesas()

function cargarInventario(){

let cont=document.getElementById("listaInventario")

inventario.forEach(i=>{

cont.innerHTML+=i.nombre+" : "+i.cantidad+"<br>"

})

}

cargarInventario()