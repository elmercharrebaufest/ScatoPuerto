using System;
using System.ComponentModel.DataAnnotations;
using Molinos.Scato.Dominio.Recursos;

namespace Molinos.Scato.Dominio.Dto
{
    public sealed class ControlRecorridoDto
    {
        public int Id { get; set; }
        public Guid WorkflowInstanceId { get; set; }
        public string NombreUsuario { get; set; }
        public string Actividad { get; set; }
        public string ActividadXaml { get; set; }
        [MaxLength(100, ErrorMessageResourceType = typeof(Textos), ErrorMessageResourceName = "Error_ExcedeLargoMaximo")]
        public string Mensaje { get; set; }
        [MaxLength(1000, ErrorMessageResourceType = typeof(Textos), ErrorMessageResourceName = "Error_ExcedeLargoMaximo")]
        public string Comentario { get; set; }
        public bool Decision { get; set; }
        public DateTime Fecha { get; set; }
        public int PuestoDeTrabajoId { get; set; }
    }
}
