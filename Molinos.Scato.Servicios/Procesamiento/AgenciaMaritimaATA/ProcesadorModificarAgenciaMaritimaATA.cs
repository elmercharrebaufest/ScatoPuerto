using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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

                var auditoria = new AuditoriaAgenciaMaritimaATA
                {
                    Accion = (int)AccionesAgenciaMaritimaATA.Modificar,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now
                };

                var auditoriaBaja = new AuditoriaAgenciaMaritimaATA
                {
                    Accion = (int)AccionesAgenciaMaritimaATA.Eliminar,
                    Usuario = comando.Usuario,
                    Fecha = DateTime.Now,
                    Activa = "1 -> 0"
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
                        auditoria.Nombre = agenciaDb.Nombre + "->" + dto.Nombre;
                        auditoria.Cuit = agenciaDb.Cuit + "->" + dto.Cuit;
                        auditoria.AgenciaMaritimaPuerto = agenciaDb;
						auditoria.Activa = "1";
						agenciaDb.Nombre = dto.Nombre;
                        agenciaDb.Cuit = dto.Cuit ?? "";
					}
                    else
                    {
                        agenciaInactiva.Activa = true;
                        auditoria.Accion = (int)AccionesAgenciaMaritimaATA.Reactivar;
                        auditoria.AgenciaMaritimaPuerto = agenciaInactiva;
                        auditoria.Nombre = dto.Nombre;
                        auditoria.Cuit = dto.Cuit ?? "";
                        auditoria.Activa = "0 -> 1";

                        agenciaDb.Activa = false;
                        auditoriaBaja.AgenciaMaritimaPuerto = agenciaDb;
                        auditoriaBaja.Nombre = agenciaDb.Nombre;
                        auditoriaBaja.Cuit = agenciaDb.Cuit ?? "";
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
                        auditoria.Nombre = ataDb.Nombre + "->" + dto.Nombre;
                        auditoria.Cuit = ataDb.Cuit + "->" + dto.Cuit;
                        auditoria.ATAPuerto = ataDb;
						auditoria.Activa = "1";
						ataDb.Nombre = dto.Nombre;
                        ataDb.Cuit = dto.Cuit ?? "";
					}
                    else
                    {
                        ataInactiva.Activa = true;
                        auditoria.Accion = (int)AccionesAgenciaMaritimaATA.Reactivar;
                        auditoria.ATAPuerto = ataInactiva;
                        auditoria.Nombre = dto.Nombre;
                        auditoria.Cuit = dto.Cuit ?? "";
                        auditoria.Activa = "0 -> 1";

                        ataDb.Activa = false;
                        auditoriaBaja.ATAPuerto = ataDb;
                        auditoriaBaja.Nombre = ataDb.Nombre;
                        auditoriaBaja.Cuit = ataDb.Cuit ?? "";
                    }
                }
                else
                {
                    throw new Exception("El tipo especificado no existe");
                }

                Repositorio.Agregar(auditoria);
                if (!string.IsNullOrEmpty(auditoriaBaja.Nombre))
                {
                    Repositorio.Agregar(auditoriaBaja);
                }

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
