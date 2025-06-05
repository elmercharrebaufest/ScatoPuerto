using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Administracion;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento.Administracion
{
    public class ProcesadorGuardarTarifaPorEmbarque : ProcesadorModificar<GuardarTarifaPorEmbarque>
    {
        public ProcesadorGuardarTarifaPorEmbarque(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio = null) : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(GuardarTarifaPorEmbarque comando)
        {
            if (comando.Dto.Id == 0)
            {
                var embarque = this.Repositorio.Obtener<Embarque>(m => m.Id == comando.Dto.Embarque.Id);
                var exportador = this.Repositorio.Obtener<Exportador>(m => m.Id == comando.Dto.Exportador.Id);
                var materialPuerto = this.Repositorio.Obtener<MaterialPuerto>(m => m.Id == comando.Dto.MaterialPuerto.Id);
                TipoContratoTarifa tipoContrato = null;
                if (comando.Dto.TipoContratoTarifa != null)
                    tipoContrato = this.Repositorio.Obtener<TipoContratoTarifa>(c => c.Id == comando.Dto.TipoContratoTarifa.Id);

                var newTarifaEmbarque = new TarifaPorEmbarque
                {
                    Embarque = embarque,
                    Exportador = exportador,
                    MaterialPuerto = materialPuerto,
                    Periodo = comando.Dto.Periodo,
                    TarifaPorEmbarqueConcepto = new List<TarifaPorEmbarqueConcepto>(),
                    TipoContratoTarifa = tipoContrato
                };

                if (comando.Dto.Cerrado)
                {
                    newTarifaEmbarque.Cerrado = true;
                }

                this.Repositorio.Agregar(newTarifaEmbarque);

                foreach (var conceptoTarifa in comando.Dto.TarifaPorEmbarqueConcepto)
                {
                    var newConcepto = this.Repositorio.Obtener<Concepto>(c => c.Id == conceptoTarifa.Concepto.Id);
                    var newConceptoTarifa = new TarifaPorEmbarqueConcepto
                    {
                        TarifaPorEmbarque = newTarifaEmbarque,
                        Concepto = newConcepto,
                        Valor = conceptoTarifa.Valor,
                    };

                    newTarifaEmbarque.TarifaPorEmbarqueConcepto.Add(newConceptoTarifa);
                }
            }
            else
            {
                var tarifaEmbBd = this.Repositorio.Obtener<TarifaPorEmbarque>(t => t.Id == comando.Dto.Id);
                if(comando.Dto.TipoContratoTarifa != null)
                {
                    var tipoContratoTarifa = this.Repositorio.Obtener<TipoContratoTarifa>(tc => tc.Id == comando.Dto.TipoContratoTarifa.Id);
                    tarifaEmbBd.TipoContratoTarifa = tipoContratoTarifa;
                }

                if (tarifaEmbBd.Cerrado)
                {
                    throw new Exception("No se puede modificar una tarifa cerrada.");
                }

                if (comando.Dto.Cerrado)
                {
                    tarifaEmbBd.Cerrado = true;
                }
                var tarifasConceptosBd = tarifaEmbBd?.TarifaPorEmbarqueConcepto.ToList();

                // Agregar o actualizar agencias
                foreach (var tarifaConceptoDto in comando.Dto.TarifaPorEmbarqueConcepto)
                {
                    var tarifaProdConceptoBd = this.Repositorio.Obtener<TarifaPorEmbarqueConcepto>(t => t.Id == tarifaConceptoDto.Id);
                    if (tarifaProdConceptoBd == null)
                    {
                        var conceptoBd = this.Repositorio.Obtener<Concepto>(c => c.Id == tarifaConceptoDto.Concepto.Id);
                        var nuevaTarifaProdConcepto = new TarifaPorEmbarqueConcepto
                        {
                            TarifaPorEmbarque = tarifaEmbBd,
                            Concepto = conceptoBd,
                            Valor = tarifaConceptoDto.Valor,
                        };
                        tarifaEmbBd.TarifaPorEmbarqueConcepto.Add(nuevaTarifaProdConcepto);
                    }
                    else
                    {
                        tarifaProdConceptoBd.Valor = tarifaConceptoDto.Valor;
                    }
                }

                var conceptosIdAgregados = comando.Dto.TarifaPorEmbarqueConcepto.Select(t => t.Concepto.Id);
                var tarifasConceptoAEliminar = tarifasConceptosBd.Where(t => !conceptosIdAgregados.Contains(t.Concepto.Id));
                if (tarifasConceptoAEliminar != null && tarifasConceptoAEliminar.Any())
                {
                    foreach (var tc in tarifasConceptoAEliminar)
                    {
                        this.Repositorio.Remover(tc);
                    }
                }

                Repositorio.GuardarCambios();
            }
        }

        protected override void Validar(GuardarTarifaPorEmbarque comando, Resultado resultado)
        {
            //throw new NotImplementedException();
        }
    }
}