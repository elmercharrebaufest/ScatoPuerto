using System;
using System.Activities;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Servicios;

namespace Molinos.Scato.Actividades.Internas
{
    public sealed class DarDeAltaCtgManual : CodeActivity
    {
        public InOutArgument<CartaPorteDto> Orden { get; set; }
        public InArgument<string> CodigoCTG { get; set; }
        public InArgument<decimal> TarifaReferencia { get; set; }
        public OutArgument<Resultado> Resultado { get; set; }
        public InArgument<Guid> WorkflowId { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var orden = Orden.Get<CartaPorteDto>(context);
            var codigoCTG = CodigoCTG.Get<string>(context);
            var tarifaReferencia = TarifaReferencia.Get<decimal>(context);
            var workflowId = WorkflowId.Get<Guid>(context);

            try
            {
                var baja = new AltaCTGDto
                {
                    CartaPorteId = orden.Id,
                    CodigoCTG = codigoCTG,
                    TarifaReferencia = tarifaReferencia,
                    Fecha = DateTime.UtcNow,
                    WorkflowId = workflowId
                };

                var servicioComandos = context.GetExtension<IServicioComandos>();
                var resultado = servicioComandos.Ejecutar(new CrearAltaCTG { Dto = baja });
                if (!resultado.HayErrores)
                {
                    var repositorio = context.GetExtension<IServicioRepositorio>();
                    Orden.Set(context, repositorio.ObtenerCartaPortePorInstanceId(workflowId));
                }
                Resultado.Set(context, resultado);
            }
            catch (Exception e)
            {
                var resultado = new Resultado();
                resultado.Errores.Add("", e.Message);
                Resultado.Set(context, resultado);
            }
        }
    }
}