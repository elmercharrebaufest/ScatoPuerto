using Molinos.Scato.Dominio.Dto;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    public class ExcelPlanillaTurnosSolidoOp
    {
        private XSSFWorkbook _workbook;
        private XSSFSheet _sheetTurnos;
        private const int NpoiUnitMultiplier = 256;
        private readonly string _path = System.Web.HttpContext.Current.Server.MapPath("~/IconoMolinosExcel.png");
        private readonly string _pathPlanilla = ConfigurationManager.AppSettings["PathPlanillaSolidos"];
        private readonly byte[] _imgMolinos;
        private readonly IList<ModuloDeCargaPlanillaDeTurnosDto> _planilla;
        private readonly IList<PlanoDeCargaBodegaDto> _listaCargaBodega;
        private readonly string _nombreBuque;
        private readonly HttpPostedFile _excel;
        private int _filaInicioTotales;
        private decimal _totalGravedad = 0;
        private decimal _totalPala = 0;

        public ExcelPlanillaTurnosSolidoOp(IList<ModuloDeCargaPlanillaDeTurnosDto> planilla, IList<PlanoDeCargaBodegaDto> listaCargaBodega,
            string nombreBuque, HttpPostedFile excel)
        {
            _planilla = planilla;
            _listaCargaBodega = listaCargaBodega;
            _nombreBuque = nombreBuque;
            _excel = excel;
            _imgMolinos = File.ReadAllBytes(_path);
        }

        public byte[] GenerarExcel()
        {
            string filePath = Path.Combine(System.Web.HttpContext.Current.Server.MapPath("~/"), Path.GetFileName(_excel.FileName));
            _excel.SaveAs(filePath);
            var fileName = _excel.FileName;
            try
            {
                using (FileStream file = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                {
                    _workbook = new XSSFWorkbook(file);
                }

                AgregarHojaTurnos();

                using (FileStream file = new FileStream(filePath, FileMode.Open, FileAccess.Write))
                {
                    _workbook.Write(file);
                }

                byte[] fileBytes = System.IO.File.ReadAllBytes(filePath);

                GuardarEnCarpetaMolinos(fileBytes, fileName);

                return fileBytes;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
        }

        private void GuardarEnCarpetaMolinos(byte[] archivo, string nombreArchivo)
        {
            DateTime fechaActual = DateTime.Now;
            int año = fechaActual.Year;
            int mes = fechaActual.Month;
            string nombreMes = ObtenerNombreMes(mes);

            string rutaBase = _pathPlanilla;
            string rutaMes = Path.Combine(rutaBase, $"AÑO {año.ToString("0000")}", $"{mes:00}-{nombreMes}");

            if (!Directory.Exists(rutaMes))
            {
                Directory.CreateDirectory(rutaMes);
            }

            string rutaArchivoDestino = Path.Combine(rutaMes, nombreArchivo);

            using (FileStream file = File.Create(rutaArchivoDestino))
            {
                file.Write(archivo, 0, archivo.Length);
            }
        }

        private string ObtenerNombreMes(int numeroMes)
        {
            string nombreMes = new DateTime(2024, numeroMes, 1).ToString("MMMM");
            return char.ToUpper(nombreMes[0]) + nombreMes.Substring(1);
        }

        private void AgregarHojaTurnos()
        {
            _sheetTurnos = (XSSFSheet)_workbook.GetSheetAt(0);
            CompletarHojaTurnos();
        }

        private void CompletarHojaTurnos()
        {
            SetearAnchoColumnasHoja1();
            ArmadoHeaderMolinos();
            ArmadoTablaSilosCelda();
            CrearHeaderBuque();
            CrearyRellenarTablas();
            CalcularTotales();
        }

        private void PintarTablaGris(int startRow, int endRow, int startCol, int endCol)
        {
            ICellStyle style = _workbook.CreateCellStyle();
            style.FillForegroundColor = IndexedColors.Grey25Percent.Index;
            style.FillPattern = FillPattern.SolidForeground;
            style.BorderBottom = BorderStyle.Thin;
            style.BorderLeft = BorderStyle.Thin;
            style.BorderRight = BorderStyle.Thin;
            style.BorderTop = BorderStyle.Thin;
            style.BottomBorderColor = IndexedColors.Grey50Percent.Index;
            style.LeftBorderColor = IndexedColors.Grey50Percent.Index;
            style.RightBorderColor = IndexedColors.Grey50Percent.Index;
            style.TopBorderColor = IndexedColors.Grey50Percent.Index;

            ICellStyle styleSeparador = _workbook.CreateCellStyle();
            styleSeparador.FillForegroundColor = IndexedColors.Grey25Percent.Index;
            styleSeparador.FillPattern = FillPattern.SolidForeground;
            styleSeparador.BorderBottom = BorderStyle.Thick;
            styleSeparador.BorderLeft = BorderStyle.Thin;
            styleSeparador.BorderRight = BorderStyle.Thin;
            styleSeparador.BorderTop = BorderStyle.Thin;
            styleSeparador.BottomBorderColor = IndexedColors.Black.Index;
            styleSeparador.LeftBorderColor = IndexedColors.Grey50Percent.Index;
            styleSeparador.RightBorderColor = IndexedColors.Grey50Percent.Index;
            styleSeparador.TopBorderColor = IndexedColors.Grey50Percent.Index;

            for (int rowNum = startRow; rowNum <= endRow; rowNum++)
            {
                IRow row = _sheetTurnos.GetRow(rowNum) ?? _sheetTurnos.CreateRow(rowNum);
                for (int colNum = startCol; colNum <= endCol; colNum++)
                {
                    ICell cell = row.GetCell(colNum) ?? row.CreateCell(colNum);
                    if (rowNum == endRow)
                    {
                        cell.CellStyle = styleSeparador;
                    }
                    else
                    {
                        cell.CellStyle = style;
                    }
                }
            }
        }

        private void SetearAnchoColumnasHoja1()
        {
            SetAnchoCol(0, 12.09);
            SetAnchoCol(1, 10.91);

            for (int i = 2; i <= 19; i++)
            {
                SetAnchoCol(i, 6.09);
            }

            SetAnchoCol(20, 13.09);
            SetAnchoCol(21, 13.09);

            SetAnchoCol(22, 16.55);
            SetAnchoCol(23, 21.91);
            SetAnchoCol(24, 28.64);
        }

        private void SetAnchoCol(int columnIndex, double widthInCharacters)
        {
            int widthInNpoiUnits = (int)(widthInCharacters * NpoiUnitMultiplier);
            _sheetTurnos.SetColumnWidth(columnIndex, widthInNpoiUnits);
        }

        private void ArmadoHeaderMolinos()
        {
            _sheetTurnos.AddMergedRegion(new CellRangeAddress(0, 3, 0, 1));
            int pictureIndex = _workbook.AddPicture(_imgMolinos, PictureType.PNG);
            XSSFDrawing drawing = (XSSFDrawing)_sheetTurnos.CreateDrawingPatriarch();
            XSSFClientAnchor anchor = new XSSFClientAnchor(0, 0, 0, 0, 0, 0, 3, 1);
            XSSFPicture picture = (XSSFPicture)drawing.CreatePicture(anchor, pictureIndex);
            picture.Resize();

            IRow row0 = _sheetTurnos.CreateRow(0);
            IRow row3 = _sheetTurnos.CreateRow(3);

            // Aplicar estilos
            ICellStyle estiloCodVersion = CrearEstiloCelda("Arial", 20, IndexedColors.Black.Index, true,
                IndexedColors.Grey25Percent.RGB, BorderStyle.Medium);
            ICellStyle estiloSubtitulo = CrearEstiloCelda("Arial", 13, IndexedColors.Black.Index, true,
                IndexedColors.Grey25Percent.RGB, BorderStyle.Medium);
            CrearCelda(row0, 0, 2, 2, 11, "Código F-437", estiloCodVersion, 2, false);
            CrearCelda(row0, 0, 2, 12, 21, "Versión 06", estiloCodVersion, 2, false);
            CrearCelda(row3, 3, 3, 2, 21, "Título: Planilla Embarque de Sólidos", estiloSubtitulo, 2, false);
        }

        private void ArmadoTablaSilosCelda()
        {
            ICellStyle styleSilo31 = CrearEstiloCelda("Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 204, 192, 218 }, BorderStyle.Medium);
            ICellStyle styleSilo32 = CrearEstiloCelda("Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 146, 205, 220 }, BorderStyle.Medium);
            ICellStyle styleCamiones = CrearEstiloCelda("Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 243, 57, 84 }, BorderStyle.Medium);
            ICellStyle styleSilosLogistica = CrearEstiloCelda("Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 148, 138, 84 }, BorderStyle.Medium);
            ICellStyle styleCelda7 = CrearEstiloCelda("Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 255, 204, 153 }, BorderStyle.Medium);
            ICellStyle styleCelda20 = CrearEstiloCelda("Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 204, 255, 204 }, BorderStyle.Medium);
            ICellStyle styleCelda23 = CrearEstiloCelda("Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 255, 255, 153 }, BorderStyle.Medium);
            ICellStyle styleCelda30 = CrearEstiloCelda("Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 230, 184, 183 }, BorderStyle.Medium);

            IRow row6 = _sheetTurnos.CreateRow(5);
            IRow row7 = _sheetTurnos.CreateRow(6);
            row6.HeightInPoints = 16;
            row7.HeightInPoints = 16;

            CrearCelda(row6, 5, 5, 4, 7, "SILO 31", styleSilo31, 2, false);
            CrearCelda(row6, 5, 5, 8, 11, "SILO 32", styleSilo32, 2, false);
            CrearCelda(row6, 5, 5, 12, 15, "Camiones", styleCamiones, 2, false);
            CrearCelda(row6, 5, 5, 16, 19, "Silos Logística", styleSilosLogistica, 2, false);

            CrearCelda(row7, 6, 6, 4, 7, "CELDA 7", styleCelda7, 2, false);
            CrearCelda(row7, 6, 6, 8, 11, "CELDA 20", styleCelda20, 2, false);
            CrearCelda(row7, 6, 6, 12, 15, "CELDA 23", styleCelda23, 2, false);
            CrearCelda(row7, 6, 6, 16, 19, "CELDA 30", styleCelda30, 2, false);
        }

        private ICellStyle CrearEstiloCelda(string fontName, short fontSize, short fontColor, bool isBold, byte[] backgroundColor, BorderStyle border)
        {
            XSSFCellStyle style = (XSSFCellStyle)_sheetTurnos.Workbook.CreateCellStyle();

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
            XSSFColor color = new XSSFColor(backgroundColor);
            style.FillForegroundXSSFColor = color;
            style.FillPattern = FillPattern.SolidForeground;

            return style;
        }

        private void CrearHeaderBuque()
        {
            IRow row8 = _sheetTurnos.CreateRow(7);
            row8.HeightInPoints = (float)25.5;

            ICellStyle estiloLabel = CrearEstiloCelda("Arial", 12, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.Medium);
            CrearCelda(row8, 7, 7, 2, 3, "Buque:", estiloLabel, 2, false);

            ICellStyle estiloLabel2 = CrearEstiloCelda("Arial", 20, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.Medium);
            CrearCelda(row8, 7, 7, 4, 19, _nombreBuque, estiloLabel2, 2, false);
        }

        private void CrearyRellenarTablas()
        {
            IRow rowProductos = _sheetTurnos.CreateRow(8);
            IRow row9 = _sheetTurnos.GetRow(8);
            IRow row10 = _sheetTurnos.CreateRow(9);
            IRow rowBodegas = _sheetTurnos.CreateRow(10);
            IRow rowBalanzas = _sheetTurnos.CreateRow(11);

            int rowIndexProductos = 8, rowIndexBodegas = 10, rowIndexBalanzas = 11,
                rowIndexDia = 12, cantCargasxFecha = 0;

            ICellStyle estiloCelda9A = CrearEstiloCelda("Arial", 10, IndexedColors.Black.Index, true, new byte[3] { 255, 255, 255 }, BorderStyle.Medium);
            CrearCelda(rowProductos, 8, 8, 0, 1, "Tipo de Mercadería", estiloCelda9A, 2, false);

            for (int nroParcel = 1; nroParcel <= 9; nroParcel++)
            {
                int col = nroParcel * 2;
                var cargaBodega = _listaCargaBodega.FirstOrDefault(c => c.BodegaParcel == nroParcel);

                bool tieneCargaBodega = cargaBodega != null;
                string descripcion = tieneCargaBodega ? cargaBodega.MaterialPuerto?.DescripcionCorta.ToUpper() : string.Empty;
                byte[] rgb = tieneCargaBodega ? ObtenerRGBProducto(cargaBodega.MaterialPuerto?.Color) : new byte[3] { 255, 255, 255 };

                ICellStyle estilo = CrearEstiloCelda("Arial", 10, IndexedColors.Black.Index, true, rgb, BorderStyle.Thin);

                CrearCelda(rowProductos, rowIndexProductos, rowIndexProductos, col, col + 1, descripcion, estilo, 1, false);
                CrearCelda(rowBodegas, rowIndexBodegas, rowIndexBodegas, col, col + 1, nroParcel.ToString(), estilo, 1, false);

                CrearCelda(rowBalanzas, rowIndexBalanzas, rowIndexBalanzas, col, col, "BZ7", estilo, 1, false);
                CrearCelda(rowBalanzas, rowIndexBalanzas, rowIndexBalanzas, col + 1, col + 1, "BZ8", estilo, 1, false);
            }

            ICellStyle estiloBodDiaTurno = CrearEstiloCelda("Arial", 10, IndexedColors.Black.Index, true, new byte[3] { 255, 255, 255 }, BorderStyle.Thin);

            CrearCelda(row10, 9, 9, 2, 19, "BODEGAS:", estiloBodDiaTurno, 1, false);
            CrearCelda(row10, 9, 11, 0, 0, "DIA:", estiloBodDiaTurno, 1, false);
            CrearCelda(row10, 9, 11, 1, 1, "TURNO:", estiloBodDiaTurno, 1, false);
            CrearCelda(row9, 8, 11, 20, 20, "TOT TURNO:", estiloBodDiaTurno, 1, false);
            CrearCelda(row9, 8, 11, 21, 21, "TOT DÍA:", estiloBodDiaTurno, 1, false);

            /*Columna A y B para fechas y sus turnos*/
            ICellStyle estiloFecha = CrearEstiloCelda("Calibri", 11, IndexedColors.Black.Index, false, new byte[3] { 255, 255, 255 }, BorderStyle.Thin);
            ICellStyle estiloTurno = CrearEstiloCelda("Arial", 9, IndexedColors.Black.Index, false, new byte[3] { 255, 255, 255 }, BorderStyle.Thin);
            ICellStyle estiloTotal = CrearEstiloCelda("Arial", 10, IndexedColors.Blue.Index, false, new byte[3] { 255, 255, 255 }, BorderStyle.Thin);

            var fechasCargas = _planilla.Select(p => p.Fecha.Value.Date).Distinct();

            CrearHeaderTablaPala();

            foreach (DateTime fecha in fechasCargas)
            {
                decimal totalCargasxFecha = ObtenerTotalCargasPorFecha(fecha);
                cantCargasxFecha = ObtenerCargasPorFecha(fecha);
                IRow row = _sheetTurnos.GetRow(rowIndexDia) ?? _sheetTurnos.CreateRow(rowIndexDia);
                CrearCelda(row, rowIndexDia, rowIndexDia + (cantCargasxFecha - 1), 0, 0, fecha.ToString("dd-MMM-yy"), estiloFecha, 1, true);
                PintarTablaGris(rowIndexDia, rowIndexDia + (cantCargasxFecha - 1), 2, 19);
                CrearCelda(row, rowIndexDia, rowIndexDia + (cantCargasxFecha - 1), 21, 21, ToCustomString(totalCargasxFecha), estiloTotal, 1, true);
                //Por cada turno de fecha dada agrego sus cargas, y sus palas correspondientes.
                AgregarCargasYPala(fecha, row, rowIndexDia, rowIndexDia + cantCargasxFecha - 1, estiloTurno, totalCargasxFecha);
                rowIndexDia += cantCargasxFecha;
            }

            _filaInicioTotales = rowIndexDia;

            PintarTotalesPalaGravedad(rowIndexDia);
        }

        private void PintarTotalesPalaGravedad(int index)
        {
            ICellStyle styleGravedad = CrearEstiloCelda("Calibri", 10, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.Medium);
            ICellStyle stylePala = CrearEstiloCelda("Calibri", 14, IndexedColors.Black.Index, true, IndexedColors.Yellow.RGB, BorderStyle.Medium);
            IRow row = _sheetTurnos.GetRow(index) ?? _sheetTurnos.CreateRow(index);
            CrearCelda(row, index, index, 23, 23, $"Total {_totalGravedad} TN Gravedad", styleGravedad, 2, false);
            CrearCelda(row, index, index, 24, 24, $"Total {_totalPala} TN con Palas", stylePala, 2, false);
        }

        private void AgregarCargasYPala(DateTime fecha, IRow rowFecha, int rowIni, int rowFin, ICellStyle estilo, decimal totalXFecha)
        {
            int cantCargasxTurno = 0, turno = 1;
            decimal acumPorGravedad = 0, pesoGravedad = 0;
            bool separador = false;

            ICellStyle estilo1 = CrearEstiloCelda("Arial", 9, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin);
            ICellStyle estiloTotal = CrearEstiloCelda("Arial", 10, IndexedColors.Blue.Index, false, new byte[3] { 255, 255, 255 }, BorderStyle.Thin);

            cantCargasxTurno = ObtenerCantidadCargasPorFechaTurno(fecha, turno);
            for (int i = rowIni; i < rowFin; i += cantCargasxTurno)
            {
                var planillaTurno = _planilla.FirstOrDefault(p => p.Fecha.Value.Date == fecha.Date && p.TurnoPuerto.Orden == turno);
                pesoGravedad = planillaTurno?.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad.Sum(p => ((decimal)(p.KgGravedad)) / 1000) ?? 0;
                acumPorGravedad += pesoGravedad;
                _totalGravedad += acumPorGravedad;
                cantCargasxTurno = ObtenerCantidadCargasPorFechaTurno(fecha, turno);
                IRow rowAux = _sheetTurnos.GetRow(i) ?? _sheetTurnos.CreateRow(i);
                if (turno == 4)
                {
                    separador = true;
                }
                CrearCelda(rowAux, i, i + (cantCargasxTurno - 1), 1, 1, ObtenerTurno(turno), estilo, 1, separador);
                CrearCelda(rowAux, i, i + (cantCargasxTurno - 1), 20, 20, ToCustomString(ObtenerTotalCargasPorFechaTurno(fecha, turno)), estiloTotal, 1, separador);
                CrearCelda(rowAux, i, i + (cantCargasxTurno - 1), 23, 23, ToCustomString(pesoGravedad), estilo, 1, separador);
                AgregarCargasXTurno(fecha, turno, rowAux, i, i + (cantCargasxTurno - 1));
                turno++;
            }
            decimal valorConPalas = totalXFecha - acumPorGravedad;
            _totalPala += valorConPalas;
            CrearCelda(rowFecha, rowIni, rowFin, 24, 24, ToCustomString(valorConPalas), estilo, 1, true);
        }

        private void AgregarCargasXTurno(DateTime fecha, int turno, IRow row, int rowIni, int rowFin)
        {
            var planillaturno = _planilla.FirstOrDefault(t => t.Fecha.Value.Date == fecha.Date && t.TurnoPuerto.Orden == turno);

            if (planillaturno != null)
            {
                var cargas = planillaturno.ModuloDeCargaPlanillaDeTurnosDetallesSolido.OrderBy(x => x.Fila ?? int.MaxValue);
                foreach (ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto carga in cargas)
                {
                    if (carga.Bodega?.Nombre != null && carga.BalanzaPuerto?.CodigoBalanza != null && carga.SiloCelda?.Color != null && carga.Fila != null)
                        PintarValorEnBodegaBlz(rowIni, rowFin, turno, carga.Bodega.Nombre, carga.BalanzaPuerto.CodigoBalanza, ((decimal)(carga.Cantidad)) / 1000, carga.Fila.Value, carga.SiloCelda.Color);
                }
            }
        }

        private void PintarValorEnBodegaBlz(int rowIni, int rowFin, int turno, string bodega, string codBalanza, decimal cantidad, int fila, string color)
        {
            bool separador = false;
            int offsetBlz = codBalanza == "7" ? 0 : 1;
            int col = ((int)char.GetNumericValue(bodega.Last())) * 2 + offsetBlz;
            ICellStyle estiloCarga = CrearEstiloCelda("Calibri", 11, IndexedColors.Black.Index, false, ObtenerRGBProducto(color), BorderStyle.None);
            IRow row = _sheetTurnos.GetRow(rowIni + (fila)) ?? _sheetTurnos.CreateRow(rowIni + (fila));
            if (turno == 4)
                separador = true;
            CrearCelda(row, rowIni + (fila), rowIni + (fila), col, col, ToCustomString(cantidad), estiloCarga, 0, separador);
        }

        private void CrearCelda(IRow row, int firstRow, int lastRow, int firstCol, int lastCol, string valorCelda, ICellStyle estilo, int bordeRegion, bool separador)
        {
            var regionCelda = new CellRangeAddress(firstRow, lastRow, firstCol, lastCol);
            _sheetTurnos.AddMergedRegion(regionCelda);
            RegionUtil.SetBorderTop(bordeRegion, regionCelda, _sheetTurnos, _workbook);
            RegionUtil.SetBorderLeft(bordeRegion, regionCelda, _sheetTurnos, _workbook);
            RegionUtil.SetBorderRight(bordeRegion, regionCelda, _sheetTurnos, _workbook);
            if (separador)
            {
                RegionUtil.SetBorderBottom(5, regionCelda, _sheetTurnos, _workbook);
            }
            else
            {
                RegionUtil.SetBorderBottom(bordeRegion, regionCelda, _sheetTurnos, _workbook);
            }
            ICell celda = row.CreateCell(firstCol);
            celda.CellStyle = estilo;
            celda.SetCellValue(valorCelda);
        }

        private byte[] ObtenerRGBProducto(string hexa)
        {
            if (hexa.StartsWith("#"))
            {
                hexa = hexa.Substring(1);
            }

            byte r = Convert.ToByte(hexa.Substring(0, 2), 16);
            byte g = Convert.ToByte(hexa.Substring(2, 2), 16);
            byte b = Convert.ToByte(hexa.Substring(4, 2), 16);

            return new byte[3] { r, g, b };
        }

        private string ObtenerTurno(int idTurno)
        {
            string valorTurno;
            switch (idTurno)
            {
                case 1:
                    valorTurno = "00:00 a 06:00";
                    break;

                case 2:
                    valorTurno = "06:00 a 12:00";
                    break;

                case 3:
                    valorTurno = "12:00 a 18:00";
                    break;

                case 4:
                    valorTurno = "18:00 a 24:00";
                    break;

                default:
                    valorTurno = string.Empty;
                    break;
            }
            return valorTurno;
        }

        private int ObtenerCantidadCargasPorFechaTurno(DateTime fecha, int turno)
        {
            int cantCargas = 4;
            var planillaFecha = _planilla.FirstOrDefault(x => x.Fecha.Value.Date == fecha.Date && x.TurnoPuerto.Orden == turno);
            if (planillaFecha != null)
            {
                int cant = planillaFecha.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Count();
                if (cant > 4)
                {
                    cantCargas = cant;
                }
            }
            return cantCargas;
        }

        private decimal ObtenerTotalCargasPorFecha(DateTime fecha)
        {
            decimal total = 0;
            var planillaFecha = _planilla.Where(x => x.Fecha.Value.Date == fecha.Date);
            foreach (ModuloDeCargaPlanillaDeTurnosDto planilla in planillaFecha)
            {
                foreach (ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto carga in planilla.ModuloDeCargaPlanillaDeTurnosDetallesSolido)
                {
                    total += ((decimal)(carga.Cantidad)) / 1000;
                }
            }
            return total;
        }

        private decimal ObtenerTotalCargasPorFechaTurno(DateTime fecha, int turno)
        {
            decimal total = 0;
            var planillaFecha = _planilla.FirstOrDefault(x => x.Fecha.Value.Date == fecha.Date && x.TurnoPuerto.Orden == turno);
            if (planillaFecha != null)
            {
                foreach (ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto carga in planillaFecha.ModuloDeCargaPlanillaDeTurnosDetallesSolido)
                {
                    total += ((decimal)(carga.Cantidad)) / 1000;
                }
            }
            return total;
        }

        private int ObtenerCargasPorFecha(DateTime fecha)
        {
            int acumCargas = 0;
            for (int i = 1; i <= 4; i++)
            {
                acumCargas += ObtenerCantidadCargasPorFechaTurno(fecha, i);
            }
            return acumCargas;
        }

        private void CalcularTotales()
        {
            decimal totalABordo = 0, totalSPlano = 0, faltanEmb = 0;
            int filaBodegas = 10;

            IRow rowTotalxBodega = _sheetTurnos.GetRow(_filaInicioTotales) ?? _sheetTurnos.CreateRow(_filaInicioTotales);
            rowTotalxBodega.HeightInPoints = (short)21.5;
            IRow rowPlanoCargaBod = _sheetTurnos.GetRow(_filaInicioTotales + 1) ?? _sheetTurnos.CreateRow(_filaInicioTotales + 1);
            rowPlanoCargaBod.HeightInPoints = (short)27;
            IRow rowFaltaEmbarcar = _sheetTurnos.GetRow(_filaInicioTotales + 2) ?? _sheetTurnos.CreateRow(_filaInicioTotales + 2);
            rowFaltaEmbarcar.HeightInPoints = (short)28.5;
            IRow rowTotalxBodBlz = _sheetTurnos.GetRow(_filaInicioTotales + 3) ?? _sheetTurnos.CreateRow(_filaInicioTotales + 3);
            ICellStyle estiloTitulo = CrearEstiloCelda("Arial", 9, IndexedColors.Black.Index, false,
                IndexedColors.White.RGB, BorderStyle.Thin);

            CrearCelda(rowTotalxBodega, _filaInicioTotales, _filaInicioTotales, 0, 1, "Total por bodegas", estiloTitulo, 1, false);
            CrearCelda(rowPlanoCargaBod, _filaInicioTotales + 1, _filaInicioTotales + 1, 0, 1, "S / Plano de Carga por bodegas", estiloTitulo, 1, false);
            CrearCelda(rowFaltaEmbarcar, _filaInicioTotales + 2, _filaInicioTotales + 2, 0, 1, "Faltan embarcar por bodega", estiloTitulo, 1, false);
            CrearCelda(rowTotalxBodBlz, _filaInicioTotales + 3, _filaInicioTotales + 3, 0, 1, "Total por balanzas", estiloTitulo, 2, false);

            //Recorro las columnas de bodega para obtener el color.

            for (int i = 2; i <= 18; i += 2)
            {
                decimal totalxBod = CalcularTotalxBodega(i / 2);
                decimal totalxPlCargaBod = CalcularTotalPlanoCargaxBodega(i / 2);
                decimal restaCargar = totalxPlCargaBod - totalxBod;

                totalABordo += totalxBod;
                totalSPlano += totalxPlCargaBod;
                faltanEmb += restaCargar;

                ICell celda = _sheetTurnos.GetRow(filaBodegas).GetCell(i);
                byte[] backgroundColor = !(celda.CellStyle.FillForegroundColorColor.RGB.SequenceEqual(IndexedColors.Black.RGB)) ?
                    celda.CellStyle.FillForegroundColorColor.RGB : IndexedColors.White.RGB;

                ICellStyle estilo1 = CrearEstiloCelda("Arial", 10, IndexedColors.Blue.Index, false,
                  backgroundColor, BorderStyle.Thin);

                ICellStyle estilo2 = CrearEstiloCelda("Arial", 10, IndexedColors.Black.Index, false,
                  backgroundColor, BorderStyle.Thin);

                short fondoRestaCargar = restaCargar == 0 ? IndexedColors.Black.Index : IndexedColors.Red.Index;

                ICellStyle estilo3 = CrearEstiloCelda("Arial", 10, fondoRestaCargar, false,
              backgroundColor, BorderStyle.Thin);

                CrearCelda(rowTotalxBodega, _filaInicioTotales, _filaInicioTotales, i, i + 1, ToCustomString(totalxBod), estilo1, 1, false);
                CrearCelda(rowPlanoCargaBod, _filaInicioTotales + 1, _filaInicioTotales + 1, i, i + 1, ToCustomString(totalxPlCargaBod), estilo2, 1, false);
                CrearCelda(rowFaltaEmbarcar, _filaInicioTotales + 2, _filaInicioTotales + 2, i, i + 1, ToCustomString(restaCargar), estilo3, 1, false);

                decimal totalxBodBlz7 = CalcularTotalxBodegaBlz(i / 2, "7");
                decimal totalxBodBlz8 = CalcularTotalxBodegaBlz(i / 2, "8");

                CrearCelda(rowTotalxBodBlz, _filaInicioTotales + 3, _filaInicioTotales + 3, i, i, ToCustomString(totalxBodBlz7), estiloTitulo, 1, false);
                CrearCelda(rowTotalxBodBlz, _filaInicioTotales + 3, _filaInicioTotales + 3, i + 1, i + 1, ToCustomString(totalxBodBlz8), estiloTitulo, 1, false);
            }

            ICellStyle estiloTotxBod = CrearEstiloCelda("Arial", 8, IndexedColors.Blue.Index, true,
                  IndexedColors.White.RGB, BorderStyle.Medium);

            ICellStyle estiloTotalxPlCargaBod = CrearEstiloCelda("Arial", 8, IndexedColors.Black.Index, true,
               IndexedColors.White.RGB, BorderStyle.Medium);

            short backgroundColorRestaCargar = faltanEmb == 0 ? IndexedColors.Black.Index : IndexedColors.Red.Index;

            ICellStyle estiloRestaCargar = CrearEstiloCelda("Arial", 8, backgroundColorRestaCargar, true,
           IndexedColors.White.RGB, BorderStyle.Medium);

            CrearCelda(rowTotalxBodega, _filaInicioTotales, _filaInicioTotales, 20, 20, "TOTAL A BORDO:", estiloTotxBod, 1, false);
            CrearCelda(rowPlanoCargaBod, _filaInicioTotales + 1, _filaInicioTotales + 1, 20, 20, "TOTAL S/ PLANO", estiloTotalxPlCargaBod, 1, false);
            CrearCelda(rowFaltaEmbarcar, _filaInicioTotales + 2, _filaInicioTotales + 2, 20, 20, "FALTAN EMB.", estiloRestaCargar, 1, false);

            CrearCelda(rowTotalxBodega, _filaInicioTotales, _filaInicioTotales, 21, 21, ToCustomString(totalABordo), estiloTotxBod, 1, false);
            CrearCelda(rowPlanoCargaBod, _filaInicioTotales + 1, _filaInicioTotales + 1, 21, 21, ToCustomString(totalSPlano), estiloTotalxPlCargaBod, 1, false);
            CrearCelda(rowFaltaEmbarcar, _filaInicioTotales + 2, _filaInicioTotales + 2, 21, 21, ToCustomString(faltanEmb), estiloRestaCargar, 1, false);
        }

        private decimal CalcularTotalxBodega(int bodega)
        {
            decimal total = 0;
            foreach (ModuloDeCargaPlanillaDeTurnosDto turno in _planilla)
            {
                var cargasBodega = turno.ModuloDeCargaPlanillaDeTurnosDetallesSolido
                    .Where(x => x.Bodega != null
                             && x.Bodega.Nombre != null
                             && (int)char.GetNumericValue(x.Bodega.Nombre.LastOrDefault()) == bodega);

                foreach (ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto carga in cargasBodega)
                {
                    total += ((decimal)(carga.Cantidad)) / 1000;
                }
            }
            return total;
        }

        private decimal CalcularTotalPlanoCargaxBodega(int bodega)
        {
            decimal total = 0;
            var cargasBodega = _listaCargaBodega.Where(x => x.BodegaParcel == bodega);
            foreach (PlanoDeCargaBodegaDto carga in cargasBodega)
            {
                total += carga.Cantidad ?? 0;
            }
            return total;
        }

        private decimal CalcularTotalxBodegaBlz(int bodega, string blz)
        {
            decimal total = 0;
            foreach (ModuloDeCargaPlanillaDeTurnosDto turno in _planilla)
            {
                var cargasBodega = turno.ModuloDeCargaPlanillaDeTurnosDetallesSolido
                    .Where(x => x.Bodega != null
                             && x.Bodega.Nombre != null
                             && (int)char.GetNumericValue(x.Bodega.Nombre.LastOrDefault()) == bodega
                             && (x.BalanzaPuerto != null && x.BalanzaPuerto.CodigoBalanza == blz));

                foreach (ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto carga in cargasBodega)
                {
                    total += ((decimal)(carga.Cantidad)) / 1000;
                }
            }
            return total;
        }

        private void CrearHeaderTablaPala()
        {
            var fechasCargas = _planilla.Select(p => p.Fecha.Value.Date).Distinct();
            ICellStyle estilo = CrearEstiloCelda("Arial", 9, IndexedColors.Black.Index, false, new byte[3] { 255, 255, 255 }, BorderStyle.Thin);
            ICellStyle estiloHeader = CrearEstiloCelda("Calibri", 9, IndexedColors.Black.Index, true, new byte[3] { 252, 252, 4 }, BorderStyle.Medium);
            ICellStyle estiloHeader2 = CrearEstiloCelda("Calibri", 11, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.Medium);

            IRow rowHeaderTablaPala = _sheetTurnos.GetRow(8);
            IRow rowHeader2 = _sheetTurnos.GetRow(10);
            IRow rowHeader3 = _sheetTurnos.GetRow(11);

            CrearCelda(rowHeaderTablaPala, 8, 9, 23, 24, "Para confección de remitos de palas (Solo completar sí va por gravedad)", estiloHeader, 2, false);
            CrearCelda(rowHeader2, 10, 10, 23, 24, "Toneladas por Turno", estiloHeader2, 2, false);
            CrearCelda(rowHeader3, 11, 11, 23, 23, "Por gravedad", estiloHeader2, 2, false);
            CrearCelda(rowHeader3, 11, 11, 24, 24, "Por palas", estiloHeader2, 2, false);
        }

        private string ToCustomString(decimal valor)
        {
            return valor % 1 == 0 ? valor.ToString("0") : valor.ToString("0.##");
        }
    }
}