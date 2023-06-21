using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Servicios;
using NPOI.HSSF.UserModel;
using NPOI.SS.Formula.Functions;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using static System.Net.WebRequestMethods;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    public class ExcelProgramaEmbarque
    {
        private readonly HSSFWorkbook workbook;
        private readonly HSSFSheet sheet;
        private readonly IList<NominacionDto> nominaciones;
        /// <summary>
        /// Puntero incremental que marca el indice de la fila actual
        /// </summary>
        private int nroFila;
        /// <summary>
        /// Flag para alternar entre 2 colores, para así diferenciar entre secciones
        /// </summary>
        private bool flagColor;
        private readonly Dictionary<string, short> indicesColores;
        private short indiceColorActual;

        public ExcelProgramaEmbarque(IList<NominacionDto> list)
        {
            nominaciones = list;
            workbook = new HSSFWorkbook();
            sheet = (HSSFSheet)workbook.CreateSheet("Programa de embarques");
            nroFila = 0;
            flagColor = false;
            indicesColores = new Dictionary<string, short>();
            CrearPaletaDeColores();
        }
        public byte[] GenerarArchivo()
        {
            GenerarExcel();
            using (var fs = new FileStream(@"C:\Users\mleiva\Desktop\Prueba Excel\test.xls", FileMode.Create, FileAccess.Write))
            {
                workbook.Write(fs);
            }
            using (var fileData = new MemoryStream())
            {
                workbook.Write(fileData);
                return fileData.ToArray();
            }
        }

        private void GenerarExcel()
        {
            InsertarFilaTitulo("Programa de Embarque de Molinos Agro S.A.", true);
            nroFila++;
            foreach (var nominacion in nominaciones) InsertarNominacion(nominacion);
            // Ajustar columnas
            for (int i = 1; i <= 12; i++)
            {
                sheet.AutoSizeColumn(i);
            }
        }

        private void InsertarNominacion(NominacionDto nominacion)
        {
            flagColor = true;
            indiceColorActual = indicesColores[nominacion.NominacionDatoTecnico.MaterialPuerto.Color];
            InsertarFilaSeparador();
            InsertarDatosTecnicos(nominacion.NominacionDatoTecnico);
            InsertarRecibos(nominacion.NominacionRecibo);
            InsertarIntervenciones(nominacion.NominacionDetalleIntervencion);
            nroFila += 2;
        }

        private void InsertarDatosTecnicos(NominacionDatoTecnicoDto datoTecnico)
        {
            string[] valoresCeldas;

            #region BUQUE Y PRODUCTO
            valoresCeldas = new string[] { "Producto", "Nombre Buque", "Bandera", "Tipo de buque", "IMO", "Detalle Producto", "Cantidad Total", "Calidad", "Tolerancia", "Observaciones" };
            InsertarFilaConValores(valoresCeldas, true, true);
            valoresCeldas = new string[] {
                datoTecnico.MaterialPuerto == null ? "-" : datoTecnico.MaterialPuerto.DescripcionCortaIngles,
                datoTecnico.VaporInformacion?.NombreBuque ?? "-",
                datoTecnico.VaporInformacion?.Bandera?.Nombre ?? "-",
                datoTecnico.VaporInformacion?.TipoBuque ?? "-",
                datoTecnico.VaporInformacion?.ImoVapor ?? "-",
                datoTecnico.MaterialPuerto.Descripcion,
                datoTecnico.CantidadTotal.ToString(),
                datoTecnico.NominacionDatoTecnicoCalidad?.FirstOrDefault()?.CalidadValor?.TipoDeCalidad?.Descripcion ?? "-",
                String.Format("+/- {0}%", datoTecnico.Tolerancia),
                datoTecnico.Observaciones ?? "-"
            };
            InsertarFilaConValores(valoresCeldas, columnasMayorFuente: new int[] { 1, 2 });
            flagColor = !flagColor;
            #endregion

            #region EMBARQUE
            valoresCeldas = new string[] {
                "Muelle de carga", "ETA Recalada", "Obligacion de carga", "ATA", "Agencia Maritima",
                "Loading Rate", "DEM", "DES", "Tipo de contrato", "Surveyor", "Observaciones del Surveyor"
            };
            InsertarFilaConValores(valoresCeldas, true, true);
            valoresCeldas = new string[] {
                datoTecnico.MuelleDeCarga?.Descripcion ?? "-",
                datoTecnico.ETARecalada.Value != null ? datoTecnico.ETARecalada.Value.ToString("dd/MM/yyyy") : "-",
                datoTecnico.ObligacionDeCarga.Value != null ? datoTecnico.ObligacionDeCarga.Value.ToString("dd/MM/yyyy") : "-",
                datoTecnico.ATAPuerto?.Nombre ?? "-",
                datoTecnico.AgenciaMaritimaPuerto?.Nombre ?? "-",
                (datoTecnico.TasaDeCargaValor ?? 0).ToString(),
                datoTecnico.DEM.ToString(),
                datoTecnico.DES.ToString(),
                datoTecnico.TipoDeContrato?.Descripcion ?? "-",
                datoTecnico.Surveyor?.Descripcion ?? "-",
                datoTecnico.ObservacionesSurveyor ?? "-"
            };
            InsertarFilaConValores(valoresCeldas, columnasMayorFuente: new int[] { 1, 2, 3 });
            flagColor = !flagColor;
            #endregion

            #region CANTIDADES
            InsertarFilaConValores(new string[] { "Cantidad por destino" }, true, true);
            foreach (var destino in datoTecnico.NominacionDatoTecnicoDestino)
            {
                valoresCeldas = new string[] { destino.Destino.Nombre, destino.Cantidad + "tn" };
                InsertarFilaConValores(valoresCeldas);
            }
            flagColor = !flagColor;
            InsertarFilaConValores(new string[] { "Cantidad por cargadores" }, true, true);
            foreach (var item in datoTecnico.NominacionDatoTecnicoExportador)
            {
                valoresCeldas = new string[] { item.Exportador.Nombre, String.Format("{0} tn +/- {1}%", item.Cantidad, item.Tolerancia) };
                InsertarFilaConValores(valoresCeldas, false);
            }
            flagColor = !flagColor;
            InsertarFilaConValores(new string[] { "Cantidad por cliente" }, true, true);
            foreach (var item in datoTecnico.NominacionDatoTecnicoCoordinadorPuerto)
            {
                valoresCeldas = new string[] { item.CoordinadorPuerto.Nombre, item.Cantidad + " tn" };
                InsertarFilaConValores(valoresCeldas, false);
            }
            flagColor = !flagColor;
            #endregion
        }

        private void InsertarRecibos(ICollection<NominacionReciboDto> nominacionRecibo)
        {
            InsertarFilaTitulo("Recibos");
            var valoresCeldas = new string[] {
                "N° de recibo", "Cargador", "Formato", "Cantidad (TN)", "Unidad", "Ajuste", "Loading Port",
                "Discharge Port", "Description of goods", "Recibos por día", "Mostrar Destinos", "Mostrar Bodegas"
            };
            InsertarFilaConValores(valoresCeldas, true);
            foreach (var recibo in nominacionRecibo)
            {
                valoresCeldas = new string[] {
                    recibo.NumeroRecibo.ToString(),
                    recibo.Exportador?.Nombre ?? "-",
                    recibo.Formato,
                    recibo.Cantidad.ToString(),
                    recibo.Unidad,
                    recibo.Ajuste,
                    recibo.PuertoDeCarga,
                    recibo.PuertoDeDescarga,
                    recibo.DescripcionesBienes,
                    recibo.RecibosPorDia ? "SI" : "NO",
                    recibo.MostrarDestinos ? "SI" : "NO",
                    recibo.MostrarBodegas ? "SI" : "NO"
                };
                InsertarFilaConValores(valoresCeldas);
            }
            flagColor = !flagColor;
        }

        private void InsertarIntervenciones(NominacionDetalleIntervencionDto detalleIntervencion)
        {
            string[] valoresCeldas;
            #region INTERVENCIONES
            InsertarFilaTitulo("Intervenciones");
            valoresCeldas = new string[] { "", "Aplica", "A cuenta de", "Observaciones" };
            InsertarFilaConValores(valoresCeldas, true);
            valoresCeldas = new string[] {
                "Precintado de bodegas",
                detalleIntervencion == null ? "-" : detalleIntervencion.Precintado ? "SI" : "NO",
                detalleIntervencion?.PrecintadoACuentaDe ?? "-",
                "-"
            };
            InsertarFilaConValores(valoresCeldas, negritaSoloPrimero: true);
            valoresCeldas = new string[] {
                "Draft Survey",
                detalleIntervencion == null ? "-" : detalleIntervencion.DraftSurvey ? "SI" : "NO",
                detalleIntervencion?.SurveyACuentaDe ?? "-",
                "-"
            };
            InsertarFilaConValores(valoresCeldas, negritaSoloPrimero: true);
            valoresCeldas = new string[] {
                "Permiso de embarque",
                detalleIntervencion == null ? "-" : detalleIntervencion.PermisoDeEmbarque ? "SI" : "NO",
                "-", "-"
            };
            InsertarFilaConValores(valoresCeldas, negritaSoloPrimero: true);
            valoresCeldas = new string[] {
                "Estibado y trimado",
                detalleIntervencion == null ? "-" : detalleIntervencion.EstibadorYTrimado ? "SI" : "NO",
                "-", "-"
            };
            InsertarFilaConValores(valoresCeldas, negritaSoloPrimero: true);
            valoresCeldas = new string[] {
                "Fumigación",
                detalleIntervencion?.Fumigacion ?? "-",
                detalleIntervencion?.CompaniaACuentaDe ?? "-",
                detalleIntervencion?.TipoDeFumigacion?.Descripcion ?? "-"
            };
            InsertarFilaConValores(valoresCeldas, negritaSoloPrimero: true);
            flagColor = !flagColor;
            #endregion

            #region SENASA
            InsertarFilaTitulo("SENASA");
            valoresCeldas = new string[] {
                "Exportador", "CORRESPONDE SENASA", "Consumo", "A cuenta de", "Destino", "IP", "GMO",
                "FITO", "Muestras oficiales", "Certificado de inocuidad", "Certificado Veterinario"
            };
            InsertarFilaConValores(valoresCeldas, true);
            foreach (var intervencion in detalleIntervencion.Senasa)
            {
                valoresCeldas = new string[] {
                    intervencion.Exportador.Nombre ?? "-",
                    intervencion.TieneSenasa ? "SI" : "NO",
                    intervencion.Consumo ?? "-",
                    intervencion.ACuentaDe ?? "-",
                    intervencion.Destino?.Nombre ?? "-",
                    intervencion.IP ? "SI" : "NO",
                    intervencion.GMO ? "SI" : "NO",
                    intervencion.FITO ? "SI" : "NO",
                    intervencion.MuestraOficial ? "SI" : "NO",
                    intervencion.CertificadoInocuidad ? "SI" : "NO",
                    intervencion.CertificadoVeterinario ? "SI" : "NO"
                };
                var ultimo = intervencion == detalleIntervencion.Senasa.Last();
                InsertarFilaConValores(valoresCeldas, bordeInferiorGrueso: ultimo);
            }
            #endregion
        }

        /// <summary>
        /// Crea una nueva fila a partir de un array de strings.
        /// Cada elemento del array ocupa una columna.
        /// Mueve el puntero de fila un lugar hacia abajo.
        /// </summary>
        /// <param name="datos"></param>
        private void InsertarFilaConValores(string[] datos, bool negrita = false, bool bordeSuperiorGrueso = false, bool bordeInferiorGrueso = false, bool negritaSoloPrimero = false, int[] columnasMayorFuente = null)
        {
            var fila = sheet.CreateRow(nroFila);
            InsertarColumnaColor(fila);

            int nroColumna = 1;
            foreach (var dato in datos)
            {
                var primeraCelda = nroColumna == 1;
                var ultimaCelda = nroColumna == datos.Length;

                var estilo = workbook.CreateCellStyle();
                estilo.BorderTop = bordeSuperiorGrueso ? BorderStyle.Medium : BorderStyle.Thin;
                estilo.BorderBottom = bordeInferiorGrueso ? BorderStyle.Medium : BorderStyle.Thin;
                estilo.BorderLeft = primeraCelda ? BorderStyle.Medium : BorderStyle.Thin;
                estilo.BorderRight = ultimaCelda ? BorderStyle.Medium : BorderStyle.Thin;
                estilo.VerticalAlignment = VerticalAlignment.Center;
                if (flagColor)
                {
                    estilo.FillForegroundColor = indicesColores["#D9D9D9"];
                    estilo.FillPattern = FillPattern.SolidForeground;
                }

                if (negrita || (negritaSoloPrimero && primeraCelda))
                {
                    var fuente = workbook.CreateFont();
                    fuente.Boldweight = (short)FontBoldWeight.Bold;
                    estilo.SetFont(fuente);
                }
                if (columnasMayorFuente != null && columnasMayorFuente.Contains(nroColumna))
                {
                    var fuente = workbook.CreateFont();
                    fuente.FontHeightInPoints = 16;
                    fuente.Boldweight = (short)FontBoldWeight.Bold;
                    estilo.SetFont(fuente);
                }

                var celda = fila.CreateCell(nroColumna);
                celda.SetCellValue(dato);
                celda.CellStyle = estilo;

                if (ultimaCelda && nroColumna < 12) // Si sobran celdas a la derecha se combinan con la utima
                {
                    sheet.AddMergedRegion(new CellRangeAddress(nroFila, nroFila, nroColumna, 12));
                    for (int i = nroColumna + 1; i <= 12; i++)
                    {
                        var celdaAux = fila.CreateCell(i);
                        celdaAux.CellStyle = estilo;
                    }
                }

                nroColumna++;
            }
            nroFila++;
        }

        private void InsertarFilaTitulo(string titulo, bool principal = false)
        {
            var primeraColumna = principal ? 0 : 1;
            var segundColumna = principal ? 1 : 2;
            sheet.AddMergedRegion(new CellRangeAddress(nroFila, nroFila, primeraColumna, 12));
            var fila = sheet.CreateRow(nroFila);
            var celda = fila.CreateCell(primeraColumna);
            var fuente = workbook.CreateFont();
            var estilo = workbook.CreateCellStyle();

            if (!principal)
            {
                InsertarColumnaColor(fila);
            }

            fuente.Boldweight = (short)FontBoldWeight.Bold;
            if (principal)
            {
                fuente.FontHeightInPoints = 24;
                fuente.Color = IndexedColors.Green.Index;
                estilo.Alignment = HorizontalAlignment.Center;
            }
            else
            {
                estilo.BorderLeft = BorderStyle.Medium;
                estilo.BorderRight = BorderStyle.Medium;
                estilo.BorderTop = BorderStyle.Medium;
                estilo.BorderBottom = BorderStyle.Thin;
                if (flagColor)
                {
                    estilo.FillForegroundColor = indicesColores["#D9D9D9"];
                    estilo.FillPattern = FillPattern.SolidForeground;
                }
            }
            estilo.SetFont(fuente);
            celda.CellStyle = estilo;
            celda.SetCellValue(titulo);
            for (int i = segundColumna; i <= 12; i++)
            {
                var celdaAux = fila.CreateCell(i);
                celdaAux.CellStyle = estilo;
            }

            nroFila++;
        }

        private void InsertarFilaSeparador()
        {
            sheet.AddMergedRegion(new CellRangeAddress(nroFila, nroFila, 0, 12));
            var fila = sheet.CreateRow(nroFila);
            var celda = fila.CreateCell(0);
            var estilo = workbook.CreateCellStyle();

            estilo.FillForegroundColor = indiceColorActual;
            estilo.FillPattern = FillPattern.SolidForeground;
            celda.CellStyle = estilo;

            nroFila++;
        }

        /// <summary>
        /// Crea una paleta de colores customizados en base a los diferentes colores en la base de datos.
        /// Sobreescribe los colores a partir del indice 20 de la paleta de colores default.
        /// </summary>
        private void CrearPaletaDeColores()
        {
            HSSFPalette paleta = workbook.GetCustomPalette();
            var colores = nominaciones.Select(n => n.NominacionDatoTecnico.MaterialPuerto.Color).Distinct().ToList();
            colores.Add("#D9D9D9"); // Gris claro para separar filas
            short i = 20;
            foreach (var colorHexadecimal in colores)
            {
                indicesColores.Add(colorHexadecimal, i);
                Color colorRGB = ColorTranslator.FromHtml(colorHexadecimal);
                paleta.SetColorAtIndex(i, colorRGB.R, colorRGB.G, colorRGB.B);
                i++;
            }
        }

        /// <summary>
        /// Crea una columna al principio de la fila con el color del producto
        /// </summary>
        private void InsertarColumnaColor(IRow fila)
        {
            var estiloColor = workbook.CreateCellStyle();
            estiloColor.FillForegroundColor = indiceColorActual;
            estiloColor.FillPattern = FillPattern.SolidForeground;
            var celdaColor = fila.CreateCell(0);
            celdaColor.CellStyle = estiloColor;
        }
    }
}
