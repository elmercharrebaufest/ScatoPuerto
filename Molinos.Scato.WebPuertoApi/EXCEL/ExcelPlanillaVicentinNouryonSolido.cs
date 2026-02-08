using Molinos.Scato.Dominio.Dto;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    public class ExcelPlanillaVicentinNouryonSolido
    {
        private readonly XSSFWorkbook _workbook;
        private readonly ISheet _sheetDatos;
        private readonly IList<ModuloDeCargaPlanillaDeTurnosDto> _planilla;

        public ExcelPlanillaVicentinNouryonSolido(
            byte[] archivoBase,
            IList<ModuloDeCargaPlanillaDeTurnosDto> planilla)
        {
            _workbook = new XSSFWorkbook(new MemoryStream(archivoBase));

            _sheetDatos = _workbook.GetSheet("Datos")
                          ?? _workbook.CreateSheet("Datos");

            _planilla = planilla;
        }

        public byte[] Generar()
        {
            try
            {
                CompletarDatos();

                using (var fileData = new MemoryStream())
                {
                    _workbook.Write(fileData);
                    return fileData.ToArray();
                }
            }
            catch
            {
                throw;
            }
        }

        // =====================================================
        // MÉTODO PRINCIPAL
        // =====================================================
        /*private void CompletarDatos()
        {
            var estiloTexto = CrearEstiloTexto(true);
            var estiloNumero = CrearEstiloNumero();

            // =========================
            // CALCULOS POR PRODUCTO
            // =========================
            decimal sbmhp = TnSegunMateriales(new List<string> { "SBMHP" });
            decimal sbh = TnSegunMateriales(new List<string> { "SBH" });
            decimal sfp = TnSegunMateriales(new List<string> { "SFPMP", "SFPLP" });
            decimal corn = TnSegunMateriales(new List<string> { "CORN" });
            decimal wheat = TnSegunMateriales(new List<string> { "WHEAT" });
            decimal sb = TnSegunMateriales(new List<string> { "SB", "SBMLP" });

            decimal totalABordo = sbmhp + sbh + sfp + corn + wheat + sb;

            // =========================
            // TOTAL A BORDO
            // =========================
            IRow rowTotal = _sheetDatos.GetRow(1) ?? _sheetDatos.CreateRow(1);
            CrearCelda(_sheetDatos, rowTotal, 1, 1, 1, 1, "Total A Bordo", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowTotal, 1, 1, 2, 2, (double)totalABordo, estiloNumero, 0, 0, 0, 0, false);

            // =========================
            // TITULO: Cantidades por producto
            // =========================
            IRow rowTitulo = _sheetDatos.GetRow(1) ?? _sheetDatos.CreateRow(1);
            CrearCelda(_sheetDatos, rowTitulo, 1, 1, 3, 8, "Cantidades por producto", estiloTexto, 0, 0, 0, 0, false);

            // =========================
            // NOMBRES DE PRODUCTO
            // =========================
            IRow rowProductos = _sheetDatos.GetRow(2) ?? _sheetDatos.CreateRow(2);

            CrearCelda(_sheetDatos, rowProductos, 3, 3, 4, 4, "Harina de Soja", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowProductos, 3, 3, 5, 5, "Pellet cáscara de soja", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowProductos, 3, 3, 6, 6, "Pellet Girasol / Integral", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowProductos, 3, 3, 7, 7, "Maíz", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowProductos, 3, 3, 8, 8, "Trigo", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowProductos, 3, 3, 9, 9, "Poroto Soja / low Pro", estiloTexto, 0, 0, 0, 0, false);


            // =========================
            // CODIGOS
            // =========================
            IRow rowCodigos = _sheetDatos.GetRow(3) ?? _sheetDatos.CreateRow(3);

            CrearCelda(_sheetDatos, rowCodigos, 4, 4, 4, 4, "(SBMHP)", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowCodigos, 4, 4, 5, 5, "(SBH)", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowCodigos, 4, 4, 6, 6, "(SFPMP / SFPLP)", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowCodigos, 4, 4, 7, 7, "(CORN)", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowCodigos, 4, 4, 8, 8, "(WHEAT)", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowCodigos, 4, 4, 9, 9, "(SB / SBMLP)", estiloTexto, 0, 0, 0, 0, false);


            // =========================
            // VALORES
            // =========================
            IRow rowValores = _sheetDatos.GetRow(4) ?? _sheetDatos.CreateRow(4);

            CrearCelda(_sheetDatos, rowValores, 5, 5, 4, 4, (double)sbmhp, estiloNumero, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowValores, 5, 5, 5, 5, (double)sbh, estiloNumero, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowValores, 5, 5, 6, 6, (double)sfp, estiloNumero, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowValores, 5, 5, 7, 7, (double)corn, estiloNumero, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowValores, 5, 5, 8, 8, (double)wheat, estiloNumero, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowValores, 5, 5, 9, 9, (double)sb, estiloNumero, 0, 0, 0, 0, false);


            IRow rowRitmoEmbarque = _sheetDatos.GetRow(7) ?? _sheetDatos.CreateRow(7);
            CrearCelda(_sheetDatos, rowRitmoEmbarque, 1, 1, 1, 1, "Ritmo de Embarque(RE):", estiloTexto, 0, 0, 0, 0, false);


            // =========================
            // RITMO NETO
            // =========================
            decimal ritmoNeto = ObtenerRitmoNeto();
            IRow rowRN = _sheetDatos.GetRow(11) ?? _sheetDatos.CreateRow(11);
            CrearCelda(_sheetDatos, rowRN, 11, 11, 1, 1, "Ritmo Neto", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowRN, 11, 11, 2, 2, (double)ritmoNeto, estiloNumero, 0, 0, 0, 0, false);

            // =========================
            // OBSERVACIONES
            // =========================
            string observaciones = ObtenerObservaciones();
            IRow rowObs = _sheetDatos.GetRow(14) ?? _sheetDatos.CreateRow(14);
            CrearCelda(_sheetDatos, rowObs, 14, 14, 0, 7, observaciones, estiloTexto, 1, 1, 1, 1, false);
        }*/

        private void CompletarDatos()
        {
            var estiloTexto = CrearEstiloTexto(true);
            var estiloNumero = CrearEstiloNumero();

            // =========================
            // CALCULOS POR PRODUCTO
            // =========================
            decimal sbmhp = TnSegunMateriales(new List<string> { "SBMHP" });
            decimal sbh = TnSegunMateriales(new List<string> { "SBH" });
            decimal sfp = TnSegunMateriales(new List<string> { "SFPMP", "SFPLP" });
            decimal corn = TnSegunMateriales(new List<string> { "CORN" });
            decimal wheat = TnSegunMateriales(new List<string> { "WHEAT" });
            decimal sb = TnSegunMateriales(new List<string> { "SB", "SBMLP" });

            decimal totalABordo = sbmhp + sbh + sfp + corn + wheat + sb;

            // =========================
            // TOTAL A BORDO (fila 1)
            // =========================
            IRow rowTotal = _sheetDatos.GetRow(1) ?? _sheetDatos.CreateRow(1);
            CrearCelda(_sheetDatos, rowTotal, 1, 1, 1, 1, "Total A Bordo", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowTotal, 1, 1, 2, 2, (double)totalABordo, estiloNumero, 0, 0, 0, 0, false);

            // =========================
            // TITULO (fila 1)
            // =========================
            IRow rowTitulo = _sheetDatos.GetRow(1) ?? _sheetDatos.CreateRow(1);
            CrearCelda(_sheetDatos, rowTitulo, 1, 1, 4, 9, "Cantidades por producto", estiloTexto, 0, 0, 0, 0, false);

            // =========================
            // PRODUCTOS (fila 2)
            // =========================
            IRow rowProductos = _sheetDatos.GetRow(2) ?? _sheetDatos.CreateRow(2);

            CrearCelda(_sheetDatos, rowProductos, 2, 2, 4, 4, "Harina de Soja", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowProductos, 2, 2, 5, 5, "Pellet cáscara de soja", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowProductos, 2, 2, 6, 6, "Pellet Girasol / Integral", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowProductos, 2, 2, 7, 7, "Maíz", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowProductos, 2, 2, 8, 8, "Trigo", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowProductos, 2, 2, 9, 9, "Poroto Soja / low Pro", estiloTexto, 0, 0, 0, 0, false);

            // =========================
            // CODIGOS (fila 3)
            // =========================
            IRow rowCodigos = _sheetDatos.GetRow(3) ?? _sheetDatos.CreateRow(3);

            CrearCelda(_sheetDatos, rowCodigos, 3, 3, 4, 4, "(SBMHP)", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowCodigos, 3, 3, 5, 5, "(SBH)", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowCodigos, 3, 3, 6, 6, "(SFPMP / SFPLP)", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowCodigos, 3, 3, 7, 7, "(CORN)", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowCodigos, 3, 3, 8, 8, "(WHEAT)", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowCodigos, 3, 3, 9, 9, "(SB / SBMLP)", estiloTexto, 0, 0, 0, 0, false);

            // =========================
            // VALORES (fila 4)
            // =========================
            IRow rowValores = _sheetDatos.GetRow(4) ?? _sheetDatos.CreateRow(4);

            CrearCelda(_sheetDatos, rowValores, 4, 4, 4, 4, (double)sbmhp, estiloNumero, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowValores, 4, 4, 5, 5, (double)sbh, estiloNumero, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowValores, 4, 4, 6, 6, (double)sfp, estiloNumero, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowValores, 4, 4, 7, 7, (double)corn, estiloNumero, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowValores, 4, 4, 8, 8, (double)wheat, estiloNumero, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowValores, 4, 4, 9, 9, (double)sb, estiloNumero, 0, 0, 0, 0, false);

            // =========================
            // RE (fila 7, columna 2)
            // =========================
            IRow rowRE = _sheetDatos.GetRow(6) ?? _sheetDatos.CreateRow(6);
            CrearCelda(_sheetDatos, rowRE, 6, 6, 1, 1, "Ritmo de Embarque (RE):", estiloTexto, 0, 0, 0, 0, false);

            // =========================
            // RITMO NETO (fila 11)
            // =========================
            decimal ritmoNeto = ObtenerRitmoNeto();
            IRow rowRN = _sheetDatos.GetRow(10) ?? _sheetDatos.CreateRow(10);
            CrearCelda(_sheetDatos, rowRN, 10, 10, 1, 1, "Ritmo Neto", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, rowRN, 10, 10, 2, 2, (double)ritmoNeto, estiloNumero, 0, 0, 0, 0, false);

            // =========================
            // OBSERVACIONES (fila 14 a 16)
            // =========================
            string observaciones = ObtenerObservaciones();
            IRow rowObs = _sheetDatos.GetRow(14) ?? _sheetDatos.CreateRow(14);
            CrearCelda(_sheetDatos, rowObs, 14, 14, 1, 2, "Observaciones", estiloTexto, 1, 1, 1, 1, false);
            IRow rowObsTexto = _sheetDatos.GetRow(15) ?? _sheetDatos.CreateRow(15);
            CrearCelda(_sheetDatos, rowObsTexto, 15, 15, 1, 8, observaciones, estiloTexto, 1, 1, 1, 1, false);
        }



        // =====================================================
        // HELPERS
        // =====================================================
        private decimal TnSegunMateriales(List<string> materiales)
        {
            var tn = _planilla.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesSolido)
                .Where(p => materiales.Contains(p.MaterialPuerto.DescripcionCortaIngles.ToUpper())).Sum(x => x.Cantidad / 1000m);
            return tn;
        }

        private string ObtenerObservaciones()
        {
            var partes = new List<string>();

            foreach (var turno in _planilla)
            {
                var fecha = turno.Fecha?.ToString("dd/MM") ?? "";
                var nombreTurno = turno.TurnoPuerto?.Nombre ?? "";

                var observaciones = turno.ModuloDeCargaPlanillaDeTurnosDetallesSolido?
                    .Where(d => !string.IsNullOrWhiteSpace(d.Observaciones))
                    .Select(d => $"{fecha} {nombreTurno}: {d.Observaciones}");

                if (observaciones != null)
                    partes.AddRange(observaciones);
            }

            return string.Join(" / ", partes);
        }

        private decimal ObtenerRitmoNeto()
        {
            decimal toneladas = _planilla
                .SelectMany(p => p.ModuloDeCargaPlanillaDeTurnosDetallesSolido ?? new List<ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto>())
                .Sum(d => d.Cantidad) / 1000m;

            decimal horas = _planilla
                .SelectMany(p => p.ModuloDeCargaPlanillaDeTurnosDetallesSolido ?? new List<ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto>())
                .Where(d => !string.IsNullOrEmpty(d.HoraInicio) && !string.IsNullOrEmpty(d.HoraFin))
                .Sum(d =>
                {
                    var inicio = TimeSpan.Parse(d.HoraInicio);
                    var fin = TimeSpan.Parse(d.HoraFin);
                    return (decimal)(fin - inicio).TotalHours;
                });

            return horas > 0 ? toneladas / horas : 0;
        }



        private void CrearCelda(ISheet sheet, IRow row, int firstRow, int lastRow, int firstCol, int lastCol, object valorCelda, ICellStyle estilo, int bordeTop, int bordeBottom, int bordeLeft, int bordeRight, bool separador, string comentario = null)
        {
            var regionCelda = new CellRangeAddress(firstRow, lastRow, firstCol, lastCol);
            sheet.AddMergedRegion(regionCelda);            
            RegionUtil.SetBorderTop(bordeTop, regionCelda, sheet, _workbook);
            RegionUtil.SetBorderLeft(bordeLeft, regionCelda, sheet, _workbook);
            RegionUtil.SetBorderRight(bordeRight, regionCelda, sheet, _workbook);
            if (separador)
            {
                RegionUtil.SetBorderBottom(5, regionCelda, sheet, _workbook);
            }
            else
            {
                RegionUtil.SetBorderBottom(bordeBottom, regionCelda, sheet, _workbook);
            }
            ICell celda = row.CreateCell(firstCol);

            if (valorCelda is string stringValue)
            {
                celda.SetCellValue(stringValue);
            }
            else if (valorCelda is int intValue)
            {
                celda.SetCellValue((double)intValue);
            }
            else if (valorCelda is double doubleValue)
            {
                IDataFormat dataFormat = _workbook.CreateDataFormat();
                estilo.DataFormat = dataFormat.GetFormat("#,##0.000");
                celda.SetCellValue(doubleValue);                
            }
            else if (valorCelda is TimeSpan timeValue)
            {
                IDataFormat dataFormat = _workbook.CreateDataFormat();
                estilo.DataFormat = dataFormat.GetFormat("[h]:mm");
                celda.SetCellValue(timeValue.TotalHours / 24);
            }
            else
            {
                celda.SetCellValue(valorCelda?.ToString() ?? "");            
            }
            celda.CellStyle = estilo;

            if (!string.IsNullOrEmpty(comentario))
            {
                IDrawing drawing = sheet.CreateDrawingPatriarch();
                IComment cellComment = drawing.CreateCellComment(new XSSFClientAnchor());
                cellComment.String = new XSSFRichTextString(comentario);
                cellComment.Author = "Sistema";
                celda.CellComment = cellComment;
            }
        }        
        private ICellStyle CrearEstiloTexto(bool negrita)
        {
            var style = _workbook.CreateCellStyle();
            var font = _workbook.CreateFont();

            font.FontName = "Arial";
            font.FontHeightInPoints = 11;   // probá 11 o 12
            font.Boldweight = negrita
                ? (short)FontBoldWeight.Bold
                : (short)FontBoldWeight.Normal;

            style.SetFont(font);
            style.VerticalAlignment = VerticalAlignment.Center;
            style.Alignment = HorizontalAlignment.Left;

            return style;
        }

        private ICellStyle CrearEstiloNumero()
        {
            var style = _workbook.CreateCellStyle();
            var font = _workbook.CreateFont();

            font.FontName = "Arial";
            font.FontHeightInPoints = 11;
            font.Boldweight = (short)FontBoldWeight.Normal;

            style.SetFont(font);
            style.DataFormat = _workbook.CreateDataFormat().GetFormat("#,##0.000");
            style.Alignment = HorizontalAlignment.Right;
            style.VerticalAlignment = VerticalAlignment.Center;

            return style;
        }


    }

}