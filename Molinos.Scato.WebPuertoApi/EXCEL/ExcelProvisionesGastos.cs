using Molinos.Scato.Dominio.Dto;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
	public class ExcelProvisionesGastos
	{
		private readonly XSSFWorkbook _workbook;
		private readonly XSSFSheet _sheet;
		private readonly DatosExportacionProvisionDto _datos;
		private readonly IList<ConceptoDto> _conceptos;
		private readonly string _path = System.Web.HttpContext.Current.Server.MapPath("~/iconMolinosChiquito.png");
		private readonly byte[] _dataImg;

		public ExcelProvisionesGastos(DatosExportacionProvisionDto datos, IList<ConceptoDto> conceptos)
		{
			_workbook = new XSSFWorkbook();
			_sheet = (XSSFSheet)_workbook.CreateSheet("Provisiones y Gastos");
			_datos = datos;
			_conceptos = conceptos;
			_dataImg = File.ReadAllBytes(_path);
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

		private void CompletarHoja()
		{
			ICellStyle estiloTitulo = CrearEstiloCelda(12, true, BorderStyle.None);
			ICellStyle estiloNormal = CrearEstiloCelda(10, false, BorderStyle.Thin);
			ICellStyle estiloBold = CrearEstiloCelda(10, true, BorderStyle.Thin);

			InsertarLogo();
			IRow row0 = _sheet.CreateRow(0);
			CrearCelda(row0, 0, 2, 2, 4, $"Total de ingresos y gastos por Producto: {_datos.NombreProducto} - Periodo: {ObtenerPeriodo(_datos.Periodo.Month)}-{_datos.Periodo.Year}", estiloTitulo);

			int colInicioCalculados = 5;
			int colInicioDolar = colInicioCalculados + _datos.Tarifas.Count + 1;

			IRow rowHeaderDolar = _sheet.CreateRow(1);
			CrearCelda(rowHeaderDolar, 1, 1, colInicioDolar, colInicioDolar + 2, $"CONVERSIÓN A DÓLAR", estiloBold);
			IRow rowHeaderDolar2 = _sheet.CreateRow(2);
			CrearCelda(rowHeaderDolar2, 2, 2, colInicioDolar, colInicioDolar + 2, $"Cotización de período {ObtenerPeriodo(_datos.Periodo.Month)} = ${_datos.CotizacionDolar}", estiloNormal);

			CrearHeadersEmbarques(colInicioCalculados, colInicioDolar, estiloBold, estiloNormal);

			int filaActual = 10;
			filaActual = ImprimirBloqueConceptos("INGRESOS", _conceptos.Where(c => c.TipoConcepto.Descripcion == "Ingreso").ToList(), filaActual, colInicioCalculados, colInicioDolar, estiloNormal, estiloBold);

			filaActual += 2;

			filaActual = ImprimirBloqueConceptos("GASTOS", _conceptos.Where(c => c.TipoConcepto.Descripcion == "Gasto").ToList(), filaActual, colInicioCalculados, colInicioDolar, estiloNormal, estiloBold);

			ImprimirTotales(filaActual + 2, colInicioCalculados, colInicioDolar, estiloBold, estiloNormal);

			AjustarColumnas();
		}

		private void CrearHeadersEmbarques(int colBaseCalc, int colBaseUsd, ICellStyle bold, ICellStyle normal)
		{
			string[] titulosRow = { "TN:", "Muelle:", "Buque:", "Exportador:", "Nombre Contrato:", "Cantidad Contrato:" };

			for (int i = 0; i < titulosRow.Length; i++)
			{
				IRow row = _sheet.GetRow(4 + i) ?? _sheet.CreateRow(4 + i);
				CrearCelda(row, 4 + i, 4 + i, 1, 2, titulosRow[i], bold);

				int cCalc = colBaseCalc;
				int cUsd = colBaseUsd;

				foreach (var t in _datos.Tarifas)
				{
					string valor = "";
					switch (i)
					{
						case 0: valor = (t.AcuerdoEmbarque != null ? t.AcuerdoEmbarque.Cantidad : 0).ToString("N2"); break;
						case 1: valor = t.Embarque.SanBenito ? "San Benito" : "Otros"; break;
						case 2: valor = t.Embarque.Vapor.Nombre; break;
						case 3: valor = t.Exportador.Nombre; break;
						case 4: valor = t.AcuerdoEmbarque != null ? "ACUERDO" : (t.Exportador.Nombre == "MOLINOS AGRO SA" ? "SIN CONTRATO" : "TARIFA"); break;
						case 5: valor = (t.AcuerdoEmbarque != null ? t.AcuerdoEmbarque.Cantidad : 0).ToString("N2"); break;
					}

					CrearCelda(row, 4 + i, 4 + i, cCalc, cCalc, valor, normal);
					CrearCelda(row, 4 + i, 4 + i, cUsd, cUsd, valor, normal);
					cCalc++;
					cUsd++;
				}
			}
		}

		private int ImprimirBloqueConceptos(string tituloSeccion, List<ConceptoDto> conceptos, int filaInicio, int colBaseCalc, int colBaseUsd, ICellStyle normal, ICellStyle bold)
		{
			IRow rowTitulo = _sheet.CreateRow(filaInicio);
			CrearCelda(rowTitulo, filaInicio, filaInicio, 0, 0, tituloSeccion, bold);
			filaInicio++;

			foreach (var concepto in conceptos)
			{
				IRow row = _sheet.CreateRow(filaInicio);

				// Nombre del concepto
				CrearCelda(row, filaInicio, filaInicio, 1, 1, concepto.Descripcion, normal);
				CrearCelda(row, filaInicio, filaInicio, 2, 2, concepto.Moneda.Descripcion, normal);

				int cCalc = colBaseCalc;
				int cUsd = colBaseUsd;

				foreach (var tarifa in _datos.Tarifas)
				{
					decimal valorBase = 0;
					decimal valorCalculado = 0;

					// Lógica para extraer la tarifa base según si es Acuerdo, Producto o Embarque
					if (tarifa.AcuerdoEmbarque != null && tarifa.TarifasAcuerdo != null)
					{
						var tC = tarifa.TarifasAcuerdo.FirstOrDefault(c => c.ConceptoId == concepto.Id);
						if (tC != null) valorBase = tC.ValorTarifa;
					}
					else if (tarifa.TarifaProducto != null && concepto.PorProducto)
					{
						var tC = tarifa.TarifaProducto.TarifaPorProductoConcepto.FirstOrDefault(c => c.Concepto.Id == concepto.Id);
						if (tC != null) valorBase = tC.Valor;
					}

					// Uso de Muelle
					if (concepto.Descripcion.ToLower().Contains("uso de muelle"))
					{
						valorCalculado = 0;
					}
					else
					{
						decimal toneladas = tarifa.AcuerdoEmbarque != null ? tarifa.AcuerdoEmbarque.Cantidad : 0;
						valorCalculado = valorBase * toneladas;
					}

					CrearCelda(row, filaInicio, filaInicio, cCalc, cCalc, valorCalculado == 0 ? "--" : valorCalculado.ToString("N2"), normal);

					decimal valorCalculadoDolar = concepto.Moneda.Id == 2 ? valorCalculado : (valorCalculado / (_datos.CotizacionDolar > 0 ? _datos.CotizacionDolar : 1));
					CrearCelda(row, filaInicio, filaInicio, cUsd, cUsd, valorCalculadoDolar == 0 ? "--" : valorCalculadoDolar.ToString("N2"), normal);

					cCalc++;
					cUsd++;
				}
				filaInicio++;
			}
			return filaInicio;
		}

		private void ImprimirTotales(int filaActual, int colBaseCalc, int colBaseUsd, ICellStyle bold, ICellStyle normal)
		{
			IRow rowTot = _sheet.CreateRow(filaActual);
			CrearCelda(rowTot, filaActual, filaActual, 0, 2, "TOTALES FINALES", bold);
		}

		private void CrearCelda(IRow row, int f1, int f2, int c1, int c2, string valor, ICellStyle estilo)
		{
			if (f1 != f2 || c1 != c2)
			{
				_sheet.AddMergedRegion(new CellRangeAddress(f1, f2, c1, c2));
			}
			ICell celda = row.CreateCell(c1);
			celda.SetCellValue(valor);
			celda.CellStyle = estilo;
		}

		private ICellStyle CrearEstiloCelda(short fontSize, bool isBold, BorderStyle border)
		{
			XSSFCellStyle style = (XSSFCellStyle)_workbook.CreateCellStyle();
			IFont font = _workbook.CreateFont();
			font.FontHeightInPoints = fontSize;
			if (isBold) font.Boldweight = (short)FontBoldWeight.Bold;
			style.SetFont(font);
			style.BorderBottom = border;
			style.BorderTop = border;
			style.BorderLeft = border;
			style.BorderRight = border;
			style.Alignment = HorizontalAlignment.Center;
			return style;
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

		private string ObtenerPeriodo(int numeroMes)
		{
			string[] meses = { "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" };
			return (numeroMes >= 1 && numeroMes <= 12) ? meses[numeroMes - 1] : string.Empty;
		}

		private void AjustarColumnas()
		{
			for (int i = 0; i < 20; i++) _sheet.AutoSizeColumn(i);
		}
	}
}