using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Linq;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarLineasDeEmbarque : ProcesadorComando<GuardarLineasDeEmbarque>
    {
        public ProcesadorGuardarLineasDeEmbarque(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioRepositorio servicioRepositorio)
            : base(repositorio, conversor, log, servicioRepositorio) { }

        public override Resultado Ejecutar(GuardarLineasDeEmbarque comando)
        {
            var resultado = new Resultado();
            try
            {
                int moduloCargaId = comando.IdModuloDeCarga;
                var moduloDeCarga = Repositorio.Obtener<ModuloDeCarga>(x => x.Id == moduloCargaId);

                #region Histórico
                var logAbm = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = moduloDeCarga.ModuloDeCargaLineasDeEmbarque.Any() ? EventoABM.Modificacion : EventoABM.Alta,
                    Entidad = comando.ToJson()
                };
                Repositorio.Agregar(logAbm);

                if (moduloDeCarga.FechaDeCreacion == null)
                {
                    moduloDeCarga.FechaDeCreacion = DateTime.Now;
                }
                else
                {
                    moduloDeCarga.FechaDeModificacion = DateTime.Now;
                }
                ServicioRepositorio.GenerarLogging(comando.GetType().Name, comando.Dto.ToJson(), "POST", comando.Usuario);
                #endregion

                #region Elimando
                var idsLineasDto = comando.Dto.Select(l => l.Id);
                var lineasEliminar = Repositorio.Listar<ModuloDeCargaLineasDeEmbarque>(x => x.ModuloDeCarga.Id == moduloCargaId && !idsLineasDto.Contains(x.Id));
                if (lineasEliminar.Any())
                {
                    var idsLineasEliminar = lineasEliminar.Select(l => l.Id);

                    // Se verifica que ninguna de las líneas a eliminar se encuentre en uso en un turno cerrado. No debería ocurrir ya que previamente se valida en el front
                    var idsLlineasCerradas = moduloDeCarga.ModuloDeCargaPlanillaDeTurnos
                        .Where(t => t.GuardadoPorRecibidor)
                        .SelectMany(t => t.ModuloDeCargaPlanillaDeTurnosDetallesLiquido)
                        .Select(d => d.Linea_Id).Distinct();

                    if (idsLlineasCerradas.Intersect(idsLineasEliminar).Any())
                    {
                        throw new Exception("La línea de embarque no se puede eliminar debido a que está relacionada a un turno cerrado.");
                    }

                    var lineasEliminarJson = Conversor.ConvertirList<ModuloDeCargaLineasDeEmbarque, ModuloDeCargaLineasDeEmbarqueDto>(lineasEliminar).ToJson();
                    var logBaja = new LogABM
                    {
                        Pantalla = comando.GetType().Name,
                        Usuario = comando.Usuario,
                        Fecha = DateTime.Now,
                        Evento = EventoABM.Baja,
                        Entidad = lineasEliminarJson
                    };
                    Repositorio.Agregar(logBaja);

                    Repositorio.RemoverTodos(lineasEliminar);
                }
                #endregion

                #region Guardando y Actualizando
                foreach (var linea in comando.Dto)
                {
                    var lineaDeEmbarque = Repositorio.Obtener<ModuloDeCargaLineasDeEmbarque>(x => x.Id == linea.Id);
                    var material = Repositorio.Obtener<MaterialPuerto>(x => x.Id == linea.MaterialPuerto.Id);
                    var tipoLineaEmbarque = Repositorio.Obtener<TipoLineaEmbarque>(x => x.Id == linea.TipoLineaEmbarque.Id);
                    if (lineaDeEmbarque != null)
                    {
                        lineaDeEmbarque.ModuloDeCarga = moduloDeCarga;
                        lineaDeEmbarque.Linea = tipoLineaEmbarque.Linea;
                        lineaDeEmbarque.TipoLineaEmbarque = tipoLineaEmbarque;
                        lineaDeEmbarque.MaterialPuerto = material;
                        lineaDeEmbarque.TkInicial = linea.TkInicial;
                        lineaDeEmbarque.TemperaturaInicial = linea.TemperaturaInicial;
                        lineaDeEmbarque.AlturaInicialCM = linea.AlturaInicialCM;
                        lineaDeEmbarque.AlturaInicialMM = linea.AlturaInicialMM;
                        lineaDeEmbarque.DensidadInicial = linea.DensidadInicial;
                        lineaDeEmbarque.TemperaturaFinal = linea.TemperaturaFinal;
                        lineaDeEmbarque.Litros = linea.Litros;
                        lineaDeEmbarque.DensidadFinal = linea.DensidadFinal;
                        lineaDeEmbarque.AlturaFinalCM = linea.AlturaFinalCM;
                        lineaDeEmbarque.AlturaFinalMM = linea.AlturaFinalMM;
                        lineaDeEmbarque.Kilos = linea.Kilos;
                        lineaDeEmbarque.TkFinal = linea.TkFinal;
                        lineaDeEmbarque.KilosFinales = linea.KilosFinales;
                        lineaDeEmbarque.LitrosFinales = linea.LitrosFinales;

                        // Si la línea está en uso en algun turno entonces se deben modificar los datos ahí también
                        var planillaDeTurnoDetalles = Repositorio.Listar<ModuloDeCargaPlanillaDeTurnosDetallesLiquido>(d => d.Linea_Id == linea.Id);
                        foreach (var detalle in planillaDeTurnoDetalles)
                        {
                            detalle.MaterialPuerto = material;
                            detalle.Tk = linea.TkInicial;
                        }
                    }
                    else
                    {
                        var lineaEmbarque = new ModuloDeCargaLineasDeEmbarque()
                        {
                            ModuloDeCarga = moduloDeCarga,
                            Linea = tipoLineaEmbarque.Linea,
                            TipoLineaEmbarque = tipoLineaEmbarque,
                            MaterialPuerto = material,
                            TkInicial = linea.TkInicial,
                            TemperaturaInicial = linea.TemperaturaInicial,
                            AlturaInicialCM = linea.AlturaInicialCM,
                            AlturaInicialMM = linea.AlturaInicialMM,
                            DensidadInicial = linea.DensidadInicial,
                            TemperaturaFinal = linea.TemperaturaFinal,
                            Litros = linea.Litros,
                            DensidadFinal = linea.DensidadFinal,
                            AlturaFinalCM = linea.AlturaFinalCM,
                            AlturaFinalMM = linea.AlturaFinalMM,
                            Kilos = linea.Kilos,
                            TkFinal = linea.TkFinal,
                            KilosFinales = linea.KilosFinales,
                            LitrosFinales = linea.LitrosFinales,
                        };

                        moduloDeCarga.ModuloDeCargaLineasDeEmbarque.Add(lineaEmbarque);
                    }
                }
                Repositorio.GuardarCambios();
                #endregion
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al guardar líneas {0}", e);
            }
            return resultado;
        }
    }
}