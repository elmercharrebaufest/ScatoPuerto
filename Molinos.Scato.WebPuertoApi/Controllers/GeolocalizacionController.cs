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
                embarcacionGeolocalizacionDto.UbicacionLineUp = string.Empty;

                if (ubicacionDeBuquePuerto != null)
                {
                    embarcacionGeolocalizacionDto.UbicacionLineUp = ubicacionDeBuquePuerto.Nombre;
                }

                IList<EmbarqueInformacionDto> embarqueInformacion = embarque.Embarque.EmbarqueInformacion;
                IList<EmbarqueInformacionViajeDto> embarqueInformacionViaje = embarque.Embarque.EmbarqueInformacionViaje;
                IList<EmbarquePosicionDto> embarquePosicion = embarque.Embarque.EmbarquePosicion;

                embarqueInformacion = embarqueInformacion.OrderByDescending(p => p.FechaRegistro).ToList();
                embarqueInformacionViaje = embarqueInformacionViaje.OrderByDescending(p => p.FechaRegistro).ToList();
                embarquePosicion = embarquePosicion.OrderByDescending(p => p.FechaRegistro).ToList();

                if (embarqueInformacion != null)
                {
                    if (embarqueInformacion.Count > 0)
                    {
                        embarcacionGeolocalizacionDto.Informacion = embarqueInformacion[0];
                    }
                }

                if (embarqueInformacionViaje != null)
                {
                    if (embarqueInformacionViaje.Count > 0)
                    {
                        embarcacionGeolocalizacionDto.Viaje = embarqueInformacionViaje[0];
                    }
                }

                if (embarquePosicion != null)
                {
                    if (embarquePosicion.Count > 0)
                    {
                        embarcacionGeolocalizacionDto.Posicion = embarquePosicion[0];
                    }
                }

                if (embarqueInformacion.Count > 0 && embarqueInformacionViaje.Count > 0 && embarquePosicion.Count > 0)
                {
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