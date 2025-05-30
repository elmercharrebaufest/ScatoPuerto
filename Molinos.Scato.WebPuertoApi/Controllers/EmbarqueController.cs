using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class EmbarqueController : BaseController
    {
        private readonly IServicioComandos comandos;

        public EmbarqueController(IServicioActividadFactory<IIngresarEmbarqueService> factory,
            IServicioRepositorio servicio,
            IServicioComandos comandos) : base(servicio)
        {
            this.comandos = comandos;
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.PreLineUp)]
        [Autorizacion(PermisosScato.LineUp_AltaEmbarque)]
        [Route("api/Embarque/AltaEmbarque")]
        public HttpResponseMessage AltaEmbarque(EmbarqueDto embarque)
        {
            var embarqueId = 0;

            var centro = int.Parse(ConfigurationManager.AppSettings["Centro"]);
            try
            {
                IngresarEmbarque(embarque, true, false, false, false);
                embarqueId = IngresarEmbarque(embarque, false, true, false, false);
                IngresarEmbarque(embarque, false, false, true, false);
                IngresarEmbarque(embarque, false, false, false, true);
                servicio.ActualizarEstadoBuque(embarqueId, 1);
            }
            catch (Exception ex)
            {
                Console.WriteLine("xxx" + ex.ToString());
                return Request.CreateResponse(HttpStatusCode.InternalServerError, $"Error al crear el embarque, verifique que exista el centro ${centro}");
            }
            return Request.CreateResponse(HttpStatusCode.OK, embarqueId);
        }

        private int IngresarEmbarque(EmbarqueDto embarque,
            bool vicentin,
            bool sanBenito,
            bool noryon,
            bool otrosMuelles)
        {
            var datosEmbarque = 0;
            var workflow = ConfigurationManager.AppSettings["Workflow"];
            var centro = int.Parse(ConfigurationManager.AppSettings["Centro"]);
            var controlRecorrido = new ControlRecorridoDto
            {
                Actividad = Textos.ActIngresarEmbarque,
                ActividadXaml = "IngresarEmbarque",
                NombreUsuario = nombreUsuario
            };

            embarque.CentroId = centro;
            embarque.Patente = embarque.NombreBuque;
            if ((vicentin && vicentin == embarque.Vicentin) ||
                (sanBenito && sanBenito == embarque.SanBenito) ||
                (noryon && noryon == embarque.Noryon) ||
                (otrosMuelles && otrosMuelles == embarque.OtrosMuelles))
            {
                var embarqueAux = (EmbarqueDto)embarque.Clone();
                embarqueAux.Vicentin = vicentin;
                embarqueAux.SanBenito = sanBenito;
                embarqueAux.Noryon = noryon;
                embarqueAux.OtrosMuelles = otrosMuelles;

                var result = (ResultadoCrear)comandos.Ejecutar(new CrearEmbarque { Embarque = embarqueAux });

                datosEmbarque = result.Id;
            }

            return datosEmbarque;
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.PreLineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/ListarMateriales")]
        public HttpResponseMessage ListarMateriales()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListaMaterialesPuertoConDescripcionCorta()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.PreLineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/ListarAgenciasMaritimas")]
        public HttpResponseMessage ListarAgenciasMaritimas()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarAgenciasMaritimas()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.PreLineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/ListarCoordinadores")]
        public HttpResponseMessage ListarCoordinadores()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarCoordinadores()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.PreLineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/ObtenerEmbarque")]
        public HttpResponseMessage ObtenerEmbarque(int id)
        {
            var embarque = servicio.ObtenerEmbarque(id);

            return Request.CreateResponse(HttpStatusCode.OK,
                embarque
            );
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.PreLineUp)]
        [Autorizacion(PermisosScato.LineUp_EditarBuque)]
        [Route("api/Embarque/ModificarEmbarque")]
        public HttpResponseMessage ModificarEmbarque(EmbarqueDto embarque)
        {
            var embarqueDb = servicio.ObtenerEmbarque(embarque.Id);
            if (CantidadDeDestinos(embarque) == 1)
            {
                comandos.Ejecutar(new ModificarEmbarque { Dto = embarque });
                if (embarque.UbicacionDeBuque != null && embarque.UbicacionDeBuque.Orden == 1) // Zarpó
                {
                    var resultado = comandos.Ejecutar(new EnvioMailZarpado { EmbarqueId = embarque.Id });
                    if (resultado.HayErrores)
                    {
                        return Request.CreateResponse(HttpStatusCode.InternalServerError, resultado.Errores[""]);
                    }
                }
            }
            else
            {
                //Crear Nuevo
                int res;
                if (embarque.Vicentin && !embarqueDb.Vicentin && !this.servicio.ExisteEmbarqueEnMuelle(embarque.NombreBuque, "vicentin"))
                {
                    res = IngresarEmbarque(embarque, true, false, false, false);
                    servicio.AsociarEmbarqueCreadoEnLineUpANominacion(embarque, res);
                }
                if (embarque.SanBenito && !embarqueDb.SanBenito && !this.servicio.ExisteEmbarqueEnMuelle(embarque.NombreBuque, "sanBenito"))
                {
                    res = IngresarEmbarque(embarque, false, true, false, false);
                    servicio.AsociarEmbarqueCreadoEnLineUpANominacion(embarque, res);
                }
                if (embarque.Noryon && !embarqueDb.Noryon && !this.servicio.ExisteEmbarqueEnMuelle(embarque.NombreBuque, "noryon"))
                {
                    res = IngresarEmbarque(embarque, false, false, true, false);
                    servicio.AsociarEmbarqueCreadoEnLineUpANominacion(embarque, res);
                }
                if (embarque.OtrosMuelles && !embarqueDb.OtrosMuelles && !this.servicio.ExisteEmbarqueEnMuelle(embarque.NombreBuque, "otrosMuelles"))
                {
                    res = IngresarEmbarque(embarque, false, false, false, true);
                    servicio.AsociarEmbarqueCreadoEnLineUpANominacion(embarque, res);
                }
                //Eliminar
                if (!embarque.Vicentin && embarqueDb.Vicentin)
                {
                    WorkflowController.EliminarEmbarqueRecorrido(servicio, comandos, nombreUsuario, embarqueDb.InstanciaWorkflow);
                }
                if (!embarque.SanBenito && embarqueDb.SanBenito)
                {
                    WorkflowController.EliminarEmbarqueRecorrido(servicio, comandos, nombreUsuario, embarqueDb.InstanciaWorkflow);
                }
                if (!embarque.Noryon && embarqueDb.Noryon)
                {
                    WorkflowController.EliminarEmbarqueRecorrido(servicio, comandos, nombreUsuario, embarqueDb.InstanciaWorkflow);
                }
                if (!embarque.OtrosMuelles && embarqueDb.OtrosMuelles)
                {
                    WorkflowController.EliminarEmbarqueRecorrido(servicio, comandos, nombreUsuario, embarqueDb.InstanciaWorkflow);
                }
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        private void ModificarEmbarque(EmbarqueDto embarque,
            bool vicentin,
            bool sanBenito,
            bool noryon,
            bool otrosMuelles)
        {
            if ((vicentin && vicentin == embarque.Vicentin) ||
                (sanBenito && sanBenito == embarque.SanBenito) ||
                (noryon && noryon == embarque.Noryon) ||
                (otrosMuelles && otrosMuelles == embarque.OtrosMuelles))
            {
                var embarqueAux = (EmbarqueDto)embarque.Clone();
                embarqueAux.Vicentin = vicentin;
                embarqueAux.SanBenito = sanBenito;
                embarqueAux.Noryon = noryon;
                embarqueAux.OtrosMuelles = otrosMuelles;
                comandos.Ejecutar(new ModificarEmbarque { Dto = embarqueAux });
            }
        }

        private int CantidadDeDestinos(EmbarqueDto embarque)
        {
            return (embarque.Noryon ? 1 : 0) + (embarque.Vicentin ? 1 : 0) + (embarque.SanBenito ? 1 : 0) + (embarque.OtrosMuelles ? 1 : 0);
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.PreLineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/ListarATAPuerto")]
        public HttpResponseMessage ListarATAPuerto()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarATAPuerto()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.PreLineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/ListarTipoDeBuquePuerto")]
        public HttpResponseMessage ListarTipoDeBuquePuerto()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarTipoDeBuquePuerto()
            );
        }

        [HttpGet]
        //[Autorizacion(PermisosScato.PreLineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/ListarUbicacionDeBuquePuerto")]
        public HttpResponseMessage ListarUbicacionDeBuquePuerto()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ListarUbicacionDeBuquePuerto()
            );
        }

        [HttpGet]
        [Route("api/Embarque/ListarMotivosLimpieza")]
        public HttpResponseMessage ListarMotivosLimpieza()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
            servicio.ListarMotivosLimpieza()
            );
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/AgregarAgenciaMaritimaPuerto")]
        public HttpResponseMessage AgregarAgenciaMaritimaPuerto(AgenciaMaritimaPuertoDto agencia)
        {
            comandos.Ejecutar(new CrearAgenciaMaritimaPuerto { Dto = agencia });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/ModificarAgenciaMaritimaPuerto")]
        public HttpResponseMessage ModificarAgenciaMaritimaPuerto(AgenciaMaritimaPuertoDto agencia)
        {
            comandos.Ejecutar(new ModificarAgenciaMaritimaPuerto { Dto = agencia });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/EliminarAgenciaMaritimaPuerto")]
        public HttpResponseMessage EliminarAgenciaMaritimaPuerto(int agenciaId)
        {
            var resultado = comandos.Ejecutar(new EliminarAgenciaMaritimaPuerto { Id = agenciaId });
            return Request.CreateResponse(!resultado.HayErrores ? true : false);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/AgregarCoordinadorPuerto")]
        public HttpResponseMessage AgregarCoordinadorPuerto(CoordinadorPuertoDto coordinador)
        {
            comandos.Ejecutar(new CrearCoordinadorPuerto { Dto = coordinador });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/ModificarCoordinadorPuerto")]
        public HttpResponseMessage ModificarCoordinadorPuerto(CoordinadorPuertoDto coordinador)
        {
            comandos.Ejecutar(new ModificarCoordinadorPuerto { Dto = coordinador });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/EliminarCoordinadorPuerto")]
        public HttpResponseMessage EliminarCoordinadorPuerto(int coordinadorId)
        {
            var resultado = comandos.Ejecutar(new EliminarCoordinadorPuerto { Id = coordinadorId });
            return Request.CreateResponse(!resultado.HayErrores ? true : false);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/AgregarATAPuerto")]
        public HttpResponseMessage AgregarATAPuerto(ATAPuertoDto ata)
        {
            comandos.Ejecutar(new CrearATAPuerto { Dto = ata });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/ModificarATAPuerto")]
        public HttpResponseMessage ModificarATAPuerto(ATAPuertoDto ata)
        {
            comandos.Ejecutar(new ModificarATAPuerto { Dto = ata });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        //[Autorizacion(PermisosScato.LineUp)]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/EliminarATAPuerto")]
        public HttpResponseMessage EliminarATAPuerto(int ataId)
        {
            var resultado = comandos.Ejecutar(new EliminarATAPuerto { Id = ataId });
            return Request.CreateResponse(!resultado.HayErrores ? true : false);
        }

        [HttpPost]
        [Route("api/Embarque/AgregarMotivosLimpieza")]
        public HttpResponseMessage AgregaMotivosLimpieza(MotivosLimpiezaDto motivosLimpieza)
        {
            comandos.Ejecutar(new CrearMotivosLimpieza { Dto = motivosLimpieza });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        [Route("api/Embarque/ModificarMotivosLimpieza")]
        public HttpResponseMessage ModificarMotivosLimpieza(MotivosLimpiezaDto motivosLimpieza)
        {
            comandos.Ejecutar(new ModificarMotivosLimpieza { Dto = motivosLimpieza });
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpPost]
        [Route("api/Embarque/EliminarMotivosLimpieza")]
        public HttpResponseMessage EliminarMotivosLimpieza(int motivosLimpiezaId)
        {
            var resultado = comandos.Ejecutar(new EliminarMotivosLimpieza { Id = motivosLimpiezaId });
            return Request.CreateResponse(!resultado.HayErrores ? true : false);
        }

        [HttpGet]
        [Route("api/Embarque/ObtenerBanderas")]
        public HttpResponseMessage ObtenerBanderas()
        {
            return Request.CreateResponse(HttpStatusCode.OK,
                servicio.ObtenerBanderas()
            );
        }

        [HttpPost]
        [Route("api/Embarque/GuardarArchivos")]
        public HttpResponseMessage GuardarArchivos(List<ArchivosPuertoDto> archivosPuerto, int idEmbarque)
        {
            try
            {
                servicio.GuardarArchivos(archivosPuerto, idEmbarque);
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/Embarque/GuardarTipoArchivo")]
        public HttpResponseMessage GuardarArchivos(TipoArchivoPuertoDto archivosPuerto)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.GuardarTipoArchivo(archivosPuerto));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpPost]
        [Route("api/Embarque/EliminarArchivos")]
        public HttpResponseMessage EliminarArchivos(List<ArchivosPuertoDto> archivosPuerto)
        {
            try
            {
                ;
                return Request.CreateResponse(HttpStatusCode.OK, servicio.EliminarArchivos(archivosPuerto));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet]
        [Route("api/Embarque/ObtenerArchivos")]
        public HttpResponseMessage obtenerArchivos(int idEmbarque)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.obtenerArchivos(idEmbarque));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

        [HttpGet]
        [Route("api/Embarque/ObtenerTipoArchivos")]
        public HttpResponseMessage obtenerTipoArchivos()
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.obtenerTipoArchivos());
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

        [HttpGet]
        [Route("api/Embarque/ObtenerIdsUsuales")]
        public HttpResponseMessage ObtenerIdsUsuales(int idEmbarque)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ObtenerIdsUsuales(idEmbarque));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Embarque/ObtenerEmbarqueInformacion")]
        public HttpResponseMessage obtenerEmbarqueInformacion(int idEmbarque)
        {
            try
            {
                return Request.CreateResponse(HttpStatusCode.OK, servicio.obtenerEmbarqueInformacion(idEmbarque));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp_Ver)]
        [Route("api/Embarque/ExisteEmbarqueEnMuelle")]
        public HttpResponseMessage ExisteEmbarqueEnMuelle(string nombreBuque, string muelle)
        {
            bool existe = servicio.ExisteEmbarqueEnMuelle(nombreBuque, muelle);

            return Request.CreateResponse(HttpStatusCode.OK,
                existe
            );
        }
    }
}