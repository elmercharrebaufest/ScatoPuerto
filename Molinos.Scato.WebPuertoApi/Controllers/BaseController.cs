using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.Conversiones;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class BaseController : ApiController
    {
        protected readonly IServicioRepositorio servicio;
        protected readonly IServicioProgramaEmbarque servicioProgramaEmbarque;
        protected string nombreUsuario;
        protected readonly IServicioVapor servicioVapor;
        protected readonly IServicioAfip servicioAfip;
        protected readonly IServicioClientes servicioClientes;
        protected readonly IServicioDocumento servicioDocumento;
        protected readonly IServicioAdministracion servicioAdministracion;
        protected readonly IServicioComprobante servicioComprobante;

        public BaseController(
            IServicioRepositorio servicio,
            IServicioProgramaEmbarque servicioProgramaEmbarque = null,
            IServicioVapor servicioVapor = null,
            IServicioAfip servicioAfip = null,
            IServicioClientes servicioClientes = null,
            IServicioDocumento servicioDocumento = null,
            IServicioAdministracion servicioAdministracion = null,
            IServicioComprobante servicioComprobante = null
            )
        {
            if (System.Web.HttpContext.Current.Session != null)
                this.nombreUsuario = System.Web.HttpContext.Current.Session["usuario"] as string;

            this.servicio = servicio;
            this.servicioProgramaEmbarque = servicioProgramaEmbarque;
            this.servicioVapor = servicioVapor;
            this.servicioAfip = servicioAfip;
            this.servicioClientes = servicioClientes;
            this.servicioDocumento = servicioDocumento;
            this.servicioAdministracion = servicioAdministracion;
            this.servicioComprobante = servicioComprobante;
        }
    }
}