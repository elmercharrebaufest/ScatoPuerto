using System;
using System.ComponentModel.DataAnnotations;

public class FechaValidaAttribute : ValidationAttribute
{
    public override bool IsValid(object value)
    {
        if (value is DateTime fecha)
        {
            // Lógica de validación personalizada para la fecha
            return fecha > DateTime.Now;
        }

        return false; // No es una fecha válida
    }
}
