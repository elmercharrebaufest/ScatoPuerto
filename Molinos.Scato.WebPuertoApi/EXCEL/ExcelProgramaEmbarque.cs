using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using Molinos.Scato.Dominio.Dto;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.SS.Util;

namespace Molinos.Scato.WebPuertoApi.EXCEL
{
    enum TipoDeFuente { Negrita, Grande, Titulo }

    class CriterioEstilo
    {
        public bool Negrita;
        public bool Grande;
        public bool BordeIzq;
        public bool BordeDer;
        public bool BordeSup;
        public bool BordeInf;
        public bool Fondo;
        public bool Titulo;
        public ICellStyle ObjEstilo;
    }

    public class ExcelProgramaEmbarque
    {
        private readonly HSSFWorkbook _workbook;
        private readonly HSSFSheet _sheet;
        private readonly IList<NominacionDto> _nominaciones;
        /// <summary>
        /// Puntero incremental que marca el indice de la fila actual
        /// </summary>
        private int _nroFila;
        /// <summary>
        /// Flag para alternar entre 2 colores, para así diferenciar entre secciones
        /// </summary>
        private bool _flagColor;

        private readonly Dictionary<string, short> _indicesColores;
        private short _indiceColorActual;
        private readonly Dictionary<TipoDeFuente, IFont> _fuentes;
        private readonly List<ICellStyle> _estilosColores;
        private readonly List<CriterioEstilo> _criterioEstilos;

        public ExcelProgramaEmbarque(IList<NominacionDto> list)
        {
            _nominaciones = list;
            _workbook = new HSSFWorkbook();
            _sheet = (HSSFSheet)_workbook.CreateSheet("Programa de embarques");
            _nroFila = 0;
            _flagColor = false;
            _indicesColores = new Dictionary<string, short>();
            _fuentes = new Dictionary<TipoDeFuente, IFont>();
            _estilosColores = new List<ICellStyle>();
            _criterioEstilos = new List<CriterioEstilo>();
            GenerarPaletaDeColores();
            GenerarEstilos();
        }
        public byte[] GenerarArchivo()
        {
            GenerarExcel();
            using (var fileData = new MemoryStream())
            {
                _workbook.Write(fileData);
                return fileData.ToArray();
            }
        }

        private void GenerarExcel()
        {
            InsertarFilaTitulo("Programa de Embarque de Molinos Agro S.A.", true);
            _nroFila++;
            foreach (var nominacion in _nominaciones) InsertarNominacion(nominacion);
            // Ajustar columnas
            for (int i = 1; i <= 12; i++)
            {
                _sheet.AutoSizeColumn(i);
            }
        }

        private void InsertarNominacion(NominacionDto nominacion)
        {
            _flagColor = true;
            _indiceColorActual = _indicesColores[nominacion.NominacionDatoTecnico.MaterialPuerto.Color];
            InsertarFilaSeparador();
            InsertarDatosTecnicos(nominacion.NominacionDatoTecnico);
            InsertarRecibos(nominacion.NominacionRecibo);
            InsertarIntervenciones(nominacion.NominacionDetalleIntervencion);
            _nroFila += 2;
        }

