using Molinos.Scato.Servicios;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class BaseController : ApiController
    {
        protected readonly IServicioRepositorio servicio;
        protected readonly IServicioProgramaEmbarque servicioProgramaEmbarque;
        protected string nombreUsuario;
        protected readonly IServicioVapor servicioVapor;
        protected readonly IServicioAfip servicioAfip;
        public BaseController(IServicioRepositorio servicio, IServicioProgramaEmbarque servicioProgramaEmbarque = null, IServicioVapor servicioVapor = null, IServicioAfip servicioAfip = null)
        {
            if(System.Web.HttpContext.Current.Session !=null)
                this.nombreUsuario = System.Web.HttpContext.Current.Session["usuario"] as string;
           // this.nombreUsuario = User.Identity.Name.Substring(User.Identity.Name.LastIndexOf(@"\") + 1);
            this.servicio = servicio;
            this.servicioProgramaEmbarque = servicioProgramaEmbarque;
            this.servicioVapor = servicioVapor;
            this.servicioAfip = servicioAfip;
        }
    }
}