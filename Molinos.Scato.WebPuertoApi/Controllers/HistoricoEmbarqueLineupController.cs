using Molinos.Scato.Actividades.Interfaces;
using Molinos.Scato.Actividades.Servicios;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Servicios;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    [BasicAuthFilter]
    public class HistoricoEmbarqueLineupController : BaseController
	{
		private readonly IListaDeWorkflows _workflows;
		private readonly IServicioActividadFactory<ILineUpService> _servicioFactory;
		private readonly IServicioComandos _servicioComandos;
		//private readonly IServicioRepositorioBase<HistoricoEmbarqueLineUp, HistoricoEmbarqueLineUpDto> _servicioRepository;

		public HistoricoEmbarqueLineupController(
			IServicioActividadFactory<ILineUpService> servicioFactory,
			IServicioRepositorio servicio,
			IListaDeWorkflows workflows,
			IServicioComandos servicioComandos
			//IServicioRepositorioBase<HistoricoEmbarqueLineUp, HistoricoEmbarqueLineUpDto> servicioRepository
			) : base(servicio)
		{
			_servicioFactory = servicioFactory;
			_workflows = workflows;
			_servicioComandos = servicioComandos;

			//_servicioRepository = servicioRepository;
		}

		[HttpGet]
		[Route("api/historico-embarque-lineup/listar/{embarqueId}")]
		public HttpResponseMessage Listar(int embarqueId)
		{
			//var historicosEmbarqueLineUp = _servicioRepository.ListarByFK(embarqueId);
			var historicosEmbarqueLineUp = servicio.ListarHistoricoEmbarqueLineUpDto(embarqueId);

			return Request.CreateResponse(HttpStatusCode.OK, historicosEmbarqueLineUp);
			//return Request.CreateResponse(HttpStatusCode.OK);
		}

		[HttpPost]
		[Route("api/historico-embarque-lineup/create")]
		public HttpResponseMessage Crear(HistoricoEmbarqueLineUpDto dto)
		{
			_servicioComandos.Ejecutar(new CrearHistoricoEmbarqueLineUp { Dto = dto });
			return Request.CreateResponse(HttpStatusCode.OK);
		}
	}
}
