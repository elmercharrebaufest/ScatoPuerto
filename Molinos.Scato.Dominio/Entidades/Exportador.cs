using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Molinos.Scato.Dominio.Entidades
{
    [Table("Exportador")]
    public class Exportador : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Nombre { get; set; }
        public virtual Almacen Almacen { get; set; }
        public virtual bool Habilitado { get; set; }
        public string Cuit { get; set; }
        public string CodigoSap { get; set; }
        public ICollection<CargaComercial> CargasComerciales { get; set; }
        public ICollection<NominacionDatoTecnicoExportador> NominacionDatoTecnicoExportadores { get; set; }

    }
}
