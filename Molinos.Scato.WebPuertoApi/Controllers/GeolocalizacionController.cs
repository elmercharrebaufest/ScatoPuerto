using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Seguridad;
using Molinos.Scato.Servicios;
using Molinos.Scato.WebPuertoApi.Atributos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class GeolocalizacionController : BaseController
    {
        private readonly IServicioComandos comandos;
        private readonly IListaDeWorkflows workflows;

        public GeolocalizacionController(IServicioRepositorio servicio, IListaDeWorkflows workflows, IServicioComandos comandos) : base(servicio)
        {
            this.workflows = workflows;
            this.comandos = comandos;
        }

        [HttpPost]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Geolocalizacion/RegistrarEmbarqueGeolocalizacion")]
        public HttpResponseMessage RegistrarEmbarqueGeolocalizacion(List<ObjetoGeolocalizacion> listaEmbarquesGeolocalizacion)
        {
            try
            {
                foreach (var EmbarqueGeolocalizacion in listaEmbarquesGeolocalizacion)
                {
                
                    comandos.Ejecutar(new ModificarEmbarqueGeolocalizacion
                    {
                        DtoInformacion = EmbarqueGeolocalizacion.informacion,
                        DtoPosicion = EmbarqueGeolocalizacion.posicion,
                        DtoViaje = EmbarqueGeolocalizacion.informacionViaje,
                        BanderaBuque = EmbarqueGeolocalizacion.DatosEmbarqueGeolocalizacion.BanderaBuque,
                        NombreBuque = EmbarqueGeolocalizacion.DatosEmbarqueGeolocalizacion.NombreBuque,
                        TipoBuque = EmbarqueGeolocalizacion.DatosEmbarqueGeolocalizacion.TipoBuque
                    });

                    servicio.GenerarLogging("EMBARQUE", EmbarqueGeolocalizacion.DatosEmbarqueGeolocalizacion.NombreBuque, "POST", base.nombreUsuario);
                    servicio.GenerarLogging("INFORMACION", Newtonsoft.Json.JsonConvert.SerializeObject(EmbarqueGeolocalizacion.informacion), "POST", base.nombreUsuario);
                    servicio.GenerarLogging("POSICION", Newtonsoft.Json.JsonConvert.SerializeObject(EmbarqueGeolocalizacion.posicion), "POST", base.nombreUsuario);
                    servicio.GenerarLogging("INFORMACIONVIAJE", Newtonsoft.Json.JsonConvert.SerializeObject(EmbarqueGeolocalizacion.informacionViaje), "POST", base.nombreUsuario);
                }


                return Request.CreateResponse(HttpStatusCode.OK);

            }
            catch (System.Exception ex)
            {

                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }


        }
        public class ObjetoGeolocalizacion
        {
            public DatosEmbarqueGeolocalizacion DatosEmbarqueGeolocalizacion;
            public EmbarqueInformacionDto informacion;
            public EmbarqueInformacionViajeDto informacionViaje;
            public EmbarquePosicionDto posicion;
        }

        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Geolocalizacion/ObtenerEmbarquesGeolocalizacion")]
        public HttpResponseMessage ObtenerEmbarquesGeolocalizacion()
        {
            try
            {
                var embarquesLineUp = workflows.ListarEmbarques("LineUp");

                embarquesLineUp = embarquesLineUp.GroupBy(x=>x.Embarque.NombreBuque).Select(x=>x.FirstOrDefault()).ToList();
                List<DatosEmbarqueGeolocalizacion> embarques = new List<DatosEmbarqueGeolocalizacion>();

                foreach (var embarque in embarquesLineUp)
                {
                    DatosEmbarqueGeolocalizacion embarqueLineUp = new DatosEmbarqueGeolocalizacion
                    {
                        NombreBuque = embarque.Embarque.NombreBuque,
                        BanderaBuque = embarque.Embarque.EmbarqueInformacion.Count()>0 ? embarque.Embarque.EmbarqueInformacion[0].Bandera.Abreviatura:null,
                        TipoBuque = embarque.Embarque.TipoBuque,
                        imo = embarque.Embarque.EmbarqueInformacion.Count() > 0 ? embarque.Embarque.EmbarqueInformacion[0].IMO:""
                    };
                    embarques.Add(embarqueLineUp);
   
                }

                return Request.CreateResponse(HttpStatusCode.OK, embarques);

            }
            catch (System.Exception ex)
            {

                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.Message);
            }


        }

        public class DatosEmbarqueGeolocalizacion
        {
            public string NombreBuque;
            public string TipoBuque;
            public string BanderaBuque;
            public string imo;
        }


        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Geolocalizacion/ListarPuntosInteresGeolocalizacion")]
        public HttpResponseMessage ListarPuntosInteresGeolocalizacion()
        {
            try
            {
                short estado = 1;
                return Request.CreateResponse(HttpStatusCode.OK, servicio.ListarPuntosInteresGeolocalizacion(estado));
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }
        [HttpGet]
        [Autorizacion(PermisosScato.LineUp)]
        [Route("api/Geolocalizacion/ListarEmbarqueLineUpGeolocalizacion")]
        public HttpResponseMessage ListarEmbarqueLineUpGeolocalizacion()
        {
            try
            {
                var listaEmbarques = servicio.ListarEmbarques();

                List<EmbarqueGeolocalizacionDto> listaEmbarcacionGeolocalizacion = new List<EmbarqueGeolocalizacionDto>();
                IList<UbicacionDeBuquePuertoDto> listarUbicacionDeBuquePuerto = servicio.ListarUbicacionDeBuquePuerto();
                
                this.cargarEmbarquenesLineUpPorPuerto(listaEmbarques, ref listaEmbarcacionGeolocalizacion, listarUbicacionDeBuquePuerto, Convert.ToInt16(MuelleCarga.SanBenito));
                this.cargarEmbarquenesLineUpPorPuerto(listaEmbarques, ref listaEmbarcacionGeolocalizacion, listarUbicacionDeBuquePuerto, Convert.ToInt16(MuelleCarga.Vicentin));
                this.cargarEmbarquenesLineUpPorPuerto(listaEmbarques, ref listaEmbarcacionGeolocalizacion, listarUbicacionDeBuquePuerto, Convert.ToInt16(MuelleCarga.Noryon));
                this.cargarEmbarquenesLineUpPorPuerto(listaEmbarques, ref listaEmbarcacionGeolocalizacion, listarUbicacionDeBuquePuerto, Convert.ToInt16(MuelleCarga.OtrosMuelles));

                return Request.CreateResponse(HttpStatusCode.OK, listaEmbarcacionGeolocalizacion);

            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

        [HttpPost]
        [Route("api/Geolocalizacion/RegistrarErroresGeolocalizacion")]
        public HttpResponseMessage RegistrarErroresGeolocalizacion(List<erroresGeo> ErroresGeolocalizacion)
        {
            try
            {
                List<ErroresGeolocalizacionDto> errores = new List<ErroresGeolocalizacionDto>();
                foreach (var item in ErroresGeolocalizacion)
                {
                    ErroresGeolocalizacionDto error = new ErroresGeolocalizacionDto
                    {
                        Bandera = item.Bandera,
                        IMO = item.IMO,
                        FechaError = DateTime.Now,
                        Mensaje = item.Mensaje,
                        NombreBuque = item.NombreBuque,
                        TipoBuque = item.TipoBuque

                    };
                    errores.Add(error);
                }

                servicio.RegistrarErroresGeolocalizacion(errores);
                return Request.CreateResponse(HttpStatusCode.OK);

            }
            catch (System.Exception ex)
            {

                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }

     
        }
        public class erroresGeo
        {
            public string NombreBuque;
            public string TipoBuque;
            public string Bandera;
            public string IMO;
            public string Mensaje;
        }


        #region Metodos para cargar los embarques en la pantalla de geolocalización
        private void cargarEmbarquenesLineUpPorPuerto(IList<InstanciaWorkflowPuertoDto> listaEmbarques, ref List<EmbarqueGeolocalizacionDto> listaEmbarcacionGeolocalizacion,  IList<UbicacionDeBuquePuertoDto> listarUbicacionDeBuquePuerto, short tipoMuelleCarga)
        {
            EmbarqueGeolocalizacionDto embarcacionGeolocalizacionDto;
            foreach (var embarque in listaEmbarques)
            {

                embarcacionGeolocalizacionDto = new EmbarqueGeolocalizacionDto();
                embarcacionGeolocalizacionDto.Embarque_Id = embarque.Embarque.Id;
                embarcacionGeolocalizacionDto.NombreBuque = embarque.Embarque.NombreBuque;
                embarcacionGeolocalizacionDto.Vapor_Id = embarque.Embarque.Vapor.Id;
                embarcacionGeolocalizacionDto.SanBenito = embarque.Embarque.SanBenito;
                embarcacionGeolocalizacionDto.Vicentin = embarque.Embarque.Vicentin;
                embarcacionGeolocalizacionDto.Noryon = embarque.Embarque.Noryon;
                embarcacionGeolocalizacionDto.OtrosMuelles = embarque.Embarque.OtrosMuelles;

                bool esMuelleSeleccionado = false;

                switch (tipoMuelleCarga)
                {
                    case 1:
                        esMuelleSeleccionado = embarcacionGeolocalizacionDto.SanBenito;
                        break;
                    case 2:
                        esMuelleSeleccionado = embarcacionGeolocalizacionDto.Vicentin;
                        break;
                    case 3:
                        esMuelleSeleccionado = embarcacionGeolocalizacionDto.Noryon;
                        break;
                    case 4:
                        esMuelleSeleccionado = embarcacionGeolocalizacionDto.OtrosMuelles;
                        break;
                }
                if (!esMuelleSeleccionado)
                {
                    continue;
                }
                UbicacionDeBuquePuertoDto ubicacionDeBuquePuerto = listarUbicacionDeBuquePuerto.FirstOrDefault(ubicacion => ubicacion.Id == embarque.Embarque.Ubicacion);

                if (embarque.Embarque.EmbarqueInformacion.Count > 0 && embarque.Embarque.EmbarqueInformacionViaje.Count > 0 && embarque.Embarque.EmbarquePosicion.Count > 0 && ubicacionDeBuquePuerto != null)
                {
                    embarcacionGeolocalizacionDto.UbicacionLineUp = ubicacionDeBuquePuerto.Nombre;
                    embarcacionGeolocalizacionDto.Informacion = embarque.Embarque.EmbarqueInformacion[0];
                    embarcacionGeolocalizacionDto.Viaje = embarque.Embarque.EmbarqueInformacionViaje[0];
                    embarcacionGeolocalizacionDto.Posicion = embarque.Embarque.EmbarquePosicion[0];
                    listaEmbarcacionGeolocalizacion.Add(embarcacionGeolocalizacionDto);
                }
            }

        }


       
        private enum MuelleCarga
        {
            SanBenito = 1,
            Vicentin = 2,
            Noryon = 3,
            OtrosMuelles = 4
        };
        #endregion

    }
}