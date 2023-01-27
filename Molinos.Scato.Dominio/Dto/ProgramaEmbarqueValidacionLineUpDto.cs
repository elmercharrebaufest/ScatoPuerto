using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public static class MensajeEnvioLineUp
    {
        public static readonly string ENVIO_OK = "Se ha dado de alta un nuevo embarque.";
        public static readonly string ENVIO_PRODUCTO_EXISTENTE = "El producto ya existe para el embarque.";
        public static readonly string ENVIO_PRODUCTO_AGREGADO = "Se agrego el producto al embarque existente.";
        public static readonly string ENVIO_MUELLE_CARGA = "El embarque existente, se encuentra en muelle de carga.";

    }

    public class ResultadoEnvioLineUpDto
    {
        public List<RespuestaEnvioLineUpDto> ResultadoEnvioLineUp{ get; set; }
    }
    public class RespuestaEnvioLineUpDto
    {
        public int Nominacion_Id { get; set; }
        public int Estado { get; set; }
        public string Observacion { get; set; }
    }

    public class ProgramaEmbarqueNominacionesEnvioLineUpDto
    {
        public List<ProgramaEmbarqueNominacionDto> ListaNominaciones { get; set; }
    }
    public class ProgramaEmbarqueNominacionDto
    {
        public int Nominacion_Id { get; set; }
    }
    public class ProgramaEmbarqueValidacionLineUpDto
    {
        public ProgramaEmbarqueMaterialDto ProgramaEmbarqueEmbarqueMaterial { get; set; }
    }

    public class ProgramaEmbarqueMaterialDto
    {
        public EmbarqueDto Embarque { get; set; }
        public MaterialPuertoCantidadExisteDto MaterialesExistentes { get; set; }
    }

    public class MaterialPuertoCantidadExisteDto
    {
        public MaterialPuertoCantidadDto MaterialesPuertoCantidad { get; set; }
        public bool Existe { get; set; }
    }

}
