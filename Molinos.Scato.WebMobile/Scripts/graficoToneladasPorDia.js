function DataSetChartLine(nombreDeLinea, data, color) {
    this.label = nombreDeLinea,
        this.fill = false,
        this.borderDash = [],
        this.borderDashOffset = 0.0,
        this.borderJoinStyle = 'miter',
        this.borderWidth = 2,
        this.data = data;
    if (color === null) {
        this.backgroundColor = '#000000';
        this.hoverBackgroundColor = '#000000';
    } else {
        this.backgroundColor = color;
        this.hoverBackgroundColor = color;
    }
}

function GraficoToneladasPorDiaViewModel() {
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
        $.getJSON(urlGenerarToneladasPorDias, { MaterialId: self.materialSeleccionado, Fecha: self.fechaSeleccionada }, function (data) {
            self.datasetTotal.data = data.CamionesPorHidraulica;
        }).done(function () {
            var ctxh = $("#myChartToneladasPorDia");
            var labels = $.map(self.datasetTotal.data, function (n) {
                return n.Clave;
            });
            var toneladas = $.map(self.datasetTotal.data, function (n) {
                return n.Toneladas;
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
                            label: textoToneladasPorDia,
                            data: toneladas,
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
                    }
                }
            });

            //if (funcionRecursiva !== null) {
            //    setTimeout(funcionRecursiva, intervalo * multiplicador);
            //}
            }).fail(function () {

        });
    }
    function actualizarGraficoRecursivo() {
        self.actualizarGrafico(actualizarGraficoRecursivo);
    }

    self.generarGraficoToneldasPorDia = function () {
        self.materialSeleccionado = $("#materialIdToneladasPorDia").val();
        self.fechaSeleccionada = $("#FechaToneladasPorDia").val();
        if (!graficoIniciado) {
            actualizarGraficoRecursivo();
        } else {
            self.actualizarGrafico();
        }
    }
}

var graficoToneladasPorDia;
$(document).ready(function () {
    DefinirAutocompletar('#materialDescripcionToneladasPorDia', '#materialIdToneladasPorDia', $('#links').data().urlBuscarMateriales, $('#links').data().urlBuscarMaterial, null, null);
    graficoToneladasPorDia = new GraficoToneladasPorDiaViewModel();
    ko.applyBindings(graficoToneladasPorDia, document.getElementById("graficoToneladasPorDia"));
    graficoToneladasPorDia.generarGraficoToneldasPorDia();
});