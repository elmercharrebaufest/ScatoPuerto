using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionDatoTecnicoExportador : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual NominacionDatoTecnico NominacionDatoTecnico { get; set; }
        public virtual Exportador Exportador { get; set; }
        public virtual int Cantidad { get; set; }
        public virtual int Tolerancia { get; set; }
        public virtual bool? ToleranciasDiferenciadas { get; set; }
        public virtual int? ToleranciaPositiva { get; set; }
        public virtual int? ToleranciaNegativa { get; set; }
    }
}
