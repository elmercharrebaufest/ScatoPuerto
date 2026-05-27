using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using System;
using System.Linq.Expressions;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorCrearAgenciaMaritimaATA : ProcesadorComando<CrearAgenciaMaritimaATA>
    {
        public ProcesadorCrearAgenciaMaritimaATA(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        // TODO: Ver como hacer para tener una clase base para agencias maritimas y ATA, ya que comparten campos y se podría simplificar el código
        public override Resultado Ejecutar(CrearAgenciaMaritimaATA comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var dto = comando.Dto;
                var tipo = (AgenciaMaritimaATATipo)dto.Tipo;
                var logABM = new LogABM
                {
                    Pantalla = comando.GetType().Name,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Evento = EventoABM.Alta,
                    Entidad = comando.ToJson()
                };

                if (tipo == AgenciaMaritimaATATipo.AgenciaMaritima)
                {
                    if (Repositorio.Existe<AgenciaMaritimaPuerto>(a => a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Activa))
                    {
                        throw new Exception("Ya existe una agencia maritima con el nombre especificado");
                    }
                    if (Repositorio.Existe<AgenciaMaritimaPuerto>(a => a.Cuit == dto.Cuit && a.Activa))
                    {
                        throw new Exception("Ya existe una agencia maritima con el CUIT especificado");
                    }

                    var agenciaDb = Repositorio.Obtener<AgenciaMaritimaPuerto>(
                        new Expression<Func<AgenciaMaritimaPuerto, object>>[] { a => a.AtaPuerto },
                        a => a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Cuit == dto.Cuit && !a.Activa);
                    ATAPuerto ataDb = null;

                    if (agenciaDb == null)
                    {
                        // Crear nueva Agencia Marítima
                        agenciaDb = Conversor.Convertir<CrearAgenciaMaritimaATADto, AgenciaMaritimaPuerto>(dto);

                        // Crear también el ATA correspondiente
                        ataDb = new ATAPuerto
                        {
                            Nombre = dto.Nombre,
                            Cuit = dto.Cuit,
                            Activa = true
                        };
                        Repositorio.Agregar(ataDb);
                        Repositorio.GuardarCambios(); // Guardar para obtener el ID del ATA

                        // Establecer la relación
                        agenciaDb.AtaPuerto = ataDb;
                        Repositorio.Agregar(agenciaDb);
                    }
                    else
                    {
                        logABM.Entidad = "REACTIVACION " + logABM.Entidad;
                        logABM.ClaseId = agenciaDb.Id;
                        agenciaDb.Activa = true;
                        agenciaDb.Cuit = dto.Cuit;
                        agenciaDb.CodigoSap = dto.CodigoSap;

                        // Si tiene ATA asociada, también reactivarla
                        if (agenciaDb.AtaPuerto != null)
                        {
                            agenciaDb.AtaPuerto.Activa = true;
                            agenciaDb.AtaPuerto.Cuit = dto.Cuit;
                        }
                        else
                        {
                            // Si no tiene ATA, crear una
                            ataDb = new ATAPuerto
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
                }
                else if (tipo == AgenciaMaritimaATATipo.ATA)
                {
                    if (Repositorio.Existe<ATAPuerto>(a => a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Activa))
                    {
                        throw new Exception("Ya existe un ATA con el nombre especificado");
                    }

                    if (!string.IsNullOrEmpty(dto.Cuit) && Repositorio.Existe<ATAPuerto>(a => a.Cuit == dto.Cuit && a.Activa))
                    {
                        throw new Exception("Ya existe un ATA con el CUIT especificado");
                    }

                    var ataDb = Repositorio.Obtener<ATAPuerto>(a => a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Cuit == dto.Cuit && !a.Activa);
                    AgenciaMaritimaPuerto agenciaDb = null;

                    if (ataDb == null)
                    {
                        // Crear nuevo ATA
                        ataDb = Conversor.Convertir<CrearAgenciaMaritimaATADto, ATAPuerto>(dto);
                        Repositorio.Agregar(ataDb);
                        Repositorio.GuardarCambios(); // Guardar para obtener el ID del ATA

                        // Crear también la Agencia Marítima correspondiente
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
                    else
                    {
                        // Reactivar ATA existente
                        ataDb.Activa = true;
                        ataDb.Cuit = dto.Cuit;
                        logABM.Entidad = "REACTIVACIÓN " + logABM.Entidad;
                        logABM.ClaseId = ataDb.Id;

                        // Buscar si existe una agencia marítima vinculada a este ATA
                        agenciaDb = Repositorio.Obtener<AgenciaMaritimaPuerto>(a => a.AtaPuerto != null && a.AtaPuerto.Id == ataDb.Id);

                        if (agenciaDb != null)
                        {
                            // Reactivar la agencia marítima existente
                            agenciaDb.Activa = true;
                            agenciaDb.Cuit = dto.Cuit;
                            agenciaDb.CodigoSap = dto.CodigoSap;
                        }
                        else
                        {
                            // Crear nueva agencia marítima vinculada
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
                Log.Error("Error al crear Agencia Maritima o ATA {0}", e);
            }
            return resultado;
        }
    }
}
