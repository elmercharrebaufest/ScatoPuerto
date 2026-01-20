using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class MaterialPuerto : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string CodigoSAP { get; set; }
        public virtual string Descripcion { get; set; }
        public virtual string DescripcionCorta { get; set; }
        public virtual string DescripcionCortaIngles { get; set; }
        public virtual Almacen Almacen { get; set; }
        public virtual bool EsLiquido { get; set; }
        public virtual string Color { get; set; }
        public virtual bool Activo { get; set; }
        public virtual ICollection<MaterialPuertoCantidad> MaterialPuertoCantidades { get; set; }

    }
}
