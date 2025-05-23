using Molinos.Scato.Servicios.Conversiones;

namespace Molinos.Scato.Servicios.Procesamiento.Administracion
{
    public class ProcesadorGuardarProvision : ProcesadorModificar<GuardarProvision>
    {
        public ProcesadorGuardarProvision(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio = null) : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(GuardarProvision comando)
        {
            var provisionDto = comando.Dto;
            var tarifaEmb = this.Repositorio.Obtener<TarifaPorEmbarque>(t => t.Id == provisionDto.TarifaPorEmbarque.Id);
            var provision = this.Repositorio.Obtener<ProvisionGasto>(p => p.Id == provisionDto.ProvisionId);
            var detalles = provisionDto.ItemsProvision;
            if (provision == null)
            {
                var newProvision = new ProvisionGasto
                {
                    TarifaPorEmbarque = tarifaEmb,
                    ProvisionGastoDetalle = new List<ProvisionGastoDetalle>()
                };
                this.Repositorio.Agregar(newProvision);

                foreach (var tarifaConcepto in tarifaEmb.TarifaPorEmbarqueConcepto)
                {
                    var detalle = detalles.First(d => d.Concepto.Id == tarifaConcepto.Concepto.Id);
                    var newDetalle = new ProvisionGastoDetalle
                    {
                        TarifaPorEmbarqueConcepto = tarifaConcepto,
                        ValorCalculado = ServicioRepositorio.ObtenerValorCalculado(tarifaConcepto),
                        ValorAjustado = detalle.Valor
                    };
                    newProvision.ProvisionGastoDetalle.Add(newDetalle);
                }
            }
            else
            {
                foreach (var tarifaConcepto in tarifaEmb.TarifaPorEmbarqueConcepto)
                {
                    var detalle = detalles.First(d => d.Concepto.Id == tarifaConcepto.Concepto.Id);
                    var provisionDetalleBd = this.Repositorio.Obtener<ProvisionGastoDetalle>(d => d.TarifaPorEmbarqueConcepto.Id == tarifaConcepto.Id);
                    if (provisionDetalleBd.ValorAjustado != detalle.Valor)
                        provisionDetalleBd.ValorAjustado = detalle.Valor;
                }
            }
            this.Repositorio.GuardarCambios();
        }

        protected override void Validar(GuardarProvision comando, Resultado resultado)
        {
        }
    }
}