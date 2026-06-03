using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.ServiciosSap;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;
using System.Configuration;
using System.Linq;
using System.Transactions;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorCrearBuque : ProcesadorComando<CrearBuque>
    {
        private readonly ZSDWS_SCATO servicioSap;

        public ProcesadorCrearBuque(IRepositorio repositorio, IConversor conversor, ILogger log, ZSDWS_SCATO servicioSap)
            : base(repositorio, conversor, log)
        {
            this.servicioSap = servicioSap;
        }

        public override Resultado Ejecutar(CrearBuque comando)
        {
            var resultado = new ResultadoCrear();
            VaporInformacion entidad = null;
            using (var transaction = new TransactionScope())
            {
                try
                {
                    var vapor = GuardarActualizarVapor(comando);
                    Bandera bandera = Repositorio.Obtener<Bandera>(x => x.Id == comando.VaporInformacion.Bandera.Id);
                    var vaporInformacion_Db = Repositorio.Obtener<VaporInformacion>(x => x.Vapor.Id == comando.VaporInformacion.VaporId);
                    var esAlta = vaporInformacion_Db == null;

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
                        vaporInformacion_Db.EnSap = false;
                        this.GuardarShipParticular(vaporInformacion_Db.Id, comando.Archivo);
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
                            EnSap = false,
                        };
                        entidad = Repositorio.Agregar(vaporInformacion_Db);

                        AgregarLogAlta(comando);
                    }

                    Repositorio.GuardarCambios();
                    if (entidad != null)
                    {
                        this.GuardarShipParticular(entidad.Id, comando.Archivo);
                    }
                    EnviarBuqueASap(comando, vaporInformacion_Db, esAlta ? "A" : "M");
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

        private void EnviarBuqueASap(CrearBuque comando, VaporInformacion vaporInformacion, string operacion)
        {
            var requestSap = CrearRequestSap(vaporInformacion, operacion);
            var transaccion = CrearTransaccion(vaporInformacion, operacion, comando.VaporInformacion.Usuario, requestSap);
            string mensaje = string.Empty;

            try
            {
                var response = servicioSap.Z_SDMF_RFC_ABM_BUQUE(requestSap);
                var responseXml = XmlConverter<Z_SDMF_RFC_ABM_BUQUEResponse1>.Serialize(response);
                var responseSap = response.Z_SDMF_RFC_ABM_BUQUEResponse;
                mensaje = responseSap.EX_MESSAGE;

                if (responseSap.EX_RESPONSE == "OK")
                {
                    transaccion.Estado = "Enviado";
                    transaccion.ResponseSAP = responseXml;
                    vaporInformacion.EnSap = true;
                    comando.ResultadoSap = new ResultadoEnvioBuqueSap { Enviado = true, Mensaje = mensaje };
                }
                else
                {
                    transaccion.Estado = "Error";
                    transaccion.ResponseSAP = responseXml;
                    vaporInformacion.EnSap = false;
                    comando.ResultadoSap = new ResultadoEnvioBuqueSap { Enviado = false, Mensaje = mensaje };
                }

                AgregarLogEnvioSap(comando, vaporInformacion, responseXml);
            }
            catch (Exception ex)
            {
                transaccion.Estado = "Error";
                transaccion.ResponseSAP = "<Error><Exception>" + ex.Message + "</Exception></Error>";
                vaporInformacion.EnSap = false;
                mensaje = "SYSTEM_ERROR: " + ex.Message;
                comando.ResultadoSap = new ResultadoEnvioBuqueSap { Enviado = false, Mensaje = mensaje };
                AgregarLogEnvioSap(comando, vaporInformacion, transaccion.ResponseSAP);
            }

            Repositorio.GuardarCambios();
        }

        private Z_SDMF_RFC_ABM_BUQUERequest CrearRequestSap(VaporInformacion vaporInformacion, string operacion)
        {
            var tipoCarga = vaporInformacion.TipoBuque == "Bulk Carrier" ? "S" : vaporInformacion.TipoBuque == "Oil Tanker" ? "L" : string.Empty;

            return new Z_SDMF_RFC_ABM_BUQUERequest
            {
                Z_SDMF_RFC_ABM_BUQUE = new Z_SDMF_RFC_ABM_BUQUE
                {
                    IM_FLAG = operacion,
                    IM_IMO = vaporInformacion.ImoVapor,
                    IM_DESCR = (vaporInformacion.NombreBuque ?? string.Empty).Length > 40 ? vaporInformacion.NombreBuque.Substring(0, 40) : vaporInformacion.NombreBuque,
                    IM_CARACT = string.Empty,
                    IM_ESLORA = vaporInformacion.Eslora,
                    IM_ESLORASpecified = vaporInformacion.Eslora > 0,
                    IM_MANGA = vaporInformacion.Manga,
                    IM_MANGASpecified = vaporInformacion.Manga > 0,
                    IM_PUNTAL = vaporInformacion.Puntual,
                    IM_PUNTALSpecified = vaporInformacion.Puntual > 0,
                    IM_PAISPROC = vaporInformacion.Bandera != null ? vaporInformacion.Bandera.Abreviatura : string.Empty,
                    IM_PORTEBRUTO = vaporInformacion.PorteBruto,
                    IM_PORTEBRUTOSpecified = vaporInformacion.PorteBruto > 0,
                    IM_PORTENETO = vaporInformacion.PorteNeto,
                    IM_PORTENETOSpecified = vaporInformacion.PorteNeto > 0,
                    IM_TIPOCARGA = tipoCarga,
                    IM_BODEGAS = vaporInformacion.CantidadBodegasTks,
                    IM_BODEGASSpecified = vaporInformacion.CantidadBodegasTks > 0,
                    IM_FECHA = DateTime.Now.ToString("yyyy-MM-dd")
                }
            };
        }

        private TransaccionesSAP CrearTransaccion(VaporInformacion vaporInformacion, string operacion, string usuario, Z_SDMF_RFC_ABM_BUQUERequest requestSap)
        {
            var ultimoIntento = Repositorio.Listar<TransaccionesSAP>(t => t.Entidad == "VaporInformacion" && t.Entidad_Id == vaporInformacion.Id)
                .OrderByDescending(t => t.Id)
                .FirstOrDefault();
            var valorReintento = ultimoIntento != null && ultimoIntento.Estado == "Error" ? ultimoIntento.Reintento + 1 : 0;
            var transaccion = new TransaccionesSAP
            {
                Entidad = "VaporInformacion",
                Entidad_Id = vaporInformacion.Id,
                Operacion = operacion,
                PayloadXML = XmlConverter<Z_SDMF_RFC_ABM_BUQUERequest>.Serialize(requestSap),
                Estado = "Pendiente",
                Reintento = valorReintento,
                FechaCreacion = DateTime.Now,
                Usuario = usuario
            };

            Repositorio.Agregar(transaccion);
            return transaccion;
        }

        private void AgregarLogEnvioSap(CrearBuque comando, VaporInformacion vaporInformacion, string respuestaSap)
        {
            var logEnvio = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.VaporInformacion.Usuario,
                Fecha = DateTime.Now,
                Evento = EventoABM.Modificacion,
                Entidad = respuestaSap,
                ClaseId = vaporInformacion.Id
            };
            Repositorio.Agregar(logEnvio);
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

        private void GuardarShipParticular(int vaporInformacionId, ArchivoDto archivo)
        {
            var pathShipParticular = ConfigurationManager.AppSettings["PathShipParticular"];
            var carpeta = "ShipP_" + vaporInformacionId;
            var rutaCarpeta = System.IO.Path.Combine(pathShipParticular, carpeta);
            var vaporInfo = this.Repositorio.Obtener<VaporInformacion>(v => v.Id == vaporInformacionId);

            if (archivo != null)
            {
                // Verificar si la carpeta existe, si no, crearla
                if (!System.IO.Directory.Exists(rutaCarpeta))
                {
                    System.IO.Directory.CreateDirectory(rutaCarpeta);
                }
                else
                {
                    // Eliminar cualquier archivo existente en la carpeta
                    var archivosExistentes = System.IO.Directory.GetFiles(rutaCarpeta);
                    foreach (var archivoExistente in archivosExistentes)
                    {
                        System.IO.File.Delete(archivoExistente);
                    }
                }

                // Combinar la ruta de la carpeta con el nombre del archivo
                var rutaCompleta = System.IO.Path.Combine(rutaCarpeta, archivo.Nombre);

                // Guardar el archivo en el sistema de archivos (sobrescribe si ya existe)
                System.IO.File.WriteAllBytes(rutaCompleta, archivo.Contenido);

                vaporInfo.ShipParticular = rutaCompleta;
                this.Repositorio.GuardarCambios();
            }
            else
            {
                // Si la carpeta existe, eliminar todos los archivos en la carpeta
                if (System.IO.Directory.Exists(rutaCarpeta))
                {
                    var archivosExistentes = System.IO.Directory.GetFiles(rutaCarpeta);
                    foreach (var archivoExistente in archivosExistentes)
                    {
                        System.IO.File.Delete(archivoExistente);
                    }
                }

                // Limpiar la ruta en el campo ShipParticular y guardar cambios
                vaporInfo.ShipParticular = null;
                this.Repositorio.GuardarCambios();
            }
        }
    }
}