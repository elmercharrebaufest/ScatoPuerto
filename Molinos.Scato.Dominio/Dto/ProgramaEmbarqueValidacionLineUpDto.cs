using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Dto
{
    public static class ProgramaEmbarqueMensajeEnvioLineUp
    {
        public static readonly string ENVIO_LINEUP_OK = "Se ha dado de alta un nuevo embarque para la nominacion en el lineUp";
        public static readonly string ENVIO_LINEUP_PRODUCTO_EXISTENTE = "Se ha enviado al lineup, pero no se agrego el producto porque este ya existia para el embarque.";
        public static readonly string ENVIO_LINEUP_PRODUCTO_AGREGADO = "Se ha enviado al lineup, agregandose el producto al embarque.";
    }

    public class ProgramaEmbarqueResultadoEnvioLineUpDto
    {
        public int Nominacion_Id { get; set; }
        public int EstadoEnvio { get; set; }
        public int Observacion { get; set; }
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
