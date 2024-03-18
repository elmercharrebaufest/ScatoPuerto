using System;

namespace Molinos.Scato.Dominio.Dto
{
    public class AuditoriaDto
    {
        public virtual int Id { get; set; }
        public virtual int Nominacion_Id { get; set; }
        public virtual int Entidad_Id { get; set; }
        public virtual string EntidadNombre { get; set; }
        public virtual string Propiedad { get; set; }
        public virtual string ValorAnterior { get; set; }
        public virtual string ValorNuevo { get; set; }
        public virtual DateTime FechaModificacion { get; set; }
        public virtual string UsuarioEjecucion { get; set; }
    }
}



