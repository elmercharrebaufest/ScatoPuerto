using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Administracion;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

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
            ProvisionGasto newProvisionGasto = null;
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
                newProvisionGasto = this.Repositorio.Agregar(newProvision);

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

                this.AgregarLogEdicion(comando);
            }
            this.Repositorio.GuardarCambios();
            if (newProvisionGasto != null)
            {
                this.AgregarLogAlta(comando, newProvisionGasto.Id);
            }
        }

        protected override void Validar(GuardarProvision comando, Resultado resultado)
        {
        }

        private void AgregarLogAlta(GuardarProvision comando, int id)
        {
            var logAlta = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Alta,
                Entidad = comando.Dto.ToJson(),
                ClaseId = id
            };
            Repositorio.Agregar(logAlta);
            Repositorio.GuardarCambios();
        }

        private void AgregarLogEdicion(GuardarProvision comando)
        {
            var logEdicion = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = comando.Dto.ToJson(),
                ClaseId = comando.Dto.ProvisionId
            };
            Repositorio.Agregar(logEdicion);
        }
    }
}