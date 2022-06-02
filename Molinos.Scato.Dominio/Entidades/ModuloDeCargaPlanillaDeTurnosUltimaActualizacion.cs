using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Entidades
{
    public class ModuloDeCargaPlanillaDeTurnosUltimaActualizacion : IIdentificable
    {
        [Key]
        public virtual int Id { get; set; }
        public virtual int Carga_Id { get; set; }
        public virtual ModuloDeCarga ModuloDeCarga { get; set; }
        public virtual DateTime? Fecha { get; set; }


    }
}