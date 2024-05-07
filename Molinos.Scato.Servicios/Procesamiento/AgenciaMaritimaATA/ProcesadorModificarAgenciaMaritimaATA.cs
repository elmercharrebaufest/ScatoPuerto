using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using System;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorModificarAgenciaMaritimaATA : ProcesadorComando<ModificarAgenciaMaritimaATA>
    {
        public ProcesadorModificarAgenciaMaritimaATA(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        /// <summary>
        /// Verifica que el cuit ingresado no se encuentre en una Coem cuyo estado no es final
        /// </summary>
        /// <param name="cuit"></param>
        /// <returns></returns>
        private bool ValidarEnCoemActiva(string cuit)
        {
            var codigos = new string[] { "REC", "ANU", "CODE" };
            return !Repositorio.Existe<AfipCoem>(c => c.MercaderiasSueltas.Any(m => m.CuitATA == cuit && !codigos.Contains(m.CuitATA)));
        }

        public override Resultado Ejecutar(ModificarAgenciaMaritimaATA comando)
        {
            var resultado = new Resultado();
            try
            {
                var dto = comando.Dto;
                var tipo = (AgenciaMaritimaATATipo)dto.Tipo;

                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Modificacion,
                    Entidad = comando.ToJson(),
                    ClaseId = comando.Dto.Id
                };

                if (tipo == AgenciaMaritimaATATipo.AgenciaMaritima)
                {
                    var agenciaDb = Repositorio.Obtener<AgenciaMaritimaPuerto>(dto.Id) ?? throw new Exception("No se encontró una agencia maritima con el id especificado");

                    if (Repositorio.Existe<AgenciaMaritimaPuerto>(a => a.Id != dto.Id && a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Activa))
                    {
                        throw new Exception("Ya existe una agencia maritima con el nombre especificado");
                    }
                    if (Repositorio.Existe<AgenciaMaritimaPuerto>(a => a.Id != dto.Id && a.Cuit == dto.Cuit && a.Activa))
                    {
                        throw new Exception("Ya existe una agencia maritima con el CUIT especificado");
                    }
                    if (!ValidarEnCoemActiva(agenciaDb.Cuit))
                    {
                        throw new Exception("No se puede modificar la agencia ya que esta siendo utilizada en una COEM activa");
                    }

                    var agenciaInactiva = Repositorio.Obtener<AgenciaMaritimaPuerto>(a => a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Cuit == dto.Cuit && !a.Activa);
                    if (agenciaInactiva == null)
                    {
                        agenciaDb.Nombre = dto.Nombre;
                        agenciaDb.Cuit = dto.Cuit ?? "";
                    }
                    else
                    {
                        agenciaInactiva.Activa = true;
                        var agenciaInactivaJSON = Conversor.Convertir<AgenciaMaritimaPuerto, AgenciaMaritimaPuertoDto>(agenciaInactiva).ToJson();
                        logABM.Entidad = "REACTIVACIÓN" + agenciaInactivaJSON;
                        logABM.ClaseId = agenciaInactiva.Id;

                        agenciaDb.Activa = false;
                        var agenciaDbJSON = Conversor.Convertir<AgenciaMaritimaPuerto, AgenciaMaritimaPuertoDto>(agenciaDb).ToJson();
                        var logABM2 = new LogABM
                        {
                            Pantalla = comando.GetType().Name,
                            Usuario = comando.Usuario,
                            Fecha = DateTime.Now,
                            Evento = EventoABM.Baja,
                            Entidad = agenciaDbJSON,
                            ClaseId = agenciaDb.Id
                        };
                        Repositorio.Agregar(logABM2);
                    }
                }
                else if (tipo == AgenciaMaritimaATATipo.ATA)
                {
                    var ataDb = Repositorio.Obtener<ATAPuerto>(dto.Id) ?? throw new Exception("No se encontró un ATA con el id especificado");
                    if (Repositorio.Existe<ATAPuerto>(a => a.Id != dto.Id && a.Nombre == dto.Nombre))
                    {
                        throw new Exception("Ya existe un ATA con el nombre especificado");
                    }
                    if (Repositorio.Existe<ATAPuerto>(a => a.Id != dto.Id && a.Cuit == dto.Cuit))
                    {
                        throw new Exception("Ya existe un ATA con el CUIT especificado");
                    }
                    if (!ValidarEnCoemActiva(ataDb.Cuit))
                    {
                        throw new Exception("No se puede modificar el ATA ya que esta siendo utilizada en una COEM activa");
                    }

                    var ataInactiva = Repositorio.Obtener<ATAPuerto>(a => a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Cuit == dto.Cuit && !a.Activa);
                    if (ataInactiva == null)
                    {
                        ataDb.Nombre = dto.Nombre;
                        ataDb.Cuit = dto.Cuit ?? "";
                    }
                    else
                    {
                        ataInactiva.Activa = true;
                        var ataInactivaJSON = Conversor.Convertir<ATAPuerto, ATAPuertoDto>(ataInactiva).ToJson();
                        logABM.Entidad = "REACTIVACIÓN" + ataInactivaJSON;
                        logABM.ClaseId = ataInactiva.Id;

                        ataDb.Activa = false;
                        var ataDbJSON = Conversor.Convertir<ATAPuerto, ATAPuertoDto>(ataDb).ToJson();
                        var logABM2 = new LogABM
                        {
                            Pantalla = comando.GetType().Name,
                            Usuario = comando.Usuario,
                            Fecha = DateTime.Now,
                            Evento = EventoABM.Baja,
                            Entidad = ataDbJSON,
                            ClaseId = ataDb.Id
                        };
                        Repositorio.Agregar(logABM2);
                    }
                }
                else
                {
                    throw new Exception("El tipo especificado no existe");
                }

                Repositorio.Agregar(logABM);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al modificar Agencia Maritima o ATA {0}", e);
            }
            return resultado;
        }
    }
}
