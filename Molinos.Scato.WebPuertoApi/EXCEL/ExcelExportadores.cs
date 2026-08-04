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
    public class ExcelExportadores
    {
        private readonly HSSFWorkbook _workbook;
        private readonly HSSFSheet _sheet;
        private readonly IList<ExportadorDto> _exportadores;
        private readonly string _path = System.Web.HttpContext.Current.Server.MapPath("~/iconMolinosChiquito.png");
        private readonly byte[] _dataImg;

        public ExcelExportadores(IList<ExportadorDto> exportadores)
        {
            _workbook = new HSSFWorkbook();
            _sheet = (HSSFSheet)_workbook.CreateSheet("Listado de Exportadores");
            _exportadores = exportadores;
            _dataImg = File.ReadAllBytes(_path);
        }

        public byte[] GenerarExcel()
        {
            #region Logo Molinos

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

            #endregion Logo Molinos

            #region Celda Titulo

            CellRangeAddress celRangeTitulo = new CellRangeAddress(0, 2, 2, 2);
            _sheet.AddMergedRegion(celRangeTitulo);
            ICell celdaTitulo = _sheet.CreateRow(0).CreateCell(2);
            celdaTitulo.SetCellValue("Listado de exportadores");
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

            #endregion Celda Titulo

            #region Fecha de reporte

            CellRangeAddress celRangeFecha = new CellRangeAddress(3, 3, 0, 2);
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

            #endregion Fecha de reporte

            #region Header tabla exportadores

            IRow headerRow = _sheet.CreateRow(4);

            ICell celdaHeaderNombre = headerRow.CreateCell(0);
            celdaHeaderNombre.SetCellValue("Nombre");
            ICellStyle estiloHeader = _workbook.CreateCellStyle();
            estiloHeader.FillForegroundColor = IndexedColors.LightGreen.Index;
            estiloHeader.FillPattern = FillPattern.SolidForeground;
            celdaHeaderNombre.CellStyle = estiloHeader;

            ICell celdaHeaderCuit = headerRow.CreateCell(1);
            celdaHeaderCuit.SetCellValue("CUIT");
            celdaHeaderCuit.CellStyle = estiloHeader;

            ICell celdaHeaderCodigoSap = headerRow.CreateCell(2);
            celdaHeaderCodigoSap.SetCellValue("Código SAP");
            celdaHeaderCodigoSap.CellStyle = estiloHeader;

            #endregion Header tabla exportadores

            #region Rellenar tabla exportadores

            for (int i = 0; i < _exportadores.Count(); i++)
            {
                //Le sumo 5 ya que es la ultima fila hasta ahora, y deberia empezar a listar desde la fila 6.
                InsertarFilaExportador(i + 5, _exportadores.ElementAt(i));
            }

            #endregion Rellenar tabla exportadores

            #region Escribir archivo

            using (var fileData = new MemoryStream())
            {
                _workbook.Write(fileData);
                var res = fileData.ToArray();
                return res;
            }

            #endregion Escribir archivo
        }

        private void InsertarFilaExportador(int fila, ExportadorDto exportador)
        {
            IRow dataRow = _sheet.CreateRow(fila);

            ICell celdaNombre = dataRow.CreateCell(0);
            celdaNombre.SetCellValue(exportador.Nombre);

            ICell celdaCuit = dataRow.CreateCell(1);
            celdaCuit.SetCellValue(exportador.Cuit ?? "");

            ICell celdaCodigoSap = dataRow.CreateCell(2);
            celdaCodigoSap.SetCellValue(exportador.CodigoSap ?? "");
        }
    }
}