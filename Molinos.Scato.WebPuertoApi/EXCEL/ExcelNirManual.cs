using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using System;
using System.Collections.Generic;
using System.Globalization;
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
            bool hayMaiz = false;
            bool hayTrigo = false;

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
            RegionUtil.SetBorderBottom(2, celImg, sheet, workbook);

            sheet.AddMergedRegion(celImg);


            var offset_y = 3;
            var rowName = sheet.CreateRow(offset_y);
            rowName.CreateCell(1).SetCellValue("Nombre:");
            rowName.GetCell(1).CellStyle = EstiloHeaderVerde(workbook);

            ICell celdaNombre = rowName.CreateCell(2);
            celdaNombre.SetCellValue(nombreBuque);
            CellRangeAddress cellNombreBuque = new CellRangeAddress(offset_y, offset_y, 2, 3);
            RegionUtil.SetBorderBottom(2, cellNombreBuque, sheet, workbook);
            RegionUtil.SetBorderTop(2, cellNombreBuque, sheet, workbook);
            RegionUtil.SetBorderRight(2, cellNombreBuque, sheet, workbook);
            RegionUtil.SetBorderLeft(2, cellNombreBuque, sheet, workbook);
            sheet.AddMergedRegion(cellNombreBuque);
            celdaNombre.CellStyle = BordesBodyOrange(workbook);

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
                    hayMaiz = true;
                    renderNir(ref sheet, lineasMaizMano1, ref workbook, ref offset_y, 1, "Maíz");
                }

                if (lineasTrigoMano1.Count > 0)
                {
                    hayTrigo = true;
                    renderNir(ref sheet, lineasTrigoMano1, ref workbook, ref offset_y, 1, "Trigo");
                }

            }

            offset_y += 1;

            if (hayMano2)
            {
                lineasMaizMano2 = moduloDeCargaNirsManualPuerto.Where(x => x.Material_id == 11 && x.Mano == "mano2").ToList();
                lineasTrigoMano2 = moduloDeCargaNirsManualPuerto.Where(x => x.Material_id == 17 && x.Mano == "mano2").ToList();

                if (lineasMaizMano2.Count > 0)
                {
                    hayMaiz = true;
                    renderNir(ref sheet, lineasMaizMano2, ref workbook, ref offset_y, 2, "Maíz");
                }

                if (lineasTrigoMano2.Count > 0)
                {
                    hayTrigo = true;
                    renderNir(ref sheet, lineasTrigoMano2, ref workbook, ref offset_y, 2, "Trigo");
                }
            }

            offset_y += 1;

            if (hayMano1 && hayMano2 && (moduloDeCargaNirsManualPuerto.Where(x => x.Material_id == 11).ToList().Count == moduloDeCargaNirsManualPuerto.Count || moduloDeCargaNirsManualPuerto.Where(x => x.Material_id == 17).ToList().Count == moduloDeCargaNirsManualPuerto.Count))
            {

                var rowPromediosTotales = sheet.CreateRow(offset_y);
                rowPromediosTotales.CreateCell(1).SetCellValue("Promedio Total");
                rowPromediosTotales.GetCell(1).CellStyle.Alignment = HorizontalAlignment.Center;
                double promedioTotalHD = Math.Round(moduloDeCargaNirsManualPuerto.Where(x => x.HD != "").Sum(x => Convert.ToDouble(x.HD.Replace(',', '.'))) / moduloDeCargaNirsManualPuerto.Where(x => x.HD != "").ToList().Count, 2);
                rowPromediosTotales.CreateCell(3).SetCellValue(promedioTotalHD);
                double promedioTotalPH = Math.Round(moduloDeCargaNirsManualPuerto.Where(x => x.PH != "").Sum(x => Convert.ToDouble(x.PH.Replace(',', '.'))) / moduloDeCargaNirsManualPuerto.Where(x => x.PH != "").ToList().Count, 2);
                rowPromediosTotales.CreateCell(4).SetCellValue(promedioTotalPH);
                if (hayTrigo)
                {
                    double promedioTotalProtBase = Math.Round(moduloDeCargaNirsManualPuerto.Where(x => x.ProtBase != "").Sum(x => Convert.ToDouble(x.ProtBase)) / moduloDeCargaNirsManualPuerto.Where(x => x.ProtBase != "").ToList().Count, 2);
                    rowPromediosTotales.CreateCell(5).SetCellValue(promedioTotalProtBase);
                    double promedioTotalProb_BS = Math.Round(moduloDeCargaNirsManualPuerto.Where(x => x.Prot_BS != "").Sum(x => Convert.ToDouble(x.Prot_BS)) / moduloDeCargaNirsManualPuerto.Where(x => x.Prot_BS != "").ToList().Count, 2);
                    rowPromediosTotales.CreateCell(6).SetCellValue(promedioTotalProb_BS);
                }
                CellRangeAddress promediosRange = new CellRangeAddress(offset_y, offset_y, 1, 2);
                sheet.AddMergedRegion(promediosRange);
            }

            for (int i = 1; i < 10; i++)
            {
                sheet.AutoSizeColumn(i);
            }

            var anchoFecha = 11 * 256;
            sheet.SetColumnWidth(1, anchoFecha); // B
            sheet.SetColumnWidth(2, anchoFecha); // C

            //var path = @"C:\Users\mleiva\Desktop\Scato\Prueba Excel\test.xls";
            //using (var fs = new FileStream(path, FileMode.Create, FileAccess.Write))
            //{
            //    workbook.Write(fs);
            //}

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
            rowManoData.GetCell(1).CellStyle.Alignment = HorizontalAlignment.Left;
            CellRangeAddress manoRange = new CellRangeAddress(offset_y, offset_y, 1, material == "Trigo" ? 8 : 6);
            rowManoData.GetCell(1).CellStyle = EstiloHeaderVerde(wb, mano);
            RegionUtil.SetBorderBottom(2, manoRange, sheet, wb);
            RegionUtil.SetBorderTop(2, manoRange, sheet, wb);
            RegionUtil.SetBorderRight(2, manoRange, sheet, wb);
            RegionUtil.SetBorderLeft(2, manoRange, sheet, wb);
            sheet.AddMergedRegion(manoRange);
            offset_y += 1;

            var rowHeaderData = sheet.CreateRow(offset_y);

            var offset_x = 1;
            rowHeaderData.CreateCell(1).SetCellValue("Fecha y hora");
            CellRangeAddress fechaHoraHeader = new CellRangeAddress(offset_y, offset_y, 1, 2);
            RegionUtil.SetBorderBottom(2, manoRange, sheet, wb);
            sheet.AddMergedRegion(fechaHoraHeader);
            rowHeaderData.GetCell(1).CellStyle = EstiloHeaderGris(wb);
            rowHeaderData.CreateCell(2).SetCellValue("");
            rowHeaderData.GetCell(2).CellStyle = EstiloHeaderGris(wb);

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
                rowData.GetCell(1).CellStyle = BordesBody(wb);
                CellRangeAddress fechaHoraData = new CellRangeAddress(offset_y, offset_y, offset_x, offset_x + 1);
                sheet.AddMergedRegion(fechaHoraData);

                rowData.CreateCell(2).SetCellValue("");
                rowData.GetCell(2).CellStyle = BordesBody(wb);
                offset_x = 3;


                if (double.TryParse(item.HD, NumberStyles.Any, CultureInfo.InvariantCulture, out double hdValue))
                {
                    rowData.CreateCell(offset_x).SetCellValue(hdValue);
                }
                else
                {
                    rowData.CreateCell(offset_x).SetCellValue(item.HD);
                }
                rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                offset_x += 1;

                if (double.TryParse(item.PH, NumberStyles.Any, CultureInfo.InvariantCulture, out double phValue))
                {
                    rowData.CreateCell(offset_x).SetCellValue(phValue);
                }
                else
                {
                    rowData.CreateCell(offset_x).SetCellValue(item.PH);
                }
                rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                offset_x += 1;

                if (nir[0].Material_id == 17)
                {
                    if (double.TryParse(item.ProtBase, NumberStyles.Any, CultureInfo.InvariantCulture, out double protBaseValue))
                    {
                        rowData.CreateCell(offset_x).SetCellValue(protBaseValue);
                    }
                    else
                    {
                        rowData.CreateCell(offset_x).SetCellValue(item.ProtBase);
                    }
                    rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                    offset_x += 1;

                    if (double.TryParse(item.Prot_BS, NumberStyles.Any, CultureInfo.InvariantCulture, out double protBSValue))
                    {
                        rowData.CreateCell(offset_x).SetCellValue(protBSValue);
                    }
                    else
                    {
                        rowData.CreateCell(offset_x).SetCellValue(item.Prot_BS);
                    }
                    rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                    offset_x += 1;
                }

                rowData.CreateCell(offset_x).SetCellValue(item.Origen);
                rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                offset_x += 1;

                if (item.Bodega != null)
                {
                    rowData.CreateCell(offset_x).SetCellValue(item.Bodega.Nombre);
                }
                else
                {
                    rowData.CreateCell(offset_x).SetCellValue("");
                }
                rowData.GetCell(offset_x).CellStyle = BordesBody(wb);
                offset_x += 1;
                offset_y += 1;
            }

            offset_x = 1;

            var rowPromedios = sheet.CreateRow(offset_y);
            rowPromedios.CreateCell(1).SetCellValue("Promedio");
            rowPromedios.GetCell(1).CellStyle = BordesBody(wb);
            CellRangeAddress promediosRange = new CellRangeAddress(offset_y, offset_y, offset_x, offset_x + 1);
            sheet.AddMergedRegion(promediosRange);
            rowPromedios.GetCell(1).CellStyle = BordesBody(wb);
            rowPromedios.CreateCell(2);
            rowPromedios.GetCell(2).CellStyle = BordesBody(wb);
            double promedioHD = Math.Round(
                    nir.Where(x => !string.IsNullOrEmpty(x.HD))
                       .Sum(x => double.Parse(x.HD, System.Globalization.CultureInfo.InvariantCulture))
                    / nir.Count(x => !string.IsNullOrEmpty(x.HD)),
                    2
                );
            rowPromedios.CreateCell(3).SetCellValue(promedioHD);
            rowPromedios.GetCell(3).CellStyle = BordesBody(wb);
            double promedioPH = Math.Round(
                    nir.Where(x => !string.IsNullOrEmpty(x.PH))
                       .Sum(x => double.Parse(x.PH, System.Globalization.CultureInfo.InvariantCulture))
                    / nir.Count(x => !string.IsNullOrEmpty(x.PH)),
                    2
                );
            rowPromedios.CreateCell(4).SetCellValue(promedioPH);
            rowPromedios.GetCell(4).CellStyle = BordesBody(wb);

            if (material == "Trigo")
            {
                double promedioProtBase = Math.Round(
                    nir.Where(x => !string.IsNullOrEmpty(x.ProtBase))
                       .Sum(x => double.Parse(x.ProtBase, System.Globalization.CultureInfo.InvariantCulture))
                    / nir.Count(x => !string.IsNullOrEmpty(x.ProtBase)),
                    2
                ); 
                rowPromedios.CreateCell(5).SetCellValue(promedioProtBase);
                rowPromedios.GetCell(5).CellStyle = BordesBody(wb);

                double promedioProt_BS = Math.Round(
                    nir.Where(x => !string.IsNullOrEmpty(x.Prot_BS))
                       .Sum(x => double.Parse(x.Prot_BS, System.Globalization.CultureInfo.InvariantCulture))
                    / nir.Count(x => !string.IsNullOrEmpty(x.Prot_BS)),
                    2
                );
                rowPromedios.CreateCell(6).SetCellValue(promedioProt_BS);
                rowPromedios.GetCell(6).CellStyle = BordesBody(wb);
            }
            offset_y += 1;
        }

        private static ICellStyle EstiloHeaderVerde(HSSFWorkbook workbook, int mano = 1)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Medium;

            if (mano == 1)
                cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.Lime.Index;
            else
                cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.LightOrange.Index;

            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            return cellBorderStyleColumnTitles;
        }
        private static ICellStyle EstiloHeaderGris(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Medium;
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.Grey25Percent.Index;
            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            return cellBorderStyleColumnTitles;
        }
        private static ICellStyle BordesBodyOrange(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.LightOrange.Index;
            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            return cellBorderStyleColumnTitles;
        }

        private static ICellStyle BordesBody(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Thin;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            return cellBorderStyleColumnTitles;
        }
    }
}
