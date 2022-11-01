using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Dominio.Entidades
{
    public class HistoricoActores
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual string Accion { get; set; }
        public virtual string Usuario { get; set; }
        public virtual DateTime Fecha { get; set; }
        public virtual Embarque Embarque { get; set; }



    }
}