        private void InsertarDatosTecnicos(NominacionDatoTecnicoDto datoTecnico)
        {
            string[] valoresCeldas;

            #region BUQUE Y PRODUCTO
            valoresCeldas = new string[] { "Producto", "Nombre Buque", "Bandera", "Tipo de buque", "IMO", "Detalle Producto", "Cantidad Total", "Calidad", "Tolerancia", "Observaciones" };
            InsertarFilaConValores(valoresCeldas, true, true); // Negrita y borde sup
            valoresCeldas = new string[] {
                datoTecnico.MaterialPuerto == null ? "-" : datoTecnico.MaterialPuerto.DescripcionCortaIngles,
                datoTecnico.VaporInformacion?.NombreBuque ?? "-",
                datoTecnico.VaporInformacion?.Bandera?.Nombre ?? "-",
                datoTecnico.VaporInformacion?.TipoBuque ?? "-",
                datoTecnico.VaporInformacion?.ImoVapor ?? "-",
                datoTecnico.MaterialPuerto.Descripcion,
                datoTecnico.CantidadTotal.ToString(),
                datoTecnico.NominacionDatoTecnicoCalidad?.FirstOrDefault()?.CalidadValor?.TipoDeCalidad?.Descripcion ?? "-",
                String.Format("+/- {0}%", datoTecnico.Tolerancia),
                datoTecnico.Observaciones ?? "-"
            };
            InsertarFilaConValores(valoresCeldas, columnasMayorFuente: new int[] { 1, 2 }); // Negrita y fuente grande
            _flagColor = !_flagColor;
            #endregion

            #region EMBARQUE
            valoresCeldas = new string[] {
                "Muelle de carga", "ETA Recalada", "Obligacion de carga", "ATA", "Agencia Maritima",
                "Loading Rate", "DEM", "DES", "Tipo de contrato", "Surveyor", "Observaciones del Surveyor"
            };
            InsertarFilaConValores(valoresCeldas, true, true); // Negrita y borde sup
            valoresCeldas = new string[] {
                datoTecnico.MuelleDeCarga?.Descripcion ?? "-",
                datoTecnico.ETARecalada.Value != null ? datoTecnico.ETARecalada.Value.ToString("dd/MM/yyyy") : "-",
                datoTecnico.ObligacionDeCarga.Value != null ? datoTecnico.ObligacionDeCarga.Value.ToString("dd/MM/yyyy") : "-",
                datoTecnico.ATAPuerto?.Nombre ?? "-",
                datoTecnico.AgenciaMaritimaPuerto?.Nombre ?? "-",
                (datoTecnico.TasaDeCargaValor ?? 0).ToString(),
                datoTecnico.DEM.ToString(),
                datoTecnico.DES.ToString(),
                datoTecnico.TipoDeContrato?.Descripcion ?? "-",
                datoTecnico.Surveyor?.Descripcion ?? "-",
                datoTecnico.ObservacionesSurveyor ?? "-"
            };
            InsertarFilaConValores(valoresCeldas, columnasMayorFuente: new int[] { 1, 2, 3 }); // Negrita y fuente grande
            _flagColor = !_flagColor;
            #endregion

            #region CANTIDADES
            InsertarFilaConValores(new string[] { "Cantidad por destino" }, true, true); // Negrita y borde sup
            foreach (var destino in datoTecnico.NominacionDatoTecnicoDestino)
            {
                valoresCeldas = new string[] { destino.Destino.Nombre, destino.Cantidad + "tn" };
                InsertarFilaConValores(valoresCeldas); // Normal
            }
            _flagColor = !_flagColor;
            InsertarFilaConValores(new string[] { "Cantidad por cargadores" }, true, true); // Negrita y borde sup
            foreach (var item in datoTecnico.NominacionDatoTecnicoExportador)
            {
                string tolerancia = item.ToleranciasDiferenciadas == true ? String.Format("+ {0}% / - {1}%", item.ToleranciaPositiva, item.ToleranciaNegativa) : String.Format("+/- {0}%", item.Tolerancia);
                valoresCeldas = new string[] { item.Exportador.Nombre, String.Format("{0} tn {1}", item.Cantidad, tolerancia) };
                InsertarFilaConValores(valoresCeldas); // Normal
            }
            _flagColor = !_flagColor;
            InsertarFilaConValores(new string[] { "Cantidad por cliente" }, true, true); // Negrita y borde sup
            foreach (var item in datoTecnico.NominacionDatoTecnicoCoordinadorPuerto)
            {
                valoresCeldas = new string[] { item.CoordinadorPuerto.Nombre, item.Cantidad + " tn" };
                InsertarFilaConValores(valoresCeldas); // Normal
            }
            _flagColor = !_flagColor;
            #endregion
        }

