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
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Molinos.Scato.WebPuertoApi.Controllers
{
    public class ProgramaEmbarqueController : BaseController
    {
        private readonly IServicioProgramaEmbarque servicioProgramaEmbarque;
        private readonly IServicioComandos servicioComandos;
        public ProgramaEmbarqueController(IServicioRepositorio servicio, IServicioProgramaEmbarque programaEmbarque, IServicioComandos servicioComandos) : base(servicio)
        {
            this.servicioProgramaEmbarque = programaEmbarque;
            this.servicioComandos = servicioComandos;
        }
      
    }
}
