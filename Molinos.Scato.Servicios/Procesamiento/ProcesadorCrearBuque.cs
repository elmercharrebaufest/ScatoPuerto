using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Transactions;

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
                        AgregarLogEdicion(comando, vaporInformacion_Db);
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
                        AgregarLogAlta(comando);
                    }

                    Repositorio.GuardarCambios();
                    transaction.Complete();
                }
                catch (Exception e)
                {
                    Log.Error(e, "Error en ProcesadorCrearBuque-Metodo:Ejecutar");
                    resultado.Error("", Textos.Error);
                }
            }

            return resultado;
        }

        private Vapor GuardarActualizarVapor(CrearBuque comando)
        {
            if (comando.VaporInformacion.Vapor == null)
            {
                var nuevoVapor = new Vapor
                {
                    Nombre = comando.VaporInformacion.NombreBuque,
                    Habilitado = true;
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

        private void AgregarLogAlta(CrearBuque comando)
        {
            var logAlta = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.VaporInformacion.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Alta,
                Entidad = comando.VaporInformacion.ToJson(),
                ClaseId = 0
            };
            Repositorio.Agregar(logAlta);
        }

        private void AgregarLogEdicion(CrearBuque comando, VaporInformacion vaporBd)
        {
            var logEdicion = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.VaporInformacion.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = comando.VaporInformacion.ToJson(),
                ClaseId = vaporBd.Id
            };
            Repositorio.Agregar(logEdicion);
        }
    }
}