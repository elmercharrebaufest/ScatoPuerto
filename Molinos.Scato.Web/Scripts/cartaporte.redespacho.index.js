jQuery(document).ready(function ($) {    
    //Eventos
    $('.cargarCartaPorte').off("change");
    $("#dialogo-confirmar-confirmar").off("click");
    
    var cartaDePorte;
    $('.cargarCartaPorte').change(function () {
        var nroCartaPorte = $('.cargarCartaPorte').val();
        if (nroCartaPorte.length == 12 && $.isNumeric(nroCartaPorte)) {
            BlockUI($("#MensajeBuscandoCartaPorte").val());
            $.getJSON($("#links").data().urlObtenerCartaPorteRedespacho, { numero: nroCartaPorte, workflow: $('#workflow').val(), esIngreso: $('#esIngreso').val() }, function (data) {
                if (data.CodigoDeError == 0) {
                    cartaDePorte = data.CartaPorte;
                    // Muestro dialogo: Reutilizar: si, no
                    if (data.EsRedespacho == true) {
                        cargarCartaDePorteRedespacho(cartaDePorte);
                        if (data.EstaDemorado && $('#controlarTiempoPorCTG').val() == "True") {
                            MostrarAlertaAdvertencia(data.Error);
                        }
                    } else {
                        $("#dialogo-confirmar").modal('show');
                    }
                } else if (data.CodigoDeError == 1) {
                    //MostrarAlertaAdvertencia(data.Error);
                    $('.btn').removeAttr('disabled');
                } else {
                    MostrarAlertaError(data.Error);
                }
            }).complete(function () {
                $.unblockUI();
            });
        }
    });

    $("#dialogo-confirmar-confirmar").on('click', function () {
        cargarCartaDePorte(cartaDePorte);
        ValidarObjeto($("#orden-form"), $("#CEE"));
        return false;
    });
    
    function cargarCartaDePorteRedespacho(cartaDePorteRedespacho) {
        LimpiarCartaPorte();
        LlenarCartaPorteRedespacho(cartaDePorteRedespacho);
        $('.btn').removeAttr('disabled');
        //MostrarAlertaExitosa();
        $("#dialogo-confirmar").modal('hide');
        setearVistaTipoVehiculo(cartaDePorteRedespacho);
    }
    
});