using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class CalidadValor : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Valor { get; set; }
        public virtual string Parametro { get; set; }
        public virtual TipoDeCalidad TipoDeCalidad { get; set; }
        public virtual bool Activo { get; set; }
    }
}
