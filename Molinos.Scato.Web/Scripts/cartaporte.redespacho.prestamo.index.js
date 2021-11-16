jQuery(document).ready(function ($) {
    $('#Prestador').addClass('PrestadorRequerido');
    $.validator.addMethod("PrestadorRequerido", function (value, element) {
        return value.length > 0;
    }, $('#Prestador').data().error);
});