using Molinos.Scato.Servicios;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class AutenticadorController : BaseController
    {
        private const string GrupoAduana = "LAA_MOAAPP_CCTVAxis_User_AduanaSL";
        private const string GrupoSistemas = "LAD_MOAAPP_PUERTO_SISTEMA";
        private const string PermisoAduana = "Aduana_Consultar";

        public AutenticadorController(IServicioRepositorio servicio) : base(servicio)
        {
        }

        [HttpGet]
        [Authorize]
        [Route("api/AutenticarUsuarioAD")]
        public HttpResponseMessage AutenticarUsuarioAD()
        {
            try
            {
                var listadoPermisos = servicio.ListarPermisosPorUsuarioAD(nombreUsuario);

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    username = nombreUsuario,
                    permisos = listadoPermisos
                });
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        [HttpGet]
        [Authorize]
        [Route("api/AutenticarUsuario")]
        public HttpResponseMessage AutenticarUsuario()
        {
            try
            {
                var listadoPermisos = servicio.
                    ListarPermisosPorUsuario(nombreUsuario).Where(x => x.TipoPermiso == Dominio.Enums.TipoPermiso.Puerto);

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    username = nombreUsuario,
                    permisos = listadoPermisos.Select(x => x.Codigo.Value)
                });
            }
            catch(Exception ex)
            {
                throw ex;
            }
            
        }

        [HttpGet]
        [Authorize]
        [Route("api/ObtenerUsuarioId")]
        public HttpResponseMessage ObtenerUsuarioId(string usuario)
        {
            try
            {

                return Request.CreateResponse(HttpStatusCode.OK,
               servicio.ObtenerUsuarioId( usuario));
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }

        [HttpPost]
        [Route("api/ObtenerGruposAD")]
        public HttpResponseMessage ObtenerGruposAD(List<string> grupos, string username )
        {
            try
            {
                System.Web.HttpContext.Current.Session.Add("usuario", username);
                var listadoPermisos = servicio.ObtenerGruposAD(grupos).Distinct().ToList();

                if (grupos != null)
                {
                    if (grupos.Contains(GrupoAduana) && !grupos.Contains(GrupoSistemas))
                    {
                        listadoPermisos = new List<string> { PermisoAduana };
                    }
                    else if (grupos.Contains(GrupoSistemas) && !listadoPermisos.Contains(PermisoAduana))
                    {
                        listadoPermisos.Add(PermisoAduana);
                    }
                }

                return Request.CreateResponse(HttpStatusCode.OK, new
                {
                    permisos = listadoPermisos.Distinct()
                });
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }
    }
}