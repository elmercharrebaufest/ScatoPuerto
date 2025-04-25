using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.AFIPServicioComunicacionEmbarque;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Impl;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorAfipActualizarEstadosCoem : ProcesadorComando<AfipActualizarEstadosCoem>
    {
        private IConsultaComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;
        public ProcesadorAfipActualizarEstadosCoem(IRepositorio repositorio, IConversor conversor, ILogger log, IConsultaComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log)
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;
        }

        public override Resultado Ejecutar(AfipActualizarEstadosCoem comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var caratulaDb = Repositorio.Obtener<AfipCaratula>(comando.Id) ?? throw new Exception("No se ha encontrado la carátula especificada");
                var res = this.comunicacionEmbarqueServicioHelper.ConsultarEstadosCOEM(caratulaDb.IdentificadorCaratula);

                if (res.Errores.Count() > 0)
                {
                    StringBuilder sb = new StringBuilder();
                    sb.AppendLine("Se ha rechazado la solicitud de parte de AFIP por los siguientes motivos:");
                    foreach (var e in res.Errores) { sb.AppendLine(e.Descripcion); }
                    throw new Exception(sb.ToString());
                }

                var estados = Repositorio.Listar<AfipCoemEstado>();

                foreach (var item in res.Resultado.Listado)
                {
                    var coem = caratulaDb.Coems.FirstOrDefault(c => c.IdentificadorCOEM == item.IdentificadorCOEM);

                    // El estado "CODE" es interno nuestro y es final, en la respuesta de AFIP vendrá como AUTORIZADA y no debemos "retroceder" de CODE.
                    if (coem == null || coem.AfipCoemEstado.Codigo == "CODE")
                    {
                        continue;
                    }

                    var estado = estados.FirstOrDefault(e => e.Estado.ToUpper() == item.Estado);

                    // En caso de tener el mismo estado no hay que hacer nada más
                    if (coem.AfipCoemEstado.Id == estado.Id)
                    {
                        continue;
                    }

                    var logABM = new LogABM
                    {
                        Pantalla = "CambiarEstadoCoem",
                        Usuario = "Sistema",
                        Fecha = DateTime.Now,
                        Evento = EventoABM.Modificacion,
                        Entidad = $"COEM {coem.IdentificadorCOEM}: {coem.AfipCoemEstado.Estado} -> {estado.Estado}",
                        ClaseId = coem.Id
                    };
                    Repositorio.Agregar(logABM);

                    coem.AfipCoemEstado = estado;
                }
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al registrar Coem {0}", e);
            }
            return resultado;
        }
    }
}