        private void InsertarRecibos(ICollection<NominacionReciboDto> nominacionRecibo)
        {
            InsertarFilaTitulo("Recibos");
            var valoresCeldas = new string[] {
                "N° de recibo", "Cargador", "Formato", "Cantidad (TN)", "Unidad", "Ajuste", "Loading Port",
                "Discharge Port", "Description of goods", "Recibos por día", "Mostrar Destinos", "Mostrar Bodegas"
            };
            InsertarFilaConValores(valoresCeldas, true); // Negrita
            foreach (var recibo in nominacionRecibo)
            {
                valoresCeldas = new string[] {
                    recibo.NumeroRecibo.ToString(),
                    recibo.Exportador?.Nombre ?? "-",
                    recibo.Formato,
                    recibo.Cantidad.ToString(),
                    recibo.Unidad,
                    recibo.Ajuste,
                    recibo.PuertoDeCarga,
                    recibo.PuertoDeDescarga,
                    recibo.DescripcionesBienes,
                    recibo.RecibosPorDia ? "SI" : "NO",
                    recibo.MostrarDestinos ? "SI" : "NO",
                    recibo.MostrarBodegas ? "SI" : "NO"
                };
                InsertarFilaConValores(valoresCeldas); // Normal
            }
            _flagColor = !_flagColor;
        }

        private void InsertarIntervenciones(NominacionDetalleIntervencionDto detalleIntervencion)
        {
            string[] valoresCeldas;
            #region INTERVENCIONES
            InsertarFilaTitulo("Intervenciones");
            valoresCeldas = new string[] { "", "Aplica", "A cuenta de", "Observaciones" };
            InsertarFilaConValores(valoresCeldas, true); // Negrita
            valoresCeldas = new string[] {
                "Precintado de bodegas",
                detalleIntervencion == null ? "-" : detalleIntervencion.Precintado ? "SI" : "NO",
                detalleIntervencion?.PrecintadoACuentaDe ?? "-",
                "-"
            };
            InsertarFilaConValores(valoresCeldas, negritaSoloPrimero: true); // Negrita solo primero
            valoresCeldas = new string[] {
                "Draft Survey",
                detalleIntervencion == null ? "-" : detalleIntervencion.DraftSurvey ? "SI" : "NO",
                detalleIntervencion?.SurveyACuentaDe ?? "-",
                "-"
            };
            InsertarFilaConValores(valoresCeldas, negritaSoloPrimero: true); // Negrita solo primero
            valoresCeldas = new string[] {
                "Permiso de embarque",
                detalleIntervencion == null ? "-" : detalleIntervencion.PermisoDeEmbarque ? "SI" : "NO",
                "-", "-"
            };
            InsertarFilaConValores(valoresCeldas, negritaSoloPrimero: true); // Negrita solo primero
            valoresCeldas = new string[] {
                "Estibado y trimado",
                detalleIntervencion == null ? "-" : detalleIntervencion.EstibadorYTrimado ? "SI" : "NO",
                "-", "-"
            };
            InsertarFilaConValores(valoresCeldas, negritaSoloPrimero: true); // Negrita solo primero
            valoresCeldas = new string[] {
                "Fumigación",
                detalleIntervencion?.Fumigacion ?? "-",
                detalleIntervencion?.CompaniaACuentaDe ?? "-",
                detalleIntervencion?.TipoDeFumigacion?.Descripcion ?? "-"
            };
            InsertarFilaConValores(valoresCeldas, negritaSoloPrimero: true); // Negrita solo primero
            _flagColor = !_flagColor;
            #endregion

            #region SENASA
            InsertarFilaTitulo("SENASA");
            valoresCeldas = new string[] {
                "Exportador", "CORRESPONDE SENASA", "Consumo", "A cuenta de", "Destino", "IP", "GMO",
                "FITO", "Muestras oficiales", "Certificado de inocuidad", "Certificado Veterinario"
            };
            InsertarFilaConValores(valoresCeldas, true); // Negrita
            if (detalleIntervencion != null)
            {
                foreach (var intervencion in detalleIntervencion.Senasa)
                {
                    valoresCeldas = new string[] {
                        intervencion.Exportador.Nombre ?? "-",
                        intervencion.TieneSenasa ? "SI" : "NO",
                        intervencion.Consumo ?? "-",
                        intervencion.ACuentaDe ?? "-",
                        intervencion.Destino?.Nombre ?? "-",
                        intervencion.IP ? "SI" : "NO",
                        intervencion.GMO ? "SI" : "NO",
                        intervencion.FITO ? "SI" : "NO",
                        intervencion.MuestraOficial ? "SI" : "NO",
                        intervencion.CertificadoInocuidad ? "SI" : "NO",
                        intervencion.CertificadoVeterinario ? "SI" : "NO"
                    };
                    var ultimo = intervencion == detalleIntervencion.Senasa.Last();
                    InsertarFilaConValores(valoresCeldas, bordeInfGrueso: ultimo); //  inf
                }
            }
            #endregion
        }

