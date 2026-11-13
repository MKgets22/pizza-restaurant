const btnGuardarCliente = document.querySelector('#guardar-cliente');
const formulario = document.querySelector('#formulario');
const contenidoMenu = document.querySelector('#menu .contenido');
const contenidoResumen = document.querySelector('#resumen .contenido');
const campoPropina = document.querySelector('#propina');
const errorPropina = document.querySelector('#error-propina');
const btnFinalizarOrden = document.querySelector('#finalizar-orden');
const ayudaFinalizarOrden = document.querySelector('#ayuda-finalizar-orden');
const btnMostrarOrdenes = document.querySelector('#mostrar-ordenes');
const listaOrdenes = document.querySelector('#lista-ordenes');
const contenidoOrdenes = document.querySelector('#ordenes-guardadas');

let cliente = {
   mesa: '',
   hora: '',
   pedido: []
};
const ordenes = [];

const categorias = {
   1: 'pizza',
   2: 'hamburguesas',
   3: 'postres',
   4: 'bebidas',
   5: 'ensaladas',
   6: 'papas'
};

btnGuardarCliente.addEventListener('click', guardarCliente);
campoPropina.addEventListener('input', mostrarResumen);
btnFinalizarOrden.addEventListener('click', finalizarOrden);
btnMostrarOrdenes.addEventListener('click', alternarOrdenes);

function guardarCliente() {
   const mesa = document.querySelector('#mesa').value;
   const hora = document.querySelector('#hora').value;
   const numeroMesa = Number(mesa);

   if (!mesa || !hora || !Number.isInteger(numeroMesa) || numeroMesa < 1 || numeroMesa > 8) {
      alert('Ingrese una mesa del 1 al 8 y complete la hora.');
      return;
   }

   cliente = { ...cliente, mesa: numeroMesa, hora };

   bootstrap.Modal.getOrCreateInstance(formulario).hide();
   document.querySelector('#menu').classList.remove('d-none');
   document.querySelector('#resumen').classList.remove('d-none');
   obtenerMenu();
}

async function obtenerMenu() {
   try {
      const respuesta = await fetch('/menu');
      if (!respuesta.ok) {
         throw new Error(`Error al obtener el menú: ${respuesta.status}`);
      }

      const menu = await respuesta.json();
      if (!Array.isArray(menu)) {
         throw new Error('La respuesta del menú no tiene el formato esperado.');
      }

      mostrarMenu(menu);
   } catch (error) {
      console.error(error);
      alert('No se pudo cargar el menú. Verifique que el servidor de menú esté activo.');
   }
}

function mostrarMenu(menu) {
   contenidoMenu.replaceChildren();

   menu.forEach(producto => {
      const fila = document.createElement('div');
      fila.classList.add('row', 'border-top', 'align-items-center');

      const nombre = document.createElement('div');
      nombre.classList.add('col-md-3', 'py-3');
      nombre.textContent = producto.nombre;

      const precio = document.createElement('div');
      precio.classList.add('col-md-3', 'py-3');
      precio.textContent = `$${Number(producto.precio).toFixed(2)}`;

      const categoria = document.createElement('div');
      categoria.classList.add('col-md-3', 'py-3');
      categoria.textContent = categorias[producto.categoria] ?? 'Otra categoría';

      const cantidad = document.createElement('input');
      cantidad.type = 'number';
      cantidad.min = '0';
      cantidad.step = '1';
      cantidad.value = String(cliente.pedido.find(item => item.id === producto.id)?.cantidad ?? 0);
      cantidad.id = `producto-${producto.id}`;
      cantidad.classList.add('form-control');
      cantidad.setAttribute('aria-label', `Cantidad de ${producto.nombre}`);
      cantidad.addEventListener('change', () => {
         agregarPedido({ ...producto, cantidad: Number.parseInt(cantidad.value, 10) || 0 });
      });

      const columnaCantidad = document.createElement('div');
      columnaCantidad.classList.add('col-md-3', 'py-3');
      columnaCantidad.appendChild(cantidad);

      fila.append(nombre, precio, categoria, columnaCantidad);
      contenidoMenu.appendChild(fila);
   });
}

function agregarPedido(producto) {
   cliente.pedido = cliente.pedido.filter(item => item.id !== producto.id);

   if (producto.cantidad > 0) {
      cliente.pedido.push(producto);
   }

   mostrarResumen();
}

