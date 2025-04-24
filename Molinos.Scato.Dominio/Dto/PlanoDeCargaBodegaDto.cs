using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Molinos.Scato.Dominio.Dto
{
    public class PlanoDeCargaBodegaDto : IValidatableObject
    {
        public int? Id { get; set; }
        public int BodegaParcel { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "LA cantidad debe ser mayor o igual a 0")]
        public decimal? Cantidad { get; set; }
        public MaterialPuertoDto MaterialPuerto { get; set; }
        public string Condicion { get; set; }
        public string SfFull { get; set; }
        public DestinoDto Destino { get; set; }
        public IList<PlanoDeCargaBodegaDestinoDto> Destinos { get; set; }
        public string TanqueDeAbordo { get; set; }
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (Cantidad > 0 && Destino == null && (Destinos == null || Destinos.Count == 0))
            {
                yield return new ValidationResult("El campo Destino es obligatorio cuando la cantidad es mayor a cero.");
            }
        }
        public bool? FumPreventiva { get; set; }
        public bool? FumCurativa { get; set; }
    }
}