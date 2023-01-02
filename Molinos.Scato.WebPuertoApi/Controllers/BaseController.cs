using Molinos.Scato.Servicios;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class BaseController : ApiController
    {
        protected readonly IServicioRepositorio servicio;
        protected readonly IServicioProgramaEmbarque     servicioProgramaEmbarque;
        protected readonly string nombreUsuario;
        public BaseController(IServicioRepositorio servicio, IServicioProgramaEmbarque servicioProgramaEmbarque = null)
        {
            this.nombreUsuario = User.Identity.Name.Substring(User.Identity.Name.LastIndexOf(@"\") + 1);
            this.servicio = servicio;
            this.servicioProgramaEmbarque = servicioProgramaEmbarque;
        }        
    }
}   