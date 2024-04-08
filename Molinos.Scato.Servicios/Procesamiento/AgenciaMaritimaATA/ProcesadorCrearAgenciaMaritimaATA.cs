using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Molinos.Scato.Servicios.Orquestador;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

                var auditoria = new AuditoriaAgenciaMaritimaATA
                {
                    Accion = (int)AccionesAgenciaMaritimaATA.Crear,
                    Nombre = dto.Nombre,
                    Cuit = dto.Cuit,
                    Activa = "1",
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now
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
                        agenciaDb.Activa = true;
                        auditoria.Accion = (int)AccionesAgenciaMaritimaATA.Reactivar;
                        auditoria.Activa = "0 -> 1";
                    }
                    auditoria.AgenciaMaritimaPuerto = agenciaDb;
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
                        auditoria.Accion = (int)AccionesAgenciaMaritimaATA.Reactivar;
                        auditoria.Activa = "0 -> 1";
                    }
                    auditoria.ATAPuerto = ataDb;
                }
                else
                {
                    throw new Exception("El tipo especificado no existe");
                }
                Repositorio.Agregar(auditoria);
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