        /// <summary>
        /// Crea una nueva fila a partir de un array de strings.
        /// Cada elemento del array ocupa una columna.
        /// Mueve el puntero de fila un lugar hacia abajo.
        /// </summary>
        /// <param name="datos"></param>
        private void InsertarFilaConValores(string[] datos, bool negrita = false, bool bordeSupGrueso = false, bool bordeInfGrueso = false, bool negritaSoloPrimero = false, int[] columnasMayorFuente = null)
        {
            var fila = _sheet.CreateRow(_nroFila);
            InsertarColumnaColor(fila);

            int nroColumna = 1;
            foreach (var dato in datos)
            {
                var primeraCelda = nroColumna == 1;
                var ultimaCelda = nroColumna == datos.Length;

                var criterio = _criterioEstilos.FirstOrDefault(x =>
                    x.BordeIzq == primeraCelda && x.BordeDer == ultimaCelda && x.BordeSup == bordeSupGrueso && x.BordeInf == bordeInfGrueso &&
                    x.Negrita == (negrita || (negritaSoloPrimero && primeraCelda)) &&
                    x.Grande == (columnasMayorFuente != null && columnasMayorFuente.Contains(nroColumna)) &&
                    x.Fondo == _flagColor && !x.Titulo
                );

                var celda = fila.CreateCell(nroColumna);
                celda.SetCellValue(dato);
                celda.CellStyle = criterio.ObjEstilo;

                if (ultimaCelda && nroColumna < 12) // Si sobran celdas a la derecha, estas se combinan con la útima
                {
                    _sheet.AddMergedRegion(new CellRangeAddress(_nroFila, _nroFila, nroColumna, 12));
                    for (int i = nroColumna + 1; i <= 12; i++)
                    {
                        var celdaAux = fila.CreateCell(i);
                        celdaAux.CellStyle = criterio.ObjEstilo;
                    }
                }

                nroColumna++;
            }
            _nroFila++;
        }

        private void InsertarFilaTitulo(string titulo, bool principal = false)
        {
            var primeraColumna = principal ? 0 : 1;
            var segundColumna = principal ? 1 : 2;
            _sheet.AddMergedRegion(new CellRangeAddress(_nroFila, _nroFila, primeraColumna, 12));
            var fila = _sheet.CreateRow(_nroFila);
            var celda = fila.CreateCell(primeraColumna);
            CriterioEstilo criterio;

            if (!principal)
            {
                InsertarColumnaColor(fila);
                criterio = _criterioEstilos.FirstOrDefault(x => x.BordeSup && x.BordeIzq && x.BordeDer && x.Negrita && x.Fondo == _flagColor && !x.Titulo);
            }
            else
            {
                criterio = _criterioEstilos.FirstOrDefault(x => x.Titulo);
            }

            celda.CellStyle = criterio.ObjEstilo;
            celda.SetCellValue(titulo);
            for (int i = segundColumna; i <= 12; i++)
            {
                var celdaAux = fila.CreateCell(i);
                celdaAux.CellStyle = criterio.ObjEstilo;
            }

            _nroFila++;
        }

