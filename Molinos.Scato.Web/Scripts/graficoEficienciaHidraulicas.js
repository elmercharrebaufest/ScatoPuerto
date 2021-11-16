function DataSetChartLine(nombreDeLinea, data, color) {
    this.label = nombreDeLinea,
        this.fill = false,
        this.borderDash = [],
        this.borderDashOffset = 0.0,
        this.borderJoinStyle = 'miter',
        this.borderWidth = 2,
        this.data = data;
    if (color == null) {
        this.backgroundColor = '#000000';
        this.hoverBackgroundColor = '#000000';
    } else {
        this.backgroundColor = color;
        this.hoverBackgroundColor = color;
    }
}

function GraficoEficienciaHidraulicaViewModel() {
    // Inicializo observers
    var self = this;
    var intervalo = 60;
    var multiplicador = 1000;
    self.datasetTotal = new DataSetChartLine("", [], null);
    self.fechaSeleccionada = null;
    self.materialSeleccionado = null;
    var myLineChartHidraulicas = null;
    var graficoIniciado = false;

    self.actualizarGrafico = function (funcionRecursiva) {
        graficoIniciado = true;
        $.getJSON(urlGenerarEficienciaHidraulicas, { MaterialId: self.materialSeleccionado, Fecha: self.fechaSeleccionada }, function (data) {
            self.datasetTotal.data = data.CamionesPorHidraulica;
        }).complete(function () {
            var ctxh = $("#myChartHidraulicas");
            var labels = $.map(self.datasetTotal.data, function (n) {
                return n.Clave;
            });
            var valores = $.map(self.datasetTotal.data, function (n) {
                return n.Valor;
            });
            if (myLineChartHidraulicas) {
                myLineChartHidraulicas.destroy();
            }
            myLineChartHidraulicas = new Chart(ctxh, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: textoHidraulicas,
                            data: valores,
                            backgroundColor: '#9be334',
                            borderColor: '#9be334',
                            borderWidth: 1
                        }]
                },
                options: {
                    animation: false,
                    legend: {
                        display: true
                    },
                    scales: {
                        yAxes: [
                            {
                                ticks: {
                                    min: 0
                                }
                            }
                        ],
                        xAxes: [
                            {
                                ticks: {
                                    min: 0
                                }
                            }]
                    },
                    elements: {
                        point: { radius: 0 }
                    },
                    //tooltips: {
                    //    callbacks: {
                    //        label: function (tooltipItem) {
                    //            var retorno = [textoHidraulicas + ': ' + Number(tooltipItem.yLabel).toString()];
                    //            retorno.push('Toneladas: ' + toneladas[tooltipItem.index]);
                    //            return retorno;
                    //        }
                    //    }
                    //}
                }
            });

            if (funcionRecursiva != null) {
                setTimeout(funcionRecursiva, intervalo * multiplicador);
            }
        });
    }
    function actualizarGraficoRecursivo() {
        self.actualizarGrafico(actualizarGraficoRecursivo);
    }

    self.generarGrafico = function () {
        self.materialSeleccionado = $("#materialIdHidraulica").val();
        self.fechaSeleccionada = $("#Fecha").val();
        if (!graficoIniciado) {
            actualizarGraficoRecursivo();
        } else {
            self.actualizarGrafico();
        }
    }
}

var graficoHidraulica;
$(document).ready(function () {
    DefinirAutocompletar('#materialDescripcionHidraulica', '#materialIdHidraulica', $('#links').data().urlBuscarMateriales, $('#links').data().urlBuscarMaterial, null, null);
    graficoHidraulica = new GraficoEficienciaHidraulicaViewModel();
    ko.applyBindings(graficoHidraulica, document.getElementById("graficoeficienciahidraulica"));
    graficoHidraulica.generarGrafico();
});