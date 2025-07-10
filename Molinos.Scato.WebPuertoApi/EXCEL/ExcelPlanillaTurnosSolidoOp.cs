using Molinos.Scato.Dominio.Dto;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using static NPOI.HSSF.Util.HSSFColor;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    public class ExcelPlanillaTurnosSolidoOp
    {
        private XSSFWorkbook _workbook;
        private XSSFSheet _sheetTurnos;
        private XSSFSheet _sheetRitmos;
        private XSSFSheet _sheetDatos;
        private const int NpoiUnitMultiplier = 256;
        private readonly string _path = System.Web.HttpContext.Current.Server.MapPath("~/IconoMolinosExcel.png");
        private readonly byte[] _imgMolinos;
        private readonly IList<ModuloDeCargaPlanillaDeTurnosDto> _planilla;
        private readonly IList<PlanoDeCargaBodegaDto> _listaCargaBodega;
        private readonly IList<BalanzaManualDto> _balanzasManual;
        private readonly EmbarqueDto _embarque;
        private readonly ModuloDeCargaDto _modCarga;
        private readonly IList<NominacionDto> _nominaciones;
        private readonly RitmoDeCargasBalanzasDto _ritmos;
        private int _filaInicioTotales;
        private decimal _totalGravedad = 0;
        private decimal _totalPala = 0;

        public ExcelPlanillaTurnosSolidoOp(IList<ModuloDeCargaPlanillaDeTurnosDto> planilla, IList<PlanoDeCargaBodegaDto> listaCargaBodega,
          IList<BalanzaManualDto> balanzasManual, EmbarqueDto embarque, IList<NominacionDto> nominaciones, ModuloDeCargaDto modCarga, RitmoDeCargasBalanzasDto ritmos)
        {
            _workbook = new XSSFWorkbook();
            _planilla = planilla;
            _listaCargaBodega = listaCargaBodega;
            _balanzasManual = balanzasManual;
            _embarque = embarque;
            _nominaciones = nominaciones;
            _imgMolinos = File.ReadAllBytes(_path);
            _modCarga = modCarga;
            _ritmos = ritmos;
        }

        public byte[] GenerarExcel()
        {
            try
            {
                CompletarHojas();
                using (var fileData = new MemoryStream())
                {
                    _workbook.Write(fileData);
                    return fileData.ToArray();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private void CompletarHojas()
        {
            _sheetTurnos = (XSSFSheet)_workbook.CreateSheet("Planilla");
            _sheetRitmos = (XSSFSheet)_workbook.CreateSheet("Ritmos");
            _sheetDatos = (XSSFSheet)_workbook.CreateSheet("Datos");

            CompletarHojaTurnos();
            CompletarHojaRitmos();
            CompletarHojaDatos();
        }

        private void CompletarHojaTurnos()
        {
            SetearAnchoColumnasHoja1();
            ArmadoHeaderMolinos(_sheetTurnos);
            ArmadoTablaSilosCelda();
            CrearHeaderBuque();
            CrearyRellenarTablas();
            CalcularTotales();
        }

        private void CompletarHojaRitmos()
        {
            SetearAnchoColumnasHoja2();
            ArmadoHeaderMolinos(_sheetRitmos);
            ArmadoCuerpoRitmos();
        }

        private void CompletarHojaDatos()
        {
            SetearAnchoColumnasHoja3();
            ArmadoCuerpoDatos();
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
            SetAnchoCol(_sheetTurnos, 0, 12.09);
            SetAnchoCol(_sheetTurnos, 1, 10.91);

            for (int i = 2; i <= 19; i++)
            {
                SetAnchoCol(_sheetTurnos, i, 7.09);
            }

            SetAnchoCol(_sheetTurnos, 20, 13.09);
            SetAnchoCol(_sheetTurnos, 21, 13.09);

            SetAnchoCol(_sheetTurnos, 22, 16.55);
            SetAnchoCol(_sheetTurnos, 23, 21.91);
            SetAnchoCol(_sheetTurnos, 24, 28.64);
        }

        private void SetearAnchoColumnasHoja3()
        {
            SetAnchoCol(_sheetDatos, 1, 21);
            SetAnchoCol(_sheetDatos, 6, 21);
        }

        private void SetAnchoCol(ISheet sheet, int columnIndex, double widthInCharacters)
        {
            int widthInNpoiUnits = (int)(widthInCharacters * NpoiUnitMultiplier);
            sheet.SetColumnWidth(columnIndex, widthInNpoiUnits);
        }

        private void ArmadoHeaderMolinos(ISheet sheet)
        {
            sheet.AddMergedRegion(new CellRangeAddress(0, 3, 0, 1));
            int pictureIndex = _workbook.AddPicture(_imgMolinos, PictureType.PNG);
            XSSFDrawing drawing = (XSSFDrawing)sheet.CreateDrawingPatriarch();
            XSSFClientAnchor anchor = new XSSFClientAnchor(0, 0, 0, 0, 0, 0, 3, 1);
            XSSFPicture picture = (XSSFPicture)drawing.CreatePicture(anchor, pictureIndex);
            picture.Resize();

            IRow row0 = sheet.CreateRow(0);
            IRow row3 = sheet.CreateRow(3);

            // Aplicar estilos
            ICellStyle estiloCodVersion = CrearEstiloCelda(sheet, "Arial", 20, IndexedColors.Black.Index, true,
                IndexedColors.Grey25Percent.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle estiloSubtitulo = CrearEstiloCelda(sheet, "Arial", 13, IndexedColors.Black.Index, true,
                IndexedColors.Grey25Percent.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            CrearCelda(sheet, row0, 0, 2, 2, 11, "Código F-437", estiloCodVersion, 2, 2, 2, 2, false);
            CrearCelda(sheet, row0, 0, 2, 12, 21, "Versión 06", estiloCodVersion, 2, 2, 2, 2, false);
            CrearCelda(sheet, row3, 3, 3, 2, 21, "Título: Planilla Embarque de Sólidos", estiloSubtitulo, 2, 2, 2, 2, false);
        }

        private void ArmadoTablaSilosCelda()
        {
            ICellStyle styleSilo31 = CrearEstiloCelda(_sheetTurnos, "Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 204, 192, 218 }, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle styleSilo32 = CrearEstiloCelda(_sheetTurnos, "Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 146, 205, 220 }, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle styleCamiones = CrearEstiloCelda(_sheetTurnos, "Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 243, 57, 84 }, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle styleSilosLogistica = CrearEstiloCelda(_sheetTurnos, "Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 148, 138, 84 }, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle styleCelda7 = CrearEstiloCelda(_sheetTurnos, "Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 255, 204, 153 }, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle styleCelda20 = CrearEstiloCelda(_sheetTurnos, "Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 204, 255, 204 }, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle styleCelda23 = CrearEstiloCelda(_sheetTurnos, "Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 255, 255, 153 }, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle styleCelda30 = CrearEstiloCelda(_sheetTurnos, "Calibri", 10, IndexedColors.Black.Index, true, new byte[3] { 230, 184, 183 }, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);

            IRow row6 = _sheetTurnos.CreateRow(5);
            IRow row7 = _sheetTurnos.CreateRow(6);
            row6.HeightInPoints = 16;
            row7.HeightInPoints = 16;

            CrearCelda(_sheetTurnos, row6, 5, 5, 4, 7, "SILO 31", styleSilo31, 2, 2, 2, 2, false);
            CrearCelda(_sheetTurnos, row6, 5, 5, 8, 11, "SILO 32", styleSilo32, 2, 2, 2, 2, false);
            CrearCelda(_sheetTurnos, row6, 5, 5, 12, 15, "Camiones", styleCamiones, 2, 2, 2, 2, false);
            CrearCelda(_sheetTurnos, row6, 5, 5, 16, 19, "Silos Logística", styleSilosLogistica, 2, 2, 2, 2, false);

            CrearCelda(_sheetTurnos, row7, 6, 6, 4, 7, "CELDA 7", styleCelda7, 2, 2, 2, 2, false);
            CrearCelda(_sheetTurnos, row7, 6, 6, 8, 11, "CELDA 20", styleCelda20, 2, 2, 2, 2, false);
            CrearCelda(_sheetTurnos, row7, 6, 6, 12, 15, "CELDA 23", styleCelda23, 2, 2, 2, 2, false);
            CrearCelda(_sheetTurnos, row7, 6, 6, 16, 19, "CELDA 30", styleCelda30, 2, 2, 2, 2, false);
        }

        private ICellStyle CrearEstiloCelda(ISheet sheet, string fontName, short fontSize, short fontColor, bool isBold, byte[] backgroundColor, BorderStyle borderTop, BorderStyle borderBottom, BorderStyle borderLeft, BorderStyle borderRight)
        {
            XSSFCellStyle style = (XSSFCellStyle)sheet.Workbook.CreateCellStyle();

            style.Alignment = HorizontalAlignment.Center;
            style.VerticalAlignment = VerticalAlignment.Center;

            IFont font = _workbook.CreateFont();
            font.FontName = fontName;
            font.FontHeightInPoints = fontSize;
            font.Color = fontColor;
            if (isBold)
                font.Boldweight = (short)FontBoldWeight.Bold;

            style.SetFont(font);
            style.BorderBottom = borderBottom;
            style.BorderLeft = borderLeft;
            style.BorderRight = borderRight;
            style.BorderTop = borderTop;
            XSSFColor color = new XSSFColor(backgroundColor);
            style.FillForegroundXSSFColor = color;
            style.FillPattern = FillPattern.SolidForeground;

            return style;
        }

        private void CrearHeaderBuque()
        {
            IRow row8 = _sheetTurnos.CreateRow(7);
            row8.HeightInPoints = (float)25.5;

            ICellStyle estiloLabel = CrearEstiloCelda(_sheetTurnos, "Arial", 12, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            CrearCelda(_sheetTurnos, row8, 7, 7, 2, 3, "Buque:", estiloLabel, 2, 2, 2, 2, false);

            ICellStyle estiloLabel2 = CrearEstiloCelda(_sheetTurnos, "Arial", 20, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            CrearCelda(_sheetTurnos, row8, 7, 7, 4, 19, _embarque.Patente, estiloLabel2, 2, 2, 2, 2, false);
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

            ICellStyle estiloCelda9A = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Black.Index, true, new byte[3] { 255, 255, 255 }, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            CrearCelda(_sheetTurnos, rowProductos, 8, 8, 0, 1, "Tipo de Mercadería", estiloCelda9A, 2, 2, 2, 2, false);

            for (int nroParcel = 1; nroParcel <= 9; nroParcel++)
            {
                int col = nroParcel * 2;
                var cargaBodega = _listaCargaBodega.FirstOrDefault(c => c.BodegaParcel == nroParcel);

                bool tieneCargaBodega = cargaBodega != null;
                string descripcion = tieneCargaBodega ? cargaBodega.MaterialPuerto?.DescripcionCorta.ToUpper() : string.Empty;
                byte[] rgb = tieneCargaBodega ? ObtenerRGBProducto(cargaBodega.MaterialPuerto?.Color) : new byte[3] { 255, 255, 255 };

                ICellStyle estilo = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Black.Index, true, rgb, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

                CrearCelda(_sheetTurnos, rowProductos, rowIndexProductos, rowIndexProductos, col, col + 1, descripcion, estilo, 1, 1, 1, 1, false);
                CrearCelda(_sheetTurnos, rowBodegas, rowIndexBodegas, rowIndexBodegas, col, col + 1, nroParcel.ToString(), estilo, 1, 1, 1, 1, false);

                CrearCelda(_sheetTurnos, rowBalanzas, rowIndexBalanzas, rowIndexBalanzas, col, col, "BZ7", estilo, 1, 1, 1, 1, false);
                CrearCelda(_sheetTurnos, rowBalanzas, rowIndexBalanzas, rowIndexBalanzas, col + 1, col + 1, "BZ8", estilo, 1, 1, 1, 1, false);
            }

            ICellStyle estiloBodDiaTurno = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Black.Index, true, new byte[3] { 255, 255, 255 }, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

            CrearCelda(_sheetTurnos, row10, 9, 9, 2, 19, "BODEGAS:", estiloBodDiaTurno, 1, 1, 1, 1, false);
            CrearCelda(_sheetTurnos, row10, 9, 11, 0, 0, "DIA:", estiloBodDiaTurno, 1, 1, 1, 1, false);
            CrearCelda(_sheetTurnos, row10, 9, 11, 1, 1, "TURNO:", estiloBodDiaTurno, 1, 1, 1, 1, false);
            CrearCelda(_sheetTurnos, row9, 8, 11, 20, 20, "TOT TURNO:", estiloBodDiaTurno, 1, 1, 1, 1, false);
            CrearCelda(_sheetTurnos, row9, 8, 11, 21, 21, "TOT DÍA:", estiloBodDiaTurno, 1, 1, 1, 1, false);

            /*Columna A y B para fechas y sus turnos*/
            ICellStyle estiloFecha = CrearEstiloCelda(_sheetTurnos, "Calibri", 11, IndexedColors.Black.Index, false, new byte[3] { 255, 255, 255 }, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle estiloTurno = CrearEstiloCelda(_sheetTurnos, "Arial", 9, IndexedColors.Black.Index, false, new byte[3] { 255, 255, 255 }, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle estiloTotal = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Blue.Index, false, new byte[3] { 255, 255, 255 }, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

            var fechasCargas = _planilla.Select(p => p.Fecha.Value.Date).Distinct();

            CrearHeaderTablaPala();

            foreach (DateTime fecha in fechasCargas)
            {
                decimal totalCargasxFecha = ObtenerTotalCargasPorFecha(fecha);
                cantCargasxFecha = ObtenerCargasPorFecha(fecha);
                IRow row = _sheetTurnos.GetRow(rowIndexDia) ?? _sheetTurnos.CreateRow(rowIndexDia);
                CrearCelda(_sheetTurnos, row, rowIndexDia, rowIndexDia + (cantCargasxFecha - 1), 0, 0, fecha.ToString("dd-MMM-yy"), estiloFecha, 1, 1, 1, 1, true);
                PintarTablaGris(rowIndexDia, rowIndexDia + (cantCargasxFecha - 1), 2, 19);
                CrearCelda(_sheetTurnos, row, rowIndexDia, rowIndexDia + (cantCargasxFecha - 1), 21, 21, (double)totalCargasxFecha, estiloTotal, 1, 1, 1, 1, true);
                //Por cada turno de fecha dada agrego sus cargas, y sus palas correspondientes.
                AgregarCargasYPala(fecha, row, rowIndexDia, rowIndexDia + cantCargasxFecha - 1, estiloTurno, totalCargasxFecha);
                rowIndexDia += cantCargasxFecha;
            }

            _filaInicioTotales = rowIndexDia;

            PintarTotalesPalaGravedad(rowIndexDia);
        }

        private void PintarTotalesPalaGravedad(int index)
        {
            ICellStyle styleGravedad = CrearEstiloCelda(_sheetTurnos, "Calibri", 10, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle stylePala = CrearEstiloCelda(_sheetTurnos, "Calibri", 14, IndexedColors.Black.Index, true, IndexedColors.Yellow.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            IRow row = _sheetTurnos.GetRow(index) ?? _sheetTurnos.CreateRow(index);
            CrearCelda(_sheetTurnos, row, index, index, 23, 23, $"Total {_totalGravedad} TN Gravedad", styleGravedad, 2, 2, 2, 2, false);
            CrearCelda(_sheetTurnos, row, index, index, 24, 24, $"Total {_totalPala} TN con Palas", stylePala, 2, 2, 2, 2, false);
        }

        private void AgregarCargasYPala(DateTime fecha, IRow rowFecha, int rowIni, int rowFin, ICellStyle estilo, decimal totalXFecha)
        {
            int cantCargasxTurno = 0, turno = 1;
            decimal acumPorGravedad = 0, pesoGravedad = 0;
            bool separador = false;

            ICellStyle estilo1 = CrearEstiloCelda(_sheetTurnos, "Arial", 9, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle estiloTotal = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Blue.Index, false, new byte[3] { 255, 255, 255 }, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

            cantCargasxTurno = ObtenerCantidadCargasPorFechaTurno(fecha, turno);
            for (int i = rowIni; i < rowFin; i += cantCargasxTurno)
            {
                var planillaTurno = _planilla.FirstOrDefault(p => p.Fecha.Value.Date == fecha.Date && p.TurnoPuerto.Orden == turno);
                pesoGravedad = planillaTurno?.ModuloDeCargaPlanillaDeTurnosDetallesSolidoPesoGravedad.Sum(p => ((decimal)(p.KgGravedad)) / 1000) ?? 0;
                acumPorGravedad += pesoGravedad;
                _totalGravedad += pesoGravedad;
                cantCargasxTurno = ObtenerCantidadCargasPorFechaTurno(fecha, turno);
                IRow rowAux = _sheetTurnos.GetRow(i) ?? _sheetTurnos.CreateRow(i);
                if (turno == 4)
                {
                    separador = true;
                }
                CrearCelda(_sheetTurnos, rowAux, i, i + (cantCargasxTurno - 1), 1, 1, ObtenerTurno(turno), estilo, 1, 1, 1, 1, separador);
                CrearCelda(_sheetTurnos, rowAux, i, i + (cantCargasxTurno - 1), 20, 20, (double)ObtenerTotalCargasPorFechaTurno(fecha, turno), estiloTotal, 1, 1, 1, 1, separador);
                CrearCelda(_sheetTurnos, rowAux, i, i + (cantCargasxTurno - 1), 23, 23, (double)pesoGravedad, estilo, 1, 1, 1, 1, separador);
                AgregarCargasXTurno(fecha, turno, rowAux, i, i + (cantCargasxTurno - 1));
                turno++;
            }
            decimal valorConPalas = totalXFecha - acumPorGravedad;
            _totalPala += valorConPalas;
            CrearCelda(_sheetTurnos, rowFecha, rowIni, rowFin, 24, 24, (double)valorConPalas, estilo, 1, 1, 1, 1, true);
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
                        PintarValorEnBodegaBlz(rowIni, turno, carga);
                }
            }
        }

        private void PintarValorEnBodegaBlz(int rowIni, int turno, ModuloDeCargaPlanillaDeTurnosDetallesSolidoDto carga)
        {
            bool separador = turno == 4;
            string bodega = carga.Bodega.Nombre;
            string codBalanza = carga.BalanzaPuerto.CodigoBalanza;
            decimal cantidad = ((decimal)(carga.Cantidad)) / 1000;
            int fila = carga.Fila.Value;
            string color = carga.SiloCelda.Color;
            int offsetBlz = codBalanza == "7" ? 0 : 1;
            int col = ((int)char.GetNumericValue(bodega.Last())) * 2 + offsetBlz;
            var comentario = new StringBuilder();
            comentario.AppendLine(carga.SiloCelda.Nombre);
            comentario.AppendLine("Destino: " + carga.Destino.Nombre);
            comentario.AppendLine("Exportador: " + carga.Exportador.Nombre);

            ICellStyle estiloCarga = CrearEstiloCelda(_sheetTurnos, "Calibri", 11, IndexedColors.Black.Index, false, ObtenerRGBProducto(color), BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            IRow row = _sheetTurnos.GetRow(rowIni + (fila)) ?? _sheetTurnos.CreateRow(rowIni + (fila));
            CrearCelda(_sheetTurnos, row, rowIni + (fila), rowIni + (fila), col, col, (double)cantidad, estiloCarga, 0, 0, 0, 0, separador, comentario.ToString());
        }

        private void CrearCelda(ISheet sheet, IRow row, int firstRow, int lastRow, int firstCol, int lastCol, object valorCelda, ICellStyle estilo, int bordeTop, int bordeBottom, int bordeLeft, int bordeRight, bool separador, string comentario = null)
        {
            var regionCelda = new CellRangeAddress(firstRow, lastRow, firstCol, lastCol);
            sheet.AddMergedRegion(regionCelda);
            RegionUtil.SetBorderTop(bordeTop, regionCelda, sheet, _workbook);
            RegionUtil.SetBorderLeft(bordeLeft, regionCelda, sheet, _workbook);
            RegionUtil.SetBorderRight(bordeRight, regionCelda, sheet, _workbook);
            if (separador)
            {
                RegionUtil.SetBorderBottom(5, regionCelda, sheet, _workbook);
            }
            else
            {
                RegionUtil.SetBorderBottom(bordeBottom, regionCelda, sheet, _workbook);
            }
            ICell celda = row.CreateCell(firstCol);

            if (valorCelda is string stringValue)
            {
                celda.SetCellValue(stringValue);
            }
            else if (valorCelda is int intValue)
            {
                celda.SetCellValue((double)intValue);
            }
            else if (valorCelda is double doubleValue)
            {
                IDataFormat dataFormat = _workbook.CreateDataFormat();
                estilo.DataFormat = dataFormat.GetFormat("#,##0.000");
                celda.SetCellValue(doubleValue);
            }
            else if (valorCelda is TimeSpan timeValue)
            {
                IDataFormat dataFormat = _workbook.CreateDataFormat();
                estilo.DataFormat = dataFormat.GetFormat("[h]:mm");
                celda.SetCellValue(timeValue.TotalHours / 24);
            }
            else
            {
                celda.SetCellValue(valorCelda?.ToString() ?? "");
            }

            celda.CellStyle = estilo;

            if (!string.IsNullOrEmpty(comentario))
            {
                IDrawing drawing = sheet.CreateDrawingPatriarch();
                IComment cellComment = drawing.CreateCellComment(new XSSFClientAnchor());
                cellComment.String = new XSSFRichTextString(comentario);
                cellComment.Author = "Sistema";
                celda.CellComment = cellComment;
            }
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
            ICellStyle estiloTitulo = CrearEstiloCelda(_sheetTurnos, "Arial", 9, IndexedColors.Black.Index, false,
                IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

            CrearCelda(_sheetTurnos, rowTotalxBodega, _filaInicioTotales, _filaInicioTotales, 0, 1, "Total por bodegas", estiloTitulo, 1, 1, 1, 1, false);
            CrearCelda(_sheetTurnos, rowPlanoCargaBod, _filaInicioTotales + 1, _filaInicioTotales + 1, 0, 1, "S / Plano de Carga por bodegas", estiloTitulo, 1, 1, 1, 1, false);
            CrearCelda(_sheetTurnos, rowFaltaEmbarcar, _filaInicioTotales + 2, _filaInicioTotales + 2, 0, 1, "Faltan embarcar por bodega", estiloTitulo, 1, 1, 1, 1, false);
            CrearCelda(_sheetTurnos, rowTotalxBodBlz, _filaInicioTotales + 3, _filaInicioTotales + 3, 0, 1, "Total por balanzas", estiloTitulo, 2, 2, 2, 2, false);

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

                ICellStyle estilo1 = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Blue.Index, false,
                  backgroundColor, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

                ICellStyle estilo2 = CrearEstiloCelda(_sheetTurnos, "Arial", 10, IndexedColors.Black.Index, false,
                  backgroundColor, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

                short fondoRestaCargar = restaCargar == 0 ? IndexedColors.Black.Index : IndexedColors.Red.Index;

                ICellStyle estilo3 = CrearEstiloCelda(_sheetTurnos, "Arial", 10, fondoRestaCargar, false,
              backgroundColor, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

                CrearCelda(_sheetTurnos, rowTotalxBodega, _filaInicioTotales, _filaInicioTotales, i, i + 1, (double)totalxBod, estilo1, 1, 1, 1, 1, false);
                CrearCelda(_sheetTurnos, rowPlanoCargaBod, _filaInicioTotales + 1, _filaInicioTotales + 1, i, i + 1, (double)totalxPlCargaBod, estilo2, 1, 1, 1, 1, false);
                CrearCelda(_sheetTurnos, rowFaltaEmbarcar, _filaInicioTotales + 2, _filaInicioTotales + 2, i, i + 1, (double)restaCargar, estilo3, 1, 1, 1, 1, false);

                decimal totalxBodBlz7 = CalcularTotalxBodegaBlz(i / 2, "7");
                decimal totalxBodBlz8 = CalcularTotalxBodegaBlz(i / 2, "8");

                CrearCelda(_sheetTurnos, rowTotalxBodBlz, _filaInicioTotales + 3, _filaInicioTotales + 3, i, i, (double)totalxBodBlz7, estiloTitulo, 1, 1, 1, 1, false);
                CrearCelda(_sheetTurnos, rowTotalxBodBlz, _filaInicioTotales + 3, _filaInicioTotales + 3, i + 1, i + 1, (double)totalxBodBlz8, estiloTitulo, 1, 1, 1, 1, false);
            }

            ICellStyle estiloTotxBod = CrearEstiloCelda(_sheetTurnos, "Arial", 8, IndexedColors.Blue.Index, true,
                  IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);

            ICellStyle estiloTotalxPlCargaBod = CrearEstiloCelda(_sheetTurnos, "Arial", 8, IndexedColors.Black.Index, true,
               IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);

            short backgroundColorRestaCargar = faltanEmb == 0 ? IndexedColors.Black.Index : IndexedColors.Red.Index;

            ICellStyle estiloRestaCargar = CrearEstiloCelda(_sheetTurnos, "Arial", 8, backgroundColorRestaCargar, true,
           IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);

            CrearCelda(_sheetTurnos, rowTotalxBodega, _filaInicioTotales, _filaInicioTotales, 20, 20, "TOTAL A BORDO:", estiloTotxBod, 1, 1, 1, 1, false);
            CrearCelda(_sheetTurnos, rowPlanoCargaBod, _filaInicioTotales + 1, _filaInicioTotales + 1, 20, 20, "TOTAL S/ PLANO", estiloTotalxPlCargaBod, 1, 1, 1, 1, false);
            CrearCelda(_sheetTurnos, rowFaltaEmbarcar, _filaInicioTotales + 2, _filaInicioTotales + 2, 20, 20, "FALTAN EMB.", estiloRestaCargar, 1, 1, 1, 1, false);

            CrearCelda(_sheetTurnos, rowTotalxBodega, _filaInicioTotales, _filaInicioTotales, 21, 21, (double)totalABordo, estiloTotxBod, 1, 1, 1, 1, false);
            CrearCelda(_sheetTurnos, rowPlanoCargaBod, _filaInicioTotales + 1, _filaInicioTotales + 1, 21, 21, (double)totalSPlano, estiloTotalxPlCargaBod, 1, 1, 1, 1, false);
            CrearCelda(_sheetTurnos, rowFaltaEmbarcar, _filaInicioTotales + 2, _filaInicioTotales + 2, 21, 21, (double)faltanEmb, estiloRestaCargar, 1, 1, 1, 1, false);
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
            ICellStyle estilo = CrearEstiloCelda(_sheetTurnos, "Arial", 9, IndexedColors.Black.Index, false, new byte[3] { 255, 255, 255 }, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle estiloHeader = CrearEstiloCelda(_sheetTurnos, "Calibri", 9, IndexedColors.Black.Index, true, new byte[3] { 252, 252, 4 }, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);
            ICellStyle estiloHeader2 = CrearEstiloCelda(_sheetTurnos, "Calibri", 11, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);

            IRow rowHeaderTablaPala = _sheetTurnos.GetRow(8);
            IRow rowHeader2 = _sheetTurnos.GetRow(10);
            IRow rowHeader3 = _sheetTurnos.GetRow(11);

            CrearCelda(_sheetTurnos, rowHeaderTablaPala, 8, 9, 23, 24, "Para confección de remitos de palas (Solo completar sí va por gravedad)", estiloHeader, 2, 2, 2, 2, false);
            CrearCelda(_sheetTurnos, rowHeader2, 10, 10, 23, 24, "Toneladas por Turno", estiloHeader2, 2, 2, 2, 2, false);
            CrearCelda(_sheetTurnos, rowHeader3, 11, 11, 23, 23, "Por gravedad", estiloHeader2, 2, 2, 2, 2, false);
            CrearCelda(_sheetTurnos, rowHeader3, 11, 11, 24, 24, "Por palas", estiloHeader2, 2, 2, 2, 2, false);
        }

        private void ArmadoCuerpoRitmos()
        {
            IRow row4 = _sheetRitmos.GetRow(4) ?? _sheetRitmos.CreateRow(4);
            ICellStyle estiloTituloRitmos = CrearEstiloCelda(_sheetRitmos, "Arial", 14, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            CrearCelda(_sheetRitmos, row4, 4, 7, 0, 8, "Informe de Ritmos de Embarque", estiloTituloRitmos, 0, 0, 0, 0, false);

            IRow row8 = _sheetRitmos.GetRow(8) ?? _sheetRitmos.CreateRow(8);
            IRow row9 = _sheetRitmos.GetRow(9) ?? _sheetRitmos.CreateRow(9);
            IRow row10 = _sheetRitmos.GetRow(10) ?? _sheetRitmos.CreateRow(10);
            IRow row11 = _sheetRitmos.GetRow(11) ?? _sheetRitmos.CreateRow(11);

            ICellStyle estiloCampo = CrearEstiloCelda(_sheetRitmos, "Arial", 11, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle estiloValor = CrearEstiloCelda(_sheetRitmos, "Arial", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);

            CrearCelda(_sheetRitmos, row8, 8, 8, 0, 1, "Buque:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row8, 8, 8, 2, 3, _embarque.Patente, estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row8, 8, 8, 4, 5, "Destino:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row8, 8, 8, 6, 8, ObtenerDestinoEmbarque(), estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row9, 9, 9, 0, 1, "Mercadería:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row9, 9, 9, 2, 3, ObtenerMaterialesEmbarque(), estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row9, 9, 9, 4, 5, "Exportador:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row9, 9, 9, 6, 8, ObtenerExportadoresEmbarque(), estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row10, 10, 10, 0, 1, "Concepto:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row10, 10, 10, 2, 3, "Embarque", estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row10, 10, 10, 4, 5, "Bandera:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row10, 10, 10, 6, 8, ObtenerBandera(), estiloValor, 0, 0, 0, 0, false);

            CrearCelda(_sheetRitmos, row11, 11, 11, 0, 1, "Cantidad Prevista:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row11, 11, 11, 2, 3, ObtenerTotalEmbarque().ToString() + " TN", estiloValor, 0, 0, 0, 0, false);

            ICellStyle estiloPeriodoCarga = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle estiloTexto = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle estiloAmarillo = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.LightYellow.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);

            IRow row13 = _sheetRitmos.GetRow(13) ?? _sheetRitmos.CreateRow(13);
            IRow row14 = _sheetRitmos.GetRow(14) ?? _sheetRitmos.CreateRow(14);

            CrearCelda(_sheetRitmos, row13, 13, 13, 1, 2, "Pedido de carga", estiloPeriodoCarga, 1, 1, 1, 1, false);
            CrearCelda(_sheetRitmos, row14, 14, 14, 1, 2, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaComienzoCarga != null && _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraComienzoCarga != null ?
                _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaComienzoCarga.Value.ToString("dd/MM") + " " + _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraComienzoCarga : "", estiloPeriodoCarga, 1, 1, 1, 1, false);

            CrearCelda(_sheetRitmos, row13, 13, 13, 4, 5, "Final de embarque", estiloPeriodoCarga, 1, 1, 1, 1, false);
            CrearCelda(_sheetRitmos, row14, 14, 14, 4, 5, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaFinalizacionCarga != null && _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraFinalizacionCarga != null ?
                _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaFinalizacionCarga.Value.ToString("dd/MM") + " " + _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraFinalizacionCarga : "", estiloPeriodoCarga, 1, 1, 1, 1, false);

            IRow row16 = _sheetRitmos.GetRow(16) ?? _sheetRitmos.CreateRow(16);

            CrearCelda(_sheetRitmos, row16, 16, 16, 1, 3, "tTe = Tiempo Total Emb. =", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row16, 16, 16, 4, 5, ObtenerTiempoTtalEmb(), estiloAmarillo, 0, 0, 0, 0, false);

            CrearTablaEventos();

            IRow row18 = _sheetRitmos.GetRow(18);
            ICellStyle estiloRedSinBorde = CrearEstiloCelda(_sheetRitmos, "Arial", 10, IndexedColors.Red.Index, true, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);

            IRow row21 = _sheetRitmos.GetRow(21);
            CrearCelda(_sheetRitmos, row21, 21, 21, 9, 9, "Amarró:", estiloAmarillo, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetRitmos, row21, 21, 21, 10, 11, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaAmarro != null && _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraAmarro != null ?
                _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaAmarro.Value.ToString("dd/MM") + " " + _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraAmarro : "", estiloAmarillo, 0, 0, 0, 0, false, null);

            IRow row22 = _sheetRitmos.GetRow(22);
            CrearCelda(_sheetRitmos, row22, 22, 22, 9, 9, "Desamarró:", estiloAmarillo, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetRitmos, row22, 22, 22, 10, 11, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaDesamarro != null && _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraDesamarro != null ?
                _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaDesamarro.Value.ToString("dd/MM") + " " + _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.HoraDesamarro : "", estiloAmarillo, 0, 0, 0, 0, false, null);

            CrearCelda(_sheetRitmos, row21, 21, 22, 12, 14, "Completar estos datos con fecha y hora", estiloPeriodoCarga, 1, 1, 1, 1, false, null);

            IRow row23 = _sheetRitmos.GetRow(23);
            CrearCelda(_sheetRitmos, row23, 23, 23, 9, 10, "Viento Amarre:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row23, 23, 23, 11, 11, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.VientoAmarro ?? string.Empty + "Km/h", estiloValor, 0, 0, 0, 0, false);

            IRow row24 = _sheetRitmos.GetRow(24);
            CrearCelda(_sheetRitmos, row24, 24, 24, 9, 10, "Dirección:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row24, 24, 24, 11, 11, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.DireccionAmarro ?? string.Empty, estiloValor, 0, 0, 0, 0, false);

            IRow row25 = _sheetRitmos.GetRow(25);
            CrearCelda(_sheetRitmos, row25, 25, 25, 9, 10, "Viento Zarpada:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row25, 25, 25, 11, 11, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.VientoDesamarro ?? string.Empty + "Km/h", estiloValor, 0, 0, 0, 0, false);

            IRow row26 = _sheetRitmos.GetRow(26);
            CrearCelda(_sheetRitmos, row26, 26, 26, 9, 10, "Dirección:", estiloCampo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row26, 26, 26, 11, 11, _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.DireccionDesamarro ?? string.Empty, estiloValor, 0, 0, 0, 0, false);

            IRow row27 = _sheetRitmos.GetRow(27);
            CrearCelda(_sheetRitmos, row27, 27, 27, 9, 13, "Velocidad Máxima del Viento para Amarre 35 Km/h", estiloRedSinBorde, 0, 0, 0, 0, false);

            CrearTablaUmap();

            //A partir de fila 36 creamos tablas bzas 7 y 8.
            var bzas7 = _balanzasManual.Where(b => b.NumeroBalanza == "7").OrderBy(b => b.FechaInicio).ToList();
            var bzas8 = _balanzasManual.Where(b => b.NumeroBalanza == "8").OrderBy(b => b.FechaInicio).ToList();
            CrearTablaBza(bzas7, "7", 0);
            CrearTablaBza(bzas8, "8", 9);

            //Calculo inicio seccion ritmos dejando 6 espacios despues del fin de tablas contemplando headers.
            int indexInicioRitmos = 36 + Math.Max(bzas7.Count, bzas8.Count) + 6;
            CrearSeccionRitmos(indexInicioRitmos);
        }

        private void CrearTablaEventos()
        {
            ICellStyle estilo = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

            IRow row18 = _sheetRitmos.GetRow(18) ?? _sheetRitmos.CreateRow(18);
            CrearCelda(_sheetRitmos, row18, 18, 18, 0, 6, "Tipos de eventos durante embarques", estilo, 1, 1, 1, 1, false);

            IRow row19 = _sheetRitmos.GetRow(19) ?? _sheetRitmos.CreateRow(19);
            CrearCelda(_sheetRitmos, row19, 19, 19, 0, 0, "BCB", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Baja Carga Buque ( Ej: Pedido del buque, deslastre, etc.)", row19, 1, 6, new int[] { 0, 5, 11 });

            IRow row20 = _sheetRitmos.GetRow(20) ?? _sheetRitmos.CreateRow(20);
            CrearCelda(_sheetRitmos, row20, 20, 20, 0, 0, "BCP", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Baja Carga Puerto (Escases de mercadería, apelmazamiento de mercaderia, apertura de portones, etc.)", row20, 1, 6, new int[] { 0, 5, 11 });

            IRow row21 = _sheetRitmos.GetRow(21) ?? _sheetRitmos.CreateRow(21);
            CrearCelda(_sheetRitmos, row21, 21, 21, 0, 0, "C", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Calidad de Mercadería (Ej: Color, olor, granulometría, apelmazamiento, etc.)", row21, 1, 6, new int[] { 0 });

            IRow row22 = _sheetRitmos.GetRow(22) ?? _sheetRitmos.CreateRow(22);
            CrearCelda(_sheetRitmos, row22, 22, 22, 0, 0, "E", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Fallas Eléctricas de equipos de MOA", row22, 1, 6, new int[] { 7 });

            IRow row23 = _sheetRitmos.GetRow(23) ?? _sheetRitmos.CreateRow(23);
            CrearCelda(_sheetRitmos, row23, 23, 23, 0, 0, "F", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Por Fuleo de bodegas", row23, 1, 6, new int[] { 4 });

            IRow row24 = _sheetRitmos.GetRow(24) ?? _sheetRitmos.CreateRow(24);
            CrearCelda(_sheetRitmos, row24, 24, 24, 0, 0, "H", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Por Habilitación del buque (Ej: Habilitaciones, Cambio de exportadores, lluvia)", row24, 1, 6, new int[] { 4 });

            IRow row25 = _sheetRitmos.GetRow(25) ?? _sheetRitmos.CreateRow(25);
            CrearCelda(_sheetRitmos, row25, 25, 25, 0, 0, "M", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Fallas Mecánicas de equipos de MOA", row25, 1, 6, new int[] { 7 });

            IRow row26 = _sheetRitmos.GetRow(26) ?? _sheetRitmos.CreateRow(26);
            CrearCelda(_sheetRitmos, row26, 26, 26, 0, 0, "N", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Normal (Sin restricciones de ritmo)", row26, 1, 6, new int[] { 0 });

            IRow row27 = _sheetRitmos.GetRow(27) ?? _sheetRitmos.CreateRow(27);
            CrearCelda(_sheetRitmos, row27, 27, 27, 0, 0, "OP", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Operativas de Puerto MOA (Ej.: Cambios de Bodegas,Limpieza de circuito, mala operatoria)", row27, 1, 6, new int[] { 0, 14 });

            IRow row28 = _sheetRitmos.GetRow(28) ?? _sheetRitmos.CreateRow(28);
            CrearCelda(_sheetRitmos, row28, 28, 28, 0, 0, "OC", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Operativas de MOA Comercial (Ej.: Parada por Falta de mercadería)", row28, 1, 6, new int[] { 0, 18 });

            IRow row29 = _sheetRitmos.GetRow(29) ?? _sheetRitmos.CreateRow(29);
            CrearCelda(_sheetRitmos, row29, 29, 29, 0, 0, "OB", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Operativas del Buque (Ej: Corte de carga, lectura de calado)", row29, 1, 6, new int[] { 0, 15 });

            IRow row30 = _sheetRitmos.GetRow(30) ?? _sheetRitmos.CreateRow(30);
            CrearCelda(_sheetRitmos, row30, 30, 30, 0, 0, "P", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Pala / Paleo (Ej: Falta de Palas, rotura de Palas, rotura de rejillas a raíz de las palas, etc. / Paleo Bodegas)", row30, 1, 6, new int[] { 7 });

            IRow row31 = _sheetRitmos.GetRow(31) ?? _sheetRitmos.CreateRow(31);
            CrearCelda(_sheetRitmos, row31, 31, 31, 0, 0, "3ro", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("Terceros (Ej. Paradas que no corresponden al Puerto, Parada en Logística, Baja presión de aire, etc.)", row31, 1, 6, null);

            IRow row32 = _sheetRitmos.GetRow(32) ?? _sheetRitmos.CreateRow(32);
            CrearCelda(_sheetRitmos, row32, 32, 32, 0, 0, "T", estilo, 1, 1, 1, 1, false);
            CrearCeldaEvento("OTros (Ejemplo: Huelgas - Determinante)", row32, 1, 6, new int[] { 1 });
        }

        private void CrearTablaUmap()
        {
            ICellStyle estiloCampo = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle estiloValor = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);

            Dictionary<string, List<string>> diccUmap = new Dictionary<string, List<string>>
            {
                { "Dir.Viento", _modCarga.ModuloDeCargaUmap.Select(m=> m.DireccionDelViento?? "")
                                              .ToList() },
                { "Encendido", _modCarga.ModuloDeCargaUmap.Select(m => (m.FechaEncendido!= null && m.HoraEncendido!=null)? $"{m.FechaEncendido.Value:dd/MM} {m.HoraEncendido}": string.Empty)
                                              .ToList() },
                { "Apagado", _modCarga.ModuloDeCargaUmap.Select(m => (m.FechaApagado!= null && m.HoraApagado!=null)? $"{m.FechaApagado.Value:dd/MM} {m.HoraApagado}": string.Empty)
                                              .ToList() },
                { "Hs marcha", _modCarga.ModuloDeCargaUmap.Select(m =>
                    {
                        if (m.FechaEncendido != null && m.HoraEncendido != null &&
                        m.FechaApagado != null && m.HoraApagado != null)
                        {
                            DateTime encendido = DateTime.Parse($"{m.FechaEncendido.Value:yyyy-MM-dd} {m.HoraEncendido}");
                            DateTime apagado = DateTime.Parse($"{m.FechaApagado.Value:yyyy-MM-dd} {m.HoraApagado}");
                            TimeSpan diferencia = apagado - encendido;

                            return diferencia.TotalMinutes > 0 ? $"{(int)diferencia.TotalHours:D2}:{diferencia.Minutes:D2}" : "00:00";
                        }
                            return string.Empty;
                    }).ToList()
                }
            };

            IRow row29 = _sheetRitmos.GetRow(29);
            CrearCelda(_sheetRitmos, row29, 29, 32, 9, 9, "UMAP/Hidrante", estiloCampo, 1, 1, 1, 1, false);

            int indexRow = 29;
            int indexCol = 10;
            foreach (var item in diccUmap)
            {
                IRow row = _sheetRitmos.GetRow(indexRow) ?? _sheetRitmos.CreateRow(indexRow);
                CrearCelda(_sheetRitmos, row, row.RowNum, row.RowNum, 10, 10, item.Key, estiloValor, 1, 1, 1, 1, false);
                indexCol = 11;
                foreach (var valor in diccUmap[item.Key])
                {
                    CrearCelda(_sheetRitmos, row, row.RowNum, row.RowNum, indexCol, indexCol, valor, estiloValor, 1, 1, 1, 1, false);
                    indexCol++;
                }
                indexRow++;
            }
        }

        private void CrearCeldaEvento(string descripcion, IRow row, int colIni, int colFin, int[] indexIniciales)
        {
            XSSFRichTextString richText = new XSSFRichTextString(descripcion);

            IFont boldFont = _workbook.CreateFont();
            boldFont.Boldweight = (short)FontBoldWeight.Bold;

            IFont redFont = _workbook.CreateFont();
            redFont.Color = IndexedColors.Red.Index;

            if (indexIniciales != null)
            {
                foreach (int indice in indexIniciales)
                {
                    richText.ApplyFont(indice, indice + 1, boldFont);
                }
            }

            int startRedText = richText.String.IndexOf("(");
            if (startRedText != -1)
            {
                richText.ApplyFont(startRedText, richText.Length, redFont);
            }

            ICell celda = row.CreateCell(colIni);

            var regionCelda = new CellRangeAddress(row.RowNum, row.RowNum, colIni, colFin);
            _sheetRitmos.AddMergedRegion(regionCelda);
            RegionUtil.SetBorderTop(1, regionCelda, _sheetRitmos, _workbook);
            RegionUtil.SetBorderLeft(1, regionCelda, _sheetRitmos, _workbook);
            RegionUtil.SetBorderRight(1, regionCelda, _sheetRitmos, _workbook);
            RegionUtil.SetBorderBottom(1, regionCelda, _sheetRitmos, _workbook);

            celda.SetCellValue(richText);
        }

        private void CrearTablaBza(List<BalanzaManualDto> balanzas, string nroBza, int colIni)
        {
            ICellStyle titulo = CrearEstiloCelda(_sheetRitmos, "Arial", 10, IndexedColors.Red.Index, true, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle campos = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle campoHs = CrearEstiloCelda(_sheetRitmos, "Arial", 9, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle body = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle bodyTiempo = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.LightYellow.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.Thin, BorderStyle.Thin);

            //Header tabla
            IRow row36 = _sheetRitmos.GetRow(36) ?? _sheetRitmos.CreateRow(36);
            CrearCelda(_sheetRitmos, row36, 36, 36, colIni, colIni + 7, "BALANZA " + nroBza, titulo, 1, 1, 1, 1, false, null);

            IRow row37 = _sheetRitmos.GetRow(37) ?? _sheetRitmos.CreateRow(37);
            CrearCelda(_sheetRitmos, row37, 37, 37, colIni, colIni + 3, "Eventos de embarque", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row37, 37, 38, colIni + 4, colIni + 4, "TN B Carga", campos, 1, 1, 1, 1, false, null);

            CrearCelda(_sheetRitmos, row37, 37, 38, colIni + 5, colIni + 6, "Detalle de evento", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row37, 37, 38, colIni + 7, colIni + 7, "Tipo", campos, 1, 1, 1, 1, false, null);

            IRow row38 = _sheetRitmos.GetRow(38) ?? _sheetRitmos.CreateRow(38);
            CrearCelda(_sheetRitmos, row38, 38, 38, colIni, colIni, "Bga", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row38, 38, 38, colIni + 1, colIni + 1, "Inicio", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row38, 38, 38, colIni + 2, colIni + 2, "Corte", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, row38, 38, 38, colIni + 3, colIni + 3, "Tiempo T", campos, 1, 1, 1, 1, false, null);

            //Body tabla
            int index = 39;
            int totalTn = 0;
            TimeSpan totalT = new TimeSpan();

            foreach (var balanza in balanzas)
            {
                totalTn += balanza.Toneladas ?? 0;
                IRow row = _sheetRitmos.GetRow(index) ?? _sheetRitmos.CreateRow(index);
                TimeSpan tiempo = ObtenerTiempo(balanza);
                totalT = totalT.Add(tiempo);
                var bodega = balanza.Bodega != null ? balanza.Bodega.Nombre.LastOrDefault().ToString() : string.Empty;
                CrearCelda(_sheetRitmos, row, index, index, colIni, colIni, bodega, body, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 1, colIni + 1, ObtenerFechaBzaFormateada(balanza.FechaInicio, balanza.HoraInicio), campoHs, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 2, colIni + 2, ObtenerFechaBzaFormateada(balanza.FechaCorte, balanza.HoraCorte), campoHs, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 3, colIni + 3, tiempo, bodyTiempo, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 4, colIni + 4, balanza.Toneladas, body, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 5, colIni + 6, balanza.Observaciones.ToString() ?? "", body, 0, 0, 1, 1, false, null);
                CrearCelda(_sheetRitmos, row, index, index, colIni + 7, colIni + 7, balanza.MotivosFallasBalanza?.Siglas ?? "", body, 0, 0, 1, 1, false, null);
                index++;
            }

            IRow rowTotal = _sheetRitmos.GetRow(index) ?? _sheetRitmos.CreateRow(index);
            CrearCelda(_sheetRitmos, rowTotal, rowTotal.RowNum, rowTotal.RowNum, colIni, colIni + 2, "Tn = tiempo bruto emb = ", campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, rowTotal, rowTotal.RowNum, rowTotal.RowNum, colIni + 3, colIni + 3, totalT, bodyTiempo, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, rowTotal, rowTotal.RowNum, rowTotal.RowNum, colIni + 4, colIni + 4, totalTn, campos, 1, 1, 1, 1, false, null);
            CrearCelda(_sheetRitmos, rowTotal, rowTotal.RowNum, rowTotal.RowNum, colIni + 5, colIni + 7, "= Toneladas a Baja Carga", campos, 1, 1, 1, 1, false, null);
        }

        private void CrearSeccionRitmos(int inicio)
        {
            var cortes = _balanzasManual.Where(b => b.CorteManual == true).ToList();
            var bajasCargas = _balanzasManual.Where(b => b.CorteManual == false && b.CargaNormal == false).ToList();

            ICellStyle titulo = CrearEstiloCelda(_sheetRitmos, "Calibri", 15, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle subtitulo = CrearEstiloCelda(_sheetRitmos, "Calibri", 14, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle negrita = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle negritaConBorde = CrearEstiloCelda(_sheetRitmos, "Calibri", 12, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle texto = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            ICellStyle textoSinBorde = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle negritaSubrayado = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle estiloReRn = CrearEstiloCelda(_sheetRitmos, "Calibri", 14, IndexedColors.Black.Index, true, IndexedColors.LightYellow.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium);

            IFont fontSub = negritaSubrayado.GetFont(_workbook);
            fontSub.Underline = FontUnderlineType.Single;
            negritaSubrayado.SetFont(fontSub);

            var tiempoBza7 = ObtenerTiempoTtalBzas(_balanzasManual.Where(b => b.NumeroBalanza == "7").ToList());
            var tiempoBza8 = ObtenerTiempoTtalBzas(_balanzasManual.Where(b => b.NumeroBalanza == "8").ToList());

            IRow row = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row, row.RowNum, row.RowNum, 1, 2, "Ritmo de Embarque (RE):", titulo, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetRitmos, row, row.RowNum, row.RowNum, 3, 10, " Considera la cantidad cargada en el tiempo contemplando las paradas vinculadas con el Puerto.", subtitulo, 0, 0, 0, 0, false, null);

            inicio += 2;

            IRow row2 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);

            negrita.Alignment = HorizontalAlignment.Right;
            CrearCelda(_sheetRitmos, row2, row2.RowNum, row2.RowNum, 1, 1, "RE:", negrita, 0, 0, 0, 0, false, null);

            CrearCelda(_sheetRitmos, row2, row2.RowNum, row2.RowNum, 2, 2, "TN Totales Emb.", negritaSubrayado, 0, 0, 0, 0, false, null);

            CrearCelda(_sheetRitmos, row2, row2.RowNum, row2.RowNum, 4, 4, "RE Bza 7:", negritaConBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row2, row2.RowNum, row2.RowNum, 5, 5, _ritmos.RitmoBalanza7.ToString() + "TN/h", negritaConBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row2, row2.RowNum, row2.RowNum, 13, 14, "Tiemp.Contemplados", texto, 1, 1, 1, 1, false);

            inicio++;
            IRow row3 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);

            CrearCelda(_sheetRitmos, row3, row3.RowNum, row3.RowNum, 2, 2, "Tiemp. Sin paradas", negrita, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetRitmos, row3, row3.RowNum, row3.RowNum, 8, 8, "RE Buque:", titulo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row3, row3.RowNum, row3.RowNum, 9, 10, _ritmos.RitmoCargaBruto + "TN/h", estiloReRn, 2, 2, 2, 2, false);
            CrearCelda(_sheetRitmos, row3, row3.RowNum, row3.RowNum, 13, 14, "Bza 7: " + $"{(int)tiempoBza7.TotalHours:D2}:{tiempoBza7.Minutes:D2} hs", texto, 1, 1, 1, 1, false);

            inicio++;
            IRow row5 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);

            CrearCelda(_sheetRitmos, row5, row5.RowNum, row5.RowNum, 4, 4, "RE Bza 8:", negritaConBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row5, row5.RowNum, row5.RowNum, 5, 5, _ritmos.RitmoBalanza8.ToString() + "TN/h", negritaConBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row5, row5.RowNum, row5.RowNum, 13, 14, "Bza 8: " + $"{(int)tiempoBza8.TotalHours:D2}:{tiempoBza8.Minutes:D2} hs", texto, 1, 1, 1, 1, false);

            inicio += 2;
            IRow row6 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row6, row6.RowNum, row6.RowNum, 8, 8, "Ritmo Neto:", titulo, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row6, row6.RowNum, row6.RowNum, 9, 10, _ritmos.RitmoCargaNeto + "TN/h", estiloReRn, 2, 2, 2, 2, false);
            CrearCelda(_sheetRitmos, row6, row6.RowNum, row6.RowNum, 11, 15, "Este ritmo no contempla fuleos ni bajas carga a pedido del buque", negrita, 0, 0, 0, 0, false);

            inicio += 2;
            IRow row7 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row7, row7.RowNum, row7.RowNum, 1, 2, "Información adicional", titulo, 0, 0, 0, 0, false);

            inicio++;
            var tiempoTotalBc = ObtenerTiempoTtalBzas(bajasCargas);
            IRow row8 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row8, row8.RowNum, row8.RowNum, 1, 2, "Ritmo a baja carga", textoSinBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row8, row8.RowNum, row8.RowNum, 3, 3, ObtenerRitmoABajaCarga() + "TN/h", negrita, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row8, row8.RowNum, row8.RowNum, 4, 4, tiempoTotalBc, negrita, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row8, row8.RowNum, row8.RowNum, 5, 6, "Horas a Baja carga, suma las dos manos", textoSinBorde, 0, 0, 0, 0, false);

            inicio++;
            IRow row9 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row9, row9.RowNum, row9.RowNum, 1, 2, "% Cargado a Baja Carga: ", textoSinBorde, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row9, row9.RowNum, row9.RowNum, 3, 3, ObtenerPorcCargadoABajaCarga() + "%", negrita, 0, 0, 0, 0, false);

            ICellStyle esqSupIzq = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.None, BorderStyle.Medium, BorderStyle.None);
            ICellStyle esqSupDer = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.None, BorderStyle.None, BorderStyle.Medium);

            ICellStyle conMargenSup = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle conMargenInf = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.Medium, BorderStyle.None, BorderStyle.None);
            ICellStyle conMargenIzq = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.Medium, BorderStyle.None);
            ICellStyle conMargenDer = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.Medium);

            ICellStyle sinMargen = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle sinMargenDer = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None);
            ICellStyle sinMargenizqDer = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None, BorderStyle.None);
            ICellStyle sinMargenIzq = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None, BorderStyle.Medium);

            ICellStyle esqInfIzq = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None);
            ICellStyle esqInfDer = CrearEstiloCelda(_sheetRitmos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.Medium, BorderStyle.None, BorderStyle.Medium);

            inicio++;
            IRow row10 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);

            CrearCelda(_sheetRitmos, row10, row10.RowNum, row10.RowNum, 1, 2, "Paradas Operativas Puerto: ", esqSupIzq, 2, 0, 2, 0, false);
            var tiempoOP = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "OP" });
            CrearCelda(_sheetRitmos, row10, row10.RowNum, row10.RowNum, 3, 3, tiempoOP, conMargenSup, 2, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row10, row10.RowNum, row10.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "OP") + "%", esqSupDer, 2, 0, 0, 2, false);

            CrearCelda(_sheetRitmos, row10, row10.RowNum, row10.RowNum, 6, 7, "% Cargado a baja carga: ", esqSupIzq, 2, 0, 2, 0, false);
            CrearCelda(_sheetRitmos, row10, row10.RowNum, row10.RowNum, 8, 8, ObtenerPorcCargadoABajaCarga() + "%", esqSupDer, 2, 0, 0, 2, false);

            inicio++;
            IRow row11 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row11, row11.RowNum, row11.RowNum, 1, 2, "Paradas Operativas Buque: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoOB = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "OB" });
            CrearCelda(_sheetRitmos, row11, row11.RowNum, row11.RowNum, 3, 3, tiempoOB, sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row11, row11.RowNum, row11.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "OB") + "%", conMargenDer, 0, 0, 0, 2, false);

            CrearCelda(_sheetRitmos, row11, row11.RowNum, row11.RowNum, 6, 7, "% Baja Carga por Buque:", conMargenIzq, 0, 0, 2, 0, false);
            CrearCelda(_sheetRitmos, row11, row11.RowNum, row11.RowNum, 8, 8, ObtenerPorcBalanzaPorMotivoSigla(bajasCargas, "BCB") + "%", conMargenDer, 0, 0, 0, 2, false);

            inicio++;
            IRow row12 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row12, row12.RowNum, row12.RowNum, 1, 2, "Paradas Mecánicas: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoM = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "M" });
            CrearCelda(_sheetRitmos, row12, row12.RowNum, row12.RowNum, 3, 3, tiempoM, sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row12, row12.RowNum, row12.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "M") + "%", conMargenDer, 0, 0, 0, 2, false);

            CrearCelda(_sheetRitmos, row12, row12.RowNum, row12.RowNum, 6, 7, "% Baja Carga por MOA:", conMargenIzq, 0, 0, 2, 0, false);
            CrearCelda(_sheetRitmos, row12, row12.RowNum, row12.RowNum, 8, 8, ObtenerPorcBalanzaPorMotivoSigla(bajasCargas, "BCP") + "%", conMargenDer, 0, 0, 0, 2, false);

            inicio++;
            IRow row13 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row13, row13.RowNum, row13.RowNum, 1, 2, "Paradas Eléctricas: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoE = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "E" });
            CrearCelda(_sheetRitmos, row13, row13.RowNum, row13.RowNum, 3, 3, tiempoE, sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row13, row13.RowNum, row13.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "E") + "%", conMargenDer, 0, 0, 0, 2, false);

            CrearCelda(_sheetRitmos, row13, row13.RowNum, row13.RowNum, 6, 7, "% Baja Carga Fulleo:", esqInfIzq, 0, 2, 2, 0, false);
            CrearCelda(_sheetRitmos, row13, row13.RowNum, row13.RowNum, 8, 8, ObtenerPorcBalanzaPorMotivoSigla(bajasCargas, "F") + "%", esqInfDer, 0, 2, 0, 2, false);

            inicio++;
            IRow row14 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row14, row14.RowNum, row14.RowNum, 1, 2, "Paradas por Habilitación: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoH = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "H" });
            CrearCelda(_sheetRitmos, row14, row14.RowNum, row14.RowNum, 3, 3, tiempoH, sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row14, row14.RowNum, row14.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "H") + "%", conMargenDer, 0, 0, 0, 2, false);

            inicio++;
            IRow row15 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row15, row15.RowNum, row15.RowNum, 1, 2, "Espera Determinante: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoT = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "T" });
            CrearCelda(_sheetRitmos, row15, row15.RowNum, row15.RowNum, 3, 3, tiempoT, sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetRitmos, row15, row15.RowNum, row15.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "T") + "%", conMargenDer, 0, 0, 0, 2, false);

            var porcTiempoCargando = ObtenerPorcTiempoCargando();
            CrearCelda(_sheetRitmos, row15, row15.RowNum, row15.RowNum, 6, 7, "% de tiempo Cargando", esqSupIzq, 2, 0, 2, 0, false);
            CrearCelda(_sheetRitmos, row15, row15.RowNum, row15.RowNum, 8, 8, porcTiempoCargando + "%", esqSupDer, 2, 0, 0, 2, false);

            inicio++;
            IRow row16 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, row16, row16.RowNum, row16.RowNum, 1, 2, "Parada por 3ro: ", esqInfIzq, 0, 2, 2, 0, false);
            var tiempo3ro = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "3ro" });
            CrearCelda(_sheetRitmos, row16, row16.RowNum, row16.RowNum, 3, 3, tiempo3ro, conMargenInf, 0, 2, 0, 0, false);
            CrearCelda(_sheetRitmos, row16, row16.RowNum, row16.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "3ro") + "%", esqInfDer, 0, 2, 0, 2, false);

            CrearCelda(_sheetRitmos, row16, row16.RowNum, row16.RowNum, 6, 7, "% de tiempo Parado ", esqInfIzq, 0, 2, 2, 0, false);
            CrearCelda(_sheetRitmos, row16, row16.RowNum, row16.RowNum, 8, 8, (100 - porcTiempoCargando) + "%", esqInfDer, 0, 2, 0, 2, false);

            inicio++;
            IRow row17 = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            var motivos = new List<string> { "OP", "OB", "M", "E", "H", "T", "3ro" };
            CrearCelda(_sheetRitmos, row17, row17.RowNum, row17.RowNum, 1, 2, "TOTAL HORAS PARADAS", sinMargenDer, 2, 2, 2, 0, false);
            var tiempoTotalAllMotivos = ObtenerTiempoTotalPorMotivo(cortes, motivos);
            CrearCelda(_sheetRitmos, row17, row17.RowNum, row17.RowNum, 3, 3, tiempoTotalAllMotivos, sinMargenizqDer, 2, 2, 0, 0, false);
            CrearCelda(_sheetRitmos, row17, row17.RowNum, row17.RowNum, 4, 4, ObtenerPorcTotalHsParadas(cortes, motivos) + "%", sinMargenIzq, 2, 2, 0, 2, false);

            //Creamos una linea para ingresar observaciones
            inicio += 2;
            IRow rowIndex = _sheetRitmos.GetRow(inicio) ?? _sheetRitmos.CreateRow(inicio);
            CrearCelda(_sheetRitmos, rowIndex, rowIndex.RowNum, rowIndex.RowNum, 0, 16, _modCarga.ObservacionPlanilla ?? string.Empty, texto, 1, 1, 1, 1, false);
        }

        private void SetearAnchoColumnasHoja2()
        {
            //Seteo anchos Bza 7  tabla
            SetAnchoCol(_sheetRitmos, 0, 6);
            SetAnchoCol(_sheetRitmos, 1, 14);
            SetAnchoCol(_sheetRitmos, 2, 14);
            SetAnchoCol(_sheetRitmos, 3, 14);
            SetAnchoCol(_sheetRitmos, 4, 9);
            SetAnchoCol(_sheetRitmos, 5, 9);

            //Seteo anchos Bza 8  tabla
            SetAnchoCol(_sheetRitmos, 7, 6);
            SetAnchoCol(_sheetRitmos, 8, 14);
            SetAnchoCol(_sheetRitmos, 9, 14);
            SetAnchoCol(_sheetRitmos, 10, 14);
            SetAnchoCol(_sheetRitmos, 11, 9);
            SetAnchoCol(_sheetRitmos, 12, 9);

            //Detalles evento
            SetAnchoCol(_sheetRitmos, 6, 28);
            SetAnchoCol(_sheetRitmos, 15, 28);
        }

        #region FUNCIONES AUXILIARES PARA OBTENCIONES Y CALCULOS DE HOJA RITMOS

        private string ObtenerDestinoEmbarque()
        {
            var destinos = _nominaciones?
            .SelectMany(nom => nom.NominacionDatoTecnico?.NominacionDatoTecnicoDestino)
            .Select(destino => destino.Destino?.Nombre)
            .Distinct()
            .ToList();

            return string.Join(", ", destinos);
        }

        private string ObtenerMaterialesEmbarque()
        {
            var materiales = _nominaciones?
            .Select(nom => nom.NominacionDatoTecnico?.MaterialPuerto?.Descripcion)
            .Distinct()
            .ToList();

            return string.Join(", ", materiales);
        }

        private string ObtenerExportadoresEmbarque()
        {
            var exportadores = _nominaciones?
            .SelectMany(nom => nom.NominacionDatoTecnico?.NominacionDatoTecnicoExportador)
            .Select(exportador => exportador.Exportador?.Nombre)
            .Distinct()
            .ToList();

            return string.Join(", ", exportadores);
        }

        private string ObtenerBandera()
        {
            return (_nominaciones != null && _nominaciones.Count > 0)
                    ? _nominaciones[0].NominacionDatoTecnico?.VaporInformacion?.Bandera?.Nombre
                    : "";
        }

        private int ObtenerTotalEmbarque()
        {
            var total = _nominaciones
            .Sum(nom => (int)nom.NominacionDatoTecnico?.CantidadTotal);

            return total;
        }

        private TimeSpan? ObtenerTiempoTtalEmb()
        {
            var fecComienzoCarga = _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaComienzoCarga;
            var fecFinCarga = _modCarga.ModuloDeCargaPeriodoDeCarga[0]?.FechaFinalizacionCarga;
            if (fecComienzoCarga == null || fecFinCarga == null)
                return null;
            TimeSpan horaInicio = TimeSpan.ParseExact(_modCarga.ModuloDeCargaPeriodoDeCarga[0].HoraComienzoCarga, "hh\\:mm", CultureInfo.InvariantCulture);
            DateTime fechaIni = fecComienzoCarga.Value.Add(horaInicio);

            TimeSpan horaFin = TimeSpan.ParseExact(_modCarga.ModuloDeCargaPeriodoDeCarga[0].HoraFinalizacionCarga, "hh\\:mm", CultureInfo.InvariantCulture);
            DateTime fechaFin = fecFinCarga.Value.Add(horaFin);

            return fechaFin - fechaIni;
        }

        private string ObtenerFechaBzaFormateada(string fecha, string hora)
        {
            if (string.IsNullOrEmpty(fecha) && string.IsNullOrEmpty(hora)) { return string.Empty; }
            return DateTime.Parse(fecha).ToString("dd/MM") + " " + hora;
        }

        private TimeSpan ObtenerTiempo(BalanzaManualDto bza)
        {
            if (string.IsNullOrEmpty(bza.FechaInicio) || string.IsNullOrEmpty(bza.HoraInicio) || string.IsNullOrEmpty(bza.FechaCorte) || string.IsNullOrEmpty(bza.HoraCorte))
                return TimeSpan.Zero;
            var inicio = DateTime.Parse(bza.FechaInicio + " " + bza.HoraInicio);
            var corte = DateTime.Parse(bza.FechaCorte + " " + bza.HoraCorte);
            TimeSpan diferencia = corte.Subtract(inicio);
            var dif = new TimeSpan((int)diferencia.TotalHours, diferencia.Minutes, diferencia.Seconds);
            return dif;
        }

        private double ObtenerReBza(string nroBza)
        {
            var totalTn = ObtenerTotalCargasPorBalanza(nroBza);
            var tiempoTotal = ObtenerTiempoTtalBzas(_balanzasManual.Where(b => b.NumeroBalanza == nroBza && !b.CorteManual).ToList()).TotalHours;
            if (tiempoTotal == 0)
                return 0;

            return (totalTn / tiempoTotal);
        }

        private double ObtenerTotalCargasPorBalanza(string nroBza)
        {
            return _planilla.Sum(x => x.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Where(z => z.BalanzaPuerto.CodigoBalanza == nroBza).Sum(y => y.Cantidad / 1000));
        }

        private int ObtenerTotalBajasCargasPorBalanza(string nroBza)
        {
            return (int)_balanzasManual.Where(b => b.NumeroBalanza == nroBza && !b.CorteManual && !b.CargaNormal).Sum(x => x.Toneladas);
        }

        private double ObtenerRitmoABajaCarga()
        {
            int totalBc7 = ObtenerTotalBajasCargasPorBalanza("7");
            int totalBc8 = ObtenerTotalBajasCargasPorBalanza("8");
            int tnTotalesBc = totalBc7 + totalBc8;
            double hsTot = ObtenerTiempoTtalBzas(_balanzasManual.Where(b => !b.CorteManual && !b.CargaNormal).ToList()).TotalMinutes / 60D;
            if (hsTot == 0)
                return 0;
            var ritmoBc = Math.Round(((totalBc7 + totalBc8) / (hsTot)), 2);
            return ritmoBc;
        }

        private TimeSpan ObtenerTiempoTtalBzas(List<BalanzaManualDto> balanzas)
        {
            var tiempoTotal = TimeSpan.Zero;
            foreach (var bc in balanzas)
            {  
                TimeSpan tiempo = ObtenerTiempo(bc);
                tiempoTotal = tiempoTotal.Add(tiempo);
            }
            return tiempoTotal;
        }

        private int ObtenerPorcCargadoABajaCarga()
        {
            //De todo lo cargado que % es baja carga.
            int totalCargado = _planilla.Sum(x => x.ModuloDeCargaPlanillaDeTurnosDetallesSolido.Sum(y => y.Cantidad / 1000));
            int totalBajaCarga = ObtenerTotalBajasCargasPorBalanza("7") + ObtenerTotalBajasCargasPorBalanza("8");

            return ((totalBajaCarga * 100) / totalCargado);
        }

        private TimeSpan ObtenerTiempoTotalPorMotivo(List<BalanzaManualDto> balanzas, List<string> siglas)
        {
            var balanzasFiltradas = siglas != null ? balanzas.Where(b => siglas.Contains(b.MotivosFallasBalanza.Siglas)).ToList()
            : balanzas.ToList();
            var sumaTiempo = new TimeSpan();

            foreach (var bal in balanzasFiltradas)
            {
                sumaTiempo = sumaTiempo.Add(ObtenerTiempo(bal));
            }

            return sumaTiempo;
        }

        private int ObtenerPorcTotalHsParadas(List<BalanzaManualDto> cortes, List<string> siglas)
        {
            var totalCortes = cortes.Count();
            if (totalCortes == 0)
            {
                return 0;
            }

            var porcTotal = 0;
            foreach (string motivo in siglas)
            {
                var totalCortesMotivo = cortes.Where(c => c.MotivosFallasBalanza.Siglas == motivo).Count();
                porcTotal += ((totalCortesMotivo * 100) / totalCortes);
            }
            return porcTotal;
        }

        private int ObtenerPorcTiempoCargando()
        {
            double porc = 0;
            var totalHs = ObtenerTiempoTotalPorMotivo(_balanzasManual.ToList(), null); 
            var totalCargando = ObtenerTiempoTotalPorMotivo(_balanzasManual.Where(b => b.CorteManual == false).ToList(), null);
            porc = (totalCargando.TotalHours * 100) / totalHs.TotalHours;
            return (int)porc;
        }

        private int ObtenerPorcTiempoParado()
        {
            double porc = 0;
            var totalHs = ObtenerTiempoTotalPorMotivo(_balanzasManual.ToList(), null);
            var totalHsParado = ObtenerTiempoTotalPorMotivo(_balanzasManual.Where(b => b.CorteManual == true).ToList(), null);
            porc = (totalHsParado.TotalHours * 100) / totalHs.TotalHours;
            return (int)porc;
        }

        private int ObtenerPorcBalanzaPorMotivoSigla(List<BalanzaManualDto> balanzas, string sigla)
        {
            var totalHs = ObtenerTiempoTotalPorMotivo(balanzas.ToList(), null);
            if (totalHs.TotalHours == 0)
                return 0;
            var totalHsMotivo = ObtenerTiempoTotalPorMotivo(balanzas.Where(c => c.MotivosFallasBalanza.Siglas == sigla).ToList(), null);
            return (int)((totalHsMotivo.TotalHours * 100) / totalHs.TotalHours);
        }

        #endregion FUNCIONES AUXILIARES PARA OBTENCIONES Y CALCULOS DE HOJA RITMOS

        private void ArmadoCuerpoDatos()
        {
            IRow row2 = _sheetDatos.GetRow(1) ?? _sheetDatos.CreateRow(1);

            ICellStyle estiloTexto = CrearEstiloCelda(_sheetDatos, "Arial", 11, IndexedColors.Black.Index, true,
               IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);

            ICellStyle estiloTextoHs = CrearEstiloCelda(_sheetDatos, "Arial", 11, IndexedColors.Black.Index, true,
              IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);


            ICellStyle esqSupIzq = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.None, BorderStyle.Medium, BorderStyle.None);
            ICellStyle esqSupDer = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.None, BorderStyle.None, BorderStyle.Medium);

            ICellStyle conMargenSup = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle conMargenInf = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.Medium, BorderStyle.None, BorderStyle.None);
            ICellStyle conMargenIzq = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.Medium, BorderStyle.None);
            ICellStyle conMargenDer = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.Medium);

            ICellStyle sinMargen = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle sinMargenDer = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None);
            ICellStyle sinMargenizqDer = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None, BorderStyle.None);
            ICellStyle sinMargenIzq = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None, BorderStyle.Medium);

            ICellStyle esqInfIzq = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.Medium, BorderStyle.Medium, BorderStyle.None);
            ICellStyle esqInfDer = CrearEstiloCelda(_sheetDatos, "Calibri", 11, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.None, BorderStyle.Medium, BorderStyle.None, BorderStyle.Medium);


            CrearCelda(_sheetDatos, row2, 1, 1, 1, 1, "Total A Bordo", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row2, 1, 1, 2, 2, (double)ObtenerTotalEmbarque(), estiloTexto, 0, 0, 0, 0, false, null);

            IRow row4 = _sheetDatos.GetRow(3) ?? _sheetDatos.CreateRow(3);
            CrearCelda(_sheetDatos, row4, 3, 3, 1, 1, "Total por pala", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row4, 3, 3, 2, 2, (double)_totalPala, estiloTexto, 0, 0, 0, 0, false, null);

            IRow row5 = _sheetDatos.GetRow(4) ?? _sheetDatos.CreateRow(4);
            CrearCelda(_sheetDatos, row5, 4, 4, 1, 1, "Total por gravedad", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row5, 4, 4, 2, 2, (double)_totalGravedad, estiloTexto, 0, 0, 0, 0, false, null);

            CrearCelda(_sheetDatos, row2, 1, 1, 4, 4, "Cantidades por producto", estiloTexto, 0, 0, 0, 0, false, null);

            IRow row3 = _sheetDatos.GetRow(2) ?? _sheetDatos.CreateRow(2);
            CrearCelda(_sheetDatos, row3, 2, 2, 4, 4, "Harina de Soja", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row3, 2, 2, 5, 5, "Pellet cáscara de soja", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row3, 2, 2, 6, 6, "Pellet de Girasol / Pellet Girasol Integral", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row3, 2, 2, 7, 7, "Maiz", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row3, 2, 2, 8, 8, "Trigo", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row3, 2, 2, 9, 9, "Poroto Soja / Poroto Soja low Pro", estiloTexto, 0, 0, 0, 0, false, null);

            CrearCelda(_sheetDatos, row4, 3, 3, 4, 4, "(SBMHP)", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row4, 3, 3, 5, 5, "(SBH)", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row4, 3, 3, 6, 6, "(SFPMP / SFPLP)", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row4, 3, 3, 7, 7, "(CORN)", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row4, 3, 3, 8, 8, "(WHEAT)", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row4, 3, 3, 9, 9, "(SB / SBMLP)", estiloTexto, 0, 0, 0, 0, false, null);

            CrearCelda(_sheetDatos, row5, 4, 4, 4, 4, TnSegunMateriales(new List<string> { "SBMHP" }), estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row5, 4, 4, 5, 5, TnSegunMateriales(new List<string> { "SBH" }), estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row5, 4, 4, 6, 6, TnSegunMateriales(new List<string> { "SFPMP", "SFPLP" }), estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row5, 4, 4, 7, 7, TnSegunMateriales(new List<string> { "CORN" }), estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row5, 4, 4, 8, 8, TnSegunMateriales(new List<string> { "WHEAT" }), estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row5, 4, 4, 9, 9, TnSegunMateriales(new List<string> { "SB", "SBMLP" }), estiloTexto, 0, 0, 0, 0, false, null);

            IRow row7 = _sheetDatos.GetRow(6) ?? _sheetDatos.CreateRow(6);
            CrearCelda(_sheetDatos, row7, 6, 6, 1, 2, "Ritmo de Embarque (RE):", estiloTexto, 0, 0, 0, 0, false, null);

            IRow row8 = _sheetDatos.GetRow(7) ?? _sheetDatos.CreateRow(7);
            CrearCelda(_sheetDatos, row8, 7, 7, 1, 1, "RE Bza 7", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row8, 7, 7, 2, 2, (double)_ritmos.RitmoBalanza7, estiloTexto, 0, 0, 0, 0, false, null);

            IRow row9 = _sheetDatos.GetRow(8) ?? _sheetDatos.CreateRow(8);
            CrearCelda(_sheetDatos, row9, 8, 8, 1, 1, "RE Bza 8", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row9, 8, 8, 2, 2, (double)_ritmos.RitmoBalanza8, estiloTexto, 0, 0, 0, 0, false, null);

            IRow row10 = _sheetDatos.GetRow(9) ?? _sheetDatos.CreateRow(9);
            CrearCelda(_sheetDatos, row10, 9, 9, 1, 1, "RE Buque", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row10, 9, 9, 2, 2, (double)_ritmos.RitmoCargaBruto, estiloTexto, 0, 0, 0, 0, false, null);

            IRow row11 = _sheetDatos.GetRow(10) ?? _sheetDatos.CreateRow(10);
            CrearCelda(_sheetDatos, row11, 10, 10, 1, 1, "Ritmo Neto", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row11, 10, 10, 2, 2, (double)_ritmos.RitmoCargaNeto, estiloTexto, 0, 0, 0, 0, false, null);

            IRow row14 = _sheetDatos.GetRow(13) ?? _sheetDatos.CreateRow(13);
            CrearCelda(_sheetDatos, row14, 13, 13, 1, 2, "Información Adicional", estiloTexto, 0, 0, 0, 0, false, null);
            
            var cortes = _balanzasManual.Where(b => b.CorteManual == true).ToList();
            var bajasCargas = _balanzasManual.Where(b => b.CorteManual == false && b.CargaNormal == false).ToList();

            var tiempoTotalBc = ObtenerTiempoTtalBzas(bajasCargas);

            IRow row15 = _sheetDatos.GetRow(14) ?? _sheetDatos.CreateRow(14);
            CrearCelda(_sheetDatos, row15, 14, 14, 1, 2, "Ritmo a Baja Carga:", estiloTexto, 0, 0, 0, 0, false, null);
            CrearCelda(_sheetDatos, row15, row15.RowNum, row15.RowNum, 3, 3, ObtenerRitmoABajaCarga(), estiloTexto, 0, 0, 0, 0, false);

            CrearCelda(_sheetDatos, row15, row15.RowNum, row15.RowNum, 4, 4, tiempoTotalBc, estiloTextoHs, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, row15, row15.RowNum, row15.RowNum, 5, 6, "Horas a Baja carga, suma las dos manos", estiloTexto, 0, 0, 0, 0, false);

            IRow row16 = _sheetDatos.GetRow(15) ?? _sheetDatos.CreateRow(15);

            CrearCelda(_sheetDatos, row16, row16.RowNum, row16.RowNum, 1, 2, "% Cargado a Baja Carga: ", estiloTexto, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, row16, row16.RowNum, row16.RowNum, 3, 3, (double)ObtenerPorcCargadoABajaCarga(), estiloTexto, 0, 0, 0, 0, false);

            //Tablas cortes y bc
            int inicio = 16;

            IRow row17 = _sheetDatos.GetRow(inicio) ?? _sheetDatos.CreateRow(inicio);
            CrearCelda(_sheetDatos, row17, row17.RowNum, row17.RowNum, 1, 2, "Paradas Operativas Puerto: ", esqSupIzq, 2, 0, 2, 0, false);
            var tiempoOP = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "OP" });
            CrearCelda(_sheetDatos, row17, row17.RowNum, row17.RowNum, 3, 3, tiempoOP, conMargenSup, 2, 0, 0, 0, false);
            CrearCelda(_sheetDatos, row17, row17.RowNum, row17.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "OP"), esqSupDer, 2, 0, 0, 2, false);

            CrearCelda(_sheetDatos, row17, row17.RowNum, row17.RowNum, 6, 6, "% Cargado a baja carga: ", esqSupIzq, 2, 0, 2, 0, false);
            CrearCelda(_sheetDatos, row17, row17.RowNum, row17.RowNum, 7, 7, ObtenerPorcCargadoABajaCarga(), esqSupDer, 2, 0, 0, 2, false);

            inicio++;
            IRow row18 = _sheetDatos.GetRow(inicio) ?? _sheetDatos.CreateRow(inicio);
            CrearCelda(_sheetDatos, row18, row18.RowNum, row18.RowNum, 1, 2, "Paradas Operativas Buque: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoOB = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "OB" });
            CrearCelda(_sheetDatos, row18, row18.RowNum, row18.RowNum, 3, 3, tiempoOB, sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, row18, row18.RowNum, row18.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "OB"), conMargenDer, 0, 0, 0, 2, false);

            CrearCelda(_sheetDatos, row18, row18.RowNum, row18.RowNum, 6, 6, "% Baja Carga por Buque:", conMargenIzq, 0, 0, 2, 0, false);
            CrearCelda(_sheetDatos, row18, row18.RowNum, row18.RowNum, 7, 7, ObtenerPorcBalanzaPorMotivoSigla(bajasCargas, "BCB"), conMargenDer, 0, 0, 0, 2, false);

            inicio++;
            IRow row19 = _sheetDatos.GetRow(inicio) ?? _sheetDatos.CreateRow(inicio);
            CrearCelda(_sheetDatos, row19, row19.RowNum, row19.RowNum, 1, 2, "Paradas Mecánicas: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoM = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "M" });
            CrearCelda(_sheetDatos, row19, row19.RowNum, row19.RowNum, 3, 3, tiempoM, sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, row19, row19.RowNum, row19.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "M"), conMargenDer, 0, 0, 0, 2, false);

            CrearCelda(_sheetDatos, row19, row19.RowNum, row19.RowNum, 6, 6, "% Baja Carga por MOA:", conMargenIzq, 0, 0, 2, 0, false);
            CrearCelda(_sheetDatos, row19, row19.RowNum, row19.RowNum, 7, 7, ObtenerPorcBalanzaPorMotivoSigla(bajasCargas, "BCP"), conMargenDer, 0, 0, 0, 2, false);

            inicio++;
            IRow row20 = _sheetDatos.GetRow(inicio) ?? _sheetDatos.CreateRow(inicio);
            CrearCelda(_sheetDatos, row20, row20.RowNum, row20.RowNum, 1, 2, "Paradas Eléctricas: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoE = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "E" });
            CrearCelda(_sheetDatos, row20, row20.RowNum, row20.RowNum, 3, 3, tiempoE, sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, row20, row20.RowNum, row20.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "E"), conMargenDer, 0, 0, 0, 2, false);

            CrearCelda(_sheetDatos, row20, row20.RowNum, row20.RowNum, 6, 6, "% Baja Carga Fulleo:", esqInfIzq, 0, 2, 2, 0, false);
            CrearCelda(_sheetDatos, row20, row20.RowNum, row20.RowNum, 7, 7, ObtenerPorcBalanzaPorMotivoSigla(bajasCargas, "F"), esqInfDer, 0, 2, 0, 2, false);

            inicio++;
            IRow row21 = _sheetDatos.GetRow(inicio) ?? _sheetDatos.CreateRow(inicio);
            CrearCelda(_sheetDatos, row21, row21.RowNum, row21.RowNum, 1, 2, "Paradas por Habilitación: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoH = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "H" });
            CrearCelda(_sheetDatos, row21, row21.RowNum, row21.RowNum, 3, 3, tiempoH, sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, row21, row21.RowNum, row21.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "H"), conMargenDer, 0, 0, 0, 2, false);

            inicio++;
            IRow row22 = _sheetDatos.GetRow(inicio) ?? _sheetDatos.CreateRow(inicio);
            CrearCelda(_sheetDatos, row22, row22.RowNum, row22.RowNum, 1, 2, "Espera Determinante: ", conMargenIzq, 0, 0, 2, 0, false);
            var tiempoT = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "T" });
            CrearCelda(_sheetDatos, row22, row22.RowNum, row22.RowNum, 3, 3, tiempoT, sinMargen, 0, 0, 0, 0, false);
            CrearCelda(_sheetDatos, row22, row22.RowNum, row22.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "T"), conMargenDer, 0, 0, 0, 2, false);

            var porcTiempoCargando = ObtenerPorcTiempoCargando();
            CrearCelda(_sheetDatos, row22, row22.RowNum, row22.RowNum, 6, 6, "% de tiempo Cargando", esqSupIzq, 2, 0, 2, 0, false);
            CrearCelda(_sheetDatos, row22, row22.RowNum, row22.RowNum, 7, 7, porcTiempoCargando, esqSupDer, 2, 0, 0, 2, false);

            inicio++;
            IRow row23 = _sheetDatos.GetRow(inicio) ?? _sheetDatos.CreateRow(inicio);
            CrearCelda(_sheetDatos, row23, row23.RowNum, row23.RowNum, 1, 2, "Parada por 3ro: ", esqInfIzq, 0, 2, 2, 0, false);
            var tiempo3ro = ObtenerTiempoTotalPorMotivo(cortes, new List<string> { "3ro" });
            CrearCelda(_sheetDatos, row23, row23.RowNum, row23.RowNum, 3, 3, tiempo3ro, conMargenInf, 0, 2, 0, 0, false);
            CrearCelda(_sheetDatos, row23, row23.RowNum, row23.RowNum, 4, 4, ObtenerPorcBalanzaPorMotivoSigla(cortes, "3ro"), esqInfDer, 0, 2, 0, 2, false);

            CrearCelda(_sheetDatos, row23, row23.RowNum, row23.RowNum, 6, 6, "% de tiempo Parado ", esqInfIzq, 0, 2, 2, 0, false);
            CrearCelda(_sheetDatos, row23, row23.RowNum, row23.RowNum, 7, 7, (100 - porcTiempoCargando) , esqInfDer, 0, 2, 0, 2, false);

            inicio++;
            IRow row24 = _sheetDatos.GetRow(inicio) ?? _sheetDatos.CreateRow(inicio);
            var motivos = new List<string> { "OP", "OB", "M", "E", "H", "T", "3ro" };
            CrearCelda(_sheetDatos, row24, row24.RowNum, row24.RowNum, 1, 2, "TOTAL HORAS PARADAS", sinMargenDer, 2, 2, 2, 0, false);
            var tiempoTotalAllMotivos = ObtenerTiempoTotalPorMotivo(cortes, motivos);
            CrearCelda(_sheetDatos, row24, row24.RowNum, row24.RowNum, 3, 3, tiempoTotalAllMotivos, sinMargenizqDer, 2, 2, 0, 0, false);
            CrearCelda(_sheetDatos, row24, row24.RowNum, row24.RowNum, 4, 4, ObtenerPorcTotalHsParadas(cortes, motivos), sinMargenIzq, 2, 2, 0, 2, false);

            //Creamos una linea para ingresar observaciones
            inicio += 2;
            IRow rowIndex = _sheetDatos.GetRow(inicio) ?? _sheetDatos.CreateRow(inicio);
            CrearCelda(_sheetDatos, rowIndex, rowIndex.RowNum, rowIndex.RowNum, 0, 16, _modCarga.ObservacionPlanilla ?? string.Empty, estiloTexto, 1, 1, 1, 1, false);

        }

        private int TnSegunMateriales(List<string> materiales)
        {
            var tn = _planilla.SelectMany(x => x.ModuloDeCargaPlanillaDeTurnosDetallesSolido)
                .Where(p => materiales.Contains(p.MaterialPuerto.DescripcionCortaIngles.ToUpper())).Sum(x => x.Cantidad/1000);
            return tn;
        }
    }
}