
function DeshabilitarCampo(elemento) {
    elemento.attr('readonly', 'readonly');
    elemento.addClass("italic");
    elemento.unbind('focusout');
    elemento.unbind('keydown');  
    elemento.unbind('change');
    elemento.autocomplete({ disabled: true });
}

function HabilitarCampos() {
    $('input').attr("readonly", false);
    $('select').attr("readonly", false);
    $('select').removeAttr('disabled');
    $('input').removeAttr('disabled');
    $('#aceptar').attr("readonly", false);
    DeshabilitarCampo($('#Destinatario'));
    DeshabilitarCampo($('#Procedencia'));
    DeshabilitarCampo($('#TitularCartaPorte'));
    $('#CodEstab').attr('readonly', true);
    $('#bocaDestino').attr("readonly");
    $('#bocaDestino').attr('disabled', 'disabled');
    //$('#NroCartaPorte').addClass('validarCartaPorte');
};

function DesHabilitarCampos() {
    $('input').attr('readonly', true);
    $('select').attr('readonly', true);
    $('input').attr('disabled', 'disabled');
    $('select').attr('disabled', 'disabled');
    $('#aceptar').attr('readonly', true);
    $('#TipoComercialId').attr('readonly', false);
    $('#TipoComercialId').attr('disabled', false);
    //$('#NroCartaPorte').removeClass('validarCartaPorte');
}

function ReutilizarCartaPorte(cartaPorte) {
    LlenarCartaPorteRedespacho(cartaPorte);
    //TipoComercial
    $('#TipoComercial').val(cartaPorte.TipoComercialId);
    if (cartaPorte.EsExtranjero == true) {
        $("#esExtranjero").attr("checked", true);
        cargarExtranjero();
        cargarMascara();
    }
}

