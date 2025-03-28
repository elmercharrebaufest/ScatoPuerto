using System;
using System.Collections.Generic;

namespace Molinos.Scato.Dominio.Dto
{
    public enum TipoEvento
    {
        Normal,
        Corte,
        BajaCarga
    }

    public class EventoEmbarqueLiqDto
    {
        public DateTime FechaInicio { get; set; }
        public DateTime FechaCorte { get; set; }
        public TimeSpan Tiempo { get; set; }
        public int? Cantidad { get; set; }
        public string MotivoFalla { get; set; }
        public string TipoLinea { get; set; }
        public TipoEvento TipoEvento { get; set; }
        public string DetalleEvento { get; set; }
        public string TkTierra { get; set; }
        public int? Parcel { get; set; }
    }

    public class EventosPorLineaDto
    {
        public IList<EventoEmbarqueLiqDto> Eventos { get; set; }
        public string TipoLinea { get; set; }
    }
}