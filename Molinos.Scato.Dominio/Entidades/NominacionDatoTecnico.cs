using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class NominacionDatoTecnico : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual decimal CantidadTotal { get; set; }
        public virtual int Tolerancia { get; set; }
        public virtual string Observaciones { get; set; }
        public virtual VaporInformacion VaporInformacion { get; set; }
        public virtual DateTime? ETARecalada { get; set; }
        public virtual DateTime? ObligacionDeCarga { get; set; }
        public virtual MuelleDeCarga MuelleDeCarga { get; set; }
        public virtual TasaDeCarga TasaDeCarga { get; set; }
        public virtual decimal? TasaDeCargaValor { get; set; }
        public virtual decimal DEM { get; set; }
        public virtual decimal DES { get; set; }
        public virtual TipoDeContrato TipoDeContrato { get; set; }
        public virtual ATAPuerto ATAPuerto { get; set; }
        public virtual AgenciaMaritimaPuerto AgenciaMaritimaPuerto { get; set; }
        public virtual Surveyor Surveyor { get; set; }
        public virtual string ObservacionesSurveyor { get; set; }
        public virtual ICollection<NominacionDatoTecnicoCalidad> NominacionDatoTecnicoCalidad { get; set; }
        public virtual ICollection<NominacionDatoTecnicoCoordinadorPuerto> NominacionDatoTecnicoCoordinadorPuerto { get; set; }
        public virtual ICollection<NominacionDatoTecnicoExportador> NominacionDatoTecnicoExportador { get; set; }
        public virtual ICollection<NominacionDatoTecnicoDestino> NominacionDatoTecnicoDestino { get; set; }
        public virtual string OtroMuelleNombre { get; set; }
    }
}
