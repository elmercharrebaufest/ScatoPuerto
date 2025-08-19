using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Comandos.Productos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Entidades.Administracion;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarTarifaPorProducto : ProcesadorModificar<GuardarTarifaPorProducto>
    {
        public ProcesadorGuardarTarifaPorProducto(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio = null) : base(repositorio, conversor, log, servicioRepositorio)
        {
        }

        protected override void ModificarEntidad(GuardarTarifaPorProducto comando)
        {
            TarifaPorProducto newTarifa = null;
            if (comando.Dto.Id == 0)
            {
                var materialPuerto = this.Repositorio.Obtener<MaterialPuerto>(m => m.Id == comando.Dto.MaterialPuerto.Id);
                var newTarifaProducto = new TarifaPorProducto
                {
                    MaterialPuerto = materialPuerto,
                    Periodo = comando.Dto.Periodo,
                    TarifaPorProductoConcepto = new List<TarifaPorProductoConcepto>()
                };

                if (comando.Dto.Cerrado)
                {
                    newTarifaProducto.Cerrado = true;
                }

                newTarifa = this.Repositorio.Agregar(newTarifaProducto);

                foreach (var conceptoTarifa in comando.Dto.TarifaPorProductoConcepto)
                {
                    var newConcepto = this.Repositorio.Obtener<Concepto>(c => c.Id == conceptoTarifa.Concepto.Id);
                    var newConceptoTarifa = new TarifaPorProductoConcepto
                    {
                        TarifaPorProducto = newTarifaProducto,
                        Concepto = newConcepto,
                        Valor = conceptoTarifa.Valor,
                    };

                    newTarifaProducto.TarifaPorProductoConcepto.Add(newConceptoTarifa);
                }
            }
            else
            {
                var tarifaProdBd = this.Repositorio.Obtener<TarifaPorProducto>(t => t.Id == comando.Dto.Id);

                if (tarifaProdBd.Cerrado)
                {
                    throw new Exception("No se puede modificar una tarifa cerrada.");
                }

                if (comando.Dto.Cerrado)
                {
                    tarifaProdBd.Cerrado = true;
                }

                var tarifasConceptosBd = tarifaProdBd?.TarifaPorProductoConcepto.ToList();

                // Agregar o actualizar agencias
                foreach (var tarifaConceptoDto in comando.Dto.TarifaPorProductoConcepto)
                {
                    var tarifaProdConceptoBd = this.Repositorio.Obtener<TarifaPorProductoConcepto>(t => t.Id == tarifaConceptoDto.Id);
                    if (tarifaProdConceptoBd == null)
                    {
                        var conceptoBd = this.Repositorio.Obtener<Concepto>(c => c.Id == tarifaConceptoDto.Concepto.Id);
                        var nuevaTarifaProdConcepto = new TarifaPorProductoConcepto
                        {
                            TarifaPorProducto = tarifaProdBd,
                            Concepto = conceptoBd,
                            Valor = tarifaConceptoDto.Valor,
                        };
                        tarifaProdBd.TarifaPorProductoConcepto.Add(nuevaTarifaProdConcepto);
                    }
                    else
                    {
                        tarifaProdConceptoBd.Valor = tarifaConceptoDto.Valor;
                    }
                }

                var conceptosIdAgregados = comando.Dto.TarifaPorProductoConcepto.Select(t => t.Concepto.Id);
                var tarifasConceptoAEliminar = tarifasConceptosBd.Where(t => !conceptosIdAgregados.Contains(t.Concepto.Id));
                if (tarifasConceptoAEliminar != null && tarifasConceptoAEliminar.Any())
                {
                    foreach (var tc in tarifasConceptoAEliminar)
                    {
                        this.Repositorio.Remover(tc);
                    }
                }

                this.AgregarLogEdicion(comando);
            }

            Repositorio.GuardarCambios();
            
            if(newTarifa != null)
            {
                AgregarLogAlta(comando, newTarifa.Id);
            }
        }

        protected override void Validar(GuardarTarifaPorProducto comando, Resultado resultado)
        {
            //throw new NotImplementedException();
        }

        private void AgregarLogAlta(GuardarTarifaPorProducto comando, int id)
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

        private void AgregarLogEdicion(GuardarTarifaPorProducto comando)
        {
            var logEdicion = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = comando.Dto.ToJson(),
                ClaseId = comando.Dto.Id
            };
            Repositorio.Agregar(logEdicion);
        }
    }
}