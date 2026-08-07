window.borrarTodo = function() {
    localStorage.removeItem("mi_historial");
    dibujarTabla();
};

window.cargarFila = function(datosRecibidos) {
    // datosRecibidos es como: monto=100;tipo=18
    var pares = datosRecibidos.split(";");
    
    for (var i = 0; i < pares.length; i++) {
        var pieza = pares[i].split("=");
        var idInput = pieza[0];
        var valorInput = pieza[1];

        var campo = document.getElementById(idInput);
        if (campo) {
            campo.value = valorInput;
        }
    }
    alert("Datos cargados. Haz clic en CALCULAR si quieres ver los resultados.");
};

// ---  LOGICA DE CALCULOS ---

window.onload = function() {
    dibujarTabla();
};

var botonCalcular = document.querySelector(".boton");
if (botonCalcular) {
    botonCalcular.onclick = calcular;
}

function calcular() {
    var hora = new Date().toLocaleTimeString();
    var operacion = "";
    var datosParaGuardar = "";

    // ITBIS
    if (document.getElementById("monto") && document.getElementById("tipo")) {
        operacion = "ITBIS";
        var monto = parseFloat(document.getElementById("monto").value) || 0;
        var tipo = parseFloat(document.getElementById("tipo").value) || 0;
        var resItbis = monto * (tipo / 100);
        document.getElementById("itbis").value = resItbis.toFixed(2);
        document.getElementById("total").value = (monto + resItbis).toFixed(2);
        datosParaGuardar = "monto=" + monto + ";tipo=" + tipo;
    }
    // NÓMINA
    else if (document.getElementById("salarioBruto")) {
        operacion = "Nómina";
        var nom = document.getElementById("nombre").value;
        var sBruto = parseFloat(document.getElementById("salarioBruto").value) || 0;
        var afpVal = sBruto * 0.0287;
        var sfsVal = sBruto * 0.0304;
        var isrVal = (sBruto > 34000) ? sBruto * 0.15 : 0;
        document.getElementById("afp").value = afpVal.toFixed(2);
        document.getElementById("sfs").value = sfsVal.toFixed(2);
        document.getElementById("isr").value = isrVal.toFixed(2);
        document.getElementById("salarioNeto").value = (sBruto - afpVal - sfsVal - isrVal).toFixed(2);
        datosParaGuardar = "nombre=" + nom + ";salarioBruto=" + sBruto;
    }
    // DEPRECIACIÓN
    else if (document.getElementById("valorActivo")) {
        operacion = "Depreciación";
        var vAct = parseFloat(document.getElementById("valorActivo").value) || 0;
        var vRes = parseFloat(document.getElementById("valorResidual").value) || 0;
        var vida = parseFloat(document.getElementById("vidaUtil").value) || 1;
        var anual = (vAct - vRes) / vida;
        document.getElementById("depreciacionAnual").value = anual.toFixed(2);
        document.getElementById("valorLibro").value = (vAct - anual).toFixed(2);
        datosParaGuardar = "activo=" + document.getElementById("activo").value + ";valorActivo=" + vAct + ";valorResidual=" + vRes + ";vidaUtil=" + vida;
    }
    // BALANCE GENERAL
    else if (document.getElementById("activos") && document.getElementById("pasivos")) {
        operacion = "Balance";
        var a = parseFloat(document.getElementById("activos").value) || 0;
        var p = parseFloat(document.getElementById("pasivos").value) || 0;
        document.getElementById("capital").value = (a - p).toFixed(2);
        datosParaGuardar = "activos=" + a + ";pasivos=" + p;
    }
    // ESTADO DE RESULTADOS
    else if (document.getElementById("ingresos")) {
        operacion = "Resultados";
        var ing = parseFloat(document.getElementById("ingresos").value) || 0;
        var cos = parseFloat(document.getElementById("costos").value) || 0;
        var gas = parseFloat(document.getElementById("gastos").value) || 0;
        var bruta = ing - cos;
        document.getElementById("utilidadBruta").value = bruta.toFixed(2);
        document.getElementById("utilidadNeta").value = (bruta - gas).toFixed(2);
        datosParaGuardar = "ingresos=" + ing + ";costos=" + cos + ";gastos=" + gas;
    }
    // INTERES SIMPLE
    else if (document.getElementById("interes") && !document.getElementById("periodos")) {
        operacion = "Interés Simple";
        var cap = parseFloat(document.getElementById("capital").value) || 0;
        var tas = parseFloat(document.getElementById("tasa").value) || 0;
        var tie = parseFloat(document.getElementById("tiempo").value) || 0;
        var iSimple = cap * (tas / 100) * tie;
        document.getElementById("interes").value = iSimple.toFixed(2);
        document.getElementById("montoFinal").value = (cap + iSimple).toFixed(2);
        datosParaGuardar = "capital=" + cap + ";tasa=" + tas + ";tiempo=" + tie;
    }
    // INTERES COMPUESTO
    else if (document.getElementById("interesGenerado")) {
        operacion = "Interés Compuesto";
        var capC = parseFloat(document.getElementById("capital").value) || 0;
        var tasC = parseFloat(document.getElementById("tasa").value) || 0;
        var tieC = parseFloat(document.getElementById("tiempo").value) || 0;
        var perC = parseFloat(document.getElementById("periodos").value) || 1;
        var mFin = capC * Math.pow((1 + (tasC/100)/perC), perC * tieC);
        document.getElementById("interesGenerado").value = (mFin - capC).toFixed(2);
        document.getElementById("montoFinal").value = mFin.toFixed(2);
        datosParaGuardar = "capital=" + capC + ";tasa=" + tasC + ";tiempo=" + tieC + ";periodos=" + perC;
    }

    if (operacion !== "") {
        guardarHistorial(hora, operacion, datosParaGuardar);
    }
}

// ---  GESTION DEL HISTORIAL ---

function guardarHistorial(hora, op, datos) {
    var historial = localStorage.getItem("mi_historial") || "";
    var nuevaEntrada = hora + "|" + op + "|" + datos;

    if (historial === "") {
        historial = nuevaEntrada;
    } else {
        historial = historial + "#" + nuevaEntrada;
    }

    localStorage.setItem("mi_historial", historial);
    dibujarTabla();
}

function dibujarTabla() {
    var seccion = document.querySelector(".section");
    if (!seccion) return;

    var contenedor = document.getElementById("contenedorHistorial");
    if (!contenedor) {
        contenedor = document.createElement("div");
        contenedor.id = "contenedorHistorial";
        seccion.appendChild(contenedor);
    }

    var historialTxt = localStorage.getItem("mi_historial") || "";
    
    if (historialTxt === "") {
        contenedor.innerHTML = ""; 
        return;
    }

    var html = "<h3>Historial</h3><table border='1'><tr><th>Hora</th><th>Operación</th><th>Datos</th></tr>";
    var registros = historialTxt.split("#");

    for (var i = registros.length - 1; i >= 0; i--) {
        var campos = registros[i].split("|");
        html += "<tr style='cursor:pointer' onclick='window.cargarFila(\"" + campos[2] + "\")'>";
        html += "<td>" + campos[0] + "</td><td>" + campos[1] + "</td><td>" + campos[2] + "</td>";
        html += "</tr>";
    }

    html += "</table><br>";
    html += "<button onclick='window.borrarTodo()'>Borrar todo el historial</button>";
    
    contenedor.innerHTML = html;
}