function mostrarResumen() {
   contenidoResumen.replaceChildren();

   const detallesCliente = document.createElement('p');
   detallesCliente.classList.add('col-12');
   detallesCliente.textContent = `Mesa ${cliente.mesa} - Hora ${cliente.hora}`;
   contenidoResumen.appendChild(detallesCliente);

   const porcentajePropina = Number(campoPropina.value);
   const propinaValida = campoPropina.value !== ''
      && Number.isFinite(porcentajePropina)
      && porcentajePropina >= 0
      && porcentajePropina <= 100;
   errorPropina.textContent = propinaValida ? '' : 'Ingrese un porcentaje entre 0 y 100.';
   btnFinalizarOrden.disabled = cliente.pedido.length === 0 || !propinaValida;
   ayudaFinalizarOrden.textContent = cliente.pedido.length === 0
      ? 'Agrega al menos un producto para habilitar «Finalizar orden».'
      : propinaValida ? '' : 'Corrige la propina para finalizar la orden.';

   if (cliente.pedido.length === 0) {
      const mensaje = document.createElement('p');
      mensaje.classList.add('col-12', 'text-center');
      mensaje.textContent = 'Añade los elementos del pedido';
      contenidoResumen.appendChild(mensaje);
      return;
   }

   let total = 0;
   cliente.pedido.forEach(producto => {
      const subtotal = Number(producto.precio) * producto.cantidad;
      total += subtotal;

      const lineaPedido = document.createElement('p');
      lineaPedido.classList.add('col-12');
      lineaPedido.textContent = `${producto.nombre} x ${producto.cantidad} - ${formatearPrecio(subtotal)}`;
      contenidoResumen.appendChild(lineaPedido);
   });

   const montoPropina = total * porcentajePropina / 100;
   const lineaPropina = document.createElement('p');
   lineaPropina.classList.add('col-12');
   lineaPropina.textContent = `Propina (${porcentajePropina}%): ${formatearPrecio(montoPropina)}`;
   contenidoResumen.appendChild(lineaPropina);

   const totalPedido = document.createElement('p');
   totalPedido.classList.add('col-12', 'fw-bold', 'text-end');
   totalPedido.textContent = `Total con propina: ${formatearPrecio(total + montoPropina)}`;
   contenidoResumen.appendChild(totalPedido);
}

function finalizarOrden() {
   if (!cliente.pedido.length || btnFinalizarOrden.disabled) {
      return;
   }

   const subtotal = cliente.pedido.reduce(
      (total, producto) => total + Number(producto.precio) * producto.cantidad,
      0
   );
   const porcentajePropina = Number(campoPropina.value);
   ordenes.push({
      numero: ordenes.length + 1,
      mesa: cliente.mesa,
      hora: cliente.hora,
      productos: cliente.pedido.map(producto => ({ ...producto })),
      subtotal,
      porcentajePropina,
      propina: subtotal * porcentajePropina / 100,
      total: subtotal * (1 + porcentajePropina / 100)
   });

   cliente.pedido = [];
   contenidoMenu.querySelectorAll('input[type="number"]').forEach(input => {
      input.value = '0';
   });

   mostrarResumen();
   renderizarOrdenes();
}

function alternarOrdenes() {
   const seVanAMostrar = listaOrdenes.classList.contains('d-none');
   listaOrdenes.classList.toggle('d-none', !seVanAMostrar);
   btnMostrarOrdenes.textContent = `${seVanAMostrar ? 'Ocultar' : 'Mostrar'} órdenes (${ordenes.length})`;
}

function renderizarOrdenes() {
   contenidoOrdenes.replaceChildren();
   btnMostrarOrdenes.textContent = `${listaOrdenes.classList.contains('d-none') ? 'Mostrar' : 'Ocultar'} órdenes (${ordenes.length})`;

   if (ordenes.length === 0) {
      const mensaje = document.createElement('p');
      mensaje.textContent = 'Todavía no hay órdenes guardadas.';
      contenidoOrdenes.appendChild(mensaje);
      return;
   }

   ordenes.forEach(orden => {
      const tarjeta = document.createElement('article');
      tarjeta.classList.add('border', 'rounded', 'p-3', 'mb-3');

      const encabezado = document.createElement('h3');
      encabezado.classList.add('h5');
      encabezado.textContent = `Orden ${orden.numero} - Mesa ${orden.mesa} - ${orden.hora}`;
      tarjeta.appendChild(encabezado);

      orden.productos.forEach(producto => {
         const linea = document.createElement('p');
         linea.classList.add('mb-1');
         linea.textContent = `${producto.nombre} x ${producto.cantidad} - ${formatearPrecio(Number(producto.precio) * producto.cantidad)}`;
         tarjeta.appendChild(linea);
      });

      const resumen = document.createElement('p');
      resumen.classList.add('mt-2', 'mb-0', 'fw-bold');
      resumen.textContent = `Subtotal: ${formatearPrecio(orden.subtotal)} | Propina (${orden.porcentajePropina}%): ${formatearPrecio(orden.propina)} | Total: ${formatearPrecio(orden.total)}`;
      tarjeta.appendChild(resumen);
      contenidoOrdenes.appendChild(tarjeta);
   });
}

function formatearPrecio(cantidad) {
   return `$${cantidad.toFixed(2)}`;
}