using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipCaratula : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string IdentificadorCaratula { get; set; }
        public virtual string IdentificadorBuque { get; set; }
        public virtual string CodigoAduana { get; set; }
        public virtual string CodigoLugarOperativo { get; set; }
        public virtual DateTime FechaArribo { get; set; }
        public virtual DateTime FechaZarpada { get; set; }
        public virtual string Via { get; set; }
        public virtual string NombreMedioTransporte { get; set; }
        public virtual string PuertoDestino { get; set; }
        public virtual string NumeroViaje { get; set; }
        public virtual ICollection<AfipCaratulaItinerario> Itinerario { get; set; }
        public virtual DateTime FechaRegistro { get; set; }
        public virtual string Estado { get; set; }
        public virtual ICollection<AfipCoem> Coems { get; set; }
        public virtual ICollection<AfipSolicitudCambioBuque> SolicitudesCambioBuque { get; set; }
        public virtual ICollection<AfipSolicitudCambioFechas> SolicitudesCambioFechas { get; set; }
        public virtual string IdentificadorCierre { get; set; }
        public virtual ICollection<AfipSolicitudCierreCarga> SolicitudesCierreCarga { get; set; }
        public virtual bool EsLiquido { get; set; }
    }
}
