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

                    var agenciaDb = Repositorio.Obtener<AgenciaMaritimaPuerto>(a => a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Cuit == dto.Cuit && !a.Activa);
                    if (agenciaDb == null)
                    {
                        agenciaDb = Conversor.Convertir<CrearAgenciaMaritimaATADto, AgenciaMaritimaPuerto>(dto);
                        Repositorio.Agregar(agenciaDb);
                    }
                    else
                    {
                        logABM.Entidad = "REACTIVACION " + logABM.Entidad;
                        logABM.ClaseId = agenciaDb.Id;
                        agenciaDb.Activa = true;
                    }
                }
                else if (tipo == AgenciaMaritimaATATipo.ATA)
                {
                    if (Repositorio.Existe<ATAPuerto>(a => a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Activa))
                    {
                        throw new Exception("Ya existe un ATA con el nombre especificado");
                    }
                    if (Repositorio.Existe<AgenciaMaritimaPuerto>(a => a.Cuit == dto.Cuit && a.Activa))
                    {
                        throw new Exception("Ya existe un ATA con el CUIT especificado");
                    }

                    var ataDb = Repositorio.Obtener<ATAPuerto>(a => a.Nombre.ToUpper() == dto.Nombre.ToUpper() && a.Cuit == dto.Cuit && !a.Activa);
                    if (ataDb == null)
                    {
                        ataDb = Conversor.Convertir<CrearAgenciaMaritimaATADto, ATAPuerto>(dto);
                        Repositorio.Agregar(ataDb);
                    }
                    else
                    {
                        ataDb.Activa = true;
                        logABM.Entidad = "REACTIVACIÓN " + logABM.Entidad;
                        logABM.ClaseId = ataDb.Id;
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
