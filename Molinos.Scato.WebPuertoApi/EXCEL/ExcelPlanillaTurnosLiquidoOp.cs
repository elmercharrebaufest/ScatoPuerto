using Microsoft.Ajax.Utilities;
using Molinos.Scato.Dominio.Dto;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    public class ExcelPlanillaTurnosLiquidoOp
    {
        private XSSFWorkbook _workbook;
        private XSSFSheet _sheetTurnos;
        private XSSFSheet _sheetRitmos;
        private const int NpoiUnitMultiplier = 256;
        private readonly string _path = System.Web.HttpContext.Current.Server.MapPath("~/IconoMolinosExcel.png");
        private readonly byte[] _imgMolinos;
        private readonly ModuloDeCargaDto _modCarga;
        private readonly EmbarqueDto _embarque;
        private readonly IList<NominacionDto> _nominaciones;
        private readonly IList<EventosPorLineaDto> _eventos;
        private readonly IList<PlanoDeCargaBodegaDto> _bodegasPlano;

        public ExcelPlanillaTurnosLiquidoOp(ModuloDeCargaDto modCarga, IList<NominacionDto> nominaciones, EmbarqueDto embarque, IList<EventosPorLineaDto> eventos,
            IList<PlanoDeCargaBodegaDto> bodegasPlano)
        {
            _workbook = new XSSFWorkbook();
            _modCarga = modCarga;
            _nominaciones = nominaciones;
            _embarque = embarque;
            _eventos = eventos;
            _bodegasPlano = bodegasPlano;
            _imgMolinos = File.ReadAllBytes(_path);
        }

        public byte[] GenerarExcel()
        {
            try
            {
                CompletarHojas();
                using (var fileData = new MemoryStream())
                {
                    _workbook.Write(fileData);
                    return fileData.ToArray();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private void CompletarHojas()
        {
            _sheetTurnos = (XSSFSheet)_workbook.CreateSheet("Planilla");
            _sheetRitmos = (XSSFSheet)_workbook.CreateSheet("Ritmos");
            CompletarHoja1();
            CompletarHoja2();
        }

        private void CompletarHoja1()
        {
            ArmadoHeaderMolinos(_sheetTurnos);
            int indexFin = ArmadoPlanillaEmbarque();
            CrearTablaRef();
            ArmadoPlanillaTurnos(indexFin);
            SetearAnchoColumnasHoja1();
        }

        private void CompletarHoja2()
        {
            ArmadoHeaderMolinos(_sheetRitmos);
            ArmadoRitmos();
            SetearAnchoColumnasHoja2();
        }

        private void ArmadoHeaderMolinos(ISheet sheet)
        {
            sheet.AddMergedRegion(new CellRangeAddress(0, 3, 0, 1));
            int pictureIndex = _workbook.AddPicture(_imgMolinos, PictureType.PNG);
            XSSFDrawing drawing = (XSSFDrawing)sheet.CreateDrawingPatriarch();
            XSSFClientAnchor anchor = new XSSFClientAnchor(0, 0, 0, 0, 0, 0, 3, 1);
            XSSFPicture picture = (XSSFPicture)drawing.CreatePicture(anchor, pictureIndex);
            picture.Resize();

            IRow row0 = sheet.CreateRow(0);
            IRow row3 = sheet.CreateRow(3);
            IRow row4 = sheet.CreateRow(4);

            // Aplicar estilos
            ICellStyle estiloCodVersion = CrearEstiloCelda(sheet, "Arial", 20, IndexedColors.Black.Index, true,
                IndexedColors.Grey25Percent.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle estiloSubtitulo = CrearEstiloCelda(sheet, "Arial", 13, IndexedColors.Black.Index, true,
                IndexedColors.Grey25Percent.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle estiloTitBuque = CrearEstiloCelda(sheet, "Arial", 16, IndexedColors.Black.Index, true,
                IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);

            CrearCelda(sheet, row0, 0, 2, 2, 11, "Código F-2265", estiloCodVersion, 2, 2, 2, 2, false);
            CrearCelda(sheet, row0, 0, 2, 12, 21, "Revisión 01", estiloCodVersion, 2, 2, 2, 2, false);
            CrearCelda(sheet, row3, 3, 3, 2, 21, "Título: Planilla Embarque de Líquidos", estiloSubtitulo, 2, 2, 2, 2, false);

            CrearCelda(sheet, row4, 4, 5, 0, 21, "Buque: " + _embarque.Patente, estiloTitBuque, 2, 2, 2, 2, false);
        }

        private void SetearAnchoColumnasHoja1()
        {
            SetAnchoCol(_sheetTurnos, 0, 12);
            SetAnchoCol(_sheetTurnos, 10, 16);
        }

        private void SetearAnchoColumnasHoja2()
        {
            //Seteo anchos tabla lin nueva
            SetAnchoCol(_sheetRitmos, 0, 10);
            SetAnchoCol(_sheetRitmos, 1, 14);
            SetAnchoCol(_sheetRitmos, 2, 14);
            SetAnchoCol(_sheetRitmos, 3, 14);
            SetAnchoCol(_sheetRitmos, 4, 14);
            SetAnchoCol(_sheetRitmos, 5, 10);
            SetAnchoCol(_sheetRitmos, 6, 20);

            //Seteo anchos tabla lin vieja
            SetAnchoCol(_sheetRitmos, 10, 10);
            SetAnchoCol(_sheetRitmos, 11, 14);
            SetAnchoCol(_sheetRitmos, 12, 14);
            SetAnchoCol(_sheetRitmos, 13, 14);
            SetAnchoCol(_sheetRitmos, 14, 14);
            SetAnchoCol(_sheetRitmos, 15, 10);
            SetAnchoCol(_sheetRitmos, 16, 20);

            //Seteo anchos tabla lin vic
            SetAnchoCol(_sheetRitmos, 20, 10);
            SetAnchoCol(_sheetRitmos, 21, 14);
            SetAnchoCol(_sheetRitmos, 22, 14);
            SetAnchoCol(_sheetRitmos, 23, 14);
            SetAnchoCol(_sheetRitmos, 24, 14);
            SetAnchoCol(_sheetRitmos, 25, 10);
            SetAnchoCol(_sheetRitmos, 26, 20);
        }

        private void SetAnchoCol(ISheet sheet, int columnIndex, double widthInCharacters)
        {
            int widthInNpoiUnits = (int)(widthInCharacters * NpoiUnitMultiplier);
            sheet.SetColumnWidth(columnIndex, widthInNpoiUnits);
        }

        private ICellStyle CrearEstiloCelda(ISheet sheet, string fontName, short fontSize, short fontColor, bool isBold, byte[] backgroundColor, BorderStyle borderTop, BorderStyle borderBottom, BorderStyle borderLeft, BorderStyle borderRight)
        {
            XSSFCellStyle style = (XSSFCellStyle)sheet.Workbook.CreateCellStyle();

            style.Alignment = HorizontalAlignment.Center;
            style.VerticalAlignment = VerticalAlignment.Center;

            IFont font = _workbook.CreateFont();
            font.FontName = fontName;
            font.FontHeightInPoints = fontSize;
            font.Color = fontColor;
            if (isBold)
                font.Boldweight = (short)FontBoldWeight.Bold;

            style.SetFont(font);
            style.BorderBottom = borderBottom;
            style.BorderLeft = borderLeft;
            style.BorderRight = borderRight;
            style.BorderTop = borderTop;
            XSSFColor color = new XSSFColor(backgroundColor);
            style.FillForegroundXSSFColor = color;
            style.FillPattern = FillPattern.SolidForeground;

            return style;
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
            else if (valorCelda is double doubleValue)
            {
                IDataFormat dataFormat = _workbook.CreateDataFormat();
                estilo.DataFormat = dataFormat.GetFormat("#,##0.000");
                celda.SetCellValue(doubleValue);
            }
            else
            {
                celda.SetCellValue(valorCelda.ToString());
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

        private static readonly Dictionary<int, string> ColumnasPlanillaTurnos = new Dictionary<int, string>
        {
            { 0, "Día" }, { 1, "Turno" }, { 2, "Partido" }, { 3, "Tk" },
            { 4, "Línea" }, { 5, "Producto" }, { 6, "°C" }, { 7, "Med.Ini." },
            { 8, "Med.Fin" }, { 9, "Cant." }, { 10, "TTL mt Turno" }, { 11, "TTL Día" }
        };

        private int ArmadoPlanillaEmbarque()
        {
            ICellStyle estiloHeader = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Black.Index, true, new byte[3] { 204, 255, 204 },
                BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            IRow row7 = _sheetTurnos.CreateRow(7);

            CrearCelda(_sheetTurnos, row7, 7, 7, 0, 0, "Exportador", estiloHeader, 2, 2, 2, 2, false, null);
            CrearCelda(_sheetTurnos, row7, 7, 7, 1, 1, "Partida", estiloHeader, 2, 2, 2, 2, false, null);
            CrearCelda(_sheetTurnos, row7, 7, 7, 2, 3, "Tks de abordo", estiloHeader, 2, 2, 2, 2, false, null);
            CrearCelda(_sheetTurnos, row7, 7, 7, 4, 4, "Destino", estiloHeader, 2, 2, 2, 2, false, null);
            CrearCelda(_sheetTurnos, row7, 7, 7, 5, 6, "Tks Tierra", estiloHeader, 2, 2, 2, 2, false, null);
            CrearCelda(_sheetTurnos, row7, 7, 7, 7, 7, "TN", estiloHeader, 2, 2, 2, 2, false, null);
            CrearCelda(_sheetTurnos, row7, 7, 7, 8, 8, "Producto", estiloHeader, 2, 2, 2, 2, false, null);

            int index = 8;
            var planillaEmb = _modCarga.ModuloDeCargaPlanillaDeEmbarque.ToList();
            var bodegas = new HashSet<int> { 1, 2, 3, 4, 5, 6, 7 };
            var bodegasExistentes = planillaEmb.Select(p => p.BodegaParcel).ToList();

            var bodegasFaltantes = bodegas
                .Except(bodegasExistentes)
                .Select(v => new ModuloDeCargaPlanillaDeEmbarqueDto { BodegaParcel = v })
                .ToList();

            planillaEmb.AddRange(bodegasFaltantes);
            var planilla = planillaEmb.OrderBy(p => p.BodegaParcel).ToList();

            foreach (var reg in planilla)
            {
                IRow row = _sheetTurnos.CreateRow(index);
                ICellStyle estilo = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Black.Index, true, ObtenerColorBodega(reg.Id != 0 ? reg.BodegaParcel : 0),
                    BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
                CrearCelda(_sheetTurnos, row, index, index, 0, 0, reg.Exportador?.Nombre ?? "", estilo, 2, 2, 2, 2, false, null);
                CrearCelda(_sheetTurnos, row, index, index, 1, 1, "Parcel " + reg.BodegaParcel, estilo, 2, 2, 2, 2, false, null);
                CrearCelda(_sheetTurnos, row, index, index, 2, 3, reg.TanqueDeAbordo ?? "", estilo, 2, 2, 2, 2, false, null);
                CrearCelda(_sheetTurnos, row, index, index, 4, 4, reg.Id > 0 ? ObtenerDestinoPorBodega(reg.BodegaParcel) : "", estilo, 2, 2, 2, 2, false, null);
                CrearCelda(_sheetTurnos, row, index, index, 5, 6, reg.Tk ?? "", estilo, 2, 2, 2, 2, false, null);
                CrearCelda(_sheetTurnos, row, index, index, 7, 7, (int)reg.Tn, estilo, 2, 2, 2, 2, false, null);
                CrearCelda(_sheetTurnos, row, index, index, 8, 8, reg.MaterialPuerto?.DescripcionCortaIngles ?? "", estilo, 2, 2, 2, 2, false, null);
                index++;
            }

            index += 2;
            return index;
        }

        private void CrearTablaRef()
        {
            IRow row7 = _sheetTurnos.GetRow(7) ?? _sheetTurnos.CreateRow(7);
            ICellStyle estiloTitRef = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Black.Index, true, IndexedColors.White.RGB,
               BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);

            CrearCelda(_sheetTurnos, row7, 7, 7, 10, 12, "REFERENCIAS:", estiloTitRef, 0, 0, 0, 0, false, null);

            ICellStyle estiloRef = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Black.Index, false, IndexedColors.White.RGB,
                BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);

            IRow row8 = _sheetTurnos.GetRow(8) ?? _sheetTurnos.CreateRow(8);
            CrearCelda(_sheetTurnos, row8, 8, 8, 10, 12, "CSBO = ACTE CRUDO DE SOJA", estiloRef, 0, 0, 0, 0, false, null);

            IRow row9 = _sheetTurnos.GetRow(9) ?? _sheetTurnos.CreateRow(9);
            CrearCelda(_sheetTurnos, row9, 9, 9, 10, 12, "CSBO = ACTE CRUDO DE SOJA", estiloRef, 0, 0, 0, 0, false, null);

            IRow row10 = _sheetTurnos.GetRow(10) ?? _sheetTurnos.CreateRow(10);
            CrearCelda(_sheetTurnos, row10, 10, 10, 10, 12, "RSBO = ACTE REFINADO DE SOJA", estiloRef, 0, 0, 0, 0, false, null);

            IRow row11 = _sheetTurnos.GetRow(11) ?? _sheetTurnos.CreateRow(11);
            CrearCelda(_sheetTurnos, row11, 11, 11, 10, 12, "RSFO = ACTE REFINADO DE GSOL.", estiloRef, 0, 0, 0, 0, false, null);

            IRow row12 = _sheetTurnos.GetRow(12) ?? _sheetTurnos.CreateRow(12);
            CrearCelda(_sheetTurnos, row12, 12, 12, 10, 12, "FAME = BIODIESEL", estiloRef, 0, 0, 0, 0, false, null);

            //TO DO : MOSTRAR SOLO SI NO ES LINEA BIODIESEL
            IRow row13 = _sheetTurnos.GetRow(13) ?? _sheetTurnos.CreateRow(13);
            CrearCelda(_sheetTurnos, row13, 13, 13, 10, 12, "SBONEU=ACTE CRUDO DE SOJA NEUTRO", estiloRef, 0, 0, 0, 0, false, null);
        }

        private void ArmadoPlanillaTurnos(int inicio)
        {
            IRow row = _sheetTurnos.GetRow(inicio) ?? _sheetTurnos.CreateRow(inicio);
            ICellStyle estiloHeader = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Black.Index, true, new byte[3] { 204, 255, 204 },
                BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);

            foreach (var col in ColumnasPlanillaTurnos)
            {
                CrearCelda(_sheetTurnos, row, inicio, inicio, col.Key, col.Key, col.Value, estiloHeader, 2, 2, 2, 2, false, null);
            }

            inicio++;

            var planilla = _modCarga.ModuloDeCargaPlanillaDeTurnos;
            var fechas = _modCarga.ModuloDeCargaPlanillaDeTurnos.OrderBy(x => x.Fecha).DistinctBy(x => x.Fecha.Value.Date);
            ICellStyle estiloFecha = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Black.Index, true, IndexedColors.White.RGB,
                BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

            foreach (var dia in fechas)
            {
                IRow rowDia = _sheetTurnos.GetRow(inicio) ?? _sheetTurnos.CreateRow(inicio);
                var rowFin = ObtenerCargasPorFecha(dia.Fecha.Value) - 1;
                CrearCelda(_sheetTurnos, rowDia, inicio, inicio + rowFin, 0, 0, dia.Fecha.Value.Date.ToString("dd/MM/yyyy"), estiloFecha, 1, 1, 1, 1, true, null);
                var totalPorFecha = planilla.Where(x => x.Fecha.Value.Date == dia.Fecha.Value.Date).Sum(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Sum(m => m.Cantidad));
                CrearCelda(_sheetTurnos, rowDia, inicio, inicio + rowFin, 11, 11, (int)totalPorFecha, estiloFecha, 1, 1, 1, 1, true, null);
                AgregarTurnos(dia.Fecha.Value, inicio);
                inicio = inicio + rowFin + 1;
            }

            ICellStyle estiloTotales = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Red.Index, true, IndexedColors.White.RGB,
                BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);

            ICellStyle estiloTotalFinal = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Blue.Index, true, IndexedColors.White.RGB,
                BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);

            //Linea Biodiesel, se calcula como linea nueva.
            var idsLineaEmbNueva = _modCarga.ModuloDeCargaLineasDeEmbarque.Where(l => l.Linea == "Nueva" || l.Linea == "Biodiesel").Select(x => x.Id).ToList();
            var idsLineaEmbVieja = _modCarga.ModuloDeCargaLineasDeEmbarque.Where(l => l.Linea == "Vieja").Select(x => x.Id).ToList();
            var idsLineaEmbVicentin = _modCarga.ModuloDeCargaLineasDeEmbarque.Where(l => l.Linea == "Vicentin").Select(x => x.Id).ToList();

            var totalLineaNueva = (int)_modCarga.ModuloDeCargaPlanillaDeTurnos.Sum(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Where(y => idsLineaEmbNueva.Contains(y.Linea_Id)).Sum(d => d.Cantidad));
            var totalLineaVieja = (int)_modCarga.ModuloDeCargaPlanillaDeTurnos.Sum(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Where(y => idsLineaEmbVieja.Contains(y.Linea_Id)).Sum(d => d.Cantidad));
            var totalLineaVicentin = (int)_modCarga.ModuloDeCargaPlanillaDeTurnos.Sum(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Where(y => idsLineaEmbVicentin.Contains(y.Linea_Id)).Sum(d => d.Cantidad));
            var totalFinal = totalLineaNueva + totalLineaVieja + totalLineaVicentin;

            IRow rowTotales = _sheetTurnos.GetRow(inicio) ?? _sheetTurnos.CreateRow(inicio);
            CrearCelda(_sheetTurnos, rowTotales, inicio, inicio, 0, 1, "Linea Vieja: " + totalLineaVieja, estiloTotales, 2, 2, 2, 2, false, null);
            CrearCelda(_sheetTurnos, rowTotales, inicio, inicio, 2, 3, "Linea Nueva: " + totalLineaNueva, estiloTotales, 2, 2, 2, 2, false, null);
            CrearCelda(_sheetTurnos, rowTotales, inicio, inicio, 4, 6, "A Vicentin: " + totalLineaVicentin, estiloTotales, 2, 2, 2, 2, false, null);
            CrearCelda(_sheetTurnos, rowTotales, inicio, inicio, 10, 10, "Total a bordo: ", estiloTotalFinal, 2, 2, 2, 2, false, null);
            CrearCelda(_sheetTurnos, rowTotales, inicio, inicio, 11, 11, totalFinal, estiloTotalFinal, 2, 2, 2, 2, false, null);
        }

        private void AgregarTurnos(DateTime fecha, int rowIni)
        {
            ICellStyle estiloTurnos = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Black.Index, false, IndexedColors.White.RGB,
                BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            var detalle = _modCarga.ModuloDeCargaPlanillaDeTurnos.Where(m => m.Fecha.Value.Date == fecha.Date);
            for (int i = 1; i < 5; i++)
            {
                IRow row = _sheetTurnos.GetRow(rowIni) ?? _sheetTurnos.CreateRow(rowIni);
                var cantCargasXTurno = detalle.Where(x => x.TurnoPuerto.Orden == i).Sum(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Count());
                var offsetTurno = cantCargasXTurno > 4 ? cantCargasXTurno : 4;
                CrearCelda(_sheetTurnos, row, rowIni, rowIni + offsetTurno - 1, 1, 1, ObtenerTurno(i), estiloTurnos, 1, 1, 1, 1, i == 4, null);
                var totalPorTurno = detalle.Where(x => x.TurnoPuerto.Orden == i).Sum(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Sum(m => m.Cantidad));
                CrearCelda(_sheetTurnos, row, rowIni, rowIni + offsetTurno - 1, 10, 10, (int)totalPorTurno, estiloTurnos, 1, 1, 1, 1, i == 4, null);
                AgregarCargas(fecha, i, rowIni);
                rowIni += offsetTurno;
            }
        }

        private void AgregarCargas(DateTime fecha, int turno, int rowIni)
        {
            var detalle = _modCarga.ModuloDeCargaPlanillaDeTurnos.Where(m => m.Fecha.Value.Date == fecha.Date);
            var cargas = detalle.FirstOrDefault(x => x.TurnoPuerto.Orden == turno)?.ModuloDeCargaPlanillaDeTurnosDetallesLiquido;
            var regVacios = cargas == null ? 4 : cargas.Count() >= 4 ? 0 : 4 - cargas.Count();
            if (cargas != null)
            {
                foreach (var c in cargas)
                {
                    int indexCarga = cargas.IndexOf(c);
                    ICellStyle estilo = CrearEstiloCelda(_sheetTurnos, "Arial", 9, IndexedColors.Black.Index, false, ObtenerColorBodega(c.BodegaParcel),
                    BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
                    IRow row = _sheetTurnos.GetRow(rowIni) ?? _sheetTurnos.CreateRow(rowIni);
                    var tipoLineaOriginal = _modCarga.ModuloDeCargaLineasDeEmbarque.FirstOrDefault(x => x.Id == c.Linea_Id)?.Linea;
                    var tipoLinea = tipoLineaOriginal == "Biodiesel" ? "Nueva" : tipoLineaOriginal;

                    var tieneSeparador = regVacios == 0 && (indexCarga == (cargas.Count - 1)) && turno == 4;
                    CrearCelda(_sheetTurnos, row, rowIni, rowIni, 2, 2, "Parcel " + c.BodegaParcel, estilo, 1, 1, 1, 1, tieneSeparador, null);
                    CrearCelda(_sheetTurnos, row, rowIni, rowIni, 3, 3, c.Tk, estilo, 1, 1, 1, 1, tieneSeparador, null);
                    CrearCelda(_sheetTurnos, row, rowIni, rowIni, 4, 4, tipoLinea, estilo, 1, 1, 1, 1, tieneSeparador, null);
                    CrearCelda(_sheetTurnos, row, rowIni, rowIni, 5, 5, c.MaterialPuerto.DescripcionCortaIngles, estilo, 1, 1, 1, 1, tieneSeparador, null);
                    CrearCelda(_sheetTurnos, row, rowIni, rowIni, 6, 6, c.Temperatura, estilo, 1, 1, 1, 1, tieneSeparador, null);
                    CrearCelda(_sheetTurnos, row, rowIni, rowIni, 7, 7, c.MedidaInicialCM + "," + c.MedidaInicialMM, estilo, 1, 1, 1, 1, tieneSeparador, null);
                    CrearCelda(_sheetTurnos, row, rowIni, rowIni, 8, 8, c.MedidaFinalCM + "," + c.MedidaFinalMM, estilo, 1, 1, 1, 1, tieneSeparador, null);
                    CrearCelda(_sheetTurnos, row, rowIni, rowIni, 9, 9, (int)c.Cantidad, estilo, 1, 1, 1, 1, true, null);
                    rowIni++;
                }
            }

            ICellStyle estiloVacio = CrearEstiloCelda(_sheetTurnos, "Arial", 9, IndexedColors.Black.Index, false, IndexedColors.White.RGB,
                    BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            for (int i = 1; i <= regVacios; i++)
            {
                IRow row = _sheetTurnos.GetRow(rowIni) ?? _sheetTurnos.CreateRow(rowIni);
                var tieneSeparador = turno == 4 && i == regVacios;
                CrearCelda(_sheetTurnos, row, rowIni, rowIni, 2, 2, "", estiloVacio, 1, 1, 1, 1, tieneSeparador, null);
                CrearCelda(_sheetTurnos, row, rowIni, rowIni, 3, 3, "", estiloVacio, 1, 1, 1, 1, tieneSeparador, null);
                CrearCelda(_sheetTurnos, row, rowIni, rowIni, 4, 4, "", estiloVacio, 1, 1, 1, 1, tieneSeparador, null);
                CrearCelda(_sheetTurnos, row, rowIni, rowIni, 5, 5, "", estiloVacio, 1, 1, 1, 1, tieneSeparador, null);
                CrearCelda(_sheetTurnos, row, rowIni, rowIni, 6, 6, "", estiloVacio, 1, 1, 1, 1, tieneSeparador, null);
                CrearCelda(_sheetTurnos, row, rowIni, rowIni, 7, 7, "", estiloVacio, 1, 1, 1, 1, tieneSeparador, null);
                CrearCelda(_sheetTurnos, row, rowIni, rowIni, 8, 8, "", estiloVacio, 1, 1, 1, 1, tieneSeparador, null);
                CrearCelda(_sheetTurnos, row, rowIni, rowIni, 9, 9, "", estiloVacio, 1, 1, 1, 1, tieneSeparador, null);
                rowIni++;
            }
        }

        private string ObtenerTurno(int idTurno)
        {
            string valorTurno;
            switch (idTurno)
            {
                case 1:
                    valorTurno = "00 - 06";
                    break;

                case 2:
                    valorTurno = "06 - 12";
                    break;

                case 3:
                    valorTurno = "12 - 18";
                    break;

                case 4:
                    valorTurno = "18 - 24";
                    break;

                default:
                    valorTurno = string.Empty;
                    break;
            }
            return valorTurno;
        }

        private byte[] ObtenerColorBodega(int bodega)
        {
            var color = new byte[3] { 255, 255, 255 };
            switch (bodega)
            {
                case 1:
                    color = new byte[3] { 255, 255, 153 };
                    break;

                case 2:
                    color = new byte[3] { 204, 204, 255 };
                    break;

                case 3:
                    color = new byte[3] { 255, 153, 204 };
                    break;

                case 4:
                    color = new byte[3] { 153, 238, 255 };
                    break;

                case 5:
                    color = new byte[3] { 255, 204, 153 };
                    break;

                case 6:
                    color = new byte[3] { 99, 232, 164 };
                    break;

                case 7:
                    color = new byte[3] { 123, 178, 248 };
                    break;

                case 8:
                    color = new byte[3] { 160, 132, 83 };
                    break;

                default:
                    break;
            }
            return color;
        }

        private int ObtenerCargasPorFecha(DateTime fecha)
        {
            int acumCargas = 0;
            for (int i = 1; i <= 4; i++)
            {
                acumCargas += ObtenerCantidadCargasPorFechaTurno(fecha, i);
            }
            return acumCargas;
        }

        private int ObtenerCantidadCargasPorFechaTurno(DateTime fecha, int turno)
        {
            int cantCargas = 4;
            var planillaFecha = _modCarga.ModuloDeCargaPlanillaDeTurnos.FirstOrDefault(x => x.Fecha.Value.Date == fecha.Date && x.TurnoPuerto.Orden == turno);
            if (planillaFecha != null)
            {
                int cant = planillaFecha.ModuloDeCargaPlanillaDeTurnosDetallesLiquido.Count();
                if (cant > 4)
                {
                    cantCargas = cant;
                }
            }
            return cantCargas;
        }

        private void ArmadoRitmos()
        {
            IRow row8 = _sheetRitmos.GetRow(8) ?? _sheetRitmos.CreateRow(8);
            IRow row9 = _sheetRitmos.GetRow(9) ?? _sheetRitmos.CreateRow(9);
            IRow row10 = _sheetRitmos.GetRow(10) ?? _sheetRitmos.CreateRow(10);
            IRow row11 = _sheetRitmos.GetRow(11) ?? _sheetRitmos.CreateRow(11);
            IRow row12 = _sheetRitmos.GetRow(12) ?? _sheetRitmos.CreateRow(12);
            IRow row13 = _sheetRitmos.GetRow(13) ?? _sheetRitmos.CreateRow(13);
            IRow row14 = _sheetRitmos.GetRow(14) ?? _sheetRitmos.CreateRow(14);
            IRow row16 = _sheetRitmos.GetRow(16) ?? _sheetRitmos.CreateRow(16);

            ICellStyle estiloCampo = CrearEstiloCelda(_sheetRitmos, "Arial", 11, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle estiloValor = CrearEstiloCelda(_sheetRitmos, "Arial", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle estiloValorConBorde = CrearEstiloCelda(_sheetRitmos, "Arial", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle estiloAmarillo = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.LightYellow.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

            CrearCelda(_sheetRitmos, row8, 8, 8, 0, 1, "Buque:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row8, 8, 8, 2, 3, _embarque.Patente, estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row8, 8, 8, 4, 5, "Destino:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row8, 8, 8, 6, 8, ObtenerDestinoEmbarque(), estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row9, 9, 9, 0, 1, "Mercadería:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row9, 9, 9, 2, 3, ObtenerMaterialesEmbarque(), estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row9, 9, 9, 4, 5, "Exportador:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row9, 9, 9, 6, 8, ObtenerExportadoresEmbarque(), estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row10, 10, 10, 0, 1, "Cantidad:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row10, 10, 10, 2, 3, ObtenerTotalEmbarque().ToString() + " TN", estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row10, 10, 10, 4, 5, "Bandera:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row10, 10, 10, 6, 8, ObtenerBandera(), estiloValor, 0, 0, 0, 0, false);

            //Grilla horarios
            CrearCelda(_sheetRitmos, row13, 13, 13, 0, 0, "Horarios", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row12, 12, 12, 1, 1, "Atracó:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row12, 12, 12, 2, 2, "Conexión:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row12, 12, 12, 3, 3, "Comenzó:", estiloValorConBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row12, 12, 12, 4, 4, "Finalizó:", estiloValorConBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row12, 12, 12, 5, 5, "Desconex:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row12, 12, 12, 6, 6, "Desamarró:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row14, 14, 14, 3, 4, "PERIODO DE CARGA", estiloValorConBorde, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row13, 13, 13, 1, 1, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaAmarro != null && _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraAmarro != null ?
                _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaAmarro.Value.ToString("dd/MM") + " " + _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraAmarro : "", estiloValorConBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row13, 13, 13, 2, 2, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaConexionMangueras != null && _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraConexionMangueras != null ?
                _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaConexionMangueras.Value.ToString("dd/MM") + " " + _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraConexionMangueras : "", estiloValorConBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row13, 13, 13, 3, 3, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaComienzoCarga != null && _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraComienzoCarga != null ?
                _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaComienzoCarga.Value.ToString("dd/MM") + " " + _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraComienzoCarga : "", estiloValorConBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row13, 13, 13, 4, 4, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaFinalizacionCarga != null && _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraFinalizacionCarga != null ?
                _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaFinalizacionCarga.Value.ToString("dd/MM") + " " + _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraFinalizacionCarga : "", estiloValorConBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row13, 13, 13, 5, 5, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaDesconexionMangueras != null && _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraDesconexionMangueras != null ?
                _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaDesconexionMangueras.Value.ToString("dd/MM") + " " + _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraDesconexionMangueras : "", estiloValorConBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row13, 13, 13, 6, 6, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaDesamarro != null && _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraDesamarro != null ?
                _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaDesamarro.Value.ToString("dd/MM") + " " + _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraDesamarro : "", estiloValorConBorde, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row9, 9, 9, 10, 11, "Viento Amarre:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row9, 9, 9, 12, 12, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.VientoAmarro ?? string.Empty + "Km/h", estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row10, 10, 10, 10, 11, "Dirección:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row10, 10, 10, 12, 12, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.DireccionAmarro ?? string.Empty, estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row11, 11, 11, 10, 11, "Viento Zarpada:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row11, 11, 11, 12, 12, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.VientoDesamarro ?? string.Empty + "Km/h", estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row12, 12, 12, 10, 11, "Dirección:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row12, 12, 12, 12, 12, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.DireccionDesamarro ?? string.Empty, estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row16, 16, 16, 1, 3, "tTe = Tiempo Total Emb. =", estiloValor, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row16, 16, 16, 4, 5, ObtenerTiempoTtalEmb(), estiloAmarillo, 1, 1, 1, 1, false);

            CrearTablaEventos();

            //Para lineas biodiesel se trabaja como lineas nuevas.
            var linN = _eventos.Where(e => e.TipoLinea == "Nueva").FirstOrDefault();
            var linBiodiesel = _eventos.Where(e => e.TipoLinea == "Biodiesel").FirstOrDefault();
            if (linBiodiesel != null && linBiodiesel.Eventos.Count > 0)
            {
                linN = linBiodiesel;
            }
            var linV = _eventos.Where(e => e.TipoLinea == "Vieja").FirstOrDefault();
            var linVic = _eventos.Where(e => e.TipoLinea == "Vicentin").FirstOrDefault();

            var eventosN = linN != null ? linN.Eventos.ToList() : new List<EventoEmbarqueLiqDto>();
            var eventosV = linV != null ? linV.Eventos.ToList() : new List<EventoEmbarqueLiqDto>();
            var eventosVic = linVic != null ? linVic.Eventos.ToList() : new List<EventoEmbarqueLiqDto>();

            CrearTablaLinea("NUEVA", 0, eventosN);

            CrearTablaLinea("VIEJA", 10, eventosV);

            CrearTablaLinea("VICENTIN", 20, eventosVic);

            //Calculo offset de eventos de embarque y sumo 10 por los headers y espacios, y se empieza a partir de la fila 33 ya que ahi finaliza la tabla de eventos..
            int offsetEventos = 33 + Math.Max(eventosN.Count, Math.Max(eventosV.Count, eventosVic.Count)) + 10;

            CrearSeccionRitmos(offsetEventos);
        }

        #region FUNCIONES AUXILIARES

        private string ObtenerDestinoEmbarque()
        {
            var destinos = _nominaciones?
            .SelectMany(nom => nom.NominacionDatoTecnico?.NominacionDatoTecnicoDestino)
            .Select(destino => destino.Destino?.Nombre)
            .Distinct()
            .ToList();

            return string.Join(", ", destinos);
        }

        private string ObtenerMaterialesEmbarque()
        {
            var materiales = _nominaciones?
            .Select(nom => nom.NominacionDatoTecnico?.MaterialPuerto?.Descripcion)
            .Distinct()
            .ToList();

            return string.Join(", ", materiales);
        }

        private string ObtenerExportadoresEmbarque()
        {
            var exportadores = _nominaciones?
            .SelectMany(nom => nom.NominacionDatoTecnico?.NominacionDatoTecnicoExportador)
            .Select(exportador => exportador.Exportador?.Nombre)
            .Distinct()
            .ToList();

            return string.Join(", ", exportadores);
        }

        private string ObtenerBandera()
        {
            return (_nominaciones != null && _nominaciones.Count > 0)
                    ? _nominaciones[0].NominacionDatoTecnico?.VaporInformacion?.Bandera?.Nombre
                    : "";
        }

        private int ObtenerTotalEmbarque()
        {
            var total = _nominaciones
            .Sum(nom => (int)nom.NominacionDatoTecnico?.CantidadTotal);

            return total;
        }

        private string ObtenerTiempoTtalEmb()
        {
            var fecComienzoCarga = _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaComienzoCarga;
            var fecFinCarga = _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaFinalizacionCarga;
            if (fecComienzoCarga == null || fecFinCarga == null)
                return string.Empty;
            TimeSpan horaInicio = TimeSpan.ParseExact(_modCarga.ModuloDeCargaPeriodoDeCarga[0].HoraComienzoCarga, "hh\\:mm", CultureInfo.InvariantCulture);
            DateTime fechaIni = fecComienzoCarga.Value.Add(horaInicio);

            TimeSpan horaFin = TimeSpan.ParseExact(_modCarga.ModuloDeCargaPeriodoDeCarga[0].HoraFinalizacionCarga, "hh\\:mm", CultureInfo.InvariantCulture);
            DateTime fechaFin = fecFinCarga.Value.Add(horaFin);

            TimeSpan diferencia = fechaFin - fechaIni;

            return $"{(int)diferencia.TotalHours:D2}:{diferencia.Minutes:D2} hs";
        }

        private TimeSpan ObtenerTiempoTotalPorMotivo(List<EventoEmbarqueLiqDto> eventos, List<string> siglas)
        {
            var eventosFiltrados = siglas != null ? eventos.Where(e => siglas.Contains(e.MotivoFalla)).ToList()
            : eventos.ToList();
            var sumaTiempo = new TimeSpan();

            foreach (var e in eventosFiltrados)
            {
                sumaTiempo = sumaTiempo.Add(e.Tiempo);
            }

            return sumaTiempo;
        }

        private int ObtenerPorcEventoPorMotivoSigla(List<EventoEmbarqueLiqDto> eventos, string sigla)
        {
            var totalHs = eventos
                .Select(c => c.Tiempo)
                .Aggregate(TimeSpan.Zero, (suma, duracion) => suma + duracion);

            var totalHsPorMotivo = eventos.Where(e => e.MotivoFalla == sigla)
                .Select(c => c.Tiempo)
                .Aggregate(TimeSpan.Zero, (suma, duracion) => suma + duracion);

            if (totalHs.TotalHours == 0)
                return 0;

            return (int)((totalHsPorMotivo.TotalHours * 100) / totalHs.TotalHours);
        }

        private double ObtenerPorcCargaEventoPorMotivoSigla(List<EventoEmbarqueLiqDto> eventos, string sigla)
        {
            var totalBc = eventos
                .Sum(c => c.Cantidad);

            var totalBcMotivo = eventos.Where(e => e.MotivoFalla == sigla)
                .Sum(c => c.Cantidad);

            if (totalBc == 0)
                return 0;
            var porc = Math.Truncate(((int)totalBcMotivo * 100.0 / (int)totalBc) * 10) / 10;
            return porc;
        }

        private string ObtenerRitmoABajaCarga()
        {
            var bajasCargas = _eventos.SelectMany(x => x.Eventos).Where(e => e.TipoEvento.Equals(TipoEvento.BajaCarga)).ToList();
            int totalBajasCargas = bajasCargas.Sum(x => (int)x.Cantidad);
            double hsTot = ObtenerTiempoTtalEventos(bajasCargas).TotalMinutes / 60D;
            if (hsTot == 0)
                return "0 TN/h";
            var ritmoBc = Math.Round(((totalBajasCargas) / (hsTot)), 2);
            return ritmoBc + " TN/h";
        }

        private string ObtenerPorcABajaCarga()
        {
            var totalCargas = _modCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(p => p.ModuloDeCargaPlanillaDeTurnosDetallesLiquido)
                .Sum(d => (int)d.Cantidad);
            int totalBajasCargas = _eventos.SelectMany(x => x.Eventos).Where(e => e.TipoEvento.Equals(TipoEvento.BajaCarga)).Sum(x => (int)x.Cantidad);

            var porc = Math.Round((double)(totalBajasCargas * 100) / totalCargas);
            return porc + "%";
        }

        private string ObtenerHsABajaCarga()
        {
            var totalHsBc = _eventos.SelectMany(x => x.Eventos).Where(e => e.TipoEvento.Equals(TipoEvento.BajaCarga))
                .Select(c => c.Tiempo)
                .Aggregate(TimeSpan.Zero, (suma, duracion) => suma + duracion);
            return $"{(int)totalHsBc.TotalHours:D2}:{totalHsBc.Minutes:D2} hs";
        }

        private TimeSpan ObtenerTiempoTtalEventos(List<EventoEmbarqueLiqDto> eventos)
        {
            var tiempoTotal = TimeSpan.Zero;
            foreach (var evento in eventos)
            {
                tiempoTotal = tiempoTotal.Add(evento.Tiempo);
            }
            return tiempoTotal;
        }

        private double ObtenerPorcTiempoParada()
        {
            var totalHsCortes = _eventos.SelectMany(x => x.Eventos).Where(e => e.TipoEvento.Equals(TipoEvento.Corte))
                .Select(c => c.Tiempo)
                .Aggregate(TimeSpan.Zero, (suma, duracion) => suma + duracion).TotalHours;

            var totalHsCargaTotal = _eventos.SelectMany(x => x.Eventos).Where(e => e.TipoEvento.Equals(TipoEvento.BajaCarga)
            || e.TipoEvento.Equals(TipoEvento.Normal))
                .Select(c => c.Tiempo)
                .Aggregate(TimeSpan.Zero, (suma, duracion) => suma + duracion).TotalHours;

            double porc = Math.Round(((totalHsCortes / 60D) * 100) / (totalHsCargaTotal / 60D));
            return porc;
        }

        #endregion FUNCIONES AUXILIARES

        private void CrearTablaEventos()
        {
            ICellStyle estilo = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

            IRow row18 = _sheetRitmos.GetRow(18) ?? _sheetRitmos.CreateRow(18);
            CrearCelda(_sheetRitmos, row18, 18, 18, 0, 6, "Tipos de eventos durante embarques", estilo, 1, 1, 1, 1, false);

            IRow row19 = _sheetRitmos.GetRow(19) ?? _sheetRitmos.CreateRow(19);
            CrearCelda(_sheetRitmos, row19, 19, 19, 0, 0, "BCB", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Baja Carga Buque ( Ej: Pedido del buque, deslastre, etc.)", row19, 1, 6, new int[] { 0, 5, 11 });

            IRow row20 = _sheetRitmos.GetRow(20) ?? _sheetRitmos.CreateRow(20);
            CrearCelda(_sheetRitmos, row20, 20, 20, 0, 0, "BCP", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Baja Carga Puerto (Escases de mercadería, apelmazamiento de mercaderia, apertura de portones, etc.)", row20, 1, 6, new int[] { 0, 5, 11 });

            IRow row21 = _sheetRitmos.GetRow(21) ?? _sheetRitmos.CreateRow(21);
            CrearCelda(_sheetRitmos, row21, 21, 21, 0, 0, "C", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Calidad de Mercadería (Ej: Color, olor, granulometría, apelmazamiento, etc.)", row21, 1, 6, new int[] { 0 });

            IRow row22 = _sheetRitmos.GetRow(22) ?? _sheetRitmos.CreateRow(22);
            CrearCelda(_sheetRitmos, row22, 22, 22, 0, 0, "E", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Fallas Eléctricas de equipos de MOA", row22, 1, 6, new int[] { 7 });

            IRow row23 = _sheetRitmos.GetRow(23) ?? _sheetRitmos.CreateRow(23);
            CrearCelda(_sheetRitmos, row23, 23, 23, 0, 0, "F", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Por Fuleo de bodegas", row23, 1, 6, new int[] { 4 });

            IRow row24 = _sheetRitmos.GetRow(24) ?? _sheetRitmos.CreateRow(24);
            CrearCelda(_sheetRitmos, row24, 24, 24, 0, 0, "H", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Por Habilitación del buque (Ej: Habilitaciones, Cambio de exportadores, lluvia)", row24, 1, 6, new int[] { 4 });

            IRow row25 = _sheetRitmos.GetRow(25) ?? _sheetRitmos.CreateRow(25);
            CrearCelda(_sheetRitmos, row25, 25, 25, 0, 0, "M", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Fallas Mecánicas de equipos de MOA", row25, 1, 6, new int[] { 7 });

            IRow row26 = _sheetRitmos.GetRow(26) ?? _sheetRitmos.CreateRow(26);
            CrearCelda(_sheetRitmos, row26, 26, 26, 0, 0, "N", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Normal (Sin restricciones de ritmo)", row26, 1, 6, new int[] { 0 });

            IRow row27 = _sheetRitmos.GetRow(27) ?? _sheetRitmos.CreateRow(27);
            CrearCelda(_sheetRitmos, row27, 27, 27, 0, 0, "OP", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Operativas de Puerto MOA (Ej.: Cambios de Bodegas,Limpieza de circuito, mala operatoria)", row27, 1, 6, new int[] { 0, 14 });

            IRow row28 = _sheetRitmos.GetRow(28) ?? _sheetRitmos.CreateRow(28);
            CrearCelda(_sheetRitmos, row28, 28, 28, 0, 0, "OC", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Operativas de MOA Comercial (Ej.: Parada por Falta de mercadería)", row28, 1, 6, new int[] { 0, 18 });

            IRow row29 = _sheetRitmos.GetRow(29) ?? _sheetRitmos.CreateRow(29);
            CrearCelda(_sheetRitmos, row29, 29, 29, 0, 0, "OB", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Operativas del Buque (Ej: Corte de carga, lectura de calado)", row29, 1, 6, new int[] { 0, 15 });

            IRow row30 = _sheetRitmos.GetRow(30) ?? _sheetRitmos.CreateRow(30);
            CrearCelda(_sheetRitmos, row30, 30, 30, 0, 0, "P", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Pala / Paleo (Ej: Falta de Palas, rotura de Palas, rotura de rejillas a raíz de las palas, etc. / Paleo Bodegas)", row30, 1, 6, new int[] { 7 });

            IRow row31 = _sheetRitmos.GetRow(31) ?? _sheetRitmos.CreateRow(31);
            CrearCelda(_sheetRitmos, row31, 31, 31, 0, 0, "3ro", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Terceros (Ej. Paradas que no corresponden al Puerto, Parada en Logística, Baja presión de aire, etc.)", row31, 1, 6, null);

            IRow row32 = _sheetRitmos.GetRow(32) ?? _sheetRitmos.CreateRow(32);
            CrearCelda(_sheetRitmos, row32, 32, 32, 0, 0, "T", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("OTros (Ejemplo: Huelgas - Determinante)", row32, 1, 6, new int[] { 1 });
        }

        private void CrearCeldaEvento(string descripcion, IRow row, int colIni, int colFin, int[] indexIniciales)
        {
            XSSFRichTextString richText = new XSSFRichTextString(descripcion);

            IFont boldFont = _workbook.CreateFont();
            boldFont.Boldweight = (short)FontBoldWeight.Bold;

            IFont redFont = _workbook.CreateFont();
            redFont.Color = IndexedColors.Red.Index;

            if (indexIniciales != null)
            {
                foreach (int indice in indexIniciales)
                {
                    richText.ApplyFont(indice, indice + 1, boldFont);
                }
            }

            int startRedText = richText.String.IndexOf("(");
            if (startRedText != -1)
            {
                richText.ApplyFont(startRedText, richText.Length, redFont);
            }

            ICell celda = row.CreateCell(colIni);

            var regionCelda = new CellRangeAddress(row.RowNum, row.RowNum, colIni, colFin);
            _sheetRitmos.AddMergedRegion(regionCelda);
            RegionUtil.SetBorderTop(1, regionCelda, _sheetRitmos, _workbook);
            RegionUtil.SetBorderLeft(1, regionCelda, _sheetRitmos, _workbook);
            RegionUtil.SetBorderRight(1, regionCelda, _sheetRitmos, _workbook);
            RegionUtil.SetBorderBottom(1, regionCelda, _sheetRitmos, _workbook);

            celda.SetCellValue(richText);
        }

        private void CrearTablaLinea(string linea, int colIni, List<EventoEmbarqueLiqDto> eventos)
        {
            ICellStyle titulo = CrearEstiloCelda(_sheetRitmos, "Arial", 10, IndexedColors.Red.Index, true, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle campos = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle campoHs = CrearEstiloCelda(_sheetRitmos, "Arial", 9, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle body = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle bodyTiempo = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.LightYellow.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.Thin, BorderStyle.Thin);

            //Header tabla
            IRow row36 = _sheetRitmos.GetRow(36) ?? _sheetRitmos.CreateRow(36);
            CrearCelda(_sheetRitmos, row36, 36, 36, colIni, colIni + 8, "Ritmo de carga // Paradas (LINEA " + linea + ")", titulo, 1, 1, 1, 1, false, null);

            IRow row37 = _sheetRitmos.GetRow(37) ?? _sheetRitmos.CreateRow(37);
            CrearCelda(_sheetRitmos, row37, 37, 37, colIni, colIni + 4, "Eventos de embarque", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row37, 37, 38, colIni + 5, colIni + 5, "TN B Carga", campos, 1, 1, 1, 1, false, null);

            CrearCelda(_sheetRitmos, row37, 37, 38, colIni + 6, colIni + 7, "Detalle de evento", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row37, 37, 38, colIni + 8, colIni + 8, "Tipo", campos, 1, 1, 1, 1, false, null);

            IRow row38 = _sheetRitmos.GetRow(38) ?? _sheetRitmos.CreateRow(38);
            CrearCelda(_sheetRitmos, row38, 38, 38, colIni, colIni, "Bga", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row38, 38, 38, colIni + 1, colIni + 1, "Tk Tierra", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row38, 38, 38, colIni + 2, colIni + 2, "Inicio", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row38, 38, 38, colIni + 3, colIni + 3, "Corte", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row38, 38, 38, colIni + 4, colIni + 4, "Tiempo T", campos, 1, 1, 1, 1, false, null);

            //Body tabla
            int index = 39;
            int totalTn = 0;
            TimeSpan totalT = new TimeSpan();

            foreach (var evento in eventos)
            {
                totalTn += evento.Cantidad ?? 0;
                IRow row = _sheetRitmos.GetRow(index) ?? _sheetRitmos.CreateRow(index);
                totalT = totalT.Add(evento.Tiempo);
                CrearCelda(_sheetRitmos, row, index, index, colIni, colIni, evento.Parcel.HasValue ? evento.Parcel.ToString() : "", body, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 1, colIni + 1, evento.TkTierra ?? "", body, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 2, colIni + 2, ObtenerFechaFormateada(evento.FechaInicio), campoHs, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 3, colIni + 3, ObtenerFechaFormateada(evento.FechaCorte), campoHs, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 4, colIni + 4, $"{(int)evento.Tiempo.TotalHours:D2}:{evento.Tiempo.Minutes:D2} hs", bodyTiempo, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 5, colIni + 5, (evento.Cantidad).ToString() ?? "", body, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 6, colIni + 7, evento.DetalleEvento ?? "", body, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 8, colIni + 8, evento.MotivoFalla ?? "", body, 0, 0, 1, 1, false, null);
                index++;
            }

            IRow rowTotal = _sheetRitmos.GetRow(index) ?? _sheetRitmos.CreateRow(index);
            CrearCelda(_sheetRitmos, rowTotal, rowTotal.RowNum, rowTotal.RowNum, colIni, colIni + 3, "Tn = tiempo bruto emb = ", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, rowTotal, rowTotal.RowNum, rowTotal.RowNum, colIni + 4, colIni + 4, $"{(int)totalT.TotalHours:D2}:{totalT.Minutes:D2} hs", bodyTiempo, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, rowTotal, rowTotal.RowNum, rowTotal.RowNum, colIni + 5, colIni + 5, totalTn.ToString(), campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, rowTotal, rowTotal.RowNum, rowTotal.RowNum, colIni + 6, colIni + 8, "= Toneladas a Baja Carga", campos, 1, 1, 1, 1, false, null);
        }

        private string ObtenerFechaFormateada(DateTime fecha)
        {
            return fecha.ToString("dd/MM HH:mm");
        }

        private void CrearSeccionRitmos(int inicio)
        {
            ICellStyle titulo = CrearEstiloCelda(_sheetRitmos, "Calibri", 15, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle subtitulo = CrearEstiloCelda(_sheetRitmos, "Calibri", 14, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle negrita = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle negritaConBorde = CrearEstiloCelda(_sheetRitmos, "Calibri", 12, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle texto = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle textoSinBorde = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle negritaSubrayado = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle estiloReRn = CrearEstiloCelda(_sheetRitmos, "Calibri", 14, IndexedColors.Black.Index, true, IndexedColors.LightYellow.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);

            ICellStyle esqSupIzq = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.None, BorderStyle.Medium, BorderStyle.None);
            ICellStyle esqSupDer = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.None, BorderStyle.None, BorderStyle.Medium);

            ICellStyle conMargenSup = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle conMargenInf = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.Medium, BorderStyle.None, BorderStyle.None);
            ICellStyle conMargenIzq = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.Medium, BorderStyle.None);
            ICellStyle conMargenDer = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.Medium);

            ICellStyle sinMargen = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle sinMargenDer = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None);
            ICellStyle sinMargenizqDer = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None, BorderStyle.None);
            ICellStyle sinMargenIzq = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None, BorderStyle.Medium);

            ICellStyle esqInfIzq = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None);
            ICellStyle esqInfDer = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.Medium, BorderStyle.None, BorderStyle.Medium);

            IRow row = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row, row.RowNum, row.RowNum, 1, 2, "Ritmo de Embarque (RE):", titulo, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetRitmos, row, row.RowNum, row.RowNum, 3, 10, " Considera la cantidad cargada en el tiempo contemplando las paradas vinculadas con el Puerto.", subtitulo, 0, 0, 0, 0, false, null);

            IFont fontSub = negritaSubrayado.GetFont(_workbook);
            fontSub.Underline = FontUnderlineType.Single;
            negritaSubrayado.SetFont(fontSub);

            inicio += 2;

            IRow row2 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);

            negrita.Alignment = HorizontalAlignment.Right;
            CrearCelda(_sheetRitmos, row2, row2.RowNum, row2.RowNum, 1, 1, "RE:", negrita, 0, 0, 0, 0, false, null);

            CrearCelda(_sheetRitmos, row2, row2.RowNum, row2.RowNum, 2, 2, "TN Totales Emb.", negritaSubrayado, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetRitmos, row2, row2.RowNum, row2.RowNum, 4, 4, "RB LínN:", negritaConBorde, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row2, row2.RowNum, row2.RowNum, 5, 5, ObtenerRitmoBuquePorLinea("Nueva") + "TN/h", negritaConBorde, 1, 1, 1, 1, false, null);

            CrearCelda(_sheetRitmos, row2, row2.RowNum, row2.RowNum, 12, 14, "Tiempos contemplados", texto, 1, 1, 1, 1, false, null);

            inicio++;
            IRow row3 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);

            CrearCelda(_sheetRitmos, row3, row3.RowNum, row3.RowNum, 2, 2, "Tiemp.Total bruto", negrita, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetRitmos, row3, row3.RowNum, row3.RowNum, 7, 7, "RB Buque:", negritaConBorde, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row3, row3.RowNum, row3.RowNum, 8, 8, ObtenerRBBuque() + "TN/h", negritaConBorde, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row3, row3.RowNum, row3.RowNum + 2, 9, 9, "MOA", negritaConBorde, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row3, row3.RowNum, row3.RowNum, 12, 14, "Línea Nueva: " + ObtenerTiempoTotalPorLinea("Nueva") + " hs", texto, 1, 1, 1, 1, false, null);

            inicio++;
            IRow row4 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row4, row4.RowNum, row4.RowNum, 4, 4, "RB LínV:", negritaConBorde, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row4, row4.RowNum, row4.RowNum, 5, 5, ObtenerRitmoBuquePorLinea("Vieja") + "TN/h", negritaConBorde, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row4, row4.RowNum, row4.RowNum, 12, 14, "Línea Vieja: " + ObtenerTiempoTotalPorLinea("Vieja") + " hs", texto, 1, 1, 1, 1, false, null);

            inicio++;
            IRow row5 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row5, row5.RowNum, row5.RowNum, 7, 7, "R Normal:", negritaConBorde, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row5, row5.RowNum, row5.RowNum, 8, 8, ObtenerRitmoNormal() + "TN/h", negritaConBorde, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row5, row5.RowNum, row5.RowNum, 12, 14, "Lín. Vicentin: " + ObtenerTiempoTotalPorLinea("Vicentin") + " hs", texto, 1, 1, 1, 1, false, null);

            inicio++;
            IRow row6 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row6, row6.RowNum, row6.RowNum, 4, 4, "RB LínVic:", negritaConBorde, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row6, row6.RowNum, row6.RowNum, 5, 5, ObtenerRitmoBuquePorLinea("Vicentin") + "TN/h", negritaConBorde, 1, 1, 1, 1, false, null);

            inicio++;
            var rbMoaVic = ObtenerRBMoaVic();
            IRow row7 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row7, row7.RowNum, row7.RowNum, 7, 7, "RB Buque:", negritaConBorde, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row7, row7.RowNum, row7.RowNum, 8, 8, rbMoaVic == 0 ? "-" : rbMoaVic + "TN/h", negritaConBorde, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row7, row7.RowNum, row7.RowNum, 9, 9, "MOA+VIC", negritaConBorde, 1, 1, 1, 1, false, null);

            inicio += 2;
            IRow row8 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row8, row8.RowNum, row8.RowNum, 1, 2, "Información adicional", titulo, 0, 0, 0, 0, false);

            inicio++;
            IRow row9 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row9, row9.RowNum, row9.RowNum, 1, 2, "Ritmo a baja carga", textoSinBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row9, row9.RowNum, row9.RowNum, 3, 3, ObtenerRitmoABajaCarga(), negrita, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row9, row9.RowNum, row9.RowNum, 4, 4, ObtenerHsABajaCarga(), negrita, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row9, row9.RowNum, row9.RowNum, 5, 6, "Horas a Baja carga, suma las dos manos", textoSinBorde, 0, 0, 0, 0, false);

            inicio++;
            IRow row10 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row10, row10.RowNum, row10.RowNum, 1, 2, "% Cargado a Baja Carga: ", textoSinBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row10, row10.RowNum, row10.RowNum, 3, 3, ObtenerPorcABajaCarga(), negrita, 0, 0, 0, 0, false);

            inicio++;
            IRow row11 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);

            var cortes = _eventos.SelectMany(x => x.Eventos.Where(e => e.TipoEvento == TipoEvento.Corte)).ToList();
            var bajasCargas = _eventos.SelectMany(x => x.Eventos.Where(e => e.TipoEvento == TipoEvento.BajaCarga)).ToList();

            CrearCelda(_sheetRitmos, row11, row11.RowNum, row11.RowNum, 1, 2, "Paradas Operativas Puerto: ", esqSupIzq, 2, 0, 2, 0, false);
            var tiempoOP = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "OP" });
            var porcOP = ObtenerPorcEventoPorMotivoSigla(cortes, "OP");
            CrearCelda(_sheetRitmos, row11, row11.RowNum, row11.RowNum, 3, 3, $"{(int)tiempoOP.TotalHours:D2}:{tiempoOP.Minutes:D2} hs", conMargenSup, 2, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row11, row11.RowNum, row11.RowNum, 4, 4, porcOP + "%", esqSupDer, 2, 0, 0, 2, false);

            CrearCelda(_sheetRitmos, row11, row11.RowNum, row11.RowNum, 6, 7, "% Cargado a baja carga: ", esqSupIzq, 2, 0, 2, 0, false);
            CrearCelda(_sheetRitmos, row11, row11.RowNum, row11.RowNum, 8, 8, ObtenerPorcABajaCarga(), esqSupDer, 2, 0, 0, 2, false);

            inicio++;
            IRow row12 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row12, row12.RowNum, row12.RowNum, 1, 2, "Paradas Operativas Buque: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoOB = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "OB" });
            var porcOB = ObtenerPorcEventoPorMotivoSigla(cortes, "OB");

            CrearCelda(_sheetRitmos, row12, row12.RowNum, row12.RowNum, 3, 3, $"{(int)tiempoOB.TotalHours:D2}:{tiempoOB.Minutes:D2} hs", sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row12, row12.RowNum, row12.RowNum, 4, 4, porcOB + "%", conMargenDer, 0, 0, 0, 2, false);

            CrearCelda(_sheetRitmos, row12, row12.RowNum, row12.RowNum, 6, 7, "% Baja Carga por Buque:", conMargenIzq, 0, 0, 2, 0, false);
            CrearCelda(_sheetRitmos, row12, row12.RowNum, row12.RowNum, 8, 8, ObtenerPorcCargaEventoPorMotivoSigla(bajasCargas, "BCB") + "%", conMargenDer, 0, 0, 0, 2, false);

            inicio++;
            IRow row13 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row13, row13.RowNum, row13.RowNum, 1, 2, "Paradas Operativas Comercial:", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoOC = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "OC" });
            var porcOC = ObtenerPorcEventoPorMotivoSigla(cortes, "OC");

            CrearCelda(_sheetRitmos, row13, row13.RowNum, row13.RowNum, 3, 3, $"{(int)tiempoOC.TotalHours:D2}:{tiempoOC.Minutes:D2} hs", sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row13, row13.RowNum, row13.RowNum, 4, 4, porcOC + "%", conMargenDer, 0, 0, 0, 2, false);

            CrearCelda(_sheetRitmos, row13, row13.RowNum, row13.RowNum, 6, 7, "% Baja Carga por MOA:", conMargenIzq, 0, 0, 2, 0, false);
            CrearCelda(_sheetRitmos, row13, row13.RowNum, row13.RowNum, 8, 8, ObtenerPorcCargaEventoPorMotivoSigla(bajasCargas, "BCP") + "%", conMargenDer, 0, 0, 0, 2, false);

            inicio++;
            IRow row14 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row14, row14.RowNum, row14.RowNum, 1, 2, "Paradas Mecánicas: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoM = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "M" });
            var porcM = ObtenerPorcEventoPorMotivoSigla(cortes, "M");
            CrearCelda(_sheetRitmos, row14, row14.RowNum, row14.RowNum, 3, 3, $"{(int)tiempoM.TotalHours:D2}:{tiempoM.Minutes:D2} hs", sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row14, row14.RowNum, row14.RowNum, 4, 4, porcM + "%", conMargenDer, 0, 0, 0, 2, false);

            CrearCelda(_sheetRitmos, row14, row14.RowNum, row14.RowNum, 6, 7, "% Baja Carga Fulleo:", esqInfIzq, 0, 2, 2, 0, false);
            CrearCelda(_sheetRitmos, row14, row14.RowNum, row14.RowNum, 8, 8, ObtenerPorcCargaEventoPorMotivoSigla(bajasCargas, "F") + "%", esqInfDer, 0, 2, 0, 2, false);

            inicio++;
            IRow row15 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row15, row15.RowNum, row15.RowNum, 1, 2, "Paradas Eléctricas: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoE = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "E" });
            var porcE = ObtenerPorcEventoPorMotivoSigla(cortes, "E");

            CrearCelda(_sheetRitmos, row15, row15.RowNum, row15.RowNum, 3, 3, $"{(int)tiempoE.TotalHours:D2}:{tiempoE.Minutes:D2} hs", sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row15, row15.RowNum, row15.RowNum, 4, 4, porcE + "%", conMargenDer, 0, 0, 0, 2, false);

            inicio++;
            IRow row16 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row16, row16.RowNum, row16.RowNum, 1, 2, "Paradas por Habilitación: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoH = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "H" });
            var porcH = ObtenerPorcEventoPorMotivoSigla(cortes, "H");

            CrearCelda(_sheetRitmos, row16, row16.RowNum, row16.RowNum, 3, 3, $"{(int)tiempoH.TotalHours:D2}:{tiempoH.Minutes:D2} hs", sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row16, row16.RowNum, row16.RowNum, 4, 4, porcH + "%", conMargenDer, 0, 0, 0, 2, false);

            var porcTiempoParado = ObtenerPorcTiempoParada();
            var porcTiempoCargando = 100 - porcTiempoParado;

            CrearCelda(_sheetRitmos, row16, row16.RowNum, row16.RowNum, 6, 7, "% de tiempo Cargando", esqSupIzq, 2, 0, 2, 0, false);
            CrearCelda(_sheetRitmos, row16, row16.RowNum, row16.RowNum, 8, 8, porcTiempoCargando + "%", esqSupDer, 2, 0, 0, 2, false);

            inicio++;
            IRow row17 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row17, row17.RowNum, row17.RowNum, 1, 2, "Espera Determinante: ", esqInfIzq, 0, 2, 2, 0, false);
            var tiempoT = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "T" });
            var porcT = ObtenerPorcEventoPorMotivoSigla(cortes, "T");
            CrearCelda(_sheetRitmos, row17, row17.RowNum, row17.RowNum, 3, 3, $"{(int)tiempoT.TotalHours:D2}:{tiempoT.Minutes:D2} hs", conMargenInf, 0, 2, 0, 0, false);
            CrearCelda(_sheetRitmos, row17, row17.RowNum, row17.RowNum, 4, 4, porcT + "%", esqInfDer, 0, 2, 0, 2, false);

            CrearCelda(_sheetRitmos, row17, row17.RowNum, row17.RowNum, 6, 7, "% de tiempo Parado ", esqInfIzq, 0, 2, 2, 0, false);
            CrearCelda(_sheetRitmos, row17, row17.RowNum, row17.RowNum, 8, 8, porcTiempoParado + "%", esqInfDer, 0, 2, 0, 2, false);

            inicio++;
            IRow row18 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            var motivos = new List<string> { "OP", "OB", "M", "E", "H", "T" };
            var porcTotalParadas = porcOP + porcOB + porcOC + porcH + porcE + porcT;
            CrearCelda(_sheetRitmos, row18, row18.RowNum, row18.RowNum, 1, 2, "TOTAL HORAS PARADAS", sinMargenDer, 2, 2, 2, 0, false);
            var tiempoTotalAllMotivos = ObtenerTiempoTotalPorMotivo(cortes, motivos);
            CrearCelda(_sheetRitmos, row18, row18.RowNum, row18.RowNum, 3, 3, $"{(int)tiempoTotalAllMotivos.TotalHours:D2}:{tiempoTotalAllMotivos.Minutes:D2} hs", sinMargenizqDer, 2, 2, 0, 0, false);
            CrearCelda(_sheetRitmos, row18, row18.RowNum, row18.RowNum, 4, 4, porcTotalParadas + "%", sinMargenIzq, 2, 2, 0, 2, false);

            //Creamos una linea para ingresar observaciones
            inicio += 2;
            IRow rowIndex = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, rowIndex, rowIndex.RowNum, rowIndex.RowNum, 0, 16, "", texto, 1, 1, 1, 1, false);
        }

        private double ObtenerRitmoBuquePorLinea(string linea)
        {
            var tieneBiodiesel = _eventos.FirstOrDefault(e => e.TipoLinea == "Biodiesel")?.Eventos?.Any() ?? false;
            if (linea == "Nueva" && tieneBiodiesel)
            {
                linea = "Biodiesel";
            }

            var lineasEmb = _modCarga.ModuloDeCargaLineasDeEmbarque.Where(l => l.TipoLineaEmbarque.Linea == linea).Select(x => x.Id).ToList();
            var cargasTotales = _modCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido).Where(d => lineasEmb.Contains(d.Linea_Id));
            var cortesLinea = _modCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosCortes).Where(d => d.TipoLineaEmbarque.Linea == linea && d.MotivosDeCorte.Siglas != "BCP" && d.MotivosDeCorte.Siglas != "BCB");

            var cantTotal = cargasTotales.Sum(x => x.Cantidad);

            TimeSpan tiempoTotalCargas = cargasTotales
                .Select(x => TimeSpan.Parse(x.HoraFin) - TimeSpan.Parse(x.HoraInicio))
                .Aggregate(TimeSpan.Zero, (acum, tiempo) => acum + tiempo);

            TimeSpan tiempoTotalCortes = cortesLinea
                .Select(x => TimeSpan.Parse(x.HoraFin) - TimeSpan.Parse(x.HoraInicio))
                .Aggregate(TimeSpan.Zero, (acum, tiempo) => acum + tiempo);

            var tiempoTotal = tiempoTotalCargas + tiempoTotalCortes;
            if (tiempoTotal.TotalMinutes == 0)
                return 0;
            var ritmoBuque = Math.Round((double)cantTotal / (tiempoTotal.TotalMinutes / 60D), 2);
            return ritmoBuque;
        }

        private double ObtenerRBBuque()
        {
            //RE Buque: ((Total de cantidad TN LinN) +(Total de
            //cantidad TN de LinV)) / (dividido)suma de tiempos de las LinN y LinV. (Es igual a Ritmo bruto)
            var lineaNueva = "Nueva";
            var tieneBiodiesel = _eventos.FirstOrDefault(e => e.TipoLinea == "Biodiesel")?.Eventos?.Any() ?? false;

            if (tieneBiodiesel)
            {
                lineaNueva = "Biodiesel";
            }
            var lineasEmb = _modCarga.ModuloDeCargaLineasDeEmbarque.Where(l => l.TipoLineaEmbarque.Linea == lineaNueva || l.TipoLineaEmbarque.Linea == "Vieja").Select(x => x.Id).ToList();

            var cargasTotales = _modCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido).Where(d => lineasEmb.Contains(d.Linea_Id));
            var cortesLinea = _modCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosCortes).Where(d => (d.TipoLineaEmbarque.Linea == lineaNueva || d.TipoLineaEmbarque.Linea == "Vieja")
            && (d.MotivosDeCorte.Siglas != "BCP" && d.MotivosDeCorte.Siglas != "BCB"));

            var cantTotal = (double)cargasTotales.Sum(x => x.Cantidad);

            TimeSpan tiempoTotalCargas = cargasTotales
                .Select(x => TimeSpan.Parse(x.HoraFin) - TimeSpan.Parse(x.HoraInicio))
                .Aggregate(TimeSpan.Zero, (acum, tiempo) => acum + tiempo);

            TimeSpan tiempoTotalCortes = cortesLinea
            .Select(x => TimeSpan.Parse(x.HoraFin) - TimeSpan.Parse(x.HoraInicio))
            .Aggregate(TimeSpan.Zero, (acum, tiempo) => acum + tiempo);

            var tiempoTotal = tiempoTotalCargas + tiempoTotalCortes;
            if (tiempoTotal.TotalMinutes == 0) return 0;

            var reBuque = Math.Round((double)cantTotal / (tiempoTotal.TotalMinutes / 60D), 2);

            return reBuque;
        }

        private double ObtenerRitmoNormal()
        {
            var lineaNueva = "Nueva";
            var tieneBiodiesel = _eventos.FirstOrDefault(e => e.TipoLinea == "Biodiesel")?.Eventos?.Any() ?? false;

            if (tieneBiodiesel)
            {
                lineaNueva = "Biodiesel";
            }

            var lineasEmb = _modCarga.ModuloDeCargaLineasDeEmbarque.Where(l => l.TipoLineaEmbarque.Linea == lineaNueva || l.TipoLineaEmbarque.Linea == "Vieja").Select(x => x.Id).ToList();
            var cargasTotales = _modCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido).Where(d => lineasEmb.Contains(d.Linea_Id));
            var total = cargasTotales.Sum(x => x.Cantidad);
            var totalBajacarga = _modCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(t => t.ModuloDeCargaPlanillaDeTurnosCortes).Where(x => (x.TipoLineaEmbarque.Linea == lineaNueva || x.TipoLineaEmbarque.Linea == "Vieja")
            && (x.MotivosDeCorte.Siglas == "BCB" || x.MotivosDeCorte.Siglas == "BCP")).Sum(b => b.Cantidad);
            var totalNormal = (int)total - (int)totalBajacarga;

            TimeSpan tiempoTotal = cargasTotales
                            .Select(x => TimeSpan.Parse(x.HoraFin) - TimeSpan.Parse(x.HoraInicio))
                            .Aggregate(TimeSpan.Zero, (acum, tiempo) => acum + tiempo);
            TimeSpan tiempoTotalBc = _modCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(t => t.ModuloDeCargaPlanillaDeTurnosCortes).Where(x => (x.TipoLineaEmbarque.Linea == lineaNueva || x.TipoLineaEmbarque.Linea == "Vieja") &&
            (x.MotivosDeCorte.Siglas == "BCB" || x.MotivosDeCorte.Siglas == "BCP"))
                            .Select(x => TimeSpan.Parse(x.HoraFin) - TimeSpan.Parse(x.HoraInicio))
                            .Aggregate(TimeSpan.Zero, (acum, tiempo) => acum + tiempo);
            TimeSpan tiempoTotalCortes = _modCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(t => t.ModuloDeCargaPlanillaDeTurnosCortes).Where(x => (x.TipoLineaEmbarque.Linea == lineaNueva || x.TipoLineaEmbarque.Linea == "Vieja") &&
            (x.MotivosDeCorte.Siglas != "BCB" && x.MotivosDeCorte.Siglas != "BCP"))
                .Select(x => TimeSpan.Parse(x.HoraFin) - TimeSpan.Parse(x.HoraInicio))
                .Aggregate(TimeSpan.Zero, (acum, tiempo) => acum + tiempo);

            /*Ritmo Normal: ((Total de cantidad TN LinN -la cantidad a baja carga de
            LinN) +(Total de cantidad TN de LinV - la cantidad a
            baja carga de LinV)) / (dividido la suma de total de tiempos de LinN -los tiempos de baja carga en
            LinN sumado a los tiempos de LinV -los tiempos de baja carga en LINV. (Para este último caso no se
            toman en cuenta los tiempos de parada en ambas líneas, es decir también se restan).*/
            var tiempoTotalNormal = (tiempoTotal.TotalMinutes / 60D) - (tiempoTotalBc.TotalMinutes / 60D) - (tiempoTotalCortes.TotalMinutes / 60D);

            if (tiempoTotalNormal == 0) return 0;

            var ritmoNormal = totalNormal / tiempoTotalNormal;
            return Math.Round(ritmoNormal, 2);
        }

        private double ObtenerRBMoaVic()
        {
            if (!_eventos.First(x => x.TipoLinea == "Vicentin").Eventos.Any())
                return 0;

            var lineaNueva = "Nueva";
            var tieneBiodiesel = _eventos.FirstOrDefault(e => e.TipoLinea == "Biodiesel")?.Eventos?.Any() ?? false;

            if (tieneBiodiesel)
            {
                lineaNueva = "Biodiesel";
            }
            var lineasEmb = _modCarga.ModuloDeCargaLineasDeEmbarque.Where(l => l.TipoLineaEmbarque.Linea == lineaNueva || l.TipoLineaEmbarque.Linea == "Vieja" || l.TipoLineaEmbarque.Linea == "Vicentin").Select(x => x.Id).ToList();

            var cargasTotales = _modCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesLiquido).Where(d => lineasEmb.Contains(d.Linea_Id));
            var cortesLinea = _modCarga.ModuloDeCargaPlanillaDeTurnos.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosCortes).Where(d => (d.TipoLineaEmbarque.Linea == lineaNueva || d.TipoLineaEmbarque.Linea == "Vieja" || d.TipoLineaEmbarque.Linea == "Vicentin")
            && (d.MotivosDeCorte.Siglas != "BCP" && d.MotivosDeCorte.Siglas != "BCB"));

            var cantTotal = (double)cargasTotales.Sum(x => x.Cantidad);

            TimeSpan tiempoTotalCargas = cargasTotales
                .Select(x => TimeSpan.Parse(x.HoraFin) - TimeSpan.Parse(x.HoraInicio))
                .Aggregate(TimeSpan.Zero, (acum, tiempo) => acum + tiempo);

            TimeSpan tiempoTotalCortes = cortesLinea
            .Select(x => TimeSpan.Parse(x.HoraFin) - TimeSpan.Parse(x.HoraInicio))
            .Aggregate(TimeSpan.Zero, (acum, tiempo) => acum + tiempo);

            var tiempoTotal = tiempoTotalCargas + tiempoTotalCortes;
            if (tiempoTotal.TotalMinutes == 0) return 0;

            var reBuque = Math.Round((double)cantTotal / (tiempoTotal.TotalMinutes / 60D), 2);

            return reBuque;
        }

        private string ObtenerTiempoTotalPorLinea(string linea)
        {
            var lineaFiltro = linea;
            var tieneBiodiesel = _eventos.FirstOrDefault(e => e.TipoLinea == "Biodiesel")?.Eventos?.Any() ?? false;

            if (linea == "Nueva" && tieneBiodiesel)
            {
                lineaFiltro = "Biodiesel";
            }
            TimeSpan tiempoTotal = _eventos
                .Where(e => e.TipoLinea == lineaFiltro)
                .SelectMany(e => e.Eventos)
                .Select(x => x.Tiempo)
                .Aggregate(TimeSpan.Zero, (acum, tiempo) => acum + tiempo);

            return tiempoTotal.ToString(@"hh\:mm");
        }

        private string ObtenerDestinoPorBodega(int nroBod)
        {
            var bodega = _bodegasPlano.FirstOrDefault(b => b.BodegaParcel == nroBod);
            if (bodega == null || bodega.Destinos == null) return string.Empty;

            return string.Join(", ", bodega.Destinos.Select(x => x.Destino.Nombre));
        }
    }
}