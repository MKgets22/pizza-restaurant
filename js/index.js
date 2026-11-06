const btnGuardarCliente = document.querySelector('#Guardar-Cliente');

//guardar informacion del cliente 
let cliente = {
    mesa: '',
    hora: '',
    pedido: [] 
 }

 const categoria = {
    1:"pizza",
    2:"hamburgesas",
    3:"postres",
    4:"bebidas",
    5:"ensaladas",
    6:"papas"
 }