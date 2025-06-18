using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.Administracion;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Servicios;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Runtime.CompilerServices;
using System.Web;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    public class ExcelProvisionesGastos
    {
        private readonly XSSFWorkbook _workbook;
        private readonly XSSFSheet _sheet;
        private readonly IList<ProvisionGastoDto> _provisiones;
        private readonly IList<TarifaPorEmbarqueDto> _tarifas;
        private readonly IList<ConceptoDto> _conceptos;

        private readonly string _path = System.Web.HttpContext.Current.Server.MapPath("~/iconMolinosChiquito.png");
        private readonly byte[] _dataImg;

        public ExcelProvisionesGastos(List<ProvisionGastoDto> provisiones, List<TarifaPorEmbarqueDto> tarifas, IList<ConceptoDto> conceptos
            )
        {
            _workbook = new XSSFWorkbook();
            _sheet = (XSSFSheet)_workbook.CreateSheet("Provisiones y Gastos");
            _provisiones = provisiones;
            _tarifas = tarifas;
            _dataImg = File.ReadAllBytes(_path);
            _conceptos = conceptos;
        }

        public byte[] GenerarExcel()
        {
            this.CompletarHoja();
            using (var fileData = new MemoryStream())
            {
                _workbook.Write(fileData);
                var res = fileData.ToArray();
                return res;
            }
        }

        public void CompletarHoja()
        {
            SetearAnchoColumnas();

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
            IRow row0 = _sheet.CreateRow(0);
            ICellStyle titulo = this.CrearEstiloCelda(_sheet, "Arial", 12, IndexedColors.Black.Index, true, IndexedColors.White.RGB, BorderStyle.None,
                BorderStyle.None, BorderStyle.None, BorderStyle.None);
            ICellStyle texto = this.CrearEstiloCelda(_sheet, "Arial", 12, IndexedColors.Black.Index, false, IndexedColors.White.RGB, BorderStyle.Thin,
            BorderStyle.Thin, BorderStyle.Thin, BorderStyle.Thin);
            this.CrearCelda(_sheet, row0, 0, 2, 2, 10, $"Total de ingresos y gastos por Producto: {this._tarifas.First().MaterialPuerto.Descripcion} - Periodo: {this.ObtenerPeriodo(this._tarifas.First().Periodo.Month)}",
                titulo, 1, 1, 1, 1, false, null);

            #endregion Celda Titulo


            IRow row5 = _sheet.CreateRow(5);
            this.CrearCelda(_sheet, row5, 5, 5, 5, 6, "TN:", texto, 1, 1, 1, 1, false, null);

            IRow row6 = _sheet.CreateRow(6);
            this.CrearCelda(_sheet, row6, 6, 6, 5, 6, "Muelle:", texto, 1, 1, 1, 1, false, null);

            IRow row7 = _sheet.CreateRow(7);
            this.CrearCelda(_sheet, row7, 7, 7, 5, 6, "Buque:", texto, 1, 1, 1, 1, false, null);

            IRow row8 = _sheet.CreateRow(8);
            this.CrearCelda(_sheet, row8, 8, 8, 5, 6, "Exportador:", texto, 1, 1, 1, 1, false, null);

            IRow row9 = _sheet.CreateRow(9);
            this.CrearCelda(_sheet, row9, 9, 9, 5, 6, "Tipo Contrato:", texto, 1, 1, 1, 1, false, null);

            int colIndex = 7;
            foreach (var tarifa in _tarifas)
            {
                this.CrearCelda(_sheet, row5, 5, 5, colIndex, colIndex, tarifa.Tn, texto, 1, 1, 1, 1, false, null);
                this.CrearCelda(_sheet, row6, 6, 6, colIndex, colIndex, ObtenerMuelle(tarifa.Embarque), texto, 1, 1, 1, 1, false, null);
                this.CrearCelda(_sheet, row7, 7, 7, colIndex, colIndex, tarifa.Embarque.Patente, texto, 1, 1, 1, 1, false, null);
                this.CrearCelda(_sheet, row8, 8, 8, colIndex, colIndex, tarifa.Exportador.Nombre, texto, 1, 1, 1, 1, false, null);
                this.CrearCelda(_sheet, row9, 9, 9, colIndex, colIndex, tarifa?.TipoContratoTarifa != null ? tarifa?.TipoContratoTarifa?.Descripcion : "N/A", texto, 1, 1, 1, 1, false, null);
                colIndex++;
            }

            IRow row11 = _sheet.CreateRow(11);
            this.CrearCelda(_sheet, row11, 11, 11, 1, 2, $"Precio Tarifa {this.ObtenerPeriodo(this._tarifas.First().Periodo.Month)}", texto, 1, 1, 1, 1, false, null);

            this.CrearCelda(_sheet, row11, 11, 11, 3, 3, "Moneda", texto, 1, 1, 1, 1, false, null);

            IRow row12 = _sheet.CreateRow(12);
            this.CrearCelda(_sheet, row12, 12, 12, 0, 0, "INGRESOS", texto, 1, 1, 1, 1, false, null);

            IRow row13 = _sheet.CreateRow(13);

            /*Listar conceptos de tipo ingreso*/
            var ingresos = _conceptos.Where(c => c.TipoConcepto.Descripcion == "Ingreso");
            int rowIniIngresos = 13;
            foreach (var ingreso in ingresos)
            {
                IRow row = _sheet.GetRow(rowIniIngresos) ?? _sheet.CreateRow(rowIniIngresos);
                double valorTarifa = ObtenerValorTarifaComún(ingreso);

                this.CrearCelda(_sheet, row, rowIniIngresos, rowIniIngresos, 1, 1, ingreso.Descripcion, texto, 1, 1, 1, 1, false, null);
                if (valorTarifa == 0)
                {
                    this.CrearCelda(_sheet, row, rowIniIngresos, rowIniIngresos, 2, 2, string.Empty, texto, 1, 1, 1, 1, false, null);
                }
                else
                {
                    this.CrearCelda(_sheet, row, rowIniIngresos, rowIniIngresos, 2, 2, valorTarifa, texto, 1, 1, 1, 1, false, null);
                }
                this.CrearCelda(_sheet, row, rowIniIngresos, rowIniIngresos, 3, 3, ingreso.Moneda.Descripcion, texto, 1, 1, 1, 1, false, null);

                rowIniIngresos++;
            }

            rowIniIngresos++;

            IRow rowTituloGastos = _sheet.GetRow(rowIniIngresos) ?? _sheet.CreateRow(rowIniIngresos);
            this.CrearCelda(_sheet, rowTituloGastos, rowTituloGastos.RowNum, rowTituloGastos.RowNum, 0, 0, "GASTOS", texto, 1, 1, 1, 1, false, null);
            rowIniIngresos++;
            /*Listar conceptos de tipo gasto*/
            var gastos = _conceptos.Where(c => c.TipoConcepto.Descripcion == "Gasto");
            int rowGastos = rowIniIngresos;
            foreach (var gasto in gastos)
            {
                IRow row = _sheet.GetRow(rowGastos) ?? _sheet.CreateRow(rowGastos);
                double valorTarifa = ObtenerValorTarifaComún(gasto);
                this.CrearCelda(_sheet, row, rowGastos, rowGastos, 1, 1, gasto.Descripcion, texto, 1, 1, 1, 1, false, null);
                if (valorTarifa == 0)
                {
                    this.CrearCelda(_sheet, row, rowGastos, rowGastos, 2, 2, string.Empty, texto, 1, 1, 1, 1, false, null);
                }
                else
                {
                    this.CrearCelda(_sheet, row, rowGastos, rowGastos, 2, 2, valorTarifa, texto, 1, 1, 1, 1, false, null);
                }
                this.CrearCelda(_sheet, row, rowGastos, rowGastos, 3, 3, gasto.Moneda.Descripcion, texto, 1, 1, 1, 1, false, null);
                rowGastos++;
            }

            /*Comenzamos a calcular desde el primer ingreso*/
            colIndex = 7;
            int indexIngresos = 13;
            int indexGastos = 18;

            /*Completamos los calculos de provisiones y gastos dada tarifa y datos del embarque*/
            foreach (var tarifa in _tarifas)
            {
                //Calculamos provisiones ingresos
                for (int i = 0; i < ingresos.Count(); i++) {
                    IRow row = _sheet.GetRow(indexIngresos);
                    var descripcionConcepto = this.ObtenerConceptoCelda(row.RowNum, 1);
                    this.CrearCelda(_sheet, row, row.RowNum, row.RowNum, colIndex, colIndex, ObtenerProvision(tarifa, descripcionConcepto), texto, 1, 1, 1, 1, false, null);
                    indexIngresos++;
                }

                //Calculamos provisiones gastos
                for (int i = 0; i < gastos.Count(); i++)
                {
                    IRow row = _sheet.GetRow(indexGastos);
                    var descripcionConcepto = this.ObtenerConceptoCelda(row.RowNum, 1);
                    this.CrearCelda(_sheet, row, row.RowNum, row.RowNum, colIndex, colIndex, ObtenerProvision(tarifa, descripcionConcepto), texto, 1, 1, 1, 1, false, null);
                    indexGastos++;
                }
                colIndex++;
                indexIngresos = 13;
                indexGastos = 18;
            }

            int indexTotales = indexGastos+= _conceptos.Count() +3;
            IRow rowTituloTotalIngreso = _sheet.CreateRow(indexTotales);
            this.CrearCelda(_sheet, rowTituloTotalIngreso, rowTituloTotalIngreso.RowNum, rowTituloTotalIngreso.RowNum, 0, 0, "Total INGRESOS:", texto, 1, 1, 1, 1, false, null);
            this.CrearCelda(_sheet, rowTituloTotalIngreso, rowTituloTotalIngreso.RowNum, rowTituloTotalIngreso.RowNum, 2, 2, "Pesos", texto, 1, 1, 1, 1, false, null);
            this.CrearCelda(_sheet, rowTituloTotalIngreso, rowTituloTotalIngreso.RowNum, rowTituloTotalIngreso.RowNum, 3, 3, this.ObtenerTotalIngresosPesos(), texto, 1, 1, 1, 1, false, null);

            indexTotales++;
            IRow rowTotalIngPesos = _sheet.CreateRow(indexTotales);
            this.CrearCelda(_sheet, rowTotalIngPesos, rowTotalIngPesos.RowNum, rowTotalIngPesos.RowNum, 2, 2, "Dolares:", texto, 1, 1, 1, 1, false, null);
            this.CrearCelda(_sheet, rowTotalIngPesos, rowTotalIngPesos.RowNum, rowTotalIngPesos.RowNum, 3, 3, this.ObtenerTotalIngresosDolares(), texto, 1, 1, 1, 1, false, null);

            indexTotales+=3;
            IRow rowTituloTotalGastos = _sheet.CreateRow(indexTotales);
            this.CrearCelda(_sheet, rowTituloTotalGastos, rowTituloTotalGastos.RowNum, rowTituloTotalGastos.RowNum, 0, 0, "Total GASTOS:", texto, 1, 1, 1, 1, false, null);
            this.CrearCelda(_sheet, rowTituloTotalGastos, rowTituloTotalGastos.RowNum, rowTituloTotalGastos.RowNum, 2, 2, "Pesos", texto, 1, 1, 1, 1, false, null);
            this.CrearCelda(_sheet, rowTituloTotalGastos, rowTituloTotalGastos.RowNum, rowTituloTotalGastos.RowNum, 3, 3, this.ObtenerTotalGastosPesos(), texto, 1, 1, 1, 1, false, null);

            indexTotales++;
            IRow rowTotalGastosPesos = _sheet.CreateRow(indexTotales);
            this.CrearCelda(_sheet, rowTotalGastosPesos, rowTotalGastosPesos.RowNum, rowTotalGastosPesos.RowNum, 2, 2, "Dolares:", texto, 1, 1, 1, 1, false, null);
            this.CrearCelda(_sheet, rowTotalGastosPesos, rowTotalGastosPesos.RowNum, rowTotalGastosPesos.RowNum, 3, 3, this.ObtenerTotalGastosDolares(), texto, 1, 1, 1, 1, false, null);
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
                estilo.DataFormat = dataFormat.GetFormat("#,##0.00");
                celda.SetCellValue(doubleValue);
            }
            else if (valorCelda is TimeSpan timeValue)
            {
                IDataFormat dataFormat = _workbook.CreateDataFormat();
                estilo.DataFormat = dataFormat.GetFormat("hh:mm");
                celda.SetCellValue(timeValue.TotalDays);
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

        private string ObtenerMuelle(EmbarqueDto embarque)
        {
            var muelle = string.Empty;
            if (embarque.SanBenito)
                muelle = "San Benito";
            if (embarque.Noryon)
                muelle = "Noryon";
            if (embarque.Vicentin)
                muelle = "Vicentin";
            if (embarque.OtrosMuelles)
            {
                if (embarque.OtroMuelleNombre != null)
                {
                    muelle = embarque.OtroMuelleNombre;
                }
                else muelle = "Otros muelles";
            }
            return muelle;
        }

        private double ObtenerValorTarifaComún(ConceptoDto concepto)
        {
            double valor = 0;
            var tarifaConceptos = _tarifas.SelectMany(t => t.TarifaPorEmbarqueConcepto).Where(y => y.Concepto.Id == concepto.Id);
            if (tarifaConceptos == null || !tarifaConceptos.Any())
                return 0;
            var primerValor = tarifaConceptos.First().Valor;
            var esValorComun = tarifaConceptos.All(x => x.Valor == primerValor);
            if (esValorComun)
                valor = (double)primerValor;

            return valor;
        }

        private string ObtenerConceptoCelda(int fila, int col)
        {
            IRow row = _sheet.GetRow(fila);

            // Obtener la celda
            if (row != null)
            {
                ICell cell = row.GetCell(col);

                // Obtener el valor de la celda (si la celda no es nula)
                if (cell != null)
                {
                    String valorCelda = cell.StringCellValue;
                    return valorCelda;
                }
            }
            return null;
        }

        private double ObtenerProvision(TarifaPorEmbarqueDto tarifa, string descConcepto)
        {
            var concepto = this._conceptos.FirstOrDefault(c => c.Descripcion.ToLower() == descConcepto.ToLower());
            var tarifaConcepto = tarifa.TarifaPorEmbarqueConcepto.FirstOrDefault(t => t.Concepto.Id == concepto.Id);
            if (tarifaConcepto == null)
                return 0;
            var provisionExistente = _provisiones.FirstOrDefault(p => p.TarifaPorEmbarque.Id == tarifa.Id);
            if(provisionExistente != null)
            {
                var detalle = provisionExistente.ProvisionGastoDetalle.FirstOrDefault(d => d.TarifaPorEmbarqueConcepto.Id == tarifaConcepto.Id);
                return (double)(detalle.ValorAjustado > 0 ? detalle.ValorAjustado : detalle.ValorCalculado);
            }
            var valorCalculado = tarifaConcepto.ValorCalculado;
            return (double)valorCalculado;
        }

        private double ObtenerValorConcepto(TarifaPorEmbarqueConceptoDto tc, int conceptoId)
        {
            var detalles = _provisiones.SelectMany(x => x.ProvisionGastoDetalle);
            var detalle = detalles.FirstOrDefault(d => d.TarifaPorEmbarqueConcepto.Id == tc.Id
            );
            if(detalle != null)
            {
                return (double)(detalle.ValorAjustado > 0 ? detalle.ValorAjustado : detalle.ValorCalculado);
            }
            return (double)tc.ValorCalculado;
        }

        //TODO

        private double ObtenerTNTotalTarifa(TarifaPorEmbarqueDto tarifa, LineUpDto lineup)
        {
            return 0;
        }

        private double ObtenerTotalIngresosPesos()
        {
            double total = 0;
            var conceptosIngresosPesos = _conceptos.Where(c => c.Moneda.Descripcion == "Pesos" && c.TipoConcepto.Descripcion == "Ingreso")
                .ToList();
            
            foreach (var concepto in conceptosIngresosPesos)
            {
                var tarifaPesosIng = _tarifas.SelectMany(x => x.TarifaPorEmbarqueConcepto).
                Where(tc => tc.Concepto.Id == concepto.Id).ToList();
                foreach (var tc in tarifaPesosIng)
                {
                    total += this.ObtenerValorConcepto(tc, concepto.Id);
                }
            }
            return total;
        }

        private double ObtenerTotalIngresosDolares()
        {
            double total = 0;
            var conceptosIngresosPesos = _conceptos.Where(c => c.Moneda.Descripcion == "Dolares" && c.TipoConcepto.Descripcion == "Ingreso")
                .ToList();

            foreach (var concepto in conceptosIngresosPesos)
            {
                var tarifaPesosIng = _tarifas.SelectMany(x => x.TarifaPorEmbarqueConcepto).
                Where(tc => tc.Concepto.Id == concepto.Id).ToList();
                foreach (var tc in tarifaPesosIng)
                {
                    total += this.ObtenerValorConcepto(tc, concepto.Id);
                }
            }
            return total;
        }

        private double ObtenerTotalGastosPesos()
        {
            double total = 0;
            var conceptosIngresosPesos = _conceptos.Where(c => c.Moneda.Descripcion == "Pesos" && c.TipoConcepto.Descripcion == "Gasto")
                .ToList();

            foreach (var concepto in conceptosIngresosPesos)
            {
                var tarifaPesosIng = _tarifas.SelectMany(x => x.TarifaPorEmbarqueConcepto).
                Where(tc => tc.Concepto.Id == concepto.Id).ToList();
                foreach (var tc in tarifaPesosIng)
                {
                    total += this.ObtenerValorConcepto(tc, concepto.Id);
                }
            }
            return total;
        }

        private double ObtenerTotalGastosDolares()
        {
            double total = 0;
            var conceptosIngresosPesos = _conceptos.Where(c => c.Moneda.Descripcion == "Dolares" && c.TipoConcepto.Descripcion == "Gasto")
                .ToList();

            foreach (var concepto in conceptosIngresosPesos)
            {
                var tarifaPesosIng = _tarifas.SelectMany(x => x.TarifaPorEmbarqueConcepto).
                Where(tc => tc.Concepto.Id == concepto.Id).ToList();
                foreach (var tc in tarifaPesosIng)
                {
                    total += this.ObtenerValorConcepto(tc, concepto.Id);
                }
            }
            return total;
        }

        public string ObtenerPeriodo(int numeroMes)
        {
            string[] meses = new string[]
            {
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            };

            if (numeroMes >= 1 && numeroMes <= 12)
            {
                return meses[numeroMes - 1];
            }
            return string.Empty;
        }

        private void SetearAnchoColumnas()
        {
            SetAnchoCol(_sheet, 0, 2.38);
            SetAnchoCol(_sheet, 1, 3.72);
            SetAnchoCol(_sheet, 2, 3.27);
            SetAnchoCol(_sheet, 3, 1.55);
            SetAnchoCol(_sheet, 6, 1.29);
            //Seteamos anchos de la info de tarifas.
            for(int i=0; i<_tarifas.Count(); i++)
            {
                SetAnchoCol(_sheet, 7 + i, 3.27);
            }
        }

        private void SetAnchoCol(ISheet sheet, int columnIndex, double cm)
        {
            int npoiWidth = (int)(cm * 256 / 0.142857);
            sheet.SetColumnWidth(columnIndex, npoiWidth);
        }


    }
}