
jQuery(document).ready(function ($) {
    
    /*Agrego clase de validación para Bootstrap*/
    $('span.field-validation-valid, span.field-validation-error').each(function () {
        $(this).addClass('help-block');
    });
    
    //  create the model
    var model = new VagonViewModel();

    //  bind model to the html
    ko.applyBindings(model);

    if ($('#esIngreso').val() == "False") {
        $('#TarifaReferencia').attr("readonly", "readonly");
        $('#TarifaReferencia').attr('tabindex', -1); 
    }
    $.validator.addMethod("KmRecorrerRequerido", function (value, element) {
        return value.length > 0;
    }, $('#KmRecorrer').data().errorRequerido);
    $.validator.addMethod("KmRecorrerNumerico", function (value, element) {
        return $.isNumeric(Globalize.parseFloat(value));
    }, $('#KmRecorrer').data().errorNumerico);

    //Corrige la funcionalidad de la validación
    var arr = ["KmRecorrer"];

    jQuery.each(arr, function (i, val) {
        $("#" + val).focusout(function () {
            if ($("#" + val).parent().children().children().length == 0) {
                $("#" + val).parent().parent().removeClass("error");
            }
            if ($("#" + val).parent().children().children().length == 1) {
                $("#" + val).parent().parent().addClass("error");
            }
        });
    });
});

/*----------------------------------------------------------------------*/
/* Item Model
/*----------------------------------------------------------------------*/
var i = 0;
function Vagon(id, patente, bruto, tara, neto,primero) {
    var self = this;
    self.Id = id;
    self.Patente = ko.observable(patente).extend({ required: true });
    self.PesoBrutoOrigen = ko.observable(bruto);
    self.PesoTaraOrigen = ko.observable(tara);
    self.PesoNetoOrigen = ko.observable(neto);
    self.Primero = ko.observable(primero);
    self.Indice1 = ko.observable(i++);
    self.Indice2 = ko.observable(i++);
    self.Indice3 = ko.observable(i++);
    self.Indice4 = ko.observable(i++);
};

/*----------------------------------------------------------------------*/
/* View Model
/*----------------------------------------------------------------------*/
function VagonViewModel() {
    var self = this;

    //  data
    self.vagones = ko.observableArray([]);
    var vagonesJson = $("#VehiculoJson").val();
    if (vagonesJson != "[]" && vagonesJson != "" && vagonesJson != null) {
        var vagonesAux = jQuery.parseJSON(vagonesJson);
        var primero = true;
        for (var i = 0; i < vagonesAux.length; i++) {
            self.vagones.push(new Vagon(vagonesAux[i].Id, vagonesAux[i].Patente, vagonesAux[i].PesoBrutoOrigen, vagonesAux[i].PesoTaraOrigen, vagonesAux[i].PesoNetoOrigen, primero));
            primero = false;
        }
    }


    //  edit helpers
    self.availableColours = [];
    self.editingItem = ko.observable();
    self.isItemEditing = function (itemToTest) {
        return itemToTest == self.editingItem();
    };

    //  edit behaviours
    self.addVagon = function () {
        var esPrimero = false;
        if (self.vagones().length == 0) esPrimero = true;
        var vagon = new Vagon(0, null, null, null, null, esPrimero);
        self.vagones.push(vagon);
        
        $(".patente-internacional").mask("?9999999");
        if ($('#esIngreso').val() == "False") {
            $('.pesoBrutoRequerido').attr('disabled', 'disabled');
            $('.pesoTaraRequerido').attr('disabled', 'disabled');
        }
    };

    self.removeVagon = function (vagon) {
        if (self.editingItem() == null) {
            self.vagones.remove(vagon);
        }
    };

    self.actualizarPesoNeto = function (e) {
        var resta = e.PesoBrutoOrigen() - e.PesoTaraOrigen();
        if (isNaN(resta)) {
            e.PesoNetoOrigen(null);
        } else {
            e.PesoNetoOrigen(resta);
        }
    };

}