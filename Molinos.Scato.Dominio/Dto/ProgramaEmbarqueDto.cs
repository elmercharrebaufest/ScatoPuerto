using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class ProgramaEmbarqueDto
    {
        public int Id { get; set; }
        public bool? EnviadoFumigador { get; set; }
        public bool? EnviadoSurveyor { get; set; }
        public bool EnviadoOtros { get; set; }
        public DateTime? FechaCreacion { get; set; }
        public DateTime? FechaEnvioLineUp { get; set; }
        public DateTime? FechaEliminacion { get; set; }
        public string Producto { get; set; }
        public string NombreBuque { get; set; }
        public string MuelleDeCarga { get; set; }
        public IEnumerable<NominacionCargadorDto> Cargadores { get; set; }
        public DateTime? ETARecalada { get; set; }
        public string ProductoColor { get; set; }
        public IList<string> ListaProducto { get; set; }
        public IList<string> ListaBuque { get; set; }
        public IList<string> ListaMuelle { get; set; }
        public string Contrato { get; set; }
        public int Estado { get; set; }
        public int ItemPorPagina { get; set; }
        public int Pagina { get; set; }
        public int ItemsTotales { get; set; }
        public int CantidadTotalDatoTecnico { get; set; }
        public IEnumerable<NominacionDestinoDto> DestinoDatoTecnico { get; set; }
        public IEnumerable<NominacionClienteDto> ClienteDatoTecnico { get; set; }
        public NominacionVaporInformacionDto DatosBuque { get; set; }
        
        public int ToleranciaDatoTecnico { get; set; }
        public string ObservacionesDatoTecnico { get; set; }
        public string ATA { get; set; }
        public string AgenciaMaritima { get; set; }
        public string Surveyor { get; set; }
        public string ObservacionSurveyor { get; set; }
        public int? TasaDeCargaValor { get; set; }
        public string TasaDeCargaDescripcion { get; set; }
        public decimal DES { get; set; }
        public decimal DEM { get; set; }
        public string TipoDeContrato { get; set; }
    }

    public class NominacionCargadorDto
    {        
        public string NombreExportador { get; set; }

        public decimal Toneladas { get; set; }
    }

    public class NominacionDestinoDto
    {
        public string Descripcion { get; set; }

        public decimal Toneladas { get; set; }
    }

    public class NominacionClienteDto
    {
        public string Nombre { get; set; }
        public decimal Toneladas { get; set; }
    }
    public class NominacionVaporInformacionDto
    {
        public string NombreBuque { get; set; }
        public string Bandera { get; set; }
        public string TipoDeBuque { get; set; }
        public string IMO { get; set; }


    }

}
