using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioClientes : IServicioClientes
    {
        private readonly IRepositorio repositorio;

        public ServicioClientes(IRepositorio repositorio)
        {
            this.repositorio = repositorio;
        }
        public ListaPaginada<CoordinadorPuertoDto> ListarClientesPuerto(Paginacion paginacion, string nombre = null)
        {
            return repositorio.ListarConsultaPaginada(new ListarClientesConsulta(paginacion, nombre));
        }
    }
}