function LlenarCartaPorteRedespacho(cartaPorte) {

    ////fecha emision
    //if (cartaPorte.FechaEmision != null && cartaPorte.FechaEmision != "") {
    //    var fechaEmision = new Date(parseInt(cartaPorte.FechaEmision.substr(6)));
    //    var fechaEmisionFormateada = Globalize.format(fechaEmision, 'd');
    //    $('#FechaEmision').removeAttr('readonly');
    //    $('#FechaEmision').val(fechaEmisionFormateada);
    //}

    //FechaCP
    if (cartaPorte.FechaCP != null && cartaPorte.FechaCP != "") {
        var fechaCp = new Date(parseInt(cartaPorte.FechaCP.substr(6)));
        var fechaCpFormateada = Globalize.format(fechaCp, 'd');
        $('#FechaCP').removeAttr('readonly');
        $('#FechaCP').val(fechaCpFormateada);
    }

    //FechaVto
    if (cartaPorte.FechaVto != null && cartaPorte.FechaVto != "") {
        var fechaVto = new Date(parseInt(cartaPorte.FechaVto.substr(6)));
        var fechaVtoFormateada = Globalize.format(fechaVto, 'd');
        $('#FechaVto').val(fechaVtoFormateada);
    }

    //centro destino
    $('#DestinoId').val(cartaPorte.DestinoId);
    $('#Destino').val(cartaPorte.Destino);
    $('#Destino').addClass("italic");

    //CTG
    $('#CTG').val(cartaPorte.CTG);
    if ($('#Cupo').length > 0) {
        $('#Cupo').val(cartaPorte.Cupo);
    }

    if ($('#NumeroAduana').length > 0) {
        $('#NumeroAduana').val(cartaPorte.NumeroAduana);
    }
    
    //CTG
    //$('#CEE').val(cartaPorte.CEE);

    //PatenteCamion
    $('#PatenteCamion').val(cartaPorte.PatenteCamion);
    $('#PatenteAcoplado').val(cartaPorte.PatenteAcoplado);

    //Desvio
    $('#Desvio').prop('checked', cartaPorte.Desvio);

    //Extranjero
    $('#esExtranjero').prop('checked', cartaPorte.EsExtranjero);


    //TitularCartaPorte
    $('#TitularCartaPorteId').val(cartaPorte.TitularCartaPorteId);
    $('#TitularCartaPorte').val(cartaPorte.TitularCartaPorte);
    $('#TitularCartaPorte').addClass("italic");

    //Intermediario
    $('#IntermediarioId').val(cartaPorte.IntermediarioId);
    $('#Intermediario').val(cartaPorte.Intermediario);
    $('#Intermediario').addClass("italic");

    //RtteComercial
    $('#RtteComercialId').val(cartaPorte.RtteComercialId);
    $('#RtteComercial').val(cartaPorte.RtteComercial);
    $('#RtteComercial').addClass("italic");

    //Corredor
    $('#CorredorId').val(cartaPorte.CorredorId);
    $('#Corredor').val(cartaPorte.Corredor);
    $('#Corredor').addClass("italic");

    //CorredorVendedor
    $('#CorredorVendedorId').val(cartaPorte.CorredorVendedorId);
    $('#CorredorVendedor').val(cartaPorte.CorredorVendedor);
    $('#CorredorVendedor').addClass("italic");
    //IntermediarioFlete
    $('#IntermediarioFleteId').val(cartaPorte.IntermediarioFleteId);
    $('#IntermediarioFlete').val(cartaPorte.IntermediarioFlete);
    $('#IntermediarioFlete').addClass("italic");
    //Entregador
    $('#EntregadorId').val(cartaPorte.EntregadorId);
    $('#Entregador').val(cartaPorte.Entregador);
    $('#Entregador').addClass("italic");

    //AgenteCompras
    $('#AgenteComprasId').val(cartaPorte.AgenteComprasId);
    $('#AgenteCompras').val(cartaPorte.AgenteCompras);
    $('#AgenteCompras').addClass("italic");

    //Destinatario
    $('#DestinatarioId').val(cartaPorte.DestinatarioId);
    $('#Destinatario').val(cartaPorte.Destinatario);
    $('#Destinatario').addClass("italic");

    //Transportista
    $('#TransportistaId').val(cartaPorte.TransportistaId);
    $('#Transportista').val(cartaPorte.Transportista);
    $('#Transportista').addClass("italic");
    $('#EsTransportista').val(true);
    
    //Variedad
    $('#Variedad').val(cartaPorte.Variedad);

    //Cosecha
    $('#Cosecha').val(cartaPorte.Cosecha);

    //Procedencia
    $('#ProcedenciaId').val(cartaPorte.ProcedenciaId);
    $('#Procedencia').val(cartaPorte.Procedencia);
    $('#Procedencia').addClass("italic");

    //CodEstab
    $('#CodEstab').val(cartaPorte.CodEstab);

    //chofer
    SetearChofer(cartaPorte.Chofer);

    //material
    $('#MaterialId').val(cartaPorte.MaterialId);

    if (cartaPorte.TipoCategoriaId != null && cartaPorte.TipoCategoriaId != 0) {
        $('#TipoCategoriaId').val(cartaPorte.TipoCategoriaId);
    }
    

    $('#tipoVehiculoDropdown').val(cartaPorte.TipoVehiculo);
    if (cartaPorte.TipoVehiculo != 1) {
        $('#tabFotos li[class="fotoLi2"]').hide();
    }
    $("#VehiculoJson").val(cartaPorte.VehiculoJson);

    //Prestador
    $('#PrestadorId').val(cartaPorte.PrestadorId);
    $('#Prestador').val(cartaPorte.Prestador);
    $('#Prestador').addClass("italic");

    if ($('#PrestadorId').val() != '0') {
        RecargarBoca(cartaPorte);
    }
    
    //patente
    $('.boca').val(cartaPorte.BocaDestinoId);

    //AcuerdoMarco
    $('#AcuerdoMarco').val(cartaPorte.AcuerdoMarco);

    //Caratula
    $('#Caratula').val(cartaPorte.Caratula);

    //habilito boton aceptar
    $('#aceptar').removeAttr('disabled');

    MostrarAnexo(cartaPorte.CodigoAnexo);
    MostrarTecnologia(cartaPorte.TecnologiaId);
}

