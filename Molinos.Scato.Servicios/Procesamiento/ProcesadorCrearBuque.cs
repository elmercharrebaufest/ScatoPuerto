using System;
using System.Linq;
using System.Transactions;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Filtros;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorCrearBuque : ProcesadorComando<CrearBuque>
    {
        public ProcesadorCrearBuque(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(CrearBuque comando)
        {
            var resultado = new ResultadoCrear();
            using (var transaction = new TransactionScope())
            {
                try
                {
                    var vapor = GuardarActualizarVapor(comando);                
                    Bandera bandera = Repositorio.Obtener<Bandera>(x => x.Id == comando.VaporInformacion.Bandera.Id);
                    var vaporInformacion_Db = Repositorio.Obtener<VaporInformacion>(x => x.Vapor.Id == comando.VaporInformacion.VaporId);

                    // Validar(comando, resultado);
                    if (TieneEmbarqueAsociado(comando) && (vaporInformacion_Db != null &&
                    (vaporInformacion_Db.Bandera.Nombre != comando.VaporInformacion.Bandera.Nombre ||
                    vaporInformacion_Db.Vapor.Nombre != comando.VaporInformacion.NombreBuque)))
                    {
                        try
                        {
                            var logAbm = new LogABM
                            {
                                Pantalla = comando.GetType().Name,
                                Usuario = comando.VaporInformacion.Usuario,
                                Fecha = DateTime.Now,
                                Evento = EventoABM.Alta,
                                Entidad = comando.VaporInformacion.ToJson(),
                                ClaseId = vaporInformacion_Db.Id
                            };
                            Repositorio.Agregar(logAbm);

                        }
                        catch (Exception e)
                        {
                            Log.Warn(e, "Ocurrio un error al crear el log AMB Crear");
                        }
                    }
                    vapor.Nombre = comando.VaporInformacion.NombreBuque;
                    if (vaporInformacion_Db != null)
                    {
                        vaporInformacion_Db.Bandera = bandera;
                        vaporInformacion_Db.NombreBuque = comando.VaporInformacion.NombreBuque;
                        vaporInformacion_Db.TipoBuque = comando.VaporInformacion.TipoBuque;
                        vaporInformacion_Db.CategoriaBuque = comando.VaporInformacion.CategoriaBuque;
                        vaporInformacion_Db.ImoVapor = comando.VaporInformacion.ImoVapor;
                        vaporInformacion_Db.Freeboard = comando.VaporInformacion.Freeboard;
                        vaporInformacion_Db.Eslora = comando.VaporInformacion.Eslora;
                        vaporInformacion_Db.PorteNeto = comando.VaporInformacion.PorteNeto;
                        vaporInformacion_Db.PorteBruto = comando.VaporInformacion.PorteBruto;
                        vaporInformacion_Db.Manga = comando.VaporInformacion.Manga;
                        vaporInformacion_Db.Puntual = comando.VaporInformacion.Puntual;
                        vaporInformacion_Db.CantidadBodegasTks = comando.VaporInformacion.CantidadBodegasTks;
                        AgregarAuditoriaEdicion(comando.VaporInformacion);
                    }
                    else
                    {
                        vaporInformacion_Db = new VaporInformacion()
                        {
                            Vapor = vapor,
                            Bandera = bandera,
                            NombreBuque = comando.VaporInformacion.NombreBuque,
                            TipoBuque = comando.VaporInformacion.TipoBuque,
                            CategoriaBuque = comando.VaporInformacion.CategoriaBuque,
                            ImoVapor = comando.VaporInformacion.ImoVapor,
                            Freeboard = comando.VaporInformacion.Freeboard,
                            Eslora = comando.VaporInformacion.Eslora,
                            PorteNeto = comando.VaporInformacion.PorteNeto,
                            PorteBruto = comando.VaporInformacion.PorteBruto,
                            Manga = comando.VaporInformacion.Manga,
                            Puntual = comando.VaporInformacion.Puntual,
                            CantidadBodegasTks = comando.VaporInformacion.CantidadBodegasTks,
                        };
                        Repositorio.Agregar(vaporInformacion_Db);
                        AgregarAuditoriaAlta(comando.VaporInformacion);
                    }

                    Repositorio.GuardarCambios();
                    transaction.Complete();
                }
                catch (Exception e)
                {
                    //Log.Error(e, "Error al crear característica de calidad {0}", comando.Dto.Descripcion);
                    resultado.Error("", Textos.Error);
                }
            }

            return resultado;
        }



        private void Validar(CrearCaracteristicaDeCalidad comando, Resultado resultado)
        {
        }

        private Vapor GuardarActualizarVapor(CrearBuque comando)
        {
            if (comando.VaporInformacion.Vapor == null)
            {
                var nuevoVapor = new Vapor
                {
                    Nombre = comando.VaporInformacion.NombreBuque,
                    Habilitado = true
                };
                Repositorio.Agregar(nuevoVapor);
                Repositorio.GuardarCambios();
                return nuevoVapor;
            }
            else
            {
                return Repositorio.Obtener<Vapor>(x => x.Id == comando.VaporInformacion.Vapor.Id);
            }
        }

        private bool TieneEmbarqueAsociado(CrearBuque comando)
        {
            return Repositorio.Existe<Embarque>(x => comando.VaporInformacion.VaporId == x.Vapor.Id);
        }
        private void AgregarAuditoriaAlta(VaporInformacionDto vapor)
        {
            var auditoria = new Auditoria
            {
                Entidad_Id = 0,
                EntidadNombre = "Vapor",
                UsuarioEjecuta = vapor.Usuario,
                Propiedad = "Nombre",
                ValorNuevo = vapor.NombreBuque,
                FechaModificacion = DateTime.Now,
                Accion = "Registro de vapor."
            };
            Repositorio.Agregar(auditoria);
        }
        private void AgregarAuditoriaEdicion(VaporInformacionDto vapor)
        {
            var auditoria = new Auditoria
            {
                Entidad_Id = vapor.VaporId,
                EntidadNombre = "Vapor",
                UsuarioEjecuta = vapor.Usuario,
                FechaModificacion = DateTime.Now,
                Accion = "Edicion de vapor."
            };
            Repositorio.Agregar(auditoria);
        }
    }
}