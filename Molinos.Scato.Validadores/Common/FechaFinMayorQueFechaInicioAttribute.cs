using System;
using System.ComponentModel.DataAnnotations;

public class FechaFinMayorQueFechaInicioAttribute : ValidationAttribute
{
    private readonly string _fechaInicioPropertyName;

    public FechaFinMayorQueFechaInicioAttribute(string fechaInicioPropertyName)
    {
        _fechaInicioPropertyName = fechaInicioPropertyName;
    }

    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        var fechaInicioProperty = validationContext.ObjectType.GetProperty(_fechaInicioPropertyName);

        if (fechaInicioProperty != null)
        {
            var fechaInicioValue = (DateTime)fechaInicioProperty.GetValue(validationContext.ObjectInstance, null);

            if (value != null && (DateTime)value <= fechaInicioValue)
            {
                return new ValidationResult($"La fecha de fin {validationContext.MemberName} debe ser mayor que la fecha de inicio {_fechaInicioPropertyName}.");
            }
        }

        return ValidationResult.Success;
    }
}
