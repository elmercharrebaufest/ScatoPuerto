$(document).ready(function () {
    $(document).on('click', '.confirmar-boton', function () {
        $("#dialogo-confirmar-confirmar").val($(this).data().accion);
       

        if($(this).data().accion == "Autorizar" || $(this).data().accion == "TerminarInhabilitaciones") {
            $("#terminarInhabilitacion").hide();
            $("#MotivoTerminarInhabilitacion").hide();
            $("#motivo").show();
            $("#MotivoAutorizacion").show();
            $("#dialogo-confirmar-text").text($(this).data().mensaje).hide();
            $("#dialogo-confirmar").addClass("margen-400");

        } else {
            $("#motivo").hide();
            $("#MotivoAutorizacion").hide();
            $("#terminarInhabilitacion").hide();
            $("#MotivoTerminarInhabilitacion").hide();
            $("#dialogo-confirmar-text").text($(this).data().mensaje).show();
            $("#dialogo-confirmar").removeClass("margen-400");

        }
        $("#dialogo-confirmar").on('hide.bs.modal', function () {            
            $("#MotivoAutorizacion").val("");
            $("#MotivoTerminarInhabilitacion").val("");

        });
        $("#dialogo-confirmar").modal('show');
        return false;
    });

});