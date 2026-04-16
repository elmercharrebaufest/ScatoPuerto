using Molinos.Scato.Dominio.Comandos;
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

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioClientes : IServicioClientes
    {
        private readonly IRepositorio repositorio;
        private readonly IServicioComandos comandos;
        private readonly ILogger log;
        private readonly IConversor conversor;

        public ServicioClientes(IRepositorio repositorio, IServicioComandos comandos, ILogger log, IConversor conversor)
        {
            this.repositorio = repositorio;
            this.comandos = comandos;
            this.log = log;
            this.conversor = conversor;
        }

        public void GuardarCliente(CoordinadorPuertoDto clienteDto, string usuario)
        {
            if (String.IsNullOrEmpty(clienteDto.Nombre))
                throw new Exception("Es obligatorio ingresar un nombre.");

            clienteDto.Nombre = clienteDto.Nombre.Trim();

            if (clienteDto.Id > 0)
            {
                this.EditarCliente(clienteDto, usuario);
            }
            else
            {
                this.RegistrarCliente(clienteDto, usuario);
            }
        }

        private void RegistrarCliente(CoordinadorPuertoDto clienteDto, string usuario)
        {
            var clienteBd = this.repositorio.Obtener<CoordinadorPuerto>(c => c.Nombre.ToUpper().Trim() == clienteDto.Nombre.ToUpper().Trim());
            if (clienteBd != null && clienteBd.Habilitado)
                throw new Exception("El Nombre ingresado ya existe en otro cliente.");

            if (clienteBd != null && !clienteBd.Habilitado)
            {
                clienteDto.Id = clienteBd.Id;
                clienteDto.Nombre = clienteBd.Nombre;
                clienteDto.Habilitado = true;
                this.HabilitarCliente(clienteDto, usuario);
                return;
            }

            try
            {
                comandos.Ejecutar(new CrearCoordinadorPuerto { Dto = clienteDto, Usuario = usuario });
            }
            catch (Exception ex)
            {
                log.Error(ex, "Hubo un problema al intentar registrar cliente: " + clienteDto.Nombre);
                throw new Exception("Hubo un problema al intentar registrar el cliente. Contacte a sistemas.");
            }
        }

        private void EditarCliente(CoordinadorPuertoDto clienteDto, string usuario)
        {
            var clienteBd = this.repositorio.Obtener<CoordinadorPuerto>(c => c.Id == clienteDto.Id);
            var clienteMismoNombre = this.repositorio.Obtener<CoordinadorPuerto>(c => c.Nombre.ToUpper().Trim() == clienteDto.Nombre.ToUpper().Trim());

            if (ExisteClienteNominacionActiva(clienteBd))
            {
                throw new Exception("No se puede modificar al cliente ya que esta siendo utilizado en una nominación activa.");
            }
            if (ExisteClienteLineUp(clienteBd))
            {
                throw new Exception("No se puede modificar al cliente ya que el mismo se encuentra en LineUp.");
            }

            if (clienteMismoNombre != null && clienteMismoNombre.Habilitado)
            {
                throw new Exception("El Nombre ingresado ya existe en el sistema.");
            }

            if (clienteMismoNombre != null && !clienteMismoNombre.Habilitado)
            {
                clienteDto.Id = clienteMismoNombre.Id;
                clienteDto.Nombre = clienteMismoNombre.Nombre;
                clienteDto.Habilitado = true;
                this.HabilitarCliente(clienteDto, usuario);
                this.DeshabilitarCliente(new CoordinadorPuertoDto
                {
                    Id = clienteBd.Id,
                    Nombre = clienteBd.Nombre,
                    Usuario = clienteDto.Usuario
                }, usuario);
                return;
            }

            try
            {
                var valorAnterior = clienteBd.Nombre;
                comandos.Ejecutar(new ModificarCoordinadorPuerto { Dto = clienteDto, Usuario = usuario });
            }
            catch (Exception ex)
            {
                log.Error(ex, "Hubo un problema al intentar modificar cliente: " + clienteDto.Nombre);
                throw new Exception("Hubo un problema al intentar editar el cliente. Contacte a sistemas.");
            }
        }

        private void HabilitarCliente(CoordinadorPuertoDto clienteDto, string usuario)
        {
            try
            {
                comandos.Ejecutar(new ModificarCoordinadorPuerto { Dto = clienteDto, Usuario = usuario });
            }
            catch (Exception ex)
            {
                log.Error(ex, "Hubo un problema al intentar modificar cliente: " + clienteDto.Nombre);
                throw new Exception("Hubo un problema al intentar editar el cliente. Contacte a sistemas.");
            }
        }

        public void DeshabilitarCliente(CoordinadorPuertoDto clienteDto, string usuario)
        {
            var clienteBd = this.repositorio.Obtener<CoordinadorPuerto>(c => c.Id == clienteDto.Id);
            if (ExisteClienteNominacionActiva(clienteBd))
            {
                throw new Exception("No se puede eliminar al cliente ya que esta siendo utilizado en una nominación activa.");
            }
            if (ExisteClienteLineUp(clienteBd))
            {
                throw new Exception("No se puede eliminar al cliente ya que el mismo se encuentra en LineUp.");
            }
            try
            {
                clienteDto.Habilitado = false;
                comandos.Ejecutar(new ModificarCoordinadorPuerto { Dto = clienteDto, Usuario = usuario });
            }
            catch (Exception ex)
            {
                log.Error(ex, "Hubo un problema al intentar deshabilitar cliente: " + clienteDto.Nombre);
                throw new Exception("Hubo un problema al intentar deshabilitar el cliente. Contacte a sistemas.");
            }
        }

        public ListaPaginada<CoordinadorPuertoDto> ListarClientesPuerto(Paginacion paginacion, string nombre = null, string codigoSap = null)
        {
            return repositorio.ListarConsultaPaginada(new ListarClientesConsulta(paginacion, nombre, codigoSap));
        }

        public CoordinadorPuertoDto ObtenerCliente(int id)
        {
            var cliente = repositorio.Obtener<CoordinadorPuerto>(c => c.Id == id);
            if (cliente == null)
                throw new Exception("No se encontró el cliente en el sistema.");
            return new CoordinadorPuertoDto { Id = cliente.Id, Nombre = cliente.Nombre, Habilitado = cliente.Habilitado };
        }

        private bool ExisteClienteNominacionActiva(CoordinadorPuerto clienteBd)
        {
            var existeNominacion = (from n in repositorio.Listar<Nominacion>()
                                    where !n.FechaEliminacion.HasValue && !n.FechaEnvioLineUp.HasValue &&
                                    n.NominacionDatoTecnico.NominacionDatoTecnicoCoordinadorPuerto.Any(c => c.CoordinadorPuerto.Id == clienteBd.Id)
                                    select (n)).Any();
            return existeNominacion;
        }

        private bool ExisteClienteLineUp(CoordinadorPuerto clienteBd)
        {
            var existeEmbarque = (from e in repositorio.Listar<Embarque>()
                                  join l in repositorio.Listar<LineUp>() on e.Id equals l.Embarque?.Id
                                  where e.Ubicacion != 1 && l.ModuloDeCarga != null && l.ModuloDeCarga.Id > 0 &&
                                  e.Coordinadores.Any(c => c.CoordinadorPuerto.Id == clienteBd.Id)
                                  select (e)).Any();
            return existeEmbarque;
        }

        public IList<CoordinadorPuertoDto> ListarClientes(string nombre)
        {
            var clientes = conversor.ConvertirList<CoordinadorPuerto, CoordinadorPuertoDto>(
                this.repositorio.Listar<CoordinadorPuerto>(c => c.Habilitado == true));
            if (!string.IsNullOrEmpty(nombre))
            {
                return clientes.Where(c2 => c2.Nombre.ToUpper().Contains(nombre.ToUpper())).ToList();
            }
            return clientes;
        }
    }
}