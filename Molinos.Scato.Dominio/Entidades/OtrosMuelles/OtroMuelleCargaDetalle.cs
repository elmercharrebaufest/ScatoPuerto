using System;

namespace Molinos.Scato.Dominio.Entidades
{
    public class OtroMuelleCargaDetalle : IIdentificable
    {
        public virtual int Id { get; set; }
        public virtual OtroMuelleCarga OtroMuelleCarga { get; set; }
        public virtual DateTime FechaHoraInicio { get; set; }
        public virtual DateTime FechaHoraFin { get; set; }
        public virtual Exportador Exportador { get; set; }
        public virtual Destino Destino { get; set; }
        public virtual MaterialPuerto MaterialPuerto { get; set; }
        public virtual string TipoMaterial { get; set; }
        public virtual decimal CantidadTn { get; set; }
    }
}
