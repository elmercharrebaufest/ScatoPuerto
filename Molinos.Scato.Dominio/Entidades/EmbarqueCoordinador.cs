using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class EmbarqueCoordinador: IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual CoordinadorPuerto CoordinadorPuerto { get; set; }
        public virtual Embarque Embarque { get; set; }
    }
}