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
        private readonly IRepositorio repositorio;
        public void GenerarArchivo(ResultadoPrevisualizar resultado, List<ModuloDeCargaNirManualPuertoDto> moduloDeCargaNirsManualPuerto, int idModuloDeCarga)
        {
            //LineUp lineUp = repositorio.Obtener<LineUp>(x => x.ModuloDeCarga.Id == idModuloDeCarga);
            //var nombreBuque = lineUp.Embarque.Patente; 
            var workbook = GenerarExcel(moduloDeCargaNirsManualPuerto);
            resultado.Archivo = workbook;
        }

        private static byte[] GenerarExcel(List<ModuloDeCargaNirManualPuertoDto> moduloDeCargaNirsManualPuerto)
        {
            var workbook = new HSSFWorkbook();
            var sheet = (HSSFSheet)workbook.CreateSheet("NIR");



            ICellStyle colorNaranja = ColorNaranja(workbook);
            ICellStyle colorVerde = ColorVerde(workbook);
            ICellStyle estiloColumnas = EstiloColumnas(workbook);

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
            var i = 6;
            var j = 6;
            bool tieneMaiz = false;
            bool tieneTrigo = false;

            foreach (var mod in moduloDeCargaNirsManualPuerto)
            {
                foreach(var mat in moduloDeCargaNirsManualPuerto)
                {
                    var materialPuerto = mat.Material_id;
                    if(materialPuerto == 11)
                    {
                        tieneMaiz = true;
                    }
                    else
                    {
                        tieneTrigo = true;
                    }
                }
                var bodega = mod.Bodega.Nombre;
                var fecha = mod.Fecha;
                var hd = mod.HD;
                var mano = mod.Mano;
                var origen = mod.Origen;
                var ph = mod.PH;
                var portBase = mod.ProtBase;
                var portBS = mod.Prot_BS;
                var ritmo = mod.Ritmo;
                var material = mod.Material_id;

                if (tieneMaiz == true && tieneTrigo == false)
                {
                    

                    if (mano == "mano1" || mano == "1")
                    {
                        var row = sheet.CreateRow(i);
                        var cell1 = row.CreateCell(1);
                        cell1.SetCellValue(fecha.ToString());
                        CellRangeAddress fechaC = new CellRangeAddress(i, i, 1, 2);
                        sheet.AddMergedRegion(fechaC);

                        row.CreateCell(3).SetCellValue(hd);
                        row.CreateCell(4).SetCellValue(ph);
                        row.CreateCell(5).SetCellValue(origen);
                        row.CreateCell(6).SetCellValue(bodega);
                        i++;
                    }

                    if (mano == "mano2" || mano == "2")
                    {
                        var row = sheet.CreateRow(j);
                        var cell1 = row.CreateCell(7);
                        cell1.SetCellValue(fecha.ToString());
                        CellRangeAddress fechaC = new CellRangeAddress(j, j, 7, 8);
                        sheet.AddMergedRegion(fechaC);

                        row.CreateCell(9).SetCellValue(hd);
                        row.CreateCell(10).SetCellValue(ph);
                        row.CreateCell(11).SetCellValue(origen);
                        row.CreateCell(12).SetCellValue(bodega);
                        j++;

                    }

                } else if (tieneTrigo == true && tieneMaiz == false)
                {
                    if (mano == "mano1" || mano == "1")
                    {
                        var row = sheet.CreateRow(i);
                        var cell1 = row.CreateCell(1);
                        cell1.SetCellValue(fecha.ToString());
                        CellRangeAddress fechaC = new CellRangeAddress(i, i, 1, 2);
                        sheet.AddMergedRegion(fechaC);

                        row.CreateCell(3).SetCellValue(hd);
                        row.CreateCell(4).SetCellValue(portBase);
                        row.CreateCell(5).SetCellValue(portBS);
                        row.CreateCell(6).SetCellValue(ph);
                        row.CreateCell(7).SetCellValue(origen);
                        row.CreateCell(8).SetCellValue(bodega);
                        i++;
                    }

                    if (mano == "mano2" || mano == "2")
                    {
                        var row = sheet.CreateRow(j);
                        var cell1 = row.CreateCell(9);
                        cell1.SetCellValue(fecha.ToString());
                        CellRangeAddress fechaC = new CellRangeAddress(j, j, 9, 10);
                        sheet.AddMergedRegion(fechaC);

                        row.CreateCell(11).SetCellValue(hd);
                        row.CreateCell(12).SetCellValue(portBase);
                        row.CreateCell(13).SetCellValue(portBS);
                        row.CreateCell(14).SetCellValue(ph);
                        row.CreateCell(15).SetCellValue(origen);
                        row.CreateCell(16).SetCellValue(bodega);
                        j++;
                    }

                }else if (tieneTrigo == true && tieneMaiz == true)
                {
                    if (mano == "mano1" || mano == "1")
                    {
                        var row = sheet.CreateRow(i);
                        var cell1 = row.CreateCell(1);
                        cell1.SetCellValue(fecha.ToString());
                        CellRangeAddress fechaC = new CellRangeAddress(i, i, 1, 2);
                        sheet.AddMergedRegion(fechaC);

                        row.CreateCell(3).SetCellValue(hd);
                        row.CreateCell(4).SetCellValue(portBase);
                        row.CreateCell(5).SetCellValue(portBS);
                        row.CreateCell(6).SetCellValue(ph);
                        row.CreateCell(7).SetCellValue(origen);
                        row.CreateCell(8).SetCellValue(bodega);
                        i++;
                    }
                    if (mano == "mano2" || mano == "2")
                    {
                        var row = sheet.CreateRow(j);
                        var cell1 = row.CreateCell(9);
                        cell1.SetCellValue(fecha.ToString());
                        CellRangeAddress fechaC = new CellRangeAddress(j, j, 9, 10);
                        sheet.AddMergedRegion(fechaC);

                        row.CreateCell(11).SetCellValue(hd);
                        row.CreateCell(12).SetCellValue(ph);
                        row.CreateCell(13).SetCellValue(origen);
                        row.CreateCell(14).SetCellValue(bodega);
                        j++;
                    }
                }
            }
            

            if (tieneMaiz == true && tieneTrigo == false)
            {
                sheet.CreateRow(0).CreateCell(1).SetCellValue("IMAGEN");
                CellRangeAddress celImg = new CellRangeAddress(0, 2, 1, 2);
                sheet.AddMergedRegion(celImg);

                var rowBuque = sheet.CreateRow(3);

                var celda1 = rowBuque.CreateCell(1);
                celda1.SetCellValue("Buque:");
                celda1.CellStyle = colorNaranja;
                //celda1.CellStyle = estiloHeader;

                var celda2 = rowBuque.CreateCell(2);
                celda2.SetCellValue("Nombre Buque");
                CellRangeAddress cellNombreBuque = new CellRangeAddress(3, 3, 2, 3);
                sheet.AddMergedRegion(cellNombreBuque);
                celda2.CellStyle = colorVerde;


                var celda4 = rowBuque.CreateCell(4);
                celda4.SetCellValue("MERCADERIA:");
                sheet.AutoSizeColumn(4);
                //celda4.CellStyle = estiloHeader;

                var celda5 = rowBuque.CreateCell(5);
                CellRangeAddress cellMaterialMaiz = new CellRangeAddress(3, 3, 5, 6);
                sheet.AddMergedRegion(cellMaterialMaiz);
                celda5.SetCellValue("MAÍZ");

                var rowManos = sheet.CreateRow(4);

                var celdaMano1 = rowManos.CreateCell(1);
                celdaMano1.SetCellValue("Mano 1");
                //celdaMano1.CellStyle = estiloHeader;
                CellRangeAddress RegionceldaMano1 = new CellRangeAddress(4, 4, 1, 6);
                sheet.AddMergedRegion(RegionceldaMano1);

                var celdaMano2 = rowManos.CreateCell(7);
                celdaMano2.SetCellValue("Mano 2");
                //celdaMano2.CellStyle = estiloHeader;
                CellRangeAddress RegionceldaMano2 = new CellRangeAddress(4, 4, 7, 12);
                sheet.AddMergedRegion(RegionceldaMano2);

                var rowHeaderData = sheet.CreateRow(5);

                rowHeaderData.CreateCell(1).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraMaiz = new CellRangeAddress(5, 5, 1, 2);
                sheet.AddMergedRegion(fechaHoraMaiz);

                rowHeaderData.CreateCell(3).SetCellValue("% HD");

                rowHeaderData.CreateCell(4).SetCellValue("PH");

                rowHeaderData.CreateCell(5).SetCellValue("Origen");

                rowHeaderData.CreateCell(6).SetCellValue("Bodega");



                rowHeaderData.CreateCell(7).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraMaiz2 = new CellRangeAddress(5, 5, 7, 8);
                sheet.AddMergedRegion(fechaHoraMaiz2);

                rowHeaderData.CreateCell(9).SetCellValue("% HD");

                rowHeaderData.CreateCell(10).SetCellValue("PH");

                rowHeaderData.CreateCell(11).SetCellValue("Origen");

                rowHeaderData.CreateCell(12).SetCellValue("Bodega");
            }else if (tieneTrigo && tieneMaiz == false)
            {
                sheet.CreateRow(0).CreateCell(1).SetCellValue("IMAGEN");
                CellRangeAddress celImg = new CellRangeAddress(0, 2, 1, 2);
                sheet.AddMergedRegion(celImg);


                var rowBuque = sheet.CreateRow(3);

                var celda1 = rowBuque.CreateCell(1);
                celda1.SetCellValue("Buque:");
                celda1.CellStyle = colorNaranja;
                //celda1.CellStyle = estiloHeader;

                var celda2 = rowBuque.CreateCell(2);
                celda2.SetCellValue("Nombre Buque");
                CellRangeAddress cellNombreBuque = new CellRangeAddress(3, 3, 2, 3);
                sheet.AddMergedRegion(cellNombreBuque);
                celda2.CellStyle = colorVerde;


                var celda4 = rowBuque.CreateCell(4);
                CellRangeAddress cellMercTrigo = new CellRangeAddress(3, 3, 4, 6);
                sheet.AddMergedRegion(cellMercTrigo);
                celda4.SetCellValue("MERCADERIA:");
                sheet.AutoSizeColumn(4);
                //celda4.CellStyle = estiloHeader;

                var celda5 = rowBuque.CreateCell(7);
                CellRangeAddress cellMaterialMaiz = new CellRangeAddress(3, 3, 7, 8);
                sheet.AddMergedRegion(cellMaterialMaiz);
                celda5.SetCellValue("TRIGO");

                var rowManos = sheet.CreateRow(4);

                var celdaMano1 = rowManos.CreateCell(1);
                celdaMano1.SetCellValue("Mano 1");
                //celdaMano1.CellStyle = estiloHeader;
                CellRangeAddress RegionceldaMano1 = new CellRangeAddress(4, 4, 1, 8);
                sheet.AddMergedRegion(RegionceldaMano1);

                var celdaMano2 = rowManos.CreateCell(9);
                celdaMano2.SetCellValue("Mano 2");
                //celdaMano2.CellStyle = estiloHeader;
                CellRangeAddress RegionceldaMano2 = new CellRangeAddress(4, 4, 9, 16);
                sheet.AddMergedRegion(RegionceldaMano2);

                var rowHeaderData = sheet.CreateRow(5);

                rowHeaderData.CreateCell(1).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraTrigo = new CellRangeAddress(5, 5, 1, 2);
                sheet.AddMergedRegion(fechaHoraTrigo);

                rowHeaderData.CreateCell(3).SetCellValue("% HD");

                rowHeaderData.CreateCell(4).SetCellValue("% Prot.");

                rowHeaderData.CreateCell(5).SetCellValue("% Prot B/S");

                rowHeaderData.CreateCell(6).SetCellValue("PH");

                rowHeaderData.CreateCell(7).SetCellValue("Origen");

                rowHeaderData.CreateCell(8).SetCellValue("Bodega");

                rowHeaderData.CreateCell(9).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraTrigo2 = new CellRangeAddress(5, 5, 9, 10);
                sheet.AddMergedRegion(fechaHoraTrigo2);

                rowHeaderData.CreateCell(11).SetCellValue("% HD");

                rowHeaderData.CreateCell(12).SetCellValue("% Prot.");

                rowHeaderData.CreateCell(13).SetCellValue("% Prot B/S");

                rowHeaderData.CreateCell(14).SetCellValue("PH");

                rowHeaderData.CreateCell(15).SetCellValue("Origen");

                rowHeaderData.CreateCell(16).SetCellValue("Bodega");
            }
            else if(tieneMaiz && tieneTrigo)
            {
                sheet.CreateRow(0).CreateCell(1).SetCellValue("IMAGEN");
                CellRangeAddress celImg = new CellRangeAddress(0, 2, 1, 2);
                sheet.AddMergedRegion(celImg);


                var rowBuque = sheet.CreateRow(3);

                var celda1 = rowBuque.CreateCell(1);
                celda1.SetCellValue("Buque:");
                celda1.CellStyle = estiloColumnas;
                //celda1.CellStyle = estiloHeader;

                var celda2 = rowBuque.CreateCell(2);
                celda2.SetCellValue("Nombre Buque");
                CellRangeAddress cellNombreBuque = new CellRangeAddress(3, 3, 2, 3);
                sheet.AddMergedRegion(cellNombreBuque);
                celda2.CellStyle = colorVerde;


                var celda4 = rowBuque.CreateCell(4);
                CellRangeAddress cellMercTrigo = new CellRangeAddress(3, 3, 4, 6);
                sheet.AddMergedRegion(cellMercTrigo);
                celda4.SetCellValue("MERCADERIA:");
                sheet.AutoSizeColumn(4);
                //celda4.CellStyle = estiloHeader;

                var celda5 = rowBuque.CreateCell(7);
                CellRangeAddress cellMaterialMaiz = new CellRangeAddress(3, 3, 7, 8);
                sheet.AddMergedRegion(cellMaterialMaiz);
                celda5.SetCellValue("TRIGO/MAÍZ");

                var rowManos = sheet.CreateRow(4);

                var celdaMano1 = rowManos.CreateCell(1);
                celdaMano1.SetCellValue("Mano 1(TRIGO)");
                //celdaMano1.CellStyle = estiloHeader;
                CellRangeAddress RegionceldaMano1 = new CellRangeAddress(4, 4, 1, 8);
                sheet.AddMergedRegion(RegionceldaMano1);

                var celdaMano2 = rowManos.CreateCell(9);
                celdaMano2.SetCellValue("Mano 2(MAÍZ)");
                //celdaMano2.CellStyle = estiloHeader;
                CellRangeAddress RegionceldaMano2 = new CellRangeAddress(4, 4, 9, 14);
                sheet.AddMergedRegion(RegionceldaMano2);

                var rowHeaderData = sheet.CreateRow(5);

                rowHeaderData.CreateCell(1).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraMaiz = new CellRangeAddress(5, 5, 1, 2);
                sheet.AddMergedRegion(fechaHoraMaiz);

                rowHeaderData.CreateCell(3).SetCellValue("% HD");

                rowHeaderData.CreateCell(4).SetCellValue("% Prot.");

                rowHeaderData.CreateCell(5).SetCellValue("% Prot B/S");

                rowHeaderData.CreateCell(6).SetCellValue("PH");

                rowHeaderData.CreateCell(7).SetCellValue("Origen");

                rowHeaderData.CreateCell(8).SetCellValue("Bodega");



                rowHeaderData.CreateCell(9).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraMaiz2 = new CellRangeAddress(5, 5, 9, 10);
                sheet.AddMergedRegion(fechaHoraMaiz2);

                rowHeaderData.CreateCell(11).SetCellValue("% HD");

                rowHeaderData.CreateCell(12).SetCellValue("PH");

                rowHeaderData.CreateCell(13).SetCellValue("Origen");

                rowHeaderData.CreateCell(14).SetCellValue("Bodega");
                rowHeaderData.GetCell(14).CellStyle = colorNaranja;
            }
            
            //var celda9 = row.CreateCell(8);
            //celda9.SetCellValue("Ritmo");
            //celda9.CellStyle = estiloHeader;

            //row = sheet.CreateRow(1);
            //var cellNumber = 1;

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
            cellBorderStyleColumnTitles.VerticalAlignment = VerticalAlignment.Center;
            cellBorderStyleColumnTitles.WrapText = true;
            return cellBorderStyleColumnTitles;
        }
        private static ICellStyle ColorNaranja(HSSFWorkbook workbook)
        {
            var color = workbook.CreateCellStyle();
            color.FillForegroundColor = IndexedColors.Orange.Index;
            return color;
        }

        private static ICellStyle ColorVerde(HSSFWorkbook workbook)
        {
            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.OliveGreen.Index;
            return cellBorderStyleColumnTitles;
        }
        private static ICellStyle EstiloColumnas(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 11;
            fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            
            
            
            
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Medium;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            cellBorderStyleColumnTitles.VerticalAlignment = VerticalAlignment.Center;
            cellBorderStyleColumnTitles.VerticalAlignment = VerticalAlignment.Center;
            return cellBorderStyleColumnTitles;
        }

    }

    

}
