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
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

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
                    // Cargar la agencia con su ATA vinculada
                    var includes = new List<Expression<Func<AgenciaMaritimaPuerto, object>>> { a => a.AtaPuerto };
                    var agenciaDb = Repositorio.Obtener(includes, (Expression<Func<AgenciaMaritimaPuerto, bool>>)(a => a.Id == dto.Id)) 
                        ?? throw new Exception("No se encontró una agencia maritima con el id especificado");

                    if (Repositorio.Existe<AgenciaMaritimaPuerto>(a => a.Id != dto.Id && a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Activa))
                    {
                        throw new Exception("Ya existe una agencia marítima con el nombre especificado");
                    }
                    if (!string.IsNullOrEmpty(dto.Cuit) && Repositorio.Existe<AgenciaMaritimaPuerto>(a => a.Id != dto.Id && a.Cuit == dto.Cuit && a.Activa))
                    {
                        throw new Exception("Ya existe una agencia maritima con el CUIT especificado");
                    }
                    if (!ValidarEnCoemActiva(agenciaDb.Cuit))
                    {
                        throw new Exception("No se puede modificar la agencia ya que esta siendo utilizada en una COEM activa");
                    }

                    agenciaDb.Nombre = dto.Nombre;
                    agenciaDb.Cuit = dto.Cuit ?? "";
                    agenciaDb.CodigoSap = dto.CodigoSap;

                    // Sincronizar con ATA si existe
                    if (agenciaDb.AtaPuerto != null)
                    {
                        agenciaDb.AtaPuerto.Nombre = dto.Nombre;
                        agenciaDb.AtaPuerto.Cuit = dto.Cuit ?? "";
                    }
                    else
                    {
                        // Si no tiene ATA, crear una
                        var ataDb = new ATAPuerto
                        {
                            Nombre = dto.Nombre,
                            Cuit = dto.Cuit,
                            Activa = true
                        };
                        Repositorio.Agregar(ataDb);
                        Repositorio.GuardarCambios();
                        agenciaDb.AtaPuerto = ataDb;
                    }
                }
                else if (tipo == AgenciaMaritimaATATipo.ATA)
                {
                    var ataDb = Repositorio.Obtener<ATAPuerto>(dto.Id) ?? throw new Exception("No se encontró un ATA con el id especificado");
                    if (Repositorio.Existe<ATAPuerto>(a => a.Id != dto.Id && a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Activa))
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

                    ataDb.Nombre = dto.Nombre;
                    ataDb.Cuit = dto.Cuit ?? "";

                    // Buscar la agencia marítima vinculada y sincronizar
                    var agenciaDb = Repositorio.Obtener<AgenciaMaritimaPuerto>(a => a.AtaPuerto != null && a.AtaPuerto.Id == ataDb.Id);
                    if (agenciaDb != null)
                    {
                        agenciaDb.Nombre = dto.Nombre;
                        agenciaDb.Cuit = dto.Cuit ?? "";
                    }
                    else
                    {
                        // Si no existe agencia vinculada, crear una
                        agenciaDb = new AgenciaMaritimaPuerto
                        {
                            Nombre = dto.Nombre,
                            Cuit = dto.Cuit,
                            CodigoSap = dto.CodigoSap,
                            Activa = true,
                            AtaPuerto = ataDb
                        };
                        Repositorio.Agregar(agenciaDb);
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
