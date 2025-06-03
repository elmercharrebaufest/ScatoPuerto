using Molinos.Scato.Dominio.Dto.Administracion;
using NPOI.HSSF.UserModel;
using NPOI.HSSF.Util;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    public class ExcelEmbarquesAdministracion
    {
        private readonly HSSFWorkbook _workbook;
        private readonly HSSFSheet _sheet;
        private readonly IList<InformacionEmbarqueDto> _embarques;
        private readonly string _path = System.Web.HttpContext.Current.Server.MapPath("~/iconMolinosChiquito.png");
        private readonly byte[] _dataImg;

        public ExcelEmbarquesAdministracion(IList<InformacionEmbarqueDto> embarques)
        {
            _workbook = new HSSFWorkbook();
            _sheet = (HSSFSheet)_workbook.CreateSheet("Embarques");
            _embarques = embarques;
            _dataImg = File.ReadAllBytes(_path);
        }

        public byte[] GenerarExcel()
        {
            int pictureIndex = _workbook.AddPicture(_dataImg, PictureType.PNG);
            ICreationHelper helper = _workbook.GetCreationHelper();
            IDrawing drawing = _sheet.CreateDrawingPatriarch();
            IClientAnchor anchor = helper.CreateClientAnchor();

            anchor.Col1 = 0;
            anchor.Row1 = 0;
            IPicture picture = drawing.CreatePicture(anchor, pictureIndex);
            picture.Resize();

            _sheet.CreateRow(0).CreateCell(0).SetCellValue("");
            CellRangeAddress celRangeImg = new CellRangeAddress(0, 2, 0, 1);
            RegionUtil.SetBorderBottom(2, celRangeImg, _sheet, _workbook);
            RegionUtil.SetBorderLeft(2, celRangeImg, _sheet, _workbook);
            RegionUtil.SetBorderRight(2, celRangeImg, _sheet, _workbook);
            RegionUtil.SetBorderTop(2, celRangeImg, _sheet, _workbook);
            _sheet.AddMergedRegion(celRangeImg);

            CellRangeAddress celRangeTitulo = new CellRangeAddress(0, 2, 2, 4);
            _sheet.AddMergedRegion(celRangeTitulo);
            ICell celdaTitulo = _sheet.CreateRow(0).CreateCell(2);
            celdaTitulo.SetCellValue("Listado de Embarques");
            ICellStyle headerStyle = _workbook.CreateCellStyle();
            IFont font = _workbook.CreateFont();
            font.Boldweight = (short)FontBoldWeight.Bold;
            font.FontHeightInPoints = 12;
            headerStyle.SetFont(font);
            headerStyle.FillForegroundColor = IndexedColors.Grey25Percent.Index;
            headerStyle.FillPattern = FillPattern.SolidForeground;
            headerStyle.Alignment = HorizontalAlignment.Center;
            headerStyle.VerticalAlignment = VerticalAlignment.Center;
            celdaTitulo.CellStyle = headerStyle;
            RegionUtil.SetBorderBottom(2, celRangeTitulo, _sheet, _workbook);
            RegionUtil.SetBorderLeft(2, celRangeTitulo, _sheet, _workbook);
            RegionUtil.SetBorderRight(2, celRangeTitulo, _sheet, _workbook);
            RegionUtil.SetBorderTop(2, celRangeTitulo, _sheet, _workbook);

            CellRangeAddress celRangeFecha = new CellRangeAddress(3, 3, 0, 4);
            _sheet.AddMergedRegion(celRangeFecha);
            ICell celdaFecha = _sheet.CreateRow(3).CreateCell(0);
            celdaFecha.SetCellValue("Fecha de reporte: " + DateTime.Now);
            ICellStyle estiloFecha = _workbook.CreateCellStyle();
            estiloFecha.FillForegroundColor = IndexedColors.LightYellow.Index;
            estiloFecha.FillPattern = FillPattern.SolidForeground;
            celdaFecha.CellStyle = estiloFecha;
            RegionUtil.SetBorderBottom(2, celRangeFecha, _sheet, _workbook);
            RegionUtil.SetBorderLeft(2, celRangeFecha, _sheet, _workbook);
            RegionUtil.SetBorderRight(2, celRangeFecha, _sheet, _workbook);

            this.CrearTabla();

            this.AgregarTotalesAgrupadosAlExcel();

            this.SetearAnchoColumnasHoja();

            using (var fileData = new MemoryStream())
            {
                _workbook.Write(fileData);
                var res = fileData.ToArray();
                return res;
            }
        }

        private void CrearTabla()
        {
            ICellStyle estiloHeader = CrearEstiloCelda(_sheet, "Arial", 11, IndexedColors.Black.Index, true, IndexedColors.LightGreen.RGB);
            ICellStyle estiloTd = CrearEstiloCelda(_sheet, "Arial", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB);

            IRow row4 = _sheet.CreateRow(4);
            CrearCelda(_sheet, row4, 4, 4, 0, 0, "Buque", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 1, 1, "Operación", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 2, 2, "Producto", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 3, 3, "TN/MT3", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 4, 4, "Amarre", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 5, 5, "Desamarre", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 6, 6, "Muelle", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 7, 7, "Exportador", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 8, 8, "Tanque", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 9, 9, "Fumigacion", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 10, 10, "Senasa", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 11, 11, "Def Moviles", estiloHeader);
            CrearCelda(_sheet, row4, 4, 4, 12, 12, "Estado", estiloHeader);

            int indexEmbarque = 5;
            foreach (var embarque in _embarques)
            {
                int indexItem = indexEmbarque;
                IRow row = _sheet.CreateRow(indexEmbarque);
                var offsetItems = embarque.ItemsEmbarque.Count();
                CrearCelda(_sheet, row, indexEmbarque, indexEmbarque + offsetItems - 1, 0, 0, embarque.Buque, estiloTd);
                CrearCelda(_sheet, row, indexEmbarque, indexEmbarque + offsetItems - 1, 1, 1, embarque.NroOperacion ?? "", estiloTd);
                CrearCelda(_sheet, row, indexEmbarque, indexEmbarque + offsetItems - 1, 12, 12, embarque.Estado ?? "", estiloTd);
                foreach (var item in embarque.ItemsEmbarque)
                {
                    IRow rowItem = _sheet.GetRow(indexItem) ?? _sheet.CreateRow(indexItem);
                    CrearCelda(_sheet, rowItem, indexItem, indexItem, 2, 2, item.Producto, estiloTd);
                    CrearCelda(_sheet, rowItem, indexItem, indexItem, 3, 3, item.Tn, estiloTd);
                    CrearCelda(_sheet, rowItem, indexItem, indexItem, 4, 4, item.Amarre.HasValue ? item.Amarre.Value.ToString("dd/MM/yyyy") : "-", estiloTd);
                    CrearCelda(_sheet, rowItem, indexItem, indexItem, 5, 5, item.Desamarre.HasValue ? item.Desamarre.Value.ToString("dd/MM/yyyy") : "-", estiloTd);
                    CrearCelda(_sheet, rowItem, indexItem, indexItem, 6, 6, item.Muelle ?? "-", estiloTd);
                    CrearCelda(_sheet, rowItem, indexItem, indexItem, 7, 7, item.Exportador, estiloTd);
                    CrearCelda(_sheet, rowItem, indexItem, indexItem, 8, 8, item.Tanque ?? "-", estiloTd);
                    CrearCelda(_sheet, rowItem, indexItem, indexItem, 9, 9, item.Fumigacion ?? "-", estiloTd);
                    CrearCelda(_sheet, rowItem, indexItem, indexItem, 10, 10, item.Senasa ?? "-", estiloTd);
                    CrearCelda(_sheet, rowItem, indexItem, indexItem, 11, 11, item.DefMoviles ?? "-", estiloTd);
                    indexItem++;
                }

                indexEmbarque += offsetItems;
            }
        }

        private void CrearCelda(ISheet sheet, IRow row, int firstRow, int lastRow, int firstCol, int lastCol, object valorCelda, ICellStyle estilo)
        {
            var regionCelda = new CellRangeAddress(firstRow, lastRow, firstCol, lastCol);
            sheet.AddMergedRegion(regionCelda);
            RegionUtil.SetBorderTop(1, regionCelda, sheet, _workbook);
            RegionUtil.SetBorderLeft(1, regionCelda, sheet, _workbook);
            RegionUtil.SetBorderRight(1, regionCelda, sheet, _workbook);
            RegionUtil.SetBorderBottom(1, regionCelda, sheet, _workbook);

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
        }

        private ICellStyle CrearEstiloCelda(ISheet sheet, string fontName, short fontSize, short fontColor, bool isBold, byte[] backgroundColor)
        {
            HSSFCellStyle style = (HSSFCellStyle)sheet.Workbook.CreateCellStyle();

            style.Alignment = HorizontalAlignment.Center;
            style.VerticalAlignment = VerticalAlignment.Center;

            IFont font = _workbook.CreateFont();
            font.FontName = fontName;
            font.FontHeightInPoints = fontSize;
            font.Color = fontColor;
            if (isBold)
                font.Boldweight = (short)FontBoldWeight.Bold;

            style.SetFont(font);
            style.BorderBottom = BorderStyle.Thin;
            style.BorderLeft = BorderStyle.Thin;
            style.BorderRight = BorderStyle.Thin;
            style.BorderTop = BorderStyle.Thin;

            HSSFPalette palette = _workbook.GetCustomPalette();
            HSSFColor color = palette.FindSimilarColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
            style.FillForegroundColor = color.Indexed;
            style.FillPattern = FillPattern.SolidForeground;

            return style;
        }

        private void SetearAnchoColumnasHoja()
        {
            //Buque
            SetAnchoCol(_sheet, 0, 20);
            //Op
            SetAnchoCol(_sheet, 1, 10);
            //Prod
            SetAnchoCol(_sheet, 2, 30);
            //Tn
            SetAnchoCol(_sheet, 3, 12);
            //Amarre
            SetAnchoCol(_sheet, 4, 14);
            //Desamarre
            SetAnchoCol(_sheet, 5, 14);
            //Muelle
            SetAnchoCol(_sheet, 6, 12);
            //Exportador
            SetAnchoCol(_sheet, 7, 25);
            //Tanque
            SetAnchoCol(_sheet, 8, 12);
            //Fumigacion
            SetAnchoCol(_sheet, 9, 12);
            //Senasa
            SetAnchoCol(_sheet, 10, 12);
            //Def Mov
            SetAnchoCol(_sheet, 11, 12);
            //Estado
            SetAnchoCol(_sheet, 12, 12);
        }

        private void SetAnchoCol(ISheet sheet, int columnIndex, double widthInCharacters)
        {
            int NpoiUnitMultiplier = 256;
            int widthInNpoiUnits = (int)(widthInCharacters * NpoiUnitMultiplier);
            sheet.SetColumnWidth(columnIndex, widthInNpoiUnits);
        }

        public Dictionary<string, decimal> GetProductoCantidadAgrupado()
        {
            var agrupadoMap = new Dictionary<string, decimal>();

            foreach (var embarque in _embarques)
            {
                foreach (var item in embarque.ItemsEmbarque)
                {
                    var prod = item.Producto;
                    var cantidadActual = agrupadoMap.ContainsKey(prod) ? agrupadoMap[prod] : 0;
                    var cantidadNueva = item.Tn;
                    agrupadoMap[prod] = cantidadActual + cantidadNueva;
                }
            }

            return agrupadoMap.ToDictionary(kvp => kvp.Key, kvp => Math.Round(kvp.Value, 3));
        }

        public void AgregarTotalesAgrupadosAlExcel()
        {
            var totalesAgrupados = GetProductoCantidadAgrupado();
            int rowIndex = _sheet.LastRowNum + 2;
            ICellStyle estiloHeader = CrearEstiloCelda(_sheet, "Arial", 11, IndexedColors.Black.Index, true, IndexedColors.LightGreen.RGB);
            ICellStyle estiloTd = CrearEstiloCelda(_sheet, "Arial", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB);

            IRow headerRow = _sheet.CreateRow(rowIndex++);
            CrearCelda(_sheet, headerRow, headerRow.RowNum, headerRow.RowNum, 0, 0, "Producto", estiloHeader);
            CrearCelda(_sheet, headerRow, headerRow.RowNum, headerRow.RowNum, 1, 1, "Total Tn", estiloHeader);

            foreach (var kvp in totalesAgrupados)
            {
                IRow row = _sheet.CreateRow(rowIndex++);
                CrearCelda(_sheet, row, row.RowNum, row.RowNum, 0, 0, kvp.Key, estiloTd);
                CrearCelda(_sheet, row, row.RowNum, row.RowNum, 1, 1, (double)kvp.Value, estiloTd);
            }
        }
    }
}