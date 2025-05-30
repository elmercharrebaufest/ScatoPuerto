using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Administracion;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace Molinos.Scato.Servicios.Procesamiento.Administracion
{
    public class ProcesadorConfirmarProvisiones : ProcesadorModificar<ConfirmarProvisiones>
    {
        public ProcesadorConfirmarProvisiones(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio = null) : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(ConfirmarProvisiones comando)
        {
            var tarifas = this.Repositorio.Listar<TarifaPorEmbarque>(t => comando.IdsTarifas.Contains(t.Id));
            foreach (var tarifa in tarifas)
            {
                var provisionBd = this.Repositorio.Obtener<ProvisionGasto>(p => p.TarifaPorEmbarque.Id == tarifa.Id);
                if (provisionBd == null)
                {
                    var newProvision = CrearProvision(tarifa, comando.Usuario);
                    this.Repositorio.Agregar(newProvision);
                }
                else
                {
                    if (provisionBd.FechaCierre == null)
                        provisionBd.FechaCierre = DateTime.Now;
                    if (provisionBd.UsuarioCierre == null)
                        provisionBd.UsuarioCierre = comando.Usuario;
                }
            }
            this.Repositorio.GuardarCambios();
        }

        private ProvisionGasto CrearProvision(TarifaPorEmbarque tarifa, string usuario)
        {
            var newProvision = new ProvisionGasto
            {
                TarifaPorEmbarque = tarifa,
                ProvisionGastoDetalle = new List<ProvisionGastoDetalle>()
            };

            foreach (var tarifaConcepto in tarifa.TarifaPorEmbarqueConcepto)
            {
                var newDetalle = new ProvisionGastoDetalle
                {
                    TarifaPorEmbarqueConcepto = tarifaConcepto,
                    ValorCalculado = ServicioRepositorio.ObtenerValorCalculado(tarifaConcepto),
                    ValorAjustado = 0
                };
                newProvision.ProvisionGastoDetalle.Add(newDetalle);
            }
            newProvision.FechaCierre = DateTime.Now;
            newProvision.UsuarioCierre = usuario;
            return newProvision;
        }

        protected override void Validar(ConfirmarProvisiones comando, Resultado resultado)
        {
        }
    }
}