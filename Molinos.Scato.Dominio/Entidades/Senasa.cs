using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class Senasa : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual NominacionDetalleIntervencion NominacionDetalleIntervencion { get; set; }
        public virtual Exportador Exportador { get; set; }
        public virtual Destino Destino { get; set; }
        public virtual bool TieneSenasa { get; set; }
        public virtual string Consumo  { get; set; }
        public virtual string ACuentaDe { get; set; }
        public virtual bool IP { get; set; }
        public virtual bool GMO { get; set; }
        public virtual bool FITO { get; set; }
        public virtual bool MuestraOficial { get; set; }
        public virtual bool CertificadoInocuidad { get; set; }
        public virtual bool CertificadoVeterinario { get; set; }
        public virtual string Observaciones { get; set; }

    }
}
