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
    public class ExcelClientes
    {
        private readonly HSSFWorkbook _workbook;
        private readonly HSSFSheet _sheet;
        private readonly IList<CoordinadorPuertoDto> _clientes;
        private readonly string _path = System.Web.HttpContext.Current.Server.MapPath("~/iconMolinosChiquito.png");
        private readonly byte[] _dataImg;

        public ExcelClientes(IList<CoordinadorPuertoDto> clientes)
        {
            _workbook = new HSSFWorkbook();
            _sheet = (HSSFSheet)_workbook.CreateSheet("Listado de clientes");
            _clientes = clientes;
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

            CellRangeAddress celRangeTitulo = new CellRangeAddress(0, 2, 2, 4);
            _sheet.AddMergedRegion(celRangeTitulo);
            ICell celdaTitulo = _sheet.CreateRow(0).CreateCell(2);
            celdaTitulo.SetCellValue("Listado de clientes");
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

            #endregion Fecha de reporte

            #region Header tabla clientes

            IRow filaHeader = _sheet.CreateRow(4);

            CellRangeAddress celRangeHeader = new CellRangeAddress(4, 4, 0, 2);
            _sheet.AddMergedRegion(celRangeHeader);
            ICell celdaHeader = filaHeader.CreateCell(0);
            celdaHeader.SetCellValue("Nombre");
            ICellStyle estiloHeader = _workbook.CreateCellStyle();
            estiloHeader.FillForegroundColor = IndexedColors.LightGreen.Index;
            estiloHeader.FillPattern = FillPattern.SolidForeground;
            celdaHeader.CellStyle = estiloHeader;
            RegionUtil.SetBorderBottom(2, celRangeHeader, _sheet, _workbook);
            RegionUtil.SetBorderLeft(2, celRangeHeader, _sheet, _workbook);
            RegionUtil.SetBorderRight(2, celRangeHeader, _sheet, _workbook);

            // ===== Columna 2: Codigo Sap =====
            CellRangeAddress celRangeHeader2 = new CellRangeAddress(4, 4, 3, 5); // <-- CAMBIA COLUMNAS
            _sheet.AddMergedRegion(celRangeHeader2);
            ICell celdaHeader2 = filaHeader.CreateCell(3);
            celdaHeader2.SetCellValue("Codigo Sap");
            ICellStyle estiloHeader2 = _workbook.CreateCellStyle();
            estiloHeader2.FillForegroundColor = IndexedColors.LightGreen.Index;
            estiloHeader2.FillPattern = FillPattern.SolidForeground;
            celdaHeader2.CellStyle = estiloHeader2;
            RegionUtil.SetBorderBottom(2, celRangeHeader2, _sheet, _workbook);
            RegionUtil.SetBorderLeft(2, celRangeHeader2, _sheet, _workbook);
            RegionUtil.SetBorderRight(2, celRangeHeader2, _sheet, _workbook);

            #endregion Header tabla clientes

            #region Rellenar tabla clientes

            for (int i = 0; i < _clientes.Count(); i++)
            {
                //Le sumo 5 ya que es la ultima fila hasta ahora, y deberia empezar a listar desde la fila 6.
                InsertarFilaCliente(i + 5, _clientes.ElementAt(i));
            }

            #endregion Rellenar tabla clientes

            #region Escribir archivo

            using (var fileData = new MemoryStream())
            {
                _workbook.Write(fileData);
                var res = fileData.ToArray();
                return res;
            }

            #endregion Escribir archivo
        }

        /*private void InsertarFilaCliente(int fila, CoordinadorPuertoDto cliente)
        {
            CellRangeAddress celRangeData = new CellRangeAddress(fila, fila, 0, 2);
            _sheet.AddMergedRegion(celRangeData);
            ICell celdaData = _sheet.CreateRow(fila).CreateCell(0);
            celdaData.SetCellValue(cliente.Nombre);
            RegionUtil.SetBorderBottom(2, celRangeData, _sheet, _workbook);
            RegionUtil.SetBorderLeft(2, celRangeData, _sheet, _workbook);
            RegionUtil.SetBorderRight(2, celRangeData, _sheet, _workbook);
          
        }*/

        private void InsertarFilaCliente(int filaIndex, CoordinadorPuertoDto cliente)
        {
            IRow fila = _sheet.CreateRow(filaIndex);

            // ===== Nombre =====
            CellRangeAddress rangoNombre = new CellRangeAddress(filaIndex, filaIndex, 0, 2);
            _sheet.AddMergedRegion(rangoNombre);

            ICell celdaNombre = fila.CreateCell(0);
            celdaNombre.SetCellValue(cliente.Nombre);

            RegionUtil.SetBorderBottom(2, rangoNombre, _sheet, _workbook);
            RegionUtil.SetBorderLeft(2, rangoNombre, _sheet, _workbook);
            RegionUtil.SetBorderRight(2, rangoNombre, _sheet, _workbook);

            // ===== Codigo SAP =====
            CellRangeAddress rangoCodigo = new CellRangeAddress(filaIndex, filaIndex, 3, 5);
            _sheet.AddMergedRegion(rangoCodigo);

            ICell celdaCodigo = fila.CreateCell(3);
           
            celdaCodigo.SetCellValue(cliente.CodigoSap);
        
            RegionUtil.SetBorderBottom(2, rangoCodigo, _sheet, _workbook);
            RegionUtil.SetBorderLeft(2, rangoCodigo, _sheet, _workbook);
            RegionUtil.SetBorderRight(2, rangoCodigo, _sheet, _workbook);
        }
    }
}