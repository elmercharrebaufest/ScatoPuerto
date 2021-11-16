$(document).ready(function ($) {
    $(document).on('click','.contingencia', function () {
        if (ValidarMotivo()) { return false; }
        BlockUI();
        $.getJSON(urlContingencia, { id: $("#elemento-id").val(), motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });
    $(document).on('click', '.sinAfip', function () {
        if (ValidarMotivo()) { return false; }
        BlockUI();
        $.getJSON(urlSinAfip, { id: $("#elemento-id").val(), motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });
    $(document).on('click', '.sinCupo', function () {
        if (ValidarMotivo()) { return false; }
        BlockUI();
        $.getJSON(urlSinCupo, { id: $("#elemento-id").val(), motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });
    $(document).on('click', '.sinFotoCartaPorte', function () {
        if (ValidarMotivo()) { return false; }
        BlockUI();
        $.getJSON(urlSinFotoCartaPorte, { id: $("#elemento-id").val(), motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    }); 
    $(document).on('click', '.imprimeCartaPorte', function () {
        if (ValidarMotivo()) { return false; }

        BlockUI();
        $.getJSON(urlImprimeCartaPorte, { id: $("#elemento-id").val(), motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });
    $(document).on('click', '.imprimeTarjetaDeAcceso', function () {
        if (ValidarMotivo()) { return false; }

        BlockUI();
        $.getJSON(urlImprimeTarjetaDeAcceso, { id: $("#elemento-id").val(), motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });

    $(document).on('click', '.tomarFotoCartaDePorteEnCentro', function () {
        if (ValidarMotivo()) { return false; }
        BlockUI();
        $.getJSON(urlTomarFotoCartaDePorteEnCentro, { motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });
    $(document).on('click', '.descargaCartaPortePorCtg', function () {
        if (ValidarMotivo()) { return false; }

        BlockUI();
        $.getJSON(urlDescargaCartaPortePorCtg, { motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });
    $(document).on('click', '.solicitaConfirmarCTG', function () {
        if (ValidarMotivo()) { return false; }

        BlockUI();
        $.getJSON(urlSolicitaConfirmarCTG, { motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });
    $(document).on('click', '.validarCupo', function () {
        if (ValidarMotivo()) { return false; }

        BlockUI();
        $.getJSON(urlValidarCupo, { motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });

    $(document).on('click', '.nirsManual', function () {
        if (ValidarMotivo()) { return false; }

        BlockUI();
        $.getJSON(urlNirsManual, { id: $("#elemento-id").val(), motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });
    $(document).on('click', '.humedimetroManual', function () {
        if (ValidarMotivo()) { return false; }

        BlockUI();
        $.getJSON(urlHumedimetroManual, { id: $("#elemento-id").val(), motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });
    $(document).on('click', '.balanzaManual', function () {
        if (ValidarMotivo()) { return false; }

        BlockUI();
        $.getJSON(urlBalanzaManual, { id: $("#elemento-id").val(), motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });

    $(document).on('click', '.impresionTicketDeSalida', function () {
        if (ValidarMotivo()) { return false; }

        BlockUI();
        $.getJSON(urlImpresionTicketDeSalida, { motivo: $("#motivo").val() }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });

    $(document).on('click', '.habilitarGranos', function () {
        if (ValidarMotivo()) { return false; }

        BlockUI();
        $.getJSON(urlContingenciaGranos, {
            id: $("#elemento-id").val(),
            contingencia: $("#elemento-grano").val() == "true" ? $("#granos:checked").val() == "on" : $("#no-granos:checked").val() == "on",
            esGranos: $("#elemento-grano").val(),
            motivo: $("#motivo").val()
        }, function (data) {
            if (data !== "") {
                MostrarAlertaError(data.value);

            } else {
                MostrarAlertaExitosa();
            }
        }).complete(function () {
            $.unblockUI();
            $("#contingenciaModal").modal("hide");
        });
    });

    $(document).on('click', '.slider', function () {
        $("#elemento-id").val($(this)[0].getAttribute('data-id'));
        $("#elemento-grano").val($(this)[0].getAttribute('data-granos'));
        $("#elemento-contingencia").val($(this)[0].getAttribute('data-contingencia'));
        $("#guardar").addClass($(this)[0].getAttribute('data-contingencia'));
        $("#motivo").val("");
        $("#error-requerido").hide(); 
        $("#error-largo").hide(); 

        $("#contingenciaModal").modal("show");
    });

    $(document).on('click', '#cancelar', function () {
        var contingencia = $("#elemento-contingencia").val();
        var id = $("#elemento-id").val();
        var inputs = [];
        if (id == "") {
            inputs = $('[data-contingencia=' + contingencia + ']').siblings();
        } else  {
            inputs = $('[data-contingencia=' + contingencia + '][data-id=' + id + ']').siblings();
        }
        inputs.trigger('click');
        $("#contingenciaModal").modal("hide");
    });
    function ValidarMotivo() {
        $("#error-requerido").hide();
        $("#error-largo").hide(); 
        var motivo = $("#motivo").val();
        if (motivo == "") {
            $("#error-requerido").show();
            return true;
        }
        if (motivo.length < 10) {
            $("#error-largo").show();
            return true;
        }
        return false;
    }
});
