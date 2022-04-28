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
    public class ExcelLiquido
    {
        public void GenerarArchivo(ResultadoPrevisualizar resultado, List<ModuloDeCargaPlanillaDeTurnosDto> turnos, int IdModuloDeCarga)
        {
            var workbook = GenerarExcel(turnos, IdModuloDeCarga);
            resultado.Archivo = workbook;
        }

        private static byte[] GenerarExcel(List<ModuloDeCargaPlanillaDeTurnosDto> turnos, int IdModuloDeCarga)
        {
            var workbook = new HSSFWorkbook();
            var sheet = (HSSFSheet)workbook.CreateSheet("Planilla de Turnos");
            //var stylebold = workbook.CreateCellStyle();   
            //stylebold.SetFont(fontBold);

            ICellStyle estiloHeaderTabla = EstiloHeaderTabla(workbook);
            ICellStyle estiloNombreBuque = EstiloNombreBuque(workbook);
            ICellStyle estiloDate = EstiloDate(workbook);
            ICellStyle estiloContenido = EstiloContenido(workbook);
            ICellStyle estiloContenidoBold = EstiloContenidoBold(workbook);
            ICellStyle estiloCabeceraCorte = EstiloCabeceraCorte(workbook);
            ICellStyle estiloRegion = EstiloRegion(workbook);
            ICellStyle estiloRegionTurnos = EstiloRegionTurnos(workbook);
            //Valores

            var i = 0;

            foreach (var turno in turnos)
            {
                i = CreateSeparatorRow(sheet, workbook, i);
                i = InsertTableHeaderTurnos(sheet, estiloHeaderTabla, i);
                i = InsertRowsTurnos(sheet, i, turno, turno, estiloContenido, estiloContenidoBold, estiloRegion, estiloRegionTurnos, estiloHeaderTabla, estiloCabeceraCorte);                
            }

            //Resize columns
            for (int j = 0; j < 11; j++)
            {
                sheet.AutoSizeColumn(j);
            }
            sheet.SetColumnWidth(4, (int)Math.Floor(40m * 256));

            using (var fileData = new MemoryStream())
            {
                workbook.Write(fileData);
                return fileData.ToArray();
            }
        }

        private static int CreateSeparatorRow(HSSFSheet sheet, HSSFWorkbook workbook,int i)
        {
            IRow row = sheet.CreateRow(i);
            for (int j = 0; j <= 11; j++)
            {
                ICellStyle SeparatorCellStyle = EstiloRegionSeparator(workbook);
                var cell = row.CreateCell(j);
                cell.CellStyle = SeparatorCellStyle;
            }
            i++;
            return i;
        }

        private static ICellStyle EstiloRegion(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            /*cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Medium;*/
            cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.LightOrange.Index;
            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            cellBorderStyleColumnTitles.WrapText = true;
            return cellBorderStyleColumnTitles;
        }
        private static ICellStyle EstiloRegionSeparator(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.LemonChiffon.Index;
            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            cellBorderStyleColumnTitles.WrapText = true;
            return cellBorderStyleColumnTitles;
        }
        private static ICellStyle EstiloRegionTurnos(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.Yellow.Index;
            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            cellBorderStyleColumnTitles.WrapText = true;
            return cellBorderStyleColumnTitles;
        }

        private static ICellStyle EstiloCabeceraCorte(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 13;
            fontBold.Boldweight = (short)FontBoldWeight.Bold;
            

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
          
            cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.LightOrange.Index;            
            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            cellBorderStyleColumnTitles.WrapText = true;
            return cellBorderStyleColumnTitles;
        }
        

        private static ICellStyle EstiloHeaderTabla(HSSFWorkbook workbook)
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

        private static ICellStyle EstiloNombreBuque(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 18;
            fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            return cellBorderStyleColumnTitles;
        }

        private static ICellStyle EstiloDate(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 12;
            fontBold.Boldweight = (short)FontBoldWeight.Bold;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Medium;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Medium;
            cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.FillForegroundColor = IndexedColors.Grey25Percent.Index;
            cellBorderStyleColumnTitles.FillPattern = FillPattern.SolidForeground;
            cellBorderStyleColumnTitles.Alignment = HorizontalAlignment.Center;
            return cellBorderStyleColumnTitles;
        }


        private static ICellStyle EstiloContenidoBold(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 9;
            fontBold.Boldweight = (short)FontBoldWeight.Bold;
            
            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Thin;
            cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.WrapText = true;

            return cellBorderStyleColumnTitles;
        }

        private static ICellStyle EstiloContenido(HSSFWorkbook workbook)
        {
            var fontBold = workbook.CreateFont();
            fontBold.FontHeightInPoints = 9;

            var cellBorderStyleColumnTitles = workbook.CreateCellStyle();
            cellBorderStyleColumnTitles.BorderBottom = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderTop = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderLeft = BorderStyle.Thin;
            cellBorderStyleColumnTitles.BorderRight = BorderStyle.Thin;
            cellBorderStyleColumnTitles.SetFont(fontBold);
            cellBorderStyleColumnTitles.WrapText = true;

            return cellBorderStyleColumnTitles;
        }

        private static int InsertRowsTurnos(HSSFSheet sheet, int i, ModuloDeCargaPlanillaDeTurnosDto registroTurno,  ModuloDeCargaPlanillaDeTurnosDto turnosPlanilla, ICellStyle font, ICellStyle fontBold, ICellStyle estiloRegion, ICellStyle estiloRegionTurnos, ICellStyle estiloHeaderTabla, ICellStyle estiloCabeceraCorte)
        {
            //if(registroTurno.ObservacionesDeCalidadDto == null)
            //{
            //    ObservacionesDeCalidadDto obs = new ObservacionesDeCalidadDto();
            //    registroTurno.ObservacionesDeCalidadDto = obs;
            //}
            
            bool crearfecha = true;
            bool crearTurno = true;

            string turno;
            DateTime? fecha;
            IRow row;
            ICell celda;
             
                foreach (var turnoDetalle in registroTurno.ModuloDeCargaPlanillaDeTurnosDetalles)
                {
                    turno = registroTurno.TurnoPuerto.Nombre;
                    fecha = turnosPlanilla.Fecha;
                    
                    row = sheet.CreateRow(i);
                    celda = row.CreateCell(0);
                    
                    if (crearfecha)
                    {
                        celda.SetCellValue(fecha.ToString());
                        crearfecha = false;
                        
                    }
                    celda.CellStyle = estiloRegionTurnos;
                    celda = row.CreateCell(1);
                    
                    
                    if (crearTurno)
                    {
                        celda.SetCellValue(registroTurno.TurnoPuerto.Nombre);
                        crearTurno = false;
                        
                    }
                    celda.CellStyle = estiloRegion;
                    celda = row.CreateCell(2);
                    celda.SetCellValue(turnoDetalle.Exportador.Nombre);
                    celda.CellStyle = font;
                    celda = row.CreateCell(3);
                    celda.SetCellValue(turnoDetalle.Linea_Id);
                    celda.CellStyle = font;
                    celda = row.CreateCell(4);
                    celda.SetCellValue(turnoDetalle.BodegaParcel);
                    celda.CellStyle = font;
                    celda = row.CreateCell(5);
                    celda.SetCellValue(turnoDetalle.MaterialPuerto.Descripcion);
                    celda.CellStyle = font;
                    celda = row.CreateCell(6);
                    celda.SetCellValue(turnoDetalle.Tk);
                    celda.CellStyle = font;
                    celda = row.CreateCell(7);
                    celda.SetCellValue(turnoDetalle.Temperatura);
                    celda.CellStyle = font;
                    celda = row.CreateCell(8);
                    celda.SetCellValue(turnoDetalle.MedidaInicialCM);
                    celda.CellStyle = font;
                    celda = row.CreateCell(9);
                    celda.SetCellValue(turnoDetalle.MedidaFinalCM);
                    celda.CellStyle =  font;
                    celda = row.CreateCell(10);
                    celda.SetCellValue(turnoDetalle.Destino.Nombre);
                    celda.CellStyle = font;
                    celda = row.CreateCell(11);
                    celda.SetCellValue(turnoDetalle.Cantidad.ToString());
                    celda.CellStyle = font;
                    i++;
                }

                i = InsertTableHeaderCortes(sheet, estiloHeaderTabla,estiloRegionTurnos, estiloCabeceraCorte, estiloRegion, i);
                foreach (var registroCortes in registroTurno.ModuloDeCargaPlanillaDeTurnosCortes)
                {
                    turno = registroTurno.TurnoPuerto.Nombre;
                    fecha = turnosPlanilla.Fecha;

                    row = sheet.CreateRow(i);

                    celda = row.CreateCell(0);
                    celda.CellStyle = estiloRegionTurnos;
                    celda = row.CreateCell(1);
                    celda.CellStyle = estiloRegion;
                    celda = row.CreateCell(2);
                    celda.SetCellValue(registroCortes.MotivosDeCorte.Nombre);                    
                    celda.CellStyle = font;                    
                    celda = row.CreateCell(3);
                    celda.SetCellValue(registroCortes.HoraInicio);
                    celda.CellStyle = font;
                    celda = row.CreateCell(4);
                    celda.SetCellValue(registroCortes.HoraFin);
                    celda.CellStyle = font;
                    celda = row.CreateCell(5);
                    celda.SetCellValue(registroCortes.TiempoTotal);
                    celda.CellStyle = font;
                    celda = row.CreateCell(6);
                    celda.SetCellValue(registroCortes.Observaciones);
                    celda.CellStyle = font;
                    i++;
                }

            turno = registroTurno.TurnoPuerto.Nombre;
            fecha = turnosPlanilla.Fecha;
            //if (registroTurno.ObservacionesDeCalidadDto != null)
            //{
            //    i = InsertTableHeaderObservacionesDeCalidad(sheet, estiloHeaderTabla, estiloRegionTurnos, estiloCabeceraCorte, estiloRegion, i);



            //    row = sheet.CreateRow(i);

            //    celda = row.CreateCell(0);
            //    celda.CellStyle = estiloRegionTurnos;
            //    celda = row.CreateCell(1);
            //    celda.CellStyle = estiloRegion;

            //    celda = row.CreateCell(2);
            //    celda.SetCellValue(registroTurno.ObservacionesDeCalidadDto.Fecha);
            //    celda.CellStyle = font;

            //    celda = row.CreateCell(3);
            //    celda.SetCellValue(registroTurno.ObservacionesDeCalidadDto.Hora);
            //    celda.CellStyle = font;

            //    celda = row.CreateCell(4);
            //    celda.SetCellValue(registroTurno.ObservacionesDeCalidadDto.Observaciones);
            //    celda.CellStyle = font;

            //    celda = row.CreateCell(5);
            //    celda.SetCellValue("");
            //    celda.CellStyle = font;

            //    celda = row.CreateCell(6);
            //    celda.SetCellValue("");
            //    celda.CellStyle = font;
            //    i++;
             
            //}
            return i;
        }
         
        private static int InsertTableHeaderTurnos(HSSFSheet sheet, ICellStyle cellBorderStyleColumnTitles, int i)
        {
            var row = sheet.CreateRow(i);
            var celda =  row.CreateCell(0);
            
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Dia");
            celda = row.CreateCell(1);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Turno");
            celda = row.CreateCell(2);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Exportador");
            celda = row.CreateCell(3);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Linea");
            celda = row.CreateCell(4);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Partida");
            celda = row.CreateCell(5);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Producto");
            celda = row.CreateCell(6);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Tk");
            celda = row.CreateCell(7);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("°C");
            celda = row.CreateCell(8);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Med.Ini.");
            celda = row.CreateCell(9);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Med.Fin.");
            celda = row.CreateCell(10);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Destino");
            celda = row.CreateCell(11);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Cant.");
            return ++i;
        }

        private static int InsertTableHeaderCortes(HSSFSheet sheet, ICellStyle cellBorderStyleColumnTitles,ICellStyle estiloRegionTurnos,ICellStyle estiloCabeceraCorte, ICellStyle estiloRegion, int i)
        {
            var row1 = sheet.CreateRow(i);
            var celda1 = row1.CreateCell(0);
            celda1.CellStyle = estiloRegionTurnos;
            celda1 = row1.CreateCell(1);
            celda1.CellStyle = estiloRegion;
            celda1 = row1.CreateCell(2);
            celda1.CellStyle = estiloCabeceraCorte;
           
            celda1 = row1.CreateCell(3);
            celda1.CellStyle = estiloCabeceraCorte;
            celda1 = row1.CreateCell(4);
            celda1.SetCellValue("CORTES");
            celda1.CellStyle = estiloCabeceraCorte;            
            celda1 = row1.CreateCell(5);
            celda1.CellStyle = estiloCabeceraCorte;
            celda1 = row1.CreateCell(6);
            celda1.CellStyle = estiloCabeceraCorte;
            //sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(i - 1, i - 1, 0, 4));
            i++;
            var row = sheet.CreateRow(i);
            var celda = row.CreateCell(0);
            celda.CellStyle = estiloRegionTurnos;
            celda.SetCellValue("");
            celda = row.CreateCell(1);
            celda.CellStyle = estiloRegion;
            celda = row.CreateCell(2);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Motivo");
            celda = row.CreateCell(3);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Inicio");
            celda = row.CreateCell(4);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Fin");
            celda = row.CreateCell(5);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Tiempo.Total");
            celda = row.CreateCell(6);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Observaciones");
            return ++i;
        }

        private static int InsertTableHeaderObservacionesDeCalidad(HSSFSheet sheet, ICellStyle cellBorderStyleColumnTitles, ICellStyle estiloRegionTurnos, ICellStyle estiloCabeceraCorte, ICellStyle estiloRegion, int i)
        {
            var row1 = sheet.CreateRow(i);
            var celda1 = row1.CreateCell(0);
            celda1.CellStyle = estiloRegionTurnos;
            celda1 = row1.CreateCell(1);
            celda1.CellStyle = estiloRegion;
            celda1 = row1.CreateCell(2);
            celda1.CellStyle = estiloCabeceraCorte;
            celda1 = row1.CreateCell(3);
            celda1.CellStyle = estiloCabeceraCorte;
            celda1 = row1.CreateCell(4);
            celda1.SetCellValue("Observaciones de calidad");
            celda1.CellStyle = estiloCabeceraCorte;
            celda1 = row1.CreateCell(5);
            celda1.CellStyle = estiloCabeceraCorte;
            celda1 = row1.CreateCell(6);
            celda1.CellStyle = estiloCabeceraCorte;
            //sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(i - 1, i - 1, 0, 4));
            i++;
            var row = sheet.CreateRow(i);
            var celda = row.CreateCell(0);
            celda.CellStyle = estiloRegionTurnos;
            celda = row.CreateCell(1);
            celda.CellStyle = estiloRegion;
            celda.SetCellValue("");
            celda = row.CreateCell(2);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Fecha");
            celda = row.CreateCell(3);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Hora");
            celda = row.CreateCell(4);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Observacion");
            celda = row.CreateCell(5);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("");
            celda = row.CreateCell(6);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("");
            return ++i;
        }

        private static int InsertTableHeaderObservacionesDeCalidad(HSSFSheet sheet, ICellStyle cellBorderStyleColumnTitles, ICellStyle estiloRegionTurnos, ICellStyle estiloCabeceraCorte, int i)
        {
            var row1 = sheet.CreateRow(i - 1);
            var celda1 = row1.CreateCell(0);
            celda1.CellStyle = estiloCabeceraCorte;

            celda1 = row1.CreateCell(1);
            celda1.CellStyle = estiloCabeceraCorte;
            celda1 = row1.CreateCell(2);
            celda1.SetCellValue("");
            celda1.CellStyle = estiloCabeceraCorte;
            celda1 = row1.CreateCell(3);
            celda1.CellStyle = estiloCabeceraCorte;
            celda1 = row1.CreateCell(4);
            celda1.CellStyle = estiloCabeceraCorte;
            //sheet.AddMergedRegion(new NPOI.SS.Util.CellRangeAddress(i - 1, i - 1, 0, 4));

            var row = sheet.CreateRow(i);
            var celda = row.CreateCell(0);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Motivo");
            celda = row.CreateCell(1);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Inicio");
            celda = row.CreateCell(2);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Fin");
            celda = row.CreateCell(3);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Tiempo.Total");
            celda = row.CreateCell(4);
            celda.CellStyle = cellBorderStyleColumnTitles;
            celda.SetCellValue("Observaciones");
            return i;
        }
    }

  

}