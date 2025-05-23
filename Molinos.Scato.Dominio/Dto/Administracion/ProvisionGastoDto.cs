using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto.Administracion
{
    public class ProvisionGastoDto
    {
        public int Id { get; set; }
        public DateTime? FechaCierre { get; set; }
        public string UsuarioCierre { get; set; }
        public TarifaPorEmbarqueDto TarifaPorEmbarque { get; set; }
        public IList<ProvisionGastoDetalleDto> ProvisionGastoDetalle { get; set; }

    }
}