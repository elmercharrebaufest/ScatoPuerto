using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    public class ExcelProvisionesGastosNuevo
    {
        private readonly XSSFWorkbook _workbook;
        private readonly XSSFSheet _sheet;
        private readonly ExcelProvisionGastoDatosDto _datos;
        private readonly IList<ConceptoDto> _conceptos;
        private readonly byte[] _dataImg;
        private readonly int _ncolSeparador;
        private readonly XSSFColor _colorGrisClaro;

        public ExcelProvisionesGastosNuevo(ExcelProvisionGastoDatosDto datos)
        {
            _workbook = new XSSFWorkbook();
            _sheet = (XSSFSheet)_workbook.CreateSheet("Provisiones y Gastos");
            _datos = datos;

            var path = System.Web.HttpContext.Current.Server.MapPath("~/iconMolinosChiquito.png");
            _dataImg = File.ReadAllBytes(path);

            _conceptos = datos.DatosExcel
                .SelectMany(x => x.ConceptosTarifas).Select(x => x.Concepto)
                .GroupBy(x => x.Id).Select(g => g.First())
                .OrderBy(x => x.TipoConcepto.Id)
                .ThenBy(x => x.Orden)
                .ToList();

            var totalAcuerdos = _datos.DatosExcel.Select(x => x.Acuerdo).Distinct().Count();
            _ncolSeparador = totalAcuerdos + 3;

            _colorGrisClaro = new XSSFColor(new byte[] { 217, 217, 217 });
        }

        public byte[] GenerarExcel()
        {
            CompletarHoja();
            using (var fileData = new MemoryStream())
            {
                _workbook.Write(fileData);
                return fileData.ToArray();
            }
        }

        public void CompletarHoja()
        {
            var cantIngresos = _conceptos.Count(x => x.TipoConcepto.Descripcion == "Ingreso");
            var cantGastos = _conceptos.Count(x => x.TipoConcepto.Descripcion == "Gasto");
            var cantColsTotales = _ncolSeparador + _datos.DatosExcel.Count + 1;

            var nrow = 11;
            IRow row;
            ICell celda;
            CellRangeAddress cellrange;

            // Título principal
            cellrange = new CellRangeAddress(0, 2, 0, cantColsTotales);
            _sheet.AddMergedRegion(cellrange);
            row = _sheet.GetRow(0) ?? _sheet.CreateRow(0);
            celda = row.CreateCell(0);
            celda.SetCellValue($"Total de ingresos y gastos por Producto: {_datos.Producto} - Periodo: {_datos.Periodo}");
            SetEstilosRange(cellrange, sinBordes: true, negrita: true, centrarH: true, centrarV: true);

            var acuerdosUnicos = _datos.DatosExcel.GroupBy(x => x.Acuerdo).Select(g => g.FirstOrDefault()).ToList();

            ArmarTablaIzquierda(8, cantIngresos, cantGastos, cantColsTotales, acuerdosUnicos);

            ArmarTablaDerecha(4, cantIngresos, cantGastos);

            nrow = 12 + _conceptos.Count;

            ArmarTablaTotales(nrow, cantIngresos, cantGastos);

            // CONVERSION A DOLAR
            nrow = nrow + 7;

            cellrange = new CellRangeAddress(nrow, nrow, 0, cantColsTotales);
            _sheet.AddMergedRegion(cellrange);
            row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
            celda = row.CreateCell(0);
            celda.SetCellValue("CONVERSIÓN A DÓLAR");
            SetEstilosRange(cellrange, sinBordes: true, negrita: true, centrarH: true);

            // Cotización de periodo
            row = _sheet.GetRow(nrow + 3) ?? _sheet.CreateRow(nrow + 3);

            var mes = _datos.Periodo.Split('-')[0];
            celda = row.CreateCell(1);
            celda.SetCellValue($"Cotización de período {mes}");
            SetEstilos(celda, negrita: true, sinBordes: true);

            celda = row.CreateCell(2);
            celda.SetCellValue((double)_datos.CotizacionDolar);
            SetEstilos(celda, sinBordes: true, centrarH: true, dosDecimales: true);

            var refCeldaCotizacion = new CellReference(celda).FormatAsString();

            ArmarTablaIzquierda(nrow + 6, cantIngresos, cantGastos, cantColsTotales, acuerdosUnicos, esDolar: true, refCeldaCotizacion: refCeldaCotizacion);

            ArmarTablaDerecha(nrow + 2, cantIngresos, cantGastos);

            nrow = nrow + 10 + _conceptos.Count;

            ArmarTablaTotales(nrow, cantIngresos, cantGastos, true);

            AjustarColumnas(cantColsTotales);
            InsertarLogo();
        }

        void ArmarTablaIzquierda(int nRowInicial, int cantIngresos, int cantGastos, int cantColsTotales, List<ProvisionGastoDatosExcelDto> acuerdosUnicos, bool esDolar = false, string refCeldaCotizacion = "")
        {
            CellRangeAddress cellrange;
            IRow row;
            ICell celda;

            var nrow = nRowInicial;

            #region Encabezado
            if (esDolar)
            {
                cellrange = new CellRangeAddress(nrow - 1, nrow - 1, 1, _ncolSeparador - 1);
                _sheet.AddMergedRegion(cellrange);
                row = _sheet.GetRow(nrow - 1) ?? _sheet.CreateRow(nrow - 1);
                celda = row.CreateCell(1);
                celda.SetCellValue("TARIFARIO CONVERTIDO A DOLAR");
                SetEstilosRange(cellrange, sinBordes: true, negrita: true, centrarH: true);
            }

            cellrange = new CellRangeAddress(nrow, nrow, 1, _ncolSeparador - 1);
            _sheet.AddMergedRegion(cellrange);
            row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
            celda = row.CreateCell(1);
            celda.SetCellValue($"Precio Tarifa {_datos.Periodo} (conceptos)");
            SetEstilosRange(cellrange, sup: true, der: true, izq: true, negrita: true, centrarH: true);

            nrow++;

            cellrange = new CellRangeAddress(nrow, nrow + 1, 1, 1);
            _sheet.AddMergedRegion(cellrange);
            row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
            celda = row.CreateCell(1);
            celda.SetCellValue("CONCEPTOS");
            SetEstilosRange(cellrange, inf: true, izq: true, negrita: true, centrarH: true, centrarV: true);

            cellrange = new CellRangeAddress(nrow, nrow, 2, _ncolSeparador - 2);
            _sheet.AddMergedRegion(cellrange);
            row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
            celda = row.CreateCell(2);
            celda.SetCellValue("ACUERDOS");
            SetEstilosRange(cellrange, negrita: true, centrarH: true);

            cellrange = new CellRangeAddress(nrow, nrow + 1, _ncolSeparador - 1, _ncolSeparador - 1);
            _sheet.AddMergedRegion(cellrange);
            row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
            celda = row.CreateCell(_ncolSeparador - 1);
            celda.SetCellValue("Moneda");
            SetEstilosRange(cellrange, der: true, inf: true, negrita: true, centrarH: true, centrarV: true);
            #endregion

            nrow = nrow + 2;

            #region Columna INGRESOS / GASTOS
            if (cantIngresos > 0)
            {
                cellrange = new CellRangeAddress(nrow, nrow + cantIngresos - 1, 0, 0);
                _sheet.AddMergedRegion(cellrange);
                row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
                celda = row.CreateCell(0);
                celda.SetCellValue("INGRESOS");
                SetEstilosRange(cellrange, sup: true, der: true, inf: true, izq: true, centrarH: true, centrarV: true);

                nrow = nrow + cantIngresos;
            }

            if (cantGastos > 0)
            {
                cellrange = new CellRangeAddress(nrow, nrow + cantGastos - 1, 0, 0);
                _sheet.AddMergedRegion(cellrange);
                row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
                celda = row.CreateCell(0);
                celda.SetCellValue("GASTOS");
                SetEstilosRange(cellrange, sup: true, der: true, inf: true, izq: true, centrarH: true, centrarV: true);
            }
            #endregion

            // Columna conceptos
            nrow = nRowInicial + 3;
            for (int i = 0; i < _conceptos.Count; i++)
            {
                var concepto = _conceptos[i];
                var sup = i == 0 || i == cantIngresos; // primer ingreso o primer gasto
                var inf = i == cantIngresos - 1 || i == _conceptos.Count - 1; // ultimo ingreso o ultimo gasto
                var fondo = i % 2 == 1;

                // Nombre concepto
                row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
                celda = row.CreateCell(1);
                celda.SetCellValue(concepto.Descripcion);
                SetEstilos(celda, sup: sup, inf: inf, izq: true, fondo: fondo, centrarH: true);

                var moneda = esDolar ? "Dolares" : concepto.Moneda.Descripcion;
                // Moneda izquierda
                celda = row.CreateCell(_ncolSeparador - 1);
                celda.SetCellValue(moneda);
                SetEstilos(celda, sup: sup, der: true, inf: inf, fondo: fondo, centrarH: true);

                // Moneda derecha
                celda = row.CreateCell(_ncolSeparador + 1);
                celda.SetCellValue(moneda);
                SetEstilos(celda, sup: sup, inf: inf, izq: true, fondo: fondo, centrarH: true);
                nrow++;
            }


            // Columna por acuerdo
            for (int i = 0; i < acuerdosUnicos.Count; i++)
            {
                nrow = nRowInicial + 2;
                var ncol = i + 2;
                row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
                var acuerdo = acuerdosUnicos[i];

                // Nombre acuerdo
                celda = row.CreateCell(ncol);
                celda.SetCellValue(acuerdo.Acuerdo);
                SetEstilos(celda, inf: true, centrarH: true);

                // Valores por concepto
                for (var j = 0; j < _conceptos.Count; j++)
                {
                    var concepto = _conceptos[j];
                    var sup = j == 0 || j == cantIngresos; // primer ingreso o primer gasto
                    var inf = j == cantIngresos - 1 || j == _conceptos.Count - 1; // ultimo ingreso o ultimo gasto
                    var fondo = j % 2 == 1;

                    nrow = nRowInicial + 3 + j;
                    row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);

                    celda = row.CreateCell(ncol);
                    SetEstilos(celda, sup: sup, inf: inf, fondo: fondo, centrarH: true, dosDecimales: true);

                    var conceptoTarifa = acuerdo.ConceptosTarifas.FirstOrDefault(x => x.Concepto.Id == concepto.Id);
                    // Si no hay tarifa para el concepto, o si el concepto es "Uso de muelle" (que no se cobra), se deja la celda vacía
                    if (conceptoTarifa == null || conceptoTarifa.Concepto.Descripcion == "Uso de muelle") continue;

                    if (esDolar && concepto.Moneda.Descripcion == "Pesos")
                    {
                        celda.SetCellType(CellType.Formula);
                        var celdaValorOriginal = new CellReference(nrow - _conceptos.Count - 17, ncol).FormatAsString();
                        celda.CellFormula = $"{celdaValorOriginal}/{refCeldaCotizacion}";
                    }
                    else
                    {
                        celda.SetCellValue((double)conceptoTarifa.Valor);
                    }
                }
            }
        }

        void ArmarTablaDerecha(int nRowInicial, int cantIngresos, int cantGastos)
        {
            CellRangeAddress cellrange;
            IRow row;
            ICell celda;

            var nrow = nRowInicial;

            #region Encabezado

            var titulos = new[] { "TN:", "Muelle:", "Buque:", "Exportador:", "Nombre Acuerdo:", "Cantidad:" };
            for (int i = 0; i < titulos.Length; i++)
            {
                var sup = i == 0;
                var inf = i == titulos.Length - 1;

                row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
                celda = row.CreateCell(_ncolSeparador + 1);
                celda.SetCellValue(titulos[i]);
                SetEstilos(celda, sup: sup, izq: true, inf: inf, centrarH: true);
                nrow++;
            }

            var gruposEmbarque = _datos.DatosExcel
                .Select((acuerdo, idx) => new { acuerdo, col = _ncolSeparador + 2 + idx })
                .GroupBy(x => x.acuerdo.Embarque_Id)
                .Select(g => new
                {
                    EmbarqueId = g.Key,
                    ColInicio = g.Min(x => x.col),
                    ColFin = g.Max(x => x.col),
                    Muelle = g.FirstOrDefault()?.acuerdo.Muelle,
                    Buque = g.FirstOrDefault()?.acuerdo.Buque,
                }).ToList();

            foreach (var grupo in gruposEmbarque)
            {
                var der = grupo == gruposEmbarque.Last();
                nrow = nRowInicial;

                // TN
                cellrange = new CellRangeAddress(nrow, nrow, grupo.ColInicio, grupo.ColFin);
                _sheet.AddMergedRegion(cellrange);
                row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
                celda = row.CreateCell(grupo.ColInicio);
                celda.SetCellType(CellType.Formula);
                var celdaInicio = new CellReference(nrow + 5, grupo.ColInicio).FormatAsString();
                var celdaFin = new CellReference(nrow + 5, grupo.ColFin).FormatAsString();
                celda.CellFormula = $"SUM({celdaInicio}:{celdaFin})";
                SetEstilosRange(cellrange, sup: true, der: der, centrarH: true, dosDecimales: true);
                nrow++;

                // Muelle
                cellrange = new CellRangeAddress(nrow, nrow, grupo.ColInicio, grupo.ColFin);
                _sheet.AddMergedRegion(cellrange);
                row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
                celda = row.CreateCell(grupo.ColInicio);
                celda.SetCellValue(grupo.Muelle);
                SetEstilosRange(cellrange, der: der, centrarH: true);
                nrow++;

                // Buque
                cellrange = new CellRangeAddress(nrow, nrow, grupo.ColInicio, grupo.ColFin);
                _sheet.AddMergedRegion(cellrange);
                row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
                celda = row.CreateCell(grupo.ColInicio);
                celda.SetCellValue(grupo.Buque);
                SetEstilosRange(cellrange, der: der, centrarH: true);
            }

            nrow = nRowInicial + 6;
            // Titulo Moneda
            row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
            celda = row.CreateCell(_ncolSeparador + 1);
            celda.SetCellValue("Moneda");
            SetEstilos(celda, sup: true, inf: true, izq: true, negrita: true, centrarH: true);

            // Titulo Total x TN
            cellrange = new CellRangeAddress(nrow, nrow, _ncolSeparador + 2, _ncolSeparador + 2 + _datos.DatosExcel.Count - 1);
            _sheet.AddMergedRegion(cellrange);
            celda = row.CreateCell(_ncolSeparador + 2);
            celda.SetCellValue("TOTAL CALCULADO POR TONELDAS EMBARCADAS");
            SetEstilosRange(cellrange, sup: true, der: true, inf: true, negrita: true, centrarH: true);
            #endregion

            // Valores y formulas por acuerdo
            for (int i = 0; i < _datos.DatosExcel.Count; i++)
            {
                nrow = nRowInicial + 3;
                var ncol = _ncolSeparador + 2 + i;
                var acuerdo = _datos.DatosExcel[i];
                var der = i == _datos.DatosExcel.Count - 1;

                // Exportador
                celda = _sheet.GetRow(nrow).CreateCell(ncol);
                celda.SetCellValue(acuerdo.Exportador);
                SetEstilos(celda, der: der, centrarH: true);

                nrow++;

                // NombreAcuerdo
                celda = _sheet.GetRow(nrow).CreateCell(ncol);
                celda.SetCellValue(acuerdo.Acuerdo);
                SetEstilos(celda, der: der, centrarH: true);

                nrow++;

                // Cantidad
                celda = _sheet.GetRow(nrow).CreateCell(ncol);
                celda.SetCellValue((double)acuerdo.Cantidad);
                SetEstilos(celda, der: der, inf: true, centrarH: true, dosDecimales: true);

                // Calculo Tarifas * Cantidad
                for (var j = 0; j < _conceptos.Count; j++)
                {
                    var concepto = _conceptos[j];
                    var sup = j == 0 || j == cantIngresos; // primer ingreso o primer gasto
                    var inf = j == cantIngresos - 1 || j == _conceptos.Count - 1; // ultimo ingreso o ultimo gasto
                    var fondo = j % 2 == 1;

                    nrow = nRowInicial + 7 + j;
                    row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);

                    var nColValor = EncontrarColumnaPorValor(_sheet.GetRow(10), acuerdo.Acuerdo);

                    var celdaCantidad = new CellReference(nRowInicial + 5, ncol).FormatAsString();
                    var celdaValor = new CellReference(nrow, nColValor).FormatAsString();

                    celda = row.CreateCell(ncol);
                    celda.SetCellType(CellType.Formula);
                    celda.CellFormula = $"{celdaValor}*{celdaCantidad}";
                    SetEstilos(celda, sup: sup, der: der, inf: inf, fondo: fondo, centrarH: true, dosDecimales: true);
                }
            }
        }

        void ArmarTablaTotales(int nRowInicial, int cantIngresos, int cantGastos, bool esdolar = false)
        {
            CellRangeAddress cellrange;
            IRow row;
            ICell celda;
            var nrow = nRowInicial;

            cellrange = new CellRangeAddress(nrow, nrow, 0, 2);
            _sheet.AddMergedRegion(cellrange);
            row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
            celda = row.CreateCell(0);
            var texto = esdolar ? "Total calculado a dólar (tarifa por toneladas embarcadas)" : "Total de la suma de las tarifas/Tonelada";
            celda.SetCellValue(texto);
            SetEstilosRange(cellrange, sinBordes: true, centrarH: true);

            nrow++;

            // Ingresos
            cellrange = new CellRangeAddress(nrow, nrow + (esdolar ? 0 : 1), 0, 0);
            _sheet.AddMergedRegion(cellrange);
            row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
            celda = row.CreateCell(0);
            celda.SetCellValue("Total INGRESOS:");
            SetEstilosRange(cellrange, sup: true, der: true, inf: true, izq: true, centrarH: true, centrarV: true);

            var nrowInicioIngreso = nRowInicial - _conceptos.Count - 1;
            var ncolInicio = _ncolSeparador + 2;
            var ncolFin = ncolInicio + _datos.DatosExcel.Count - 1;

            var nrowFinIngreso = nrowInicioIngreso + cantIngresos - 1;
            var primerCeldaMonedaIngreso = new CellReference(nrowInicioIngreso, ncolInicio - 1).FormatAsString();
            var ultimaCeldaMonedaIngreso = new CellReference(nrowFinIngreso, ncolInicio - 1).FormatAsString();
            var primerCeldaCalculoIngreso = new CellReference(nrowInicioIngreso, ncolInicio).FormatAsString();
            var ultimaCeldaCalculoIngreso = new CellReference(nrowFinIngreso, ncolFin).FormatAsString();

            if (!esdolar)
            {
                celda = row.CreateCell(1);
                celda.SetCellValue("Pesos:");
                SetEstilos(celda, sup: true, izq: true, centrarH: true);

                celda = row.CreateCell(2);
                if (cantIngresos > 0)
                {
                    celda.SetCellType(CellType.Formula);
                    celda.CellFormula = $"SUMPRODUCT(({primerCeldaMonedaIngreso}:{ultimaCeldaMonedaIngreso}=\"Pesos\")*{primerCeldaCalculoIngreso}:{ultimaCeldaCalculoIngreso})";
                }
                else
                {
                    celda.SetCellValue(0);
                }
                SetEstilos(celda, sup: true, der: true, centrarH: true, dosDecimales: true);

                nrow++;
            }

            row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
            celda = row.CreateCell(1);
            celda.SetCellValue("Dolares:");
            SetEstilos(celda, sup: esdolar, inf: true, izq: true, centrarH: true);

            celda = row.CreateCell(2);
            if (cantIngresos > 0)
            {
                celda.SetCellType(CellType.Formula);
                celda.CellFormula = $"SUMPRODUCT(({primerCeldaMonedaIngreso}:{ultimaCeldaMonedaIngreso}=\"Dolares\")*{primerCeldaCalculoIngreso}:{ultimaCeldaCalculoIngreso})";
            }
            else
            {
                celda.SetCellValue(0);
            }
            SetEstilos(celda, sup: esdolar, der: true, inf: true, centrarH: true, dosDecimales: true);

            nrow++;

            // Gastos
            cellrange = new CellRangeAddress(nrow, nrow + (esdolar ? 0 : 1), 0, 0);
            _sheet.AddMergedRegion(cellrange);
            row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
            celda = row.CreateCell(0);
            celda.SetCellValue("Total GASTOS:");
            SetEstilosRange(cellrange, sup: true, der: true, inf: true, izq: true, centrarH: true, centrarV: true);

            var nrowInicioGasto = nrowFinIngreso + 1;
            var nrowFinGasto = nrowInicioGasto + cantGastos - 1;
            var primerCeldaMonedaGasto = new CellReference(nrowInicioGasto, ncolInicio - 1).FormatAsString();
            var ultimaCeldaMonedaGasto = new CellReference(nrowFinGasto, ncolInicio - 1).FormatAsString();
            var primerCeldaCalculoGasto = new CellReference(nrowInicioGasto, ncolInicio).FormatAsString();
            var ultimaCeldaCalculoGasto = new CellReference(nrowFinGasto, ncolFin).FormatAsString();

            if (!esdolar)
            {
                celda = row.CreateCell(1);
                celda.SetCellValue("Pesos:");
                SetEstilos(celda, sup: true, izq: true, centrarH: true);

                celda = row.CreateCell(2);
                if (cantGastos > 0)
                {
                    celda.SetCellType(CellType.Formula);
                    celda.SetCellFormula($"SUMPRODUCT(({primerCeldaMonedaGasto}:{ultimaCeldaMonedaGasto}=\"Pesos\")*{primerCeldaCalculoGasto}:{ultimaCeldaCalculoGasto})");
                }
                else
                {
                    celda.SetCellValue(0);
                }
                SetEstilos(celda, sup: true, der: true, centrarH: true, dosDecimales: true);

                nrow++;
            }

            row = _sheet.GetRow(nrow) ?? _sheet.CreateRow(nrow);
            celda = row.CreateCell(1);
            celda.SetCellValue("Dolares:");
            SetEstilos(celda, sup: esdolar, inf: true, izq: true, centrarH: true);

            celda = row.CreateCell(2);
            if (cantGastos > 0)
            {
                celda.SetCellType(CellType.Formula);
                celda.SetCellFormula($"SUMPRODUCT(({primerCeldaMonedaGasto}:{ultimaCeldaMonedaGasto}=\"Dolares\")*{primerCeldaCalculoGasto}:{ultimaCeldaCalculoGasto})");
            }
            else
            {
                celda.SetCellValue(0);
            }
            SetEstilos(celda, sup: esdolar, der: true, inf: true, centrarH: true, dosDecimales: true);
        }

        private void InsertarLogo()
        {
            int pictureIndex = _workbook.AddPicture(_dataImg, PictureType.PNG);
            ICreationHelper helper = _workbook.GetCreationHelper();
            IDrawing drawing = _sheet.CreateDrawingPatriarch();
            IClientAnchor anchor = helper.CreateClientAnchor();
            anchor.Col1 = 0; anchor.Row1 = 0;
            IPicture picture = drawing.CreatePicture(anchor, pictureIndex);
            picture.Resize();
        }

        private void AjustarColumnas(int totalColumnas)
        {
            for (int i = 0; i <= totalColumnas; i++)
            {
                _sheet.AutoSizeColumn(i);
                var ancho = Math.Max(_sheet.GetColumnWidth(i), 2000);
                _sheet.SetColumnWidth(i, (int)(ancho * 1.15));
            }
            _sheet.SetColumnWidth(0, 3600); // Columna de INGRESOS/GASTOS con ancho fijo
            _sheet.SetColumnWidth(_ncolSeparador, 400); // Columna separadora con ancho fijo
            AjustarAnchoTablaDerecha();
        }

        private void AjustarAnchoTablaDerecha()
        {
            const int unidadesPorCaracter = 256;
            const int margen = 10; // caracteres extra de padding

            var colInicio = _ncolSeparador + 2;
            var colFin = colInicio + _datos.DatosExcel.Count - 1;
            var cantCols = _datos.DatosExcel.Count;

            var textoEncabezado = "TOTAL CALCULADO POR TONELDAS EMBARCADAS";
            var anchoMinimoTotal = (textoEncabezado.Length + margen) * unidadesPorCaracter;

            // Sumar el ancho actual de todas las columnas de acuerdos
            var anchoActualTotal = 0;
            for (int c = colInicio; c <= colFin; c++)
                anchoActualTotal += _sheet.GetColumnWidth(c);

            if (anchoActualTotal < anchoMinimoTotal)
            {
                // Distribuir el faltante equitativamente
                var anchoMinimoPorCol = anchoMinimoTotal / cantCols;
                for (int c = colInicio; c <= colFin; c++)
                {
                    if (_sheet.GetColumnWidth(c) < anchoMinimoPorCol)
                        _sheet.SetColumnWidth(c, anchoMinimoPorCol);
                }
            }
        }

        private int EncontrarColumnaPorValor(IRow row, string valor)
        {
            for (int i = row.FirstCellNum; i < row.LastCellNum; i++)
            {
                var cell = row.GetCell(i);
                if (cell != null && cell.StringCellValue == valor)
                {
                    return i;
                }
            }
            return -1;
        }

        private void SetEstilos(ICell celda, bool sup = false, bool der = false, bool inf = false, bool izq = false,
            bool negrita = false, bool fondo = false, bool centrarH = false, bool centrarV = false, bool sinBordes = false, bool dosDecimales = false)
        {
            var style = (XSSFCellStyle)_workbook.CreateCellStyle();
            if (!sinBordes)
            {
                style.BorderTop = sup ? BorderStyle.Thick : BorderStyle.Thin;
                style.BorderRight = der ? BorderStyle.Thick : BorderStyle.Thin;
                style.BorderBottom = inf ? BorderStyle.Thick : BorderStyle.Thin;
                style.BorderLeft = izq ? BorderStyle.Thick : BorderStyle.Thin;
            }

            if (negrita)
            {
                var font = (XSSFFont)_workbook.CreateFont();
                font.IsBold = true;
                style.SetFont(font);
            }

            if (fondo)
            {
                style.SetFillForegroundColor(_colorGrisClaro);
                style.FillPattern = FillPattern.SolidForeground;
            }

            if (centrarH) style.Alignment = HorizontalAlignment.Center;
            if (centrarV) style.VerticalAlignment = VerticalAlignment.Center;

            if (dosDecimales)
            {
                var dataFormat = _workbook.CreateDataFormat();
                style.DataFormat = dataFormat.GetFormat("#,##0.00");
            }

            celda.CellStyle = style;
        }

        private void SetEstilosRange(CellRangeAddress rango, bool sup = false, bool der = false, bool inf = false, bool izq = false,
            bool negrita = false, bool fondo = false, bool centrarH = false, bool centrarV = false, bool sinBordes = false, bool dosDecimales = false)
        {
            var rowInicio = rango.FirstRow;
            var rowFin = rango.LastRow;
            var colInicio = rango.FirstColumn;
            var colFin = rango.LastColumn;

            for (int r = rowInicio; r <= rowFin; r++)
            {
                var row = _sheet.GetRow(r) ?? _sheet.CreateRow(r);
                for (int c = colInicio; c <= colFin; c++)
                {
                    var celda = row.GetCell(c) ?? row.CreateCell(c);

                    // Los bordes gruesos solo van en los bordes exteriores del rango
                    bool esSup = r == rowInicio;
                    bool esInf = r == rowFin;
                    bool esIzq = c == colInicio;
                    bool esDer = c == colFin;

                    SetEstilos(celda,
                        sup: esSup && sup,
                        der: esDer && der,
                        inf: esInf && inf,
                        izq: esIzq && izq,
                        negrita: negrita, fondo: fondo, centrarH: centrarH, centrarV: centrarV, sinBordes: sinBordes, dosDecimales: dosDecimales);
                }
            }

        }
    }
}