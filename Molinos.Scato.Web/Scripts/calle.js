$(document).ready(function () {
    $('#dialogo-editar').show(function () {
        if ($('#Codigo').val() != "") {
            $('#Codigo').attr('readonly', true);
        } else {
            $('#Codigo').attr('readonly', false);
        }
    });
});