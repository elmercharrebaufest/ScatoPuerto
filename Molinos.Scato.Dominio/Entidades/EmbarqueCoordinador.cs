using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class EmbarqueCoordinador
    {
        public virtual CoordinadorPuerto CoordinadorPuerto { get; set; }
        public virtual Embarque Embarque { get; set; }
    }
}