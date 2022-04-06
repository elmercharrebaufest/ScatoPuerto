using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Dto;
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
        private readonly IListaDeWorkflows workflows;

        public GeolocalizacionController(IServicioRepositorio servicio, IListaDeWorkflows workflows) : base(servicio)
        {
            this.workflows = workflows;
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

                var listaEmbarques = workflows.ListarEmbarques();

                List<EmbarqueGeolocalizacionDto> listaEmbarcacionGeolocalizacion = new List<EmbarqueGeolocalizacionDto>();
                EmbarqueGeolocalizacionDto embarcacionGeolocalizacionDto;
                IList<UbicacionDeBuquePuertoDto> listarUbicacionDeBuquePuerto = servicio.ListarUbicacionDeBuquePuerto();

                foreach (var embarque in listaEmbarques)
                {
                    
                    embarcacionGeolocalizacionDto = new EmbarqueGeolocalizacionDto();
                    embarcacionGeolocalizacionDto.Embarque_Id = embarque.Embarque.Id;
                    embarcacionGeolocalizacionDto.NombreBuque = embarque.Embarque.NombreBuque;
                    embarcacionGeolocalizacionDto.Vicentin = embarque.Embarque.Vicentin;
                    embarcacionGeolocalizacionDto.OtrosMuelles = embarque.Embarque.OtrosMuelles;
                    embarcacionGeolocalizacionDto.Noryon = embarque.Embarque.Noryon;
                    embarcacionGeolocalizacionDto.SanBenito = embarque.Embarque.SanBenito;
                    embarcacionGeolocalizacionDto.Vapor_Id = embarque.Embarque.Vapor.Id;

                    UbicacionDeBuquePuertoDto ubicacionDeBuquePuerto = listarUbicacionDeBuquePuerto.FirstOrDefault(ubicacion => ubicacion.Id == embarque.Embarque.Ubicacion);
                    embarcacionGeolocalizacionDto.UbicacionLineUp = string.Empty;

                    if (ubicacionDeBuquePuerto != null)
                    {
                        embarcacionGeolocalizacionDto.UbicacionLineUp = ubicacionDeBuquePuerto.Nombre;
                    }

                    IList<EmbarqueInformacionDto> EmbarqueInformacion = embarque.Embarque.EmbarqueInformacion;
                    IList<EmbarqueInformacionViajeDto> EmbarqueInformacionViaje = embarque.Embarque.EmbarqueInformacionViaje;
                    IList<EmbarquePosicionDto> EmbarquePosicion = embarque.Embarque.EmbarquePosicion;

                    EmbarqueInformacion = EmbarqueInformacion.OrderByDescending(p => p.FechaRegistro).ToList();
                    EmbarqueInformacionViaje = EmbarqueInformacionViaje.OrderByDescending(p => p.FechaRegistro).ToList();
                    EmbarquePosicion = EmbarquePosicion.OrderByDescending(p => p.FechaRegistro).ToList();

                    if (EmbarqueInformacion != null)
                    {
                        if (EmbarqueInformacion.Count > 0 )
                        {
                            embarcacionGeolocalizacionDto.Informacion = EmbarqueInformacion[0];
                        }
                    }

                    if (EmbarqueInformacionViaje != null)
                    {
                        if (EmbarqueInformacionViaje.Count > 0)
                        {
                            embarcacionGeolocalizacionDto.Viaje = EmbarqueInformacionViaje[0];
                        }
                    }

                    if (EmbarquePosicion != null)
                    {
                        if (EmbarquePosicion.Count > 0)
                        {
                            embarcacionGeolocalizacionDto.Posicion = EmbarquePosicion[0];
                        }
                    }

                    listaEmbarcacionGeolocalizacion.Add(embarcacionGeolocalizacionDto);
        
                }
                return Request.CreateResponse(HttpStatusCode.OK, listaEmbarcacionGeolocalizacion);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError, ex.InnerException);
            }
        }

        

    }
}