using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public class ProductoDto
    {
        public string Descripcion { get; set; }
        public string DescripcionCorta { get; set; }
        public string FormatoMaterial { get; set; }
        public IList<CalidadProductoDto> Calidades { get; set; }
    }

    public class CalidadProductoDto
    {
        public string TipoCalidad { get; set; }
        public IList<ParametroValorDto> Valores { get; set; }
    }

    public class ParametroValorDto
    {
        public string Parametro { get; set; }
        public string Valor { get; set; }
    }
}