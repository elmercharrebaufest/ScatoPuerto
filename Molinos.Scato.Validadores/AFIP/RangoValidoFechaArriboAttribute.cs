using System;
using System.ComponentModel.DataAnnotations;

public class RangoValidoFechaArriboAttribute : ValidationAttribute
{
    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        if (value is DateTime fecha)
        {
            var minimo = DateTime.Now.AddHours(5);
            var maximo = DateTime.Now.AddHours(96);
            if (fecha < minimo || fecha > maximo)
            {
                return new ValidationResult("La fecha de arribo debe ser entre 5 y 96hs posteriores");
            }
            return ValidationResult.Success;
        }
        return new ValidationResult("La fecha de arribo no es válida");
    }
}
