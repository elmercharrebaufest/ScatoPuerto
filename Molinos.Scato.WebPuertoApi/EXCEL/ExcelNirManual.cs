using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    public class ExcelNirManual
    {
        public void GenerarArchivo(ResultadoPrevisualizar resultado, List<ModuloDeCargaNirManualPuertoDto> moduloDeCargaNirsManualPuerto, int idModuloDeCarga)
        {
            var workbook = GenerarExcel(moduloDeCargaNirsManualPuerto);
            resultado.Archivo = workbook;
        }

        private static byte[] GenerarExcel(List<ModuloDeCargaNirManualPuertoDto> moduloDeCargaNirsManualPuerto)
        {
            var workbook = new HSSFWorkbook();
            var sheet = (HSSFSheet)workbook.CreateSheet("NIR");


            ICellStyle estiloHeader = EstiloHeader(workbook);
            var styleBold = workbook.CreateCellStyle();
            var fontBold = workbook.CreateFont();

            fontBold.Boldweight = (short)FontBoldWeight.Bold;
            styleBold.SetFont(fontBold);

            //header
            var cellBorderStyle = workbook.CreateCellStyle();
            cellBorderStyle.BorderBottom = BorderStyle.Thin;
            cellBorderStyle.BorderLeft = BorderStyle.Thin;
            cellBorderStyle.BorderTop = BorderStyle.Thin;
            cellBorderStyle.BorderRight = BorderStyle.Thin;
            var i = 2;
            foreach (var mod in moduloDeCargaNirsManualPuerto)
            {
                var Bodega_id = mod.Bodega.Id;
                var fecha = mod.Fecha;
                var hd = mod.HD;
                var hora = mod.Hora;
                var mano = mod.Mano;
                var origen = mod.Origen;
                var ph = mod.PH;
                var portBase = mod.ProtBase;
                var portBS = mod.Prot_BS;
                var ritmo = mod.Ritmo;
                
                var row2 = sheet.CreateRow(i);

                var cel = row2.CreateCell(0);
                cel.SetCellValue(mano);

                var cel2 = row2.CreateCell(1);
                cel2.SetCellValue(fecha.ToString());

                var cel3 = row2.CreateCell(2);
                cel3.SetCellValue(hd);

                var cel4 = row2.CreateCell(3);
                cel4.SetCellValue(hora);

                var cel5 = row2.CreateCell(4);
                cel5.SetCellValue((double)Bodega_id);

                var cel6 = row2.CreateCell(5);
                cel6.SetCellValue(origen);

                var cel7 = row2.CreateCell(6);
                cel7.SetCellValue(ph);

                var cel8 = row2.CreateCell(7);
                cel8.SetCellValue(portBase);

                var cel9 = row2.CreateCell(8);
                cel9.SetCellValue(portBS);

                var cel10 = row2.CreateCell(9);
                cel10.SetCellValue(ritmo);
                
                i++;
            }


            var row = sheet.CreateRow(0);
            var celda1 = row.CreateCell(0);
            celda1.SetCellValue("Mano");
            celda1.CellStyle = estiloHeader;

            var celda2 = row.CreateCell(1);
            celda2.SetCellValue("Fecha");
            celda2.CellStyle = estiloHeader;

            var celda3 = row.CreateCell(2);
            celda3.SetCellValue("HD");
            celda3.CellStyle = estiloHeader;

            var celda4 = row.CreateCell(3);
            celda4.SetCellValue("Hora");
            celda4.CellStyle = estiloHeader;

            var celda5 = row.CreateCell(4);
            celda5.SetCellValue("Bodega");
            celda5.CellStyle = estiloHeader;

            var celda6 = row.CreateCell(5);
            celda6.SetCellValue("Origen");
            celda6.CellStyle = estiloHeader;

            var celda7 = row.CreateCell(6);
            celda7.SetCellValue("PH");
            celda7.CellStyle = estiloHeader;

            var celda8 = row.CreateCell(7);
            celda8.SetCellValue("PortBase");
            celda8.CellStyle = estiloHeader;

            var celda9 = row.CreateCell(8);
            celda9.SetCellValue("Port BS");
            celda9.CellStyle = estiloHeader;

            var celda10 = row.CreateCell(9);
            celda10.SetCellValue("Ritmo");
            celda10.CellStyle = estiloHeader;

            row = sheet.CreateRow(1);
            var cellNumber = 1;

            using (var fileData = new MemoryStream())
            {
                workbook.Write(fileData);
                return fileData.ToArray();

            }
        }
        private static ICellStyle EstiloHeader(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 11;
            fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Medium;
            cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.LightGreen.Index;
            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            cellBorderStyleColumnTitles.WrapText = true;
            return cellBorderStyleColumnTitles;
        }
    }

    

}