        private void InsertarFilaSeparador()
        {
            _sheet.AddMergedRegion(new CellRangeAddress(_nroFila, _nroFila, 0, 12));
            var fila = _sheet.CreateRow(_nroFila);
            var celda = fila.CreateCell(0);
            var estilo = _workbook.CreateCellStyle();

            estilo.FillForegroundColor = _indiceColorActual;
            estilo.FillPattern = FillPattern.SolidForeground;
            celda.CellStyle = estilo;

            _nroFila++;
        }

        /// <summary>
        /// Crea una paleta de colores customizados en base a los diferentes colores en la base de datos.
        /// Sobreescribe los colores a partir del indice 20 de la paleta de colores default.
        /// </summary>
        private void GenerarPaletaDeColores()
        {
            HSSFPalette paleta = _workbook.GetCustomPalette();
            var colores = _nominaciones.Select(n => n.NominacionDatoTecnico.MaterialPuerto.Color).Distinct().ToList();
            colores.Add("#D9D9D9"); // Gris claro para separar filas
            short i = 20;
            foreach (var colorHexadecimal in colores)
            {
                _indicesColores.Add(colorHexadecimal, i);
                Color colorRGB = ColorTranslator.FromHtml(colorHexadecimal);
                paleta.SetColorAtIndex(i, colorRGB.R, colorRGB.G, colorRGB.B);
                i++;
            }
        }

        /// <summary>
        /// Crea todos los estilos que serán usados en la planilla y los almacena en la lista _criterioEstilos.
        /// <para>
        /// Esto es necesario ya que NPOI no permite la creación de más de 4000 instancias de objetos de estilos para .xls, 
        /// por lo cual es necesario que las celdas que compartan estilo hagan referencia a la misma instancia.
        /// </para>
        /// </summary>
        private void GenerarEstilos()
        {
            GenerarFuentes();

            #region Estilos sin fondo
            CrearEstiloCriterio();
            CrearEstiloCriterio(bordeIzq: true);
            CrearEstiloCriterio(bordeDer: true);
            CrearEstiloCriterio(bordeInf: true);
            CrearEstiloCriterio(bordeDer: true, bordeInf: true);
            CrearEstiloCriterio(bordeIzq: true, bordeInf: true);

            CrearEstiloCriterio(negrita: true);
            CrearEstiloCriterio(negrita: true, bordeIzq: true);
            CrearEstiloCriterio(negrita: true, bordeDer: true);
            CrearEstiloCriterio(negrita: true, bordeSup: true);
            CrearEstiloCriterio(negrita: true, bordeSup: true, bordeIzq: true);
            CrearEstiloCriterio(negrita: true, bordeSup: true, bordeDer: true);
            CrearEstiloCriterio(negrita: true, bordeSup: true, bordeIzq: true, bordeDer: true);

            CrearEstiloCriterio(grande: true);
            CrearEstiloCriterio(grande: true, bordeIzq: true);
            #endregion

            #region Estilos con fondo
            CrearEstiloCriterio(fondo: true);
            CrearEstiloCriterio(bordeIzq: true, fondo: true);
            CrearEstiloCriterio(bordeDer: true, fondo: true);
            CrearEstiloCriterio(bordeInf: true, fondo: true);
            CrearEstiloCriterio(bordeInf: true, bordeIzq: true, fondo: true);
            CrearEstiloCriterio(bordeInf: true, bordeDer: true, fondo: true);

            CrearEstiloCriterio(negrita: true, fondo: true);
            CrearEstiloCriterio(negrita: true, bordeIzq: true, fondo: true);
            CrearEstiloCriterio(negrita: true, bordeDer: true, fondo: true);
            CrearEstiloCriterio(negrita: true, bordeSup: true, fondo: true);
            CrearEstiloCriterio(negrita: true, bordeSup: true, bordeIzq: true, fondo: true);
            CrearEstiloCriterio(negrita: true, bordeSup: true, bordeDer: true, fondo: true);
            CrearEstiloCriterio(negrita: true, bordeSup: true, bordeIzq: true, bordeDer: true, fondo: true);

            CrearEstiloCriterio(grande: true, fondo: true);
            CrearEstiloCriterio(grande: true, bordeIzq: true, fondo: true);
            #endregion

            CrearEstiloCriterio(titulo: true);
        }

        /// <summary>
        /// Crea las fuentes a ser utilizadas y las amacena en la propiedad _fuentes
        /// </summary>
        private void GenerarFuentes()
        {
            var bold = (short)FontBoldWeight.Bold;
            // Negrita
            var fuente = _workbook.CreateFont();
            fuente.Boldweight = bold;
            _fuentes.Add(TipoDeFuente.Negrita, fuente);
            // Grande
            fuente = _workbook.CreateFont();
            fuente.Boldweight = bold;
            fuente.FontHeightInPoints = 16;
            _fuentes.Add(TipoDeFuente.Grande, fuente);
            // Titulo
            fuente = _workbook.CreateFont();
            fuente.Boldweight = bold;
            fuente.FontHeightInPoints = 24;
            fuente.Color = IndexedColors.Green.Index;
            _fuentes.Add(TipoDeFuente.Titulo, fuente);
        }

        /// <summary>
        /// Crea una única instancia de objeto estilo y lo almacena en la lista _criterioEstilos junto con los parametros que se usaron para su creación.
        /// <para>
        /// En total se crearan 31 estilos y se sumarán a estos los correspondientes a los colores de los materiales
        /// </para>
        /// </summary>
        private void CrearEstiloCriterio(bool bordeSup = false, bool bordeDer = false, bool bordeInf = false, bool bordeIzq = false, bool negrita = false, bool grande = false, bool fondo = false, bool titulo = false)
        {
            var estilo = _workbook.CreateCellStyle();

            if (titulo)
            {
                estilo.SetFont(_fuentes[TipoDeFuente.Titulo]);
                estilo.Alignment = HorizontalAlignment.Center;
                _criterioEstilos.Add(new CriterioEstilo() { Titulo = true, ObjEstilo = estilo });
                return;
            }

            estilo.BorderTop = bordeSup ? BorderStyle.Medium : BorderStyle.Thin;
            estilo.BorderBottom = bordeInf ? BorderStyle.Medium : BorderStyle.Thin;
            estilo.BorderLeft = bordeIzq ? BorderStyle.Medium : BorderStyle.Thin;
            estilo.BorderRight = bordeDer ? BorderStyle.Medium : BorderStyle.Thin;
            estilo.VerticalAlignment = VerticalAlignment.Center;
            if (fondo)
            {
                estilo.FillForegroundColor = _indicesColores["#D9D9D9"];
                estilo.FillPattern = FillPattern.SolidForeground;
            }
            if (negrita) estilo.SetFont(_fuentes[TipoDeFuente.Negrita]);
            if (grande) estilo.SetFont(_fuentes[TipoDeFuente.Grande]);

            _criterioEstilos.Add(new CriterioEstilo()
            {
                BordeDer = bordeDer,
                BordeIzq = bordeIzq,
                BordeSup = bordeSup,
                BordeInf = bordeInf,
                Negrita = negrita,
                Grande = grande,
                Fondo = fondo,
                ObjEstilo = estilo
            });
        }

        /// <summary>
        /// Crea una columna al principio de la fila con el color del producto
        /// </summary>
        private void InsertarColumnaColor(IRow fila)
        {
            // Busco si existe previamente un estilo que ya tenga definido ese color antes de crear uno nuevo, ya que NPOI solo cuenta con un maximo de 4000 estilos.
            ICellStyle estiloColor = _estilosColores.FirstOrDefault(x => x.FillForegroundColor == _indiceColorActual);
            if (estiloColor == null)
            {
                estiloColor = _workbook.CreateCellStyle();
                estiloColor.FillForegroundColor = _indiceColorActual;
                estiloColor.FillPattern = FillPattern.SolidForeground;
                _estilosColores.Add(estiloColor);
            }
            var celdaColor = fila.CreateCell(0);
            celdaColor.CellStyle = estiloColor;
        }
    }
}
