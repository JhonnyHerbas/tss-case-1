var myChartVentas;
var myChartInventario;

document.getElementById('simular').addEventListener('click', function () {
    var tablaContainer = document.getElementById('venta-dias');
    var tablaInventario = document.getElementById('tabla-inventario')
    if (myChartVentas) {
        myChartVentas.destroy();
        // myChartInventario.destroy();
    }
    tablaContainer.innerHTML = '';
    tablaInventario.innerHTML = '';

    var validacionExitosa = true;

    var numeroDias = document.getElementById('numero-dias').value;
    var cantidadProductos = document.getElementById('invetario-inicial').value;
    var costoPedido = document.getElementById('costo-pedido').value;
    var costoMantenimiento = document.getElementById('costo-mentenimiento').value;

    validacionExitosa = validacionExitosa && validarNumeroDias();
    validacionExitosa = validacionExitosa && validarCantidadProductos();
    validacionExitosa = validacionExitosa && validarCostoPedido();
    validacionExitosa = validacionExitosa && validarCostoMantenimiento();

    if (validacionExitosa) {
        const numerosAleatorios = generarNumerosAleatorios(numeroDias);
        const datosBinomial = binomialDist(numerosAleatorios, 6, 0.5);
        const vendido = generarNumeroVentas(datosBinomial);
        const tablaVentas = document.getElementById('venta-dias');
        crearTabla(tablaVentas, vendido);
        const listaDias = generarlistaDias(vendido.length);
        graficarBarras(vendido, listaDias)
        const inventario = generarInventario(cantidadProductos, vendido);
        crearTablaInventario(tablaInventario, inventario);

        // console.log('Inventario: ', inventario)
        // console.log('Numeros aleatorios: ', numerosAleatorios);
        // console.log('Distribucion binomial ', datosBinomial);
        // console.log('Vendido', vendido)
    }
});

document.getElementById('numero-dias').addEventListener('input', validarNumeroDias);
document.getElementById('invetario-inicial').addEventListener('input', validarCantidadProductos);
document.getElementById('costo-pedido').addEventListener('input', validarCostoPedido);
document.getElementById('costo-mentenimiento').addEventListener('input', validarCostoMantenimiento);

// FUNCIONES UTILIZADAS
function generarNumerosAleatorios(numeroDias) {
    return Array.from({ length: numeroDias }, () => Math.floor(Math.random() * 6));
}

function binomialDist(listaX, n, p) {
    return listaX.map(x => {
        const coeficienteBinomial = factorial(n) / (factorial(x) * factorial(n - x));
        const probabilidad = coeficienteBinomial * Math.pow(p, x) * Math.pow(1 - p, n - x);
        return probabilidad;
    });
}

function factorial(num) {
    if (num === 0 || num === 1) {
        return 1;
    } else {
        return num * factorial(num - 1);
    }
}

function generarNumeroVentas(datosBinomiales) {
    return datosBinomiales.map(datoBinomial =>
        (datoBinomial < 0.167) ? 1 :
            (datoBinomial < 0.334) ? 2 :
                (datoBinomial < 0.5) ? 3 :
                    (datoBinomial < 0.667) ? 4 :
                        (datoBinomial < 0.834) ? 5 : 6
    );
}

function generarInventario(cantidadProductos, vendido) {
    let inventario = [Math.floor(cantidadProductos)];
    for (var i = 1; i < vendido.length; i++) {
        if (inventario[i-1] - vendido[i-1] < 0) {
            break;
        }
        inventario[i] = inventario[i-1] - vendido[i-1];
    }
    return inventario;
}

// GRAFICADORES
function crearTabla(div, datos) {
    var tabla = document.createElement('table');
    tabla.className = 'table';
    var filaEncabezado = tabla.createTHead().insertRow(0);
    var encabezadoDia = filaEncabezado.insertCell(0);
    encabezadoDia.innerHTML = 'Dia';
    var encabezadoVentas = filaEncabezado.insertCell(1);
    encabezadoVentas.innerHTML = 'Numero de ventas';
    var cuerpoTabla = tabla.createTBody();
    for (var i = 0; i < datos.length; i++) {
        var fila = cuerpoTabla.insertRow(i);
        var celdaDia = fila.insertCell(0);
        celdaDia.innerHTML = i + 1;
        var celdaVentas = fila.insertCell(1);
        celdaVentas.innerHTML = datos[i];
    }
    div.appendChild(tabla);
}

function crearTablaInventario(div, datos) {
    var tabla = document.createElement('table');
    tabla.className = 'table';
    var filaEncabezado = tabla.createTHead().insertRow(0);
    var encabezadoDia = filaEncabezado.insertCell(0);
    encabezadoDia.innerHTML = 'Dia';
    var encabezadoVentas = filaEncabezado.insertCell(1);
    encabezadoVentas.innerHTML = 'Inventario';
    var cuerpoTabla = tabla.createTBody();
    for (var i = 0; i < datos.length; i++) {
        var fila = cuerpoTabla.insertRow(i);
        var celdaDia = fila.insertCell(0);
        celdaDia.innerHTML = i + 1;
        var celdaVentas = fila.insertCell(1);
        celdaVentas.innerHTML = datos[i];
    }
    div.appendChild(tabla);
}

function generarlistaDias(numeroDias) {
    var listaDias = [];
    for (var i = 1; i <= numeroDias; i++) {
        listaDias.push('Dia ' + i);
    }
    return listaDias;
}

function graficarBarras(vendido, listaDias) {
    const datos = {
        labels: listaDias,
        datasets: [{
            label: 'Ventas por dia',
            data: vendido,
            backgroundColor: '#A3ABBD',
            borderColor: '#4BC0C0',
            borderWidth: 1
        }]
    };
    const configuracion = {
        type: 'bar',
        data: datos,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };
    const ctx = document.getElementById('myChart').getContext('2d');
    myChartVentas = new Chart(ctx, configuracion);
}

// VALIDACIONES
function validarNumeroDias() {
    var costoMantenimiento = document.getElementById('costo-mentenimiento').value;
    var errorMensaje = document.getElementById('error-costo-mentenimiento');
    if (costoMantenimiento < 0) {
        errorMensaje.textContent = '❌ El costo de mantenimiento no puede ser negativo';
        return false;
    } else {
        errorMensaje.textContent = '';
        return true;
    }
}

function validarCantidadProductos() {
    var numeroDias = document.getElementById('numero-dias').value;
    var errorMensaje = document.getElementById('error-numero-dias');
    if (numeroDias < 0) {
        errorMensaje.textContent = '❌ La cantidad de productos no puede ser negativa';
        return false;
    } else {
        errorMensaje.textContent = '';
        return true;
    }
}

function validarCostoPedido() {
    var costoPedido = document.getElementById('costo-pedido').value;
    var errorMensaje = document.getElementById('error-costo-pedido');
    if (costoPedido < 0) {
        errorMensaje.textContent = '❌ El costo de pedido no puede ser negativo';
        return false;
    } else {
        errorMensaje.textContent = '';
        return true;
    }
}

function validarCostoMantenimiento() {
    var costoMantenimiento = document.getElementById('costo-mentenimiento').value;
    var errorMensaje = document.getElementById('error-costo-mentenimiento');
    if (costoMantenimiento < 0) {
        errorMensaje.textContent = '❌ El costo de mantenimiento no puede ser negativo';
        return false;
    } else {
        errorMensaje.textContent = '';
        return true;
    }
}