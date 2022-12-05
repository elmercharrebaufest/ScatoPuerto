using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionDatoTecnico
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual Nominacion Nominacion { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual int CantidadTotal { get; set; }
        public virtual int Tolterancia { get; set; }
        public virtual string Observaciones { get; set; }
        public virtual Vapor Vapor { get; set; }
        public virtual DateTime? ETARecalada { get; set; }
        public virtual DateTime? ObligacionDeCarga { get; set; }
        public virtual MuelleDeCarga MuelleDeCarga { get; set; }
        public virtual TasaDeCarga TasaDeCarga { get; set; }
        public virtual decimal DEM { get; set; }
        public virtual decimal DES { get; set; }
        public virtual TipoContrato TipoContrato { get; set; }
        public virtual ATAPuerto ATAPuerto { get; set; }
        public virtual AgenciaMaritimaPuerto AgenciaMaritimaPuerto { get; set; }
        public virtual Surveyor Surveyor { get; set; }
        public virtual string ObservacionesSurveyor { get; set; }
    }
}