function LimpiarCartaPorte() {
    //centro destino
    $('#DestinoId').val('0');
    $('#Destino').val('');
    $('#CTG').val('');
    //$('#CEE').val('');
    $('#FechaCP').val('');
    $('#FechaVto').val('');
    $('#TipoComercial').val('');
    $('#PatenteCamion').val('');
    $('#PatenteAcoplado').val('');
    $('#Desvio').prop('checked', false);
    $('#esExtranjero').prop('checked', false);
    $('#TitularCartaPorteId').val('');
    $('#TitularCartaPorte').val('');
    $('#IntermediarioId').val('0');
    $('#Intermediario').val('');
    $('#RtteComercialId').val('0');
    $('#RtteComercial').val('');
    $('#CorredorId').val('0');
    $('#Corredor').val('');
    $('#EntregadorId').val('0');
    $('#Entregador').val('');
    $('#AgenteComprasId').val('0');
    $('#AgenteCompras').val('');
    $('#DestinatarioId').val('0');
    $('#Destinatario').val('');
    $('#TransportistaId').val('0');
    $('#Transportista').val('');
    $('#Variedad').val('');
    $('#Cosecha').val('');
    $('#ProcedenciaId').val('0');
    $('#Procedencia').val('');
    $('#CodEstab').val('');
    $('#Chofer_Id').val('0');
    $('#Chofer_Cuil').val('');
    $('#Chofer_Nombre').val('');
    $('#Chofer_Apellido').val('');
    $('#Chofer_NumeroDeDocumento').val('');
    $('#Chofer_TipoDocumentoIdentidadId').val('');
    $('.materialId').val('0');
    $('#PrestadorId').val('0');
    $('#Prestador').val('');
    $('#BocaDestinoId').val('0');
    $('#BocaDestino').val('');
    $('.boca').val('');
    $('#AcuerdoMarco').val('');
    $('#Caratula').val('');
    $('#Cupo').val('');
    $('#checkSinCupo').prop('checked', false);
    $('#tipoVehiculoDropdown').get(0).selectedIndex = 0;
    MostrarAnexo();
    MostrarTecnologia();
}

function MostrarAnexo(codigoAnexo) {
    if ($('#divanexo').data() != null) {
        var resultado = jQuery.inArray($('#MaterialId').val(), $('#divanexo').data().materialesAnexos);

        if (resultado == -1) {
            $('#RequiereAnexoInase').val(false);
            $('#divanexo').addClass('hide');
            $('#CodigoAnexo').val('');
            $('#CodigoAnexo').removeClass('anexoRequerido');
        } else {
            $('#RequiereAnexoInase').val(true);
            $('#divanexo').removeClass('hide');
            $('#CodigoAnexo').addClass('anexoRequerido');
            if (codigoAnexo != null) $('#CodigoAnexo').val(codigoAnexo);
        }
    }
}

function MostrarTecnologia(tecnologiaId) {
    if ($('#divtecnologia').data() != null) {
        var resultado = jQuery.inArray($('#MaterialId').val(), $('#divtecnologia').data().materialesTecnologias);

        if (resultado == -1) {
            $('#RequiereTecnologia').val(false);
            $('#divtecnologia').addClass('hide');
            $('#TecnologiaId').val('');
        } else {
            $('#RequiereTecnologia').val(true);
            $('#divtecnologia').removeClass('hide');
            if (tecnologiaId != null) $('#TecnologiaId').val(tecnologiaId);
        }
    }
}

function RecargarBoca(cartaPorte) {
    $.getJSON($('#links').data().urlBuscarBocas, { proveedorId: $("#PrestadorId").val() },
        function (response) {
            var options = '';
            for (var i = 0; i < response.length; i++) {
                options += "<option value='" + response[i].Value + "'>"
                        + response[i].Text + "</option>";
            }
            $('#bocaDestino').html(options);
            $('#bocaDestino').attr("disabled", false);

            $('#BocaDestino').val(cartaPorte.BocaDestino);
            $('#BocaDestinoId').val(cartaPorte.BocaDestinoId);
            $('#bocaDestino').val(cartaPorte.BocaDestinoId);
        });
}