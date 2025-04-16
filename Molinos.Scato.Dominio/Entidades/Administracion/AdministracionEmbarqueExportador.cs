using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AdministracionEmbarqueExportador : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }

        public virtual AdministracionEmbarque AdministracionEmbarque { get; set; }
        public virtual Exportador Exportador { get; set; }
    }
}