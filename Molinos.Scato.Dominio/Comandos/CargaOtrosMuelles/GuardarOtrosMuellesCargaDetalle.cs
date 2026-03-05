using Molinos.Scato.Dominio.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Comandos
{
    public class GuardarOtrosMuellesCargaDetalle : Comando
    {
        public OtroMuelleCargaDetalleDto Dto { get; set; }
        public int EmbarqueId { get; set; }
    }
}
