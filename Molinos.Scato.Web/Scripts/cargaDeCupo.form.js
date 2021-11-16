var errorPatente = false;
var errorInhabilitacion = false;
sinAfip = false;
sinCupo = false;
sinFotoCartaPorte = false;
$(document).ready(function () {
    $.unblockUI();
    
    $('#dialogo-confirmar').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();

    $(document).on('click', '.confirmar-boton', function () {
        var mensaje = "";
        if (errorInhabilitacion) {
            mensaje = "El vehículo se encuentra inhabilitado";
        }
        if (errorPatente) {
            if (mensaje !== "") {
                mensaje += " y ";
            }
            mensaje += "La patente leida en la imagen no coincide con la obtenída de AFIP";
        }
        if (errorPatente || errorInhabilitacion) {
            $("#dialogo-confirmar-body").text(mensaje + ", desea confirmarlo de todas formas?");
            $('#dialogo-confirmar').css({
                'top': '30%',
                'margin-left': function () {
                    return -($(this).width() / 2);
                },
                'left': '50%',
                'margin-top': function () {
                    return -($(this).height() / 2.6);
                }
            });
            $("#dialogo-confirmar").modal('show');
            return false;
        }
    });


    lastValue = '';
    $('#checkSinCupo').change(function () {
        if ($('#checkSinCupo').is(':checked')) {
            $("#Cupo").val("MOL1111/11111111");
            $('#divSpan6').removeClass('error');
            $('#Cupo').valid();
        } else {
            $("#Cupo").val("");
        };
    });
    $("#Cupo").on('keydown', function () {
        if ($("#Cupo").val() !== "MOL1111/11111111") {
            $('#checkSinCupo').prop('checked', false);
        }
    });

    var today = new Date();
    var dd = today.getDate().toString();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = dd + mm + yyyy;

    $("#Cupo").inputmask("MOL9999/99999999", { "placeholder": "MOL____/" + today });

    $("#validation-patente-close").on("click", function () {
        $("#validation-patente-alert").addClass("hide");
        return false;
    });
    $("#validation-danger-close").on("click", function () {
        $("#validation-patente-danger").addClass("hide");
        return false;
    });

    $("#validation-cupo-close").on("click", function () {
        $("#validation-cupo").addClass("hide");
        return false;
    });
    $("#validation-ctg-close").on("click", function () {
        $("#validation-ctg-alert").addClass("hide");
        return false;
    });
    var puestoDeTrabajo = null;

    if ($("#puestoDeTrabajo").val() !== "") {
        puestoDeTrabajo = JSON.parse($("#puestoDeTrabajo").val());

        sinAfip = puestoDeTrabajo.SinAfip;
        sinCupo = puestoDeTrabajo.SinCupo;
        sinFotoCartaPorte = puestoDeTrabajo.SinFotoCartaPorte;
        $('#ImprimeCartaPorte').val(puestoDeTrabajo.ImprimeCartaPorte);
        $('#ImprimeTarjetaDeAcceso').val(puestoDeTrabajo.ImprimeTarjetaDeAcceso);
        $('#SinFotoCartaPorte').val(puestoDeTrabajo.SinFotoCartaPorte);
        if (sinCupo) {
            $('#checkSinCupo').prop('checked', true);
            $('#checkSinCupo').change();
        }
        if (sinFotoCartaPorte) {
            $('.divFotoCP').addClass('hide');
        }
        $('#NumeroCartaPorte').focus();
    }
    if (puestoDeTrabajo === null || !puestoDeTrabajo.Automatico) {
        $("#labelConectado").addClass('hidden');
        $("#labelDesconectado").addClass('hidden');
        $("#Numero").removeAttr('readonly');
        $("#Numero").attr("placeholder", "");
    }
    if (puestoDeTrabajo !== null) {
        $("#PuestoDeTrabajoId").val(puestoDeTrabajo.Id);
    }
   
    
    if ($.cookie("checkvalidarPatente") !== undefined) {
        $('#checkvalidarPatente').prop('checked', true);
        TomarFotoConPatente();
    } else {
        $("#marco-patente").addClass('hide');
    }
    
    $('#checkvalidarPatente').change(function () {
        BlockUI();
        if ($('#checkvalidarPatente').is(':checked')) {
            $.cookie("checkvalidarPatente", 1);
            $("#marco-patente").removeClass('hide');
            TomarFotoConPatente();
        } else {
            $.removeCookie("checkvalidarPatente");
            $("#marco-patente").addClass('hide');

        };
        setTimeout($.unblockUI, 500);
    });

    if ($("#ImagenCartaPorte").val() != "") {
        $("#imagen-cp").attr("src", $("#ImagenCartaPorte").val());
    }

    $('#NumeroCartaPorte').change(function () {
        if (ValidarCP()) {
            if (ValidarNumeroTarjeta()) {
                TomarFotoCP();
            }
            cargarCupoPorCTG();            
        }
    });
    $('#NumeroCartaPorte').on('keydown', function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            return false;
        }
    });
    $("#Cupo").keypress(function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            return false;
        }
    });
    $('.tomarFoto1').click(function () {
        if (ValidarCP()) {
            if (ValidarNumeroTarjeta()) {
                TomarFotoCP();
            }
        }
    });

    ListarCupos();
});

var blockui = [];

function BlockCupos(msg) {
    if (blockui.length == 0) {
        BlockUI(msg);
    }
    blockui.push(1);
    console.log("B:" + blockui.length);
}

function UnblockCupos() {
    blockui.pop(1);
    console.log("U:" + blockui.length);
    if (blockui.length == 0) {
        $.unblockUI();
    }
}

function ValidarCP() {
    var numeroCartaPorte = $('#NumeroCartaPorte').val();
    return numeroCartaPorte.length == 12 && $.isNumeric(numeroCartaPorte);
}

function ValidarNumeroTarjeta() {
    return ValidarObjeto($("form"), $("#Numero"));
}

function cargarCupoPorCTG() {
    if (sinAfip) {
        $("#btnAceptar").focus();
        return;
    }
    var numeroCartaPorte = $('#NumeroCartaPorte').val();
    BlockCupos($("#MensajeBuscandoCartaPorte").val());
    $.getJSON($("#links").data().urlObtenerCartaPorteCtg, { numeroCartaPorte: numeroCartaPorte }, function (data) {
        console.log(data);
        $("#validation-ctg").html("");
        errorInhabilitacion = false;
        $("#validation-ctg-alert").addClass("hide");
        if (data.CodigoDeError === "0" || data.CodigoDeError === 1) {
            cargarCP(data);
        } else if (data.CodigoDeError === "2") {
            MostrarAlertaInfo("AFIP no respondió el número de CUPO. Debe cargarlo manualmente: " + data.Error);
        } else if (data.CodigoDeError === "3") {
            cargarInhabilitacion(data);
            cargarCP(data);
        } else {
            MostrarAlertaError(data.Error);
        }
        ValidarPatentesIguales();
    }).complete(function () {
        UnblockCupos();
    });
}

function TomarFotoCP() {
    if (!sinFotoCartaPorte) {
        BlockCupos($("#MensajeBuscandoCartaPorte").val());
        $.getJSON($("#links").data().urlObtenerPatente, {
            puestodetrabajoid: $("#PuestoDeTrabajoId").val(), fotoPatente: false, numero: $('#Numero').val(), numeroCartaPorte: $('#NumeroCartaPorte').val()
        }, function (data) {
            if (data.error === "") {
                $('#ImagenCartaPorte').val(data.imagen);
                $('#FotoRutaDestino').val(data.directorio);
                $('#imagen-cp').load(function () {
                    UnblockCupos();
                }).attr('src', data.imagen);
                $('#imagen-cp').attr('alt', "Cargando...");
            } else {
                $('#imagen-cp').attr('alt', "Error al obtener la imagen");
                $('#imagen-cp').attr('src', '');
                UnblockCupos();
            }
            $('.tomarFoto1').show();
        });
    }
}

function getDateIfDate(d) {
    var m = d.match(/\/Date\((\d+)\)\//);
    return m ? (new Date(+m[1])).toLocaleDateString('es-es', { month: '2-digit', day: '2-digit', year: 'numeric' }) : d;
}

function cargarInhabilitacion(data) {
    errorInhabilitacion = true;
    var error = "<strong>Vehículo(" + data.CartaPorte.Patente + ") inhabilitado :</strong>";
    $.each(data.Error, function (k, v) {
        error += "<div>Desde " + getDateIfDate(v.FechaDesde) + " - Hasta: " + getDateIfDate(v.FechaHasta) + " Motivo : " + v.Motivo + "</div>";
    });
    $("#validation-ctg").html(error);
    $("#validation-ctg-alert").removeClass("hide");
}
function cargarCP(data) {
    if (!data.CartaPorte.Cupo) {
        MostrarAlertaAdvertencia("AFIP no respondió el número de CUPO. Debe ingresarlo manualmente");
    }
    $("#Cupo").val(data.CartaPorte.Cupo);
    $("#Patente").val(data.CartaPorte.Patente);

    $("#CTG").val(data.CartaPorte.CTG);
    $("#CodEstab").val(data.CartaPorte.CodEstab);
    $("#RtteComercialCodigoSap").val(data.CartaPorte.RtteComercialCodigoSap);
    $("#TitularCartaPorteCodigoSap").val(data.CartaPorte.TitularCartaPorteCodigoSap);

    $('#checkSinCupo').prop('checked', false);
    $("#btnAceptar").focus();
}

var patenteNoReconocida = 'Patente no reconocida';

function ValidarPatentesIguales() {
    errorPatente = false;
    if ($('#checkvalidarPatente').is(':checked')) {
        if ($("#patenteALPR").html() !== patenteNoReconocida &&
            $("#patenteALPR").html() !== '' &&
            $("#Patente").val() !== '' &&
            $("#patenteALPR").html().toUpperCase() !== $("#Patente").val().toUpperCase()) {
            $("#validation-danger").html("<strong>La patente reconocida en la imagen (" + $("#patenteALPR").html().toUpperCase() + ") no coincide con la obtenida de AFIP (" + $("#Patente").val().toUpperCase() + ")</strong>");
            $("#validation-patente-danger").removeClass("hide");
            errorPatente = true;
        } else if (
            $("#patenteALPR").html() === patenteNoReconocida ||
            $("#patenteALPR").html() === '' &&
            $("#Patente").val() !== '') {
            $("#validation-danger").html("<strong>No se pudo reconocer la patente del vehículo en la imagen, debe validarla manualmente</strong>");
            $("#validation-patente-danger").removeClass("hide");
            errorPatente = true;
        } else {
            $("#validation-patente-danger").addClass("hide");
            $("#validation-danger").html('');
        }
    }
}

function ListarCupos() {
    $.ajax({
        url: $('#links').data().urlListar,
        data: { },
        type: "GET",
        success: function (data) {
            $('#listaCupos').html(data);
        },
        complete: function (data) {
            setTimeout(ListarCupos, 4000);
        }
    });
}
