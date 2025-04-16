using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AdministracionEmbarqueAgencia : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }

        public virtual AdministracionEmbarque AdministracionEmbarque { get; set; }
        public virtual AgenciaMaritimaPuerto AgenciaMaritimaPuerto { get; set; }
    }
}