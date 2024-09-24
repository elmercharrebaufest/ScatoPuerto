using Molinos.Scato.Dominio.Dto;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    public class ExcelProductos
    {
        private readonly HSSFWorkbook _workbook;
        private readonly HSSFSheet _sheet;
        private readonly IList<ProductoDto> _productos;
        private readonly string _path = System.Web.HttpContext.Current.Server.MapPath("~/iconMolinosChiquito.png");
        private readonly byte[] _dataImg;

        public ExcelProductos(IList<ProductoDto> productos)
        {
            _workbook = new HSSFWorkbook();
            _sheet = (HSSFSheet)_workbook.CreateSheet("Listado de productos");
            _productos = productos;
            _dataImg = File.ReadAllBytes(_path);
        }

        public byte[] GenerarExcel()
        {
            CrearHeaderMolinos();
            CrearTabla();

            using (var fileData = new MemoryStream())
            {
                _workbook.Write(fileData);
                var res = fileData.ToArray();
                return res;
            }
        }

        private void CrearHeaderMolinos()
        {
            int pictureIndex = _workbook.AddPicture(_dataImg, PictureType.PNG);
            ICreationHelper helper = _workbook.GetCreationHelper();
            IDrawing drawing = _sheet.CreateDrawingPatriarch();
            IClientAnchor anchor = helper.CreateClientAnchor();

            anchor.Col1 = 0;
            anchor.Row1 = 0;
            IPicture picture = drawing.CreatePicture(anchor, pictureIndex);
            picture.Resize();

            IRow row0 = _sheet.CreateRow(0);
            ICellStyle estilo = _workbook.CreateCellStyle();
            estilo.FillForegroundColor = IndexedColors.White.Index;
            CrearCelda(row0, 0, 2, 0, 1, "", estilo, 2);

            ICellStyle estiloMolinos = CrearEstilo("Arial", 14, IndexedColors.Black.Index, true, IndexedColors.Grey25Percent.Index, BorderStyle.Medium);
            CrearCelda(row0, 0, 2, 2, 15, "Listado de productos", estiloMolinos, 2);
        }

        private void CrearTabla()
        {
            IRow row3 = _sheet.GetRow(3) ?? _sheet.CreateRow(3);
            ICellStyle estiloTh = CrearEstilo("Arial", 9, IndexedColors.Black.Index, true, IndexedColors.LightGreen.Index, BorderStyle.Medium);

            CrearCelda(row3, 3, 3, 0, 2, "Producto", estiloTh, 2);
            CrearCelda(row3, 3, 3, 3, 4, "Descripción Corta", estiloTh, 2);
            CrearCelda(row3, 3, 3, 5, 6, "Formato del Producto", estiloTh, 2);
            CrearCelda(row3, 3, 3, 7, 8, "Tipo de Calidad", estiloTh, 2);
            CrearCelda(row3, 3, 3, 9, 11, "Parámetro", estiloTh, 2);
            CrearCelda(row3, 3, 3, 12, 15, "Valor", estiloTh, 2);

            ICellStyle estiloTd = CrearEstilo("Arial", 9, IndexedColors.Black.Index, false, IndexedColors.White.Index, BorderStyle.Thin);

            int rowIni = 4;

            foreach (ProductoDto prod in _productos)
            {
                int offsetCalidad = ObtenerOffsetParametros(prod.Calidades);
                int rowFin = rowIni + offsetCalidad;
                IRow row = _sheet.GetRow(rowIni) ?? _sheet.CreateRow(rowIni);

                CrearCelda(row, rowIni, rowFin, 0, 2, prod.Descripcion, estiloTd, 1);
                CrearCelda(row, rowIni, rowFin, 3, 4, prod.DescripcionCorta, estiloTd, 1);
                CrearCelda(row, rowIni, rowFin, 5, 6, prod.FormatoMaterial, estiloTd, 1);

                if (prod.Calidades == null || prod.Calidades.Count == 0)
                {
                    CrearCelda(row, rowIni, rowIni, 7, 8, "-", estiloTd, 1);
                    CrearCelda(row, rowIni, rowIni, 9, 11, "-", estiloTd, 1);
                    CrearCelda(row, rowIni, rowIni, 12, 15, "-", estiloTd, 1);
                }
                else
                {
                    foreach (CalidadProductoDto calidad in prod.Calidades)
                    {
                        int offsetTipoC = Math.Max(0, calidad.Valores.Count - 1);
                        int rowFinTipoC = rowIni + offsetTipoC;

                        CrearCelda(row, rowIni, rowFinTipoC, 7, 8, calidad.TipoCalidad, estiloTd, 1);

                        foreach (ParametroValorDto valor in calidad.Valores)
                        {
                            IRow rowValor = _sheet.GetRow(rowIni) ?? _sheet.CreateRow(rowIni);
                            CrearCelda(rowValor, rowIni, rowIni, 9, 11, valor.Parametro, estiloTd, 1);
                            CrearCelda(rowValor, rowIni, rowIni, 12, 15, valor.Valor, estiloTd, 1);
                            rowIni++;
                        }
                    }
                }

                rowIni = rowFin + 1;
            }
        }

        private int ObtenerOffsetParametros(IList<CalidadProductoDto> calidades)
        {
            int acum = 0;
            foreach (CalidadProductoDto calidad in calidades)
            {
                acum += calidad.Valores.Count();
            }
            return acum == 0 ? acum : acum - 1;
        }

        private void CrearCelda(IRow row, int firstRow, int lastRow, int firstCol, int lastCol, string valorCelda, ICellStyle estilo, int bordeRegion)
        {
            var regionCelda = new CellRangeAddress(firstRow, lastRow, firstCol, lastCol);
            _sheet.AddMergedRegion(regionCelda);
            RegionUtil.SetBorderTop(bordeRegion, regionCelda, _sheet, _workbook);
            RegionUtil.SetBorderLeft(bordeRegion, regionCelda, _sheet, _workbook);
            RegionUtil.SetBorderRight(bordeRegion, regionCelda, _sheet, _workbook);
            RegionUtil.SetBorderBottom(bordeRegion, regionCelda, _sheet, _workbook);
            ICell celda = row.CreateCell(firstCol);
            celda.CellStyle = estilo;
            celda.SetCellValue(valorCelda);
        }

        private ICellStyle CrearEstilo(string fontName, short fontSize, short fontColor, bool isBold, short backgroundColor, BorderStyle border)
        {
            HSSFCellStyle style = (HSSFCellStyle)_sheet.Workbook.CreateCellStyle();

            style.Alignment = HorizontalAlignment.Center;
            style.VerticalAlignment = VerticalAlignment.Center;

            IFont font = _workbook.CreateFont();
            font.FontName = fontName;
            font.FontHeightInPoints = fontSize;
            font.Color = fontColor;
            if (isBold)
                font.Boldweight = (short)FontBoldWeight.Bold;

            style.SetFont(font);
            style.BorderBottom = border;
            style.BorderLeft = border;
            style.BorderRight = border;
            style.BorderTop = border;
            style.FillForegroundColor = backgroundColor;
            style.FillPattern = FillPattern.SolidForeground;

            return style;
        }
    }
}