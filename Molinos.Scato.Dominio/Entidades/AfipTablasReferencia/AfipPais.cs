using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class AfipPais : IIdentificable
    {
        [Key]
        public int Id { get; set; }
        public string Codigo { get; set; }
        public string Descripcion { get; set; }
        public int VigenciaDesde { get; set; }
        public int VigenciaHasta { get; set; }
        public string Pais { get; set; }
        public string Aduana { get; set; }
    }
}
