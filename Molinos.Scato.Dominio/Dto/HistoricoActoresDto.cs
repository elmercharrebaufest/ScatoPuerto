using System;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class HistoricoActoresDto
    {
        public int Id { get; set; }
        public string Accion { get; set; }
        public string Usuario { get; set; }
        public DateTime Fecha { get; set; }
        public EmbarqueDto Embarque{ get; set; }
    }
}
