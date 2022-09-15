using System;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class Logging: IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public string Servicio { get; set; }
        public string Data { get; set; }
        public string Tipo { get; set; }
        public string Usuario { get; set; }
        public DateTime? Fecha { get; set; }
    }
}
