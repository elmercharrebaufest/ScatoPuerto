using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    public class ExcelNirManual
    {
        public void GenerarArchivo(ResultadoPrevisualizar resultado, List<ModuloDeCargaNirManualPuertoDto> moduloDeCargaNirsManualPuerto, int idModuloDeCarga, string nombreBuque, byte[] data)
        {
            byte[] dataImg = data;
            var nombre = nombreBuque;
            var workbook = GenerarExcel(moduloDeCargaNirsManualPuerto, nombre, dataImg);
            resultado.Archivo = workbook;
        }

        private static byte[] GenerarExcel(List<ModuloDeCargaNirManualPuertoDto> moduloDeCargaNirsManualPuerto, string nombreBuque, byte[] dataImg)
        {
            var workbook = new HSSFWorkbook();
            var sheet = (HSSFSheet)workbook.CreateSheet("NIR");

            var styleBold = workbook.CreateCellStyle();
            var fontBold = workbook.CreateFont();
            fontBold.Boldweight = (short)FontBoldWeight.Bold;
            styleBold.SetFont(fontBold);

            string[] headerMaiz = new string[] { "Fecha y hora", "% HD", "PH", "% Prot (13,5%)", "% Prot B/S", "Origen", "Bodega" };
            //header
            var cellBorderStyle = workbook.CreateCellStyle();
            cellBorderStyle.BorderBottom = BorderStyle.Thin;
            cellBorderStyle.BorderLeft = BorderStyle.Thin;
            cellBorderStyle.BorderTop = BorderStyle.Thin;
            cellBorderStyle.BorderRight = BorderStyle.Thin;
            bool hayMano1 = false;
            bool hayMano2 = false;

            foreach (var mat in moduloDeCargaNirsManualPuerto)
            {
                var materialPuerto = mat.Material_id;

                if (mat.Mano == "mano1")
                {
                    hayMano1 = true;
                }
                else
                {
                    hayMano2 = true;
                }
            }

            int pictureIndex = workbook.AddPicture(dataImg, PictureType.PNG);
            ICreationHelper helper = workbook.GetCreationHelper();
            IDrawing drawing = sheet.CreateDrawingPatriarch();
            IClientAnchor anchor = helper.CreateClientAnchor();

            anchor.Col1 = 1;//0 index based column
            anchor.Row1 = 0;//0 index based row
            IPicture picture = drawing.CreatePicture(anchor, pictureIndex);
            picture.Resize();

            sheet.CreateRow(0).CreateCell(1).SetCellValue("");
            CellRangeAddress celImg = new CellRangeAddress(0, 2, 1, 2);
            sheet.AddMergedRegion(celImg);

            var rowName = sheet.CreateRow(1);
            var celdaNombre = rowName.CreateCell(2);

            var offset_y = 3;
            celdaNombre.SetCellValue(nombreBuque);
            CellRangeAddress cellNombreBuque = new CellRangeAddress(offset_y, offset_y, 2, 3);
            sheet.AddMergedRegion(cellNombreBuque);



            var rowNombre = sheet.CreateRow(offset_y);
            rowNombre.CreateCell(1).SetCellValue("Nombre:");
            rowNombre.CreateCell(2).SetCellValue(nombreBuque);
            CellRangeAddress nombreRange = new CellRangeAddress(offset_y, offset_y, 1, 2);
            sheet.AddMergedRegion(nombreRange);






            offset_y = 4;

            List<ModuloDeCargaNirManualPuertoDto> lineasMaizMano1 = new List<ModuloDeCargaNirManualPuertoDto>();
            List<ModuloDeCargaNirManualPuertoDto> lineasMaizMano2 = new List<ModuloDeCargaNirManualPuertoDto>();
            List<ModuloDeCargaNirManualPuertoDto> lineasTrigoMano1 = new List<ModuloDeCargaNirManualPuertoDto>();
            List<ModuloDeCargaNirManualPuertoDto> lineasTrigoMano2 = new List<ModuloDeCargaNirManualPuertoDto>();

            if (hayMano1)
            {
                lineasMaizMano1 = moduloDeCargaNirsManualPuerto.Where(x => x.Material_id == 11 && x.Mano == "mano1").ToList();
                lineasTrigoMano1 = moduloDeCargaNirsManualPuerto.Where(x => x.Material_id == 17 && x.Mano == "mano1").ToList();

                if (lineasMaizMano1.Count > 0)
                {
                    renderNir(ref sheet, lineasMaizMano1, ref workbook, ref offset_y, 1, "Maíz");
                }

                if (lineasTrigoMano1.Count > 0)
                {
                    renderNir(ref sheet, lineasTrigoMano1, ref workbook, ref offset_y, 1, "Trigo");
                }

            }

            if (hayMano2)
            {
                lineasMaizMano2 = moduloDeCargaNirsManualPuerto.Where(x => x.Material_id == 11 && x.Mano == "mano2").ToList();
                lineasTrigoMano2 = moduloDeCargaNirsManualPuerto.Where(x => x.Material_id == 17 && x.Mano == "mano2").ToList();

                if (lineasMaizMano2.Count > 0)
                {
                    renderNir(ref sheet, lineasMaizMano2, ref workbook, ref offset_y, 2, "Maíz");
                }

                if (lineasTrigoMano2.Count > 0)
                {
                    renderNir(ref sheet, lineasTrigoMano2, ref workbook, ref offset_y, 2, "Trigo");
                }
            }
            
            if(hayMano1 && hayMano2 && (moduloDeCargaNirsManualPuerto.Where(x => x.Material_id == 11).ToList().Count == moduloDeCargaNirsManualPuerto.Count || moduloDeCargaNirsManualPuerto.Where(x => x.Material_id == 17).ToList().Count == moduloDeCargaNirsManualPuerto.Count)){
                string promedioTotalHD = (moduloDeCargaNirsManualPuerto.Where(x => x.HD != "").Sum(x => Convert.ToDouble(x.HD)) / moduloDeCargaNirsManualPuerto.Where(x => x.HD != "").ToList().Count).ToString().PadRight(2, ',');
                string promedioTotalPH = (moduloDeCargaNirsManualPuerto.Where(x => x.PH != "").Sum(x => Convert.ToDouble(x.PH)) / moduloDeCargaNirsManualPuerto.Where(x => x.PH != "").ToList().Count).ToString().PadRight(2, ',');
                string promedioTotalProtBase = (moduloDeCargaNirsManualPuerto.Where(x => x.ProtBase != "").Sum(x => Convert.ToDouble(x.ProtBase)) / moduloDeCargaNirsManualPuerto.Where(x => x.ProtBase != "").ToList().Count).ToString().PadRight(2, ',');
                string promedioTotalProb_BS = (moduloDeCargaNirsManualPuerto.Where(x => x.Prot_BS != "").Sum(x => Convert.ToDouble(x.Prot_BS)) / moduloDeCargaNirsManualPuerto.Where(x => x.Prot_BS != "").ToList().Count).ToString().PadRight(2, ',');

                var rowPromediosTotales = sheet.CreateRow(offset_y);
                rowPromediosTotales.CreateCell(1).SetCellValue("Promedio Total");
                rowPromediosTotales.CreateCell(3).SetCellValue(promedioTotalHD);
                rowPromediosTotales.CreateCell(4).SetCellValue(promedioTotalPH);
                rowPromediosTotales.CreateCell(5).SetCellValue(promedioTotalProtBase);
                rowPromediosTotales.CreateCell(6).SetCellValue(promedioTotalProb_BS);
                CellRangeAddress promediosRange = new CellRangeAddress(offset_y, offset_y, 1, 2);
                sheet.AddMergedRegion(promediosRange);
            }

            using (var fileData = new MemoryStream())
            {
                workbook.Write(fileData);
                return fileData.ToArray();
            }
        }

        private static void renderNir(ref HSSFSheet sheet, List<ModuloDeCargaNirManualPuertoDto> nir, ref HSSFWorkbook wb, ref int offset_y, int mano, string material)
        {

            #region Headers

            var rowManoData = sheet.CreateRow(offset_y);
            rowManoData.CreateCell(1).SetCellValue("Mano " + mano + ": " + material);
            CellRangeAddress manoRange = new CellRangeAddress(offset_y, offset_y, 1, material == "Trigo" ? 8:6);
            sheet.AddMergedRegion(manoRange);
            rowManoData.GetCell(1).CellStyle = EstiloHeaderVerde(wb);
            offset_y += 1;

            var rowHeaderData = sheet.CreateRow(offset_y);

            var offset_x = 1;
            rowHeaderData.CreateCell(1).SetCellValue("Fecha y hora");
            CellRangeAddress fechaHoraHeader = new CellRangeAddress(offset_y, offset_y, 1, 2);
            sheet.AddMergedRegion(fechaHoraHeader);
            rowHeaderData.GetCell(1).CellStyle = EstiloHeaderGris(wb);

            offset_x = 3;

            rowHeaderData.CreateCell(offset_x).SetCellValue("% HD");
            rowHeaderData.GetCell(offset_x).CellStyle = EstiloHeaderGris(wb);
            offset_x += 1;

            rowHeaderData.CreateCell(offset_x).SetCellValue("PH");
            rowHeaderData.GetCell(offset_x).CellStyle = EstiloHeaderGris(wb);
            offset_x += 1;

            if (nir[0].Material_id == 17)
            {
                rowHeaderData.CreateCell(offset_x).SetCellValue("% Prot (13,5%)");
                rowHeaderData.GetCell(offset_x).CellStyle = EstiloHeaderGris(wb);
                offset_x += 1;

                rowHeaderData.CreateCell(offset_x).SetCellValue("% Prot B/S");
                rowHeaderData.GetCell(offset_x).CellStyle = EstiloHeaderGris(wb);
                offset_x += 1;
            }

            rowHeaderData.CreateCell(offset_x).SetCellValue("Origen");
            rowHeaderData.GetCell(offset_x).CellStyle = EstiloHeaderGris(wb);
            offset_x += 1;

            rowHeaderData.CreateCell(offset_x).SetCellValue("Bodega");
            rowHeaderData.GetCell(offset_x).CellStyle = EstiloHeaderGris(wb);
            offset_x += 1;
            #endregion

            offset_y += 1;

            foreach (var item in nir)
            {
                offset_x = 1;

                var rowData = sheet.CreateRow(offset_y);
                rowData.CreateCell(1).SetCellValue(item.Fecha.ToString());
                CellRangeAddress fechaHoraData = new CellRangeAddress(offset_y, offset_y, offset_x, offset_x + 1);
                sheet.AddMergedRegion(fechaHoraData);
                rowData.GetCell(1).CellStyle = BordesBody(wb);
                offset_x = 3;

                rowData.CreateCell(offset_x).SetCellValue(item.HD);
                rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                offset_x += 1;

                rowData.CreateCell(offset_x).SetCellValue(item.PH);
                rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                offset_x += 1;

                if (nir[0].Material_id == 17)
                {
                    rowData.CreateCell(offset_x).SetCellValue(item.ProtBase);
                    rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                    offset_x += 1;

                    rowData.CreateCell(offset_x).SetCellValue(item.Prot_BS);
                    rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                    offset_x += 1;
                }

                rowData.CreateCell(offset_x).SetCellValue(item.Origen);
                rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                offset_x += 1;

                rowData.CreateCell(offset_x).SetCellValue(item.Bodega.Nombre);
                rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                offset_x += 1;
                offset_y += 1;
            }

            string promedioHD = (nir.Where(x => x.HD != "").Sum(x => Convert.ToDouble(x.HD)) / nir.Where(x => x.HD != "").ToList().Count).ToString().PadRight(2, ',');
            string promedioPH = (nir.Where(x => x.PH != "").Sum(x => Convert.ToDouble(x.PH)) / nir.Where(x => x.PH != "").ToList().Count).ToString().PadRight(2, ',');
            string promedioProtBase = (nir.Where(x => x.ProtBase != "").Sum(x => Convert.ToDouble(x.ProtBase)) / nir.Where(x => x.ProtBase != "").ToList().Count).ToString().PadRight(2, ',');
            string promedioProt_BS = (nir.Where(x => x.Prot_BS != "").Sum(x => Convert.ToDouble(x.Prot_BS)) / nir.Where(x => x.Prot_BS != "").ToList().Count).ToString().PadRight(2, ',');

            offset_x = 1;

            var rowPromedios = sheet.CreateRow(offset_y);
            rowPromedios.CreateCell(1).SetCellValue("Promedio");
            rowPromedios.CreateCell(3).SetCellValue(promedioHD);
            rowPromedios.CreateCell(4).SetCellValue(promedioPH);
            rowPromedios.CreateCell(5).SetCellValue(promedioProtBase);
            rowPromedios.CreateCell(6).SetCellValue(promedioProt_BS);
            CellRangeAddress promediosRange = new CellRangeAddress(offset_y, offset_y, offset_x, offset_x + 1);
            sheet.AddMergedRegion(promediosRange);

            offset_y += 1;
        }

        private static ICellStyle EstiloBuque(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            //fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Medium;
            //cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.LightOrange.Index;
            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            return cellBorderStyleColumnTitles;
        }
        private static ICellStyle EstiloHeaderVerde(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            //fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Medium;
            //cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.Lime.Index;
            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            return cellBorderStyleColumnTitles;
        }
        private static ICellStyle EstiloHeaderGris(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            //fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Medium;
            //cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.Grey25Percent.Index;
            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            return cellBorderStyleColumnTitles;
        }
        private static ICellStyle LineBottom(HSSFWorkbook workbook)
        {
            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Medium;
            return cellBorderStyleColumnTitles;
        }
        private static ICellStyle LineLeft(HSSFWorkbook workbook)
        {
            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Medium;
            return cellBorderStyleColumnTitles;
        }

        private static ICellStyle BordesBody(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            //fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Thin;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            return cellBorderStyleColumnTitles;
        }

        private static ICellStyle EstiloPromediosManos(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            //fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Medium;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            return cellBorderStyleColumnTitles;
        }


    }



}
