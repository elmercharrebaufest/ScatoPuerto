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

        private static byte[] GenerarExcel(List<ModuloDeCargaNirManualPuertoDto> moduloDeCargaNirsManualPuerto, string nombre, byte[] dataImg)
        {
            var workbook = new HSSFWorkbook();
            var sheet = (HSSFSheet)workbook.CreateSheet("NIR");

            ICellStyle estiloBuque = EstiloBuque(workbook);
            ICellStyle estiloHeaderVerde = EstiloHeaderVerde(workbook);
            ICellStyle estiloHeaderGris = EstiloHeaderGris(workbook);
            ICellStyle lineBottom = LineBottom(workbook);
            ICellStyle lineLeft = LineLeft(workbook);
            ICellStyle bordesBody = BordesBody(workbook);
            ICellStyle estiloPromediosManos = EstiloPromediosManos(workbook);




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
            int contMano1 = 0;
            int contMano2 = 0;
            int cantidadDeRows = 0;
            double totalHDMano1 = 0;
            double totalHDMano2 = 0;
            double totalPHMano1 = 0;
            double totalPHMano2 = 0;
            double totalProtBaseMano1 = 0;
            double totalProtBaseMano2 = 0;
            double totalProtBSMano1 = 0;
            double totalProtBSMano2 = 0;
            double promedioPHMano1 = 0;
            double promedioPHMano2 = 0;
            double promedioHDMano1 = 0;
            double promedioHDMano2 = 0;
            double promedioProtBaseMano1 = 0;
            double promedioProtBaseMano2 = 0;
            double promedioProtBSMano1 = 0;
            double promedioProtBSMano2 = 0;

            foreach (var mat in moduloDeCargaNirsManualPuerto)
            {
                var materialPuerto = mat.Material_id;
                if (materialPuerto == 11)
                {
                    tieneMaiz = true;
                    
                }
                else
                {
                    tieneTrigo = true;
                }
                if(mat.Mano == "mano1")
                {
                    contMano1++;
                }
                else
                {
                    contMano2++;
                }
            }
            if (contMano1 >= contMano2) { cantidadDeRows = contMano1; }
            else if(contMano2 <= contMano1) { cantidadDeRows = contMano2; }
            

            
            
            foreach (var mod in moduloDeCargaNirsManualPuerto)
            {
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


                if (mano == "mano1")
                {
                    if (material == 11)
                    {
                        var rowmano1 = sheet.CreateRow(i);

                        var cell1 = rowmano1.CreateCell(1);
                        cell1.SetCellValue(fecha.ToString());
                        CellRangeAddress fechaC = new CellRangeAddress(i, i, 1, 2);
                        sheet.AddMergedRegion(fechaC);
                        cell1.CellStyle = bordesBody;

                        rowmano1.CreateCell(3).SetCellValue(hd);
                        totalHDMano1 += Convert.ToDouble(hd);
                        rowmano1.GetCell(3).CellStyle = bordesBody;

                        rowmano1.CreateCell(4).SetCellValue(ph);
                        totalPHMano1 += Convert.ToDouble(ph);
                        rowmano1.GetCell(4).CellStyle = bordesBody;

                        rowmano1.CreateCell(5).SetCellValue(origen);
                        rowmano1.GetCell(5).CellStyle = bordesBody;

                        rowmano1.CreateCell(6).SetCellValue(bodega);
                        rowmano1.GetCell(6).CellStyle = bordesBody;

                        i++;
                    }
                    else
                    {
                        var rowmano1 = sheet.CreateRow(150);
                        if (tieneTrigo && tieneMaiz)
                        {
                            rowmano1 = sheet.GetRow(i);
                        }
                        else
                        {
                            rowmano1 = sheet.CreateRow(i);
                        }
                        
                        var cell1 = rowmano1.CreateCell(1);
                        cell1.SetCellValue(fecha.ToString());
                        CellRangeAddress fechaC = new CellRangeAddress(i, i, 1, 2);
                        sheet.AddMergedRegion(fechaC);
                        cell1.CellStyle = bordesBody;

                        rowmano1.CreateCell(3).SetCellValue(hd);
                        totalHDMano1 += Convert.ToDouble(hd);
                        rowmano1.GetCell(3).CellStyle = bordesBody;

                        rowmano1.CreateCell(4).SetCellValue(portBase);
                        totalProtBaseMano1 += Convert.ToDouble(portBase);
                        rowmano1.GetCell(4).CellStyle = bordesBody;

                        rowmano1.CreateCell(5).SetCellValue(portBS);
                        totalProtBSMano1 += Convert.ToDouble(portBS);
                        rowmano1.GetCell(5).CellStyle = bordesBody;

                        rowmano1.CreateCell(6).SetCellValue(ph);
                        totalPHMano1 += Convert.ToDouble(ph);
                        rowmano1.GetCell(6).CellStyle = bordesBody;

                        rowmano1.CreateCell(7).SetCellValue(origen);
                        rowmano1.GetCell(7).CellStyle = bordesBody;

                        rowmano1.CreateCell(8).SetCellValue(bodega);
                        rowmano1.GetCell(8).CellStyle = bordesBody;

                        
                        i++;
                    }
                }
                else
                {
                    
                    if (material == 11)
                    {
                        var rowmano2 = sheet.CreateRow(150);
                        if(tieneTrigo && tieneMaiz)
                        {
                            rowmano2 = sheet.CreateRow(j);

                            var cell7 = rowmano2.CreateCell(9);
                            cell7.SetCellValue(fecha.ToString());
                            CellRangeAddress fechaC = new CellRangeAddress(j, j, 9, 10);
                            sheet.AddMergedRegion(fechaC);
                            cell7.CellStyle = bordesBody;

                            rowmano2.CreateCell(11).SetCellValue(hd);
                            totalHDMano2 += Convert.ToDouble(hd);
                            rowmano2.GetCell(11).CellStyle = bordesBody;

                            rowmano2.CreateCell(12).SetCellValue(ph);
                            totalPHMano2 += Convert.ToDouble(ph);
                            rowmano2.GetCell(12).CellStyle = bordesBody;

                            rowmano2.CreateCell(13).SetCellValue(origen);
                            rowmano2.GetCell(13).CellStyle = bordesBody;

                            rowmano2.CreateCell(14).SetCellValue(bodega);
                            rowmano2.GetCell(14).CellStyle = bordesBody;

                            j++;
                        }
                        else
                        {
                            rowmano2 = sheet.GetRow(j);

                            var cell7 = rowmano2.CreateCell(7);
                            cell7.SetCellValue(fecha.ToString());
                            CellRangeAddress fechaC = new CellRangeAddress(j, j, 7, 8);
                            sheet.AddMergedRegion(fechaC);
                            cell7.CellStyle = bordesBody;

                            rowmano2.CreateCell(9).SetCellValue(hd);
                            totalHDMano2 += Convert.ToDouble(hd);
                            rowmano2.GetCell(9).CellStyle = bordesBody;

                            rowmano2.CreateCell(10).SetCellValue(ph);
                            totalPHMano2 += Convert.ToDouble(ph);
                            rowmano2.GetCell(10).CellStyle = bordesBody;

                            rowmano2.CreateCell(11).SetCellValue(origen);
                            rowmano2.GetCell(11).CellStyle = bordesBody;

                            rowmano2.CreateCell(12).SetCellValue(bodega);
                            rowmano2.GetCell(12).CellStyle = bordesBody;

                            j++;

                        }
                        
                    }
                    else
                    {
                        
                        var rowmano2 = sheet.GetRow(j);
                        var cell7 = rowmano2.CreateCell(9);
                        cell7.SetCellValue(fecha.ToString());
                        CellRangeAddress fechaC = new CellRangeAddress(j, j, 9, 10);
                        sheet.AddMergedRegion(fechaC);
                        cell7.CellStyle = bordesBody;

                        rowmano2.CreateCell(11).SetCellValue(hd);
                        totalHDMano2 += Convert.ToDouble(hd);
                        rowmano2.GetCell(11).CellStyle = bordesBody;

                        rowmano2.CreateCell(12).SetCellValue(portBase);
                        totalProtBaseMano2 += Convert.ToDouble(portBase);
                        rowmano2.GetCell(12).CellStyle = bordesBody;

                        rowmano2.CreateCell(13).SetCellValue(portBS);
                        totalProtBSMano2 += Convert.ToDouble(portBS);
                        rowmano2.GetCell(13).CellStyle = bordesBody;

                        rowmano2.CreateCell(14).SetCellValue(ph);
                        totalPHMano2 += Convert.ToDouble(ph);
                        rowmano2.GetCell(14).CellStyle = bordesBody;

                        rowmano2.CreateCell(15).SetCellValue(origen);
                        rowmano2.GetCell(15).CellStyle = bordesBody;

                        rowmano2.CreateCell(16).SetCellValue(bodega);
                        rowmano2.GetCell(16).CellStyle = bordesBody;

                        j++;
                    }
                }
            }
            promedioHDMano1 = totalHDMano1 / contMano1;
            promedioHDMano2 = totalHDMano2 / contMano2;
            promedioPHMano1 = totalPHMano1 / contMano1;
            promedioPHMano2 = totalPHMano2 / contMano2;

            double promedioTotalProtBase = 0;
            double promedioTotalProtBS = 0;
            if (tieneTrigo)
            {
                if (tieneTrigo && tieneMaiz)
                {
                    promedioProtBaseMano1 = totalProtBaseMano1 / contMano1;
                    promedioProtBSMano1 = promedioProtBSMano1 / contMano1;

                }
                else
                {
                    promedioProtBaseMano1 = totalProtBaseMano1 / contMano1;
                    promedioProtBaseMano2 = totalProtBaseMano2 / contMano2;
                    promedioProtBSMano2 = promedioProtBSMano2 / contMano2;
                    promedioProtBSMano1 = promedioProtBSMano1 / contMano1;
                }
                


                promedioTotalProtBase = (promedioProtBaseMano1 + promedioProtBaseMano2) / 2;
                promedioTotalProtBS = (promedioProtBSMano1 + promedioProtBSMano2) / 2;
            }

            

            double promedioTotalHD = (promedioHDMano1 + promedioHDMano2) / 2;
            double promedioTotalPH = (promedioPHMano1 + promedioPHMano2) / 2;
            





            if (tieneMaiz == true && tieneTrigo == false)
            {
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
                var row = sheet.CreateRow(2);
                row.CreateCell(6).CellStyle = lineBottom;
                var rowBuque = sheet.CreateRow(3);

                var celda1 = rowBuque.CreateCell(1);
                celda1.SetCellValue("Buque:");
                celda1.CellStyle = estiloBuque;
                //celda1.CellStyle = estiloHeader;

                var celda2 = rowBuque.CreateCell(2);
                celda2.SetCellValue(nombre);
                CellRangeAddress cellNombreBuque = new CellRangeAddress(3, 3, 2, 3);
                sheet.AddMergedRegion(cellNombreBuque);
                celda2.CellStyle = estiloHeaderVerde;


                var celda4 = rowBuque.CreateCell(4);
                celda4.SetCellValue("MERCADERIA:");
                sheet.AutoSizeColumn(4);
                celda4.CellStyle = estiloBuque;

                

                var celda5 = rowBuque.CreateCell(5);
                CellRangeAddress cellMaterialMaiz = new CellRangeAddress(3, 3, 5, 6);
                sheet.AddMergedRegion(cellMaterialMaiz);
                celda5.SetCellValue("MAÍZ");
                celda5.CellStyle = estiloHeaderVerde;
                rowBuque.CreateCell(7).CellStyle = lineLeft;
                rowBuque.CreateCell(8).CellStyle = lineBottom;
                rowBuque.CreateCell(9).CellStyle = lineBottom;
                rowBuque.CreateCell(10).CellStyle = lineBottom;
                rowBuque.CreateCell(11).CellStyle = lineBottom;
                rowBuque.CreateCell(12).CellStyle = lineBottom;


                var rowManos = sheet.CreateRow(4);

                var celdaMano1 = rowManos.CreateCell(1);
                celdaMano1.SetCellValue("Mano 1");
                //celdaMano1.CellStyle = estiloHeader;
                CellRangeAddress RegionceldaMano1 = new CellRangeAddress(4, 4, 1, 6);
                sheet.AddMergedRegion(RegionceldaMano1);
                celdaMano1.CellStyle = estiloHeaderVerde;

                var celdaMano2 = rowManos.CreateCell(7);
                celdaMano2.SetCellValue("Mano 2");
                //celdaMano2.CellStyle = estiloHeader;
                CellRangeAddress RegionceldaMano2 = new CellRangeAddress(4, 4, 7, 12);
                sheet.AddMergedRegion(RegionceldaMano2);
                celdaMano2.CellStyle = estiloHeaderVerde;
                celdaMano2.CellStyle.BorderRight = BorderStyle.Medium;

                rowManos.CreateCell(13).CellStyle = lineLeft;

                var rowHeaderData = sheet.CreateRow(5);

                rowHeaderData.CreateCell(1).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraMaiz = new CellRangeAddress(5, 5, 1, 2);
                sheet.AddMergedRegion(fechaHoraMaiz);
                rowHeaderData.GetCell(1).CellStyle = estiloHeaderGris;
                

                rowHeaderData.CreateCell(3).SetCellValue("% HD");
                rowHeaderData.GetCell(3).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(4).SetCellValue("PH");
                rowHeaderData.GetCell(4).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(5).SetCellValue("Origen");
                rowHeaderData.GetCell(5).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(6).SetCellValue("Bodega");
                rowHeaderData.GetCell(6).CellStyle = estiloHeaderGris;



                rowHeaderData.CreateCell(7).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraMaiz2 = new CellRangeAddress(5, 5, 7, 8);
                sheet.AddMergedRegion(fechaHoraMaiz2);
                rowHeaderData.GetCell(7).CellStyle = estiloHeaderGris;


                rowHeaderData.CreateCell(9).SetCellValue("% HD");
                rowHeaderData.GetCell(9).CellStyle = estiloHeaderGris;


                rowHeaderData.CreateCell(10).SetCellValue("PH");
                rowHeaderData.GetCell(10).CellStyle = estiloHeaderGris;


                rowHeaderData.CreateCell(11).SetCellValue("Origen");
                rowHeaderData.GetCell(11).CellStyle = estiloHeaderGris;


                rowHeaderData.CreateCell(12).SetCellValue("Bodega");
                rowHeaderData.GetCell(12).CellStyle = estiloHeaderGris;



                var rowPromedios = sheet.CreateRow(cantidadDeRows + 6);
                rowPromedios.CreateCell(1).SetCellValue("Promedio");
                CellRangeAddress promedio = new CellRangeAddress(cantidadDeRows + 6, cantidadDeRows + 6, 1, 2);
                sheet.AddMergedRegion(promedio);
                rowPromedios.GetCell(1).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(3).SetCellValue(promedioHDMano1);
                rowPromedios.GetCell(3).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(4).SetCellValue(promedioPHMano1);
                rowPromedios.GetCell(4).CellStyle = estiloPromediosManos;


                rowPromedios.CreateCell(7).SetCellValue("Promedio");
                CellRangeAddress promedio2 = new CellRangeAddress(cantidadDeRows + 6, cantidadDeRows + 6, 7, 8);
                sheet.AddMergedRegion(promedio2);
                rowPromedios.GetCell(7).CellStyle = estiloPromediosManos;


                rowPromedios.CreateCell(9).SetCellValue(promedioHDMano2);
                rowPromedios.GetCell(9).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(10).SetCellValue(promedioPHMano2);
                rowPromedios.GetCell(10).CellStyle = estiloPromediosManos;


                var rowProm1 = sheet.CreateRow(cantidadDeRows + 9);
                rowProm1.CreateCell(1);
                CellRangeAddress prom1 = new CellRangeAddress(cantidadDeRows + 9, cantidadDeRows + 9, 1, 3);
                sheet.AddMergedRegion(prom1);
                rowProm1.GetCell(1).SetCellValue("Promedio HD TOTAL:");
                rowProm1.CreateCell(4).SetCellValue(promedioTotalHD);

                var rowProm2 = sheet.CreateRow(cantidadDeRows + 10);
                rowProm2.CreateCell(1);
                CellRangeAddress prom2 = new CellRangeAddress(cantidadDeRows + 10, cantidadDeRows + 10, 1, 3);
                sheet.AddMergedRegion(prom2);
                rowProm2.GetCell(1).SetCellValue("Promedio PH TOTAL:");
                rowProm2.CreateCell(4).SetCellValue(promedioTotalPH);
            }
            else if (tieneTrigo && tieneMaiz == false)
            {


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


                var rowBuque = sheet.CreateRow(3);

                var celda1 = rowBuque.CreateCell(1);
                celda1.SetCellValue("Buque:");
                celda1.CellStyle = estiloBuque;
                //celda1.CellStyle = estiloHeader;

                var celda2 = rowBuque.CreateCell(2);
                celda2.SetCellValue(nombre);
                CellRangeAddress cellNombreBuque = new CellRangeAddress(3, 3, 2, 3);
                sheet.AddMergedRegion(cellNombreBuque);
                celda2.CellStyle = estiloHeaderVerde;


                var celda4 = rowBuque.CreateCell(4);
                CellRangeAddress cellMercTrigo = new CellRangeAddress(3, 3, 4, 6);
                sheet.AddMergedRegion(cellMercTrigo);
                celda4.SetCellValue("MERCADERIA:");
                
                celda4.CellStyle = estiloBuque;

                var celda5 = rowBuque.CreateCell(7);
                CellRangeAddress cellMaterialMaiz = new CellRangeAddress(3, 3, 7, 8);
                sheet.AddMergedRegion(cellMaterialMaiz);
                celda5.SetCellValue("TRIGO");
                celda5.CellStyle = estiloHeaderVerde;

                var rowManos = sheet.CreateRow(4);

                var celdaMano1 = rowManos.CreateCell(1);
                celdaMano1.SetCellValue("Mano 1");
                CellRangeAddress RegionceldaMano1 = new CellRangeAddress(4, 4, 1, 8);
                sheet.AddMergedRegion(RegionceldaMano1);
                celdaMano1.CellStyle = estiloHeaderVerde;

                var celdaMano2 = rowManos.CreateCell(9);
                celdaMano2.SetCellValue("Mano 2");
                CellRangeAddress RegionceldaMano2 = new CellRangeAddress(4, 4, 9, 16);
                sheet.AddMergedRegion(RegionceldaMano2);
                celdaMano2.CellStyle = estiloHeaderVerde;

                var rowHeaderData = sheet.CreateRow(5);

                rowHeaderData.CreateCell(1).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraTrigo = new CellRangeAddress(5, 5, 1, 2);
                sheet.AddMergedRegion(fechaHoraTrigo);
                rowHeaderData.GetCell(1).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(3).SetCellValue("% HD");
                rowHeaderData.GetCell(3).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(4).SetCellValue("% Prot. Base");
                rowHeaderData.GetCell(4).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(5).SetCellValue("% Prot B/S");
                rowHeaderData.GetCell(5).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(6).SetCellValue("PH");
                rowHeaderData.GetCell(6).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(7).SetCellValue("Origen");
                rowHeaderData.GetCell(7).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(8).SetCellValue("Bodega");
                rowHeaderData.GetCell(8).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(9).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraTrigo2 = new CellRangeAddress(5, 5, 9, 10);
                sheet.AddMergedRegion(fechaHoraTrigo2);
                rowHeaderData.GetCell(9).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(11).SetCellValue("% HD");
                rowHeaderData.GetCell(11).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(12).SetCellValue("% Prot. Base");
                rowHeaderData.GetCell(12).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(13).SetCellValue("% Prot B/S");
                rowHeaderData.GetCell(13).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(14).SetCellValue("PH");
                rowHeaderData.GetCell(14).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(15).SetCellValue("Origen");
                rowHeaderData.GetCell(15).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(16).SetCellValue("Bodega");
                rowHeaderData.GetCell(16).CellStyle = estiloHeaderGris;


                var rowPromedios = sheet.CreateRow(cantidadDeRows + 6);
                rowPromedios.CreateCell(1).SetCellValue("Promedio");
                CellRangeAddress promedio = new CellRangeAddress(cantidadDeRows + 6, cantidadDeRows + 6, 1, 2);
                sheet.AddMergedRegion(promedio);
                rowPromedios.GetCell(1).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(3).SetCellValue(promedioHDMano1);
                rowPromedios.GetCell(3).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(4).SetCellValue(promedioProtBaseMano1);
                rowPromedios.GetCell(4).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(5).SetCellValue(promedioProtBSMano1);
                rowPromedios.GetCell(5).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(6).SetCellValue(promedioPHMano1);
                rowPromedios.GetCell(6).CellStyle = estiloPromediosManos;


                rowPromedios.CreateCell(9).SetCellValue("Promedio");
                CellRangeAddress promedio2 = new CellRangeAddress(cantidadDeRows + 6, cantidadDeRows + 6, 9, 10);
                sheet.AddMergedRegion(promedio2);
                rowPromedios.GetCell(9).CellStyle = estiloPromediosManos;


                rowPromedios.CreateCell(11).SetCellValue(promedioHDMano2);
                rowPromedios.GetCell(11).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(12).SetCellValue(promedioProtBaseMano2);
                rowPromedios.GetCell(12).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(13).SetCellValue(promedioProtBSMano2);
                rowPromedios.GetCell(13).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(14).SetCellValue(promedioPHMano2);
                rowPromedios.GetCell(14).CellStyle = estiloPromediosManos;

                var rowProm1 = sheet.CreateRow(cantidadDeRows + 9);
                rowProm1.CreateCell(1);
                CellRangeAddress prom1 = new CellRangeAddress(cantidadDeRows + 9, cantidadDeRows + 9, 1, 3);
                sheet.AddMergedRegion(prom1);
                rowProm1.GetCell(1).SetCellValue("Promedio HD TOTAL:");
                rowProm1.CreateCell(4).SetCellValue(promedioTotalHD);

                var rowProm2 = sheet.CreateRow(cantidadDeRows + 10);
                rowProm2.CreateCell(1);
                CellRangeAddress prom2 = new CellRangeAddress(cantidadDeRows + 10, cantidadDeRows + 10, 1, 3);
                sheet.AddMergedRegion(prom2);
                rowProm2.GetCell(1).SetCellValue("Promedio Prot. (13,5%) TOTAL:");
                rowProm2.CreateCell(4).SetCellValue(promedioTotalProtBase);

                var rowProm3 = sheet.CreateRow(cantidadDeRows + 11);
                rowProm3.CreateCell(1);
                CellRangeAddress prom3 = new CellRangeAddress(cantidadDeRows + 11, cantidadDeRows + 11, 1, 3);
                sheet.AddMergedRegion(prom3);
                rowProm3.GetCell(1).SetCellValue("Promedio Prot. B/S TOTAL:");
                rowProm3.CreateCell(4).SetCellValue(promedioTotalProtBS);

                var rowProm4 = sheet.CreateRow(cantidadDeRows + 12);
                rowProm4.CreateCell(1);
                CellRangeAddress prom4 = new CellRangeAddress(cantidadDeRows + 12, cantidadDeRows + 12, 1, 3);
                sheet.AddMergedRegion(prom4);
                rowProm4.GetCell(1).SetCellValue("Promedio PH TOTAL:");
                rowProm4.CreateCell(4).SetCellValue(promedioTotalPH);

            }
            else if(tieneMaiz && tieneTrigo)
            {
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


                var rowBuque = sheet.CreateRow(3);

                var celda1 = rowBuque.CreateCell(1);
                celda1.SetCellValue("Buque:");
                celda1.CellStyle = estiloBuque;
                //celda1.CellStyle = estiloHeader;

                var celda2 = rowBuque.CreateCell(2);
                celda2.SetCellValue(nombre);
                CellRangeAddress cellNombreBuque = new CellRangeAddress(3, 3, 2, 3);
                sheet.AddMergedRegion(cellNombreBuque);
                celda2.CellStyle = estiloHeaderVerde;


                var celda4 = rowBuque.CreateCell(4);
                CellRangeAddress cellMercTrigo = new CellRangeAddress(3, 3, 4, 6);
                sheet.AddMergedRegion(cellMercTrigo);
                celda4.SetCellValue("MERCADERIA:");
                sheet.AutoSizeColumn(4);
                celda4.CellStyle = estiloBuque;

                var celda5 = rowBuque.CreateCell(7);
                CellRangeAddress cellMaterialMaiz = new CellRangeAddress(3, 3, 7, 8);
                sheet.AddMergedRegion(cellMaterialMaiz);
                celda5.SetCellValue("TRIGO/MAÍZ");
                celda5.CellStyle = estiloHeaderVerde;

                var rowManos = sheet.CreateRow(4);

                var celdaMano1 = rowManos.CreateCell(1);
                celdaMano1.SetCellValue("Mano 1(TRIGO)");
                CellRangeAddress RegionceldaMano1 = new CellRangeAddress(4, 4, 1, 8);
                sheet.AddMergedRegion(RegionceldaMano1);
                celdaMano1.CellStyle = estiloHeaderVerde;

                var celdaMano2 = rowManos.CreateCell(9);
                celdaMano2.SetCellValue("Mano 2(MAÍZ)");
                CellRangeAddress RegionceldaMano2 = new CellRangeAddress(4, 4, 9, 14);
                sheet.AddMergedRegion(RegionceldaMano2);
                celdaMano2.CellStyle = estiloHeaderVerde;

                var rowHeaderData = sheet.CreateRow(5);

                rowHeaderData.CreateCell(1).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraMaiz = new CellRangeAddress(5, 5, 1, 2);
                sheet.AddMergedRegion(fechaHoraMaiz);
                rowHeaderData.GetCell(1).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(3).SetCellValue("% HD");
                rowHeaderData.GetCell(3).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(4).SetCellValue("% Prot. Base");
                rowHeaderData.GetCell(4).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(5).SetCellValue("% Prot B/S");
                rowHeaderData.GetCell(5).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(6).SetCellValue("PH");
                rowHeaderData.GetCell(6).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(7).SetCellValue("Origen");
                rowHeaderData.GetCell(7).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(8).SetCellValue("Bodega");
                rowHeaderData.GetCell(8).CellStyle = estiloHeaderGris;


                rowHeaderData.CreateCell(9).SetCellValue("Fecha - Hora");
                CellRangeAddress fechaHoraMaiz2 = new CellRangeAddress(5, 5, 9, 10);
                sheet.AddMergedRegion(fechaHoraMaiz2);
                rowHeaderData.GetCell(9).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(11).SetCellValue("% HD");
                rowHeaderData.GetCell(11).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(12).SetCellValue("PH");
                rowHeaderData.GetCell(12).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(13).SetCellValue("Origen");
                rowHeaderData.GetCell(13).CellStyle = estiloHeaderGris;

                rowHeaderData.CreateCell(14).SetCellValue("Bodega");
                rowHeaderData.GetCell(14).CellStyle = estiloHeaderGris;



                var rowPromedios = sheet.CreateRow(cantidadDeRows + 6);
                rowPromedios.CreateCell(1).SetCellValue("Promedio");
                CellRangeAddress promedio = new CellRangeAddress(cantidadDeRows + 6, cantidadDeRows + 6, 1, 2);
                sheet.AddMergedRegion(promedio);
                rowPromedios.GetCell(1).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(3).SetCellValue(promedioHDMano1);
                rowPromedios.GetCell(3).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(4).SetCellValue(promedioProtBaseMano1);
                rowPromedios.GetCell(4).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(5).SetCellValue(promedioProtBSMano1);
                rowPromedios.GetCell(5).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(6).SetCellValue(promedioPHMano1);
                rowPromedios.GetCell(6).CellStyle = estiloPromediosManos;


                rowPromedios.CreateCell(9).SetCellValue("Promedio");
                CellRangeAddress promedio2 = new CellRangeAddress(cantidadDeRows + 6, cantidadDeRows + 6, 9, 10);
                sheet.AddMergedRegion(promedio2);
                rowPromedios.GetCell(9).CellStyle = estiloPromediosManos;


                rowPromedios.CreateCell(11).SetCellValue(promedioHDMano2);
                rowPromedios.GetCell(11).CellStyle = estiloPromediosManos;

                rowPromedios.CreateCell(12).SetCellValue(promedioPHMano2);
                rowPromedios.GetCell(12).CellStyle = estiloPromediosManos;

                var rowProm1 = sheet.CreateRow(cantidadDeRows + 9);
                rowProm1.CreateCell(1);
                CellRangeAddress prom1 = new CellRangeAddress(cantidadDeRows + 9, cantidadDeRows + 9, 1, 3);
                sheet.AddMergedRegion(prom1);
                rowProm1.GetCell(1).SetCellValue("Promedio HD TOTAL:");
                rowProm1.CreateCell(4).SetCellValue(promedioTotalHD);

                var rowProm2 = sheet.CreateRow(cantidadDeRows + 10);
                rowProm2.CreateCell(1);
                CellRangeAddress prom2 = new CellRangeAddress(cantidadDeRows + 10, cantidadDeRows + 10, 1, 3);
                sheet.AddMergedRegion(prom2);
                rowProm2.GetCell(1).SetCellValue("Promedio Prot. (13,5%) TOTAL:");
                rowProm2.CreateCell(4).SetCellValue(promedioProtBaseMano1);

                var rowProm3 = sheet.CreateRow(cantidadDeRows + 11);
                rowProm3.CreateCell(1);
                CellRangeAddress prom3 = new CellRangeAddress(cantidadDeRows + 11, cantidadDeRows + 11, 1, 3);
                sheet.AddMergedRegion(prom3);
                rowProm3.GetCell(1).SetCellValue("Promedio Prot. B/S TOTAL:");
                rowProm3.CreateCell(4).SetCellValue(promedioProtBSMano1);

                var rowProm4 = sheet.CreateRow(cantidadDeRows + 12);
                rowProm4.CreateCell(1);
                CellRangeAddress prom4 = new CellRangeAddress(cantidadDeRows + 12, cantidadDeRows + 12, 1, 3);
                sheet.AddMergedRegion(prom4);
                rowProm4.GetCell(1).SetCellValue("Promedio PH TOTAL:");
                rowProm4.CreateCell(4).SetCellValue(promedioTotalPH);
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
