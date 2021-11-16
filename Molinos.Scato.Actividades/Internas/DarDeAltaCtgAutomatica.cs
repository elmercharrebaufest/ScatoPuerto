using System;
using System.Activities;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Servicios;

namespace Molinos.Scato.Actividades.Internas
{
    public sealed class DarDeAltaCtgAutomatica : CodeActivity
    {
        public InOutArgument<int> Intentos { get; set; }
        [RequiredArgument]
        public InOutArgument<CartaPorteDto> Orden { get; set; }
        [RequiredArgument]
        public InArgument<int> CentroId { get; set; }
        [RequiredArgument]
        public OutArgument<Resultado> Resultado { get; set; }
        [RequiredArgument]
        public InArgument<VehiculoDto> Vehiculo { get; set; }
        public InArgument<Guid> WorkflowId { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var intentos = Intentos.Get<int>(context);
            try
            {
                var servicioComandos = context.GetExtension<IServicioComandos>();
                var orden = Orden.Get<CartaPorteDto>(context);
                var centroId = CentroId.Get<int>(context);
                var vehiculo = Vehiculo.Get<VehiculoDto>(context);
                var workflowId = WorkflowId.Get<Guid>(context);
                var resultado = servicioComandos.Ejecutar(new DarDeAltaCTG { Dto = orden, Vehiculo = vehiculo, CentroId = centroId, WorkflowId = workflowId});
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

            Intentos.Set(context, ++intentos);
        }
    }
}