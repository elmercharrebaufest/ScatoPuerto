using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AgenciaMaritimaPuerto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Nombre { get; set; }
        public virtual string Cuit { get; set; }
        public bool Activa { get; set; }
        public string CodigoSap { get; set; }
        public ATAPuerto AtaPuerto { get; set; }
    }
}
