$(document).ready(function () {

    $(".FechaDesde input").datetimepicker({
        format: "dd/mm/yyyy hh:ii",
        autoclose: true,
        pickerPosition: "bottom-left",
    });
    $(".FechaHasta input").datetimepicker({
        format: "dd/mm/yyyy hh:ii",
        autoclose: true,
        pickerPosition: "bottom-left",
    });

    $(".FechaDesde input").change(function (selected) {
        cambiarFechaDesde($(".FechaDesde input").val());
    });

    $(".FechaHasta input").change(function (selected) {
        cambiarFechaHasta($(".FechaHasta input").val());
    });
});

function cambiarFechaDesde(selected) {
    $(".FechaHasta input").datepicker("option", "minDate", selected);
    $(".FechaDesde input").valid();
    var controlGroup = $(".FechaDesde input").closest("div.control-group");
    if (controlGroup.find('span.field-validation-error').length == 0)
        controlGroup.removeClass('error');
    else
        controlGroup.addClass('error');
}

function cambiarFechaHasta(valor) {
    $(".FechaDesde input").datepicker("option", "maxDate", valor);
    $(".FechaHasta input").valid();
    var controlGroup = $(".FechaHasta input").closest("div.control-group");
    if (controlGroup.find('span.field-validation-error').length == 0)
        controlGroup.removeClass('error');
    else
        controlGroup.addClass('error');
}