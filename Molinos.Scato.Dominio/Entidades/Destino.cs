using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    [Table("Destino")]
    public class Destino : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Nombre { get; set; }
        public virtual bool Activo { get; set; }
        public ICollection<Embarque> Embarques { get; set; }
        public ICollection<NominacionDatoTecnicoDestino> NominacionDatoTecnicoDestinos { get; set; }
    }
}
