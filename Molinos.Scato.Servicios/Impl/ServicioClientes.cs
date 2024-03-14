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
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioClientes : IServicioClientes
    {
        private readonly IRepositorio repositorio;
        private readonly IServicioComandos comandos;
        private readonly ILogger log;

        public ServicioClientes(IRepositorio repositorio, IServicioComandos comandos, ILogger log)
        {
            this.repositorio = repositorio;
            this.comandos = comandos;
            this.log = log;
        }

        public void GuardarCliente(CoordinadorPuertoDto clienteDto)
        {
            if (String.IsNullOrEmpty(clienteDto.Nombre))
                throw new Exception("Es obligatorio ingresar un nombre.");

            var clienteBd = this.repositorio.Obtener<CoordinadorPuerto>(c => c.Nombre.ToUpper().Trim() == clienteDto.Nombre.ToUpper().Trim());

            if (clienteBd != null && clienteBd.Habilitado)
                throw new Exception("El Nombre ingresado ya existe en otro cliente.");

            clienteDto.Nombre = clienteDto.Nombre.Trim();
            //En caso que se de de alta un cliente que ya existe y estaba deshabilitado ->
            //Se lo vuelve a habilitar.
            if (clienteBd != null && !clienteBd.Habilitado && clienteDto.Id == 0)
            {
                clienteDto.Id = clienteBd.Id;
                clienteDto.Nombre = clienteBd.Nombre;
                clienteDto.Habilitado = true;
                this.HabilitarCliente(clienteDto, clienteBd);
                return;
            }
            else
            {
                if (clienteDto.Id == 0)
                {
                    this.RegistrarCliente(clienteDto);
                }
                else if (clienteDto.Id > 0)
                {
                    this.EditarCliente(clienteDto, clienteBd);
                }
            }  
        }

        private void RegistrarCliente(CoordinadorPuertoDto clienteDto)
        {
            try
            {
                comandos.Ejecutar(new CrearCoordinadorPuerto { Dto = clienteDto });
                this.RegistrarAuditoriaAlta(clienteDto);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Hubo un problema al intentar registrar cliente: " + clienteDto.Nombre);
                throw new Exception("Hubo un problema al intentar registrar el cliente. Contacte a sistemas.");
            }
        }

        private void EditarCliente(CoordinadorPuertoDto clienteDto, CoordinadorPuerto clienteBd)
        {
            try
            {
                comandos.Ejecutar(new ModificarCoordinadorPuerto { Dto = clienteDto });
                this.RegistrarAuditoriaEdicion(clienteDto, clienteBd);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Hubo un problema al intentar modificar cliente: " + clienteDto.Nombre);
                throw new Exception("Hubo un problema al intentar editar el cliente. Contacte a sistemas.");
            }
        }

        private void HabilitarCliente(CoordinadorPuertoDto clienteDto, CoordinadorPuerto clienteBd)
        {
            try
            {
                comandos.Ejecutar(new ModificarCoordinadorPuerto { Dto = clienteDto });
                this.RegistrarAuditoriaHabilitacion(clienteDto);
            }
            catch (Exception ex)
            {
                log.Error(ex, "Hubo un problema al intentar modificar cliente: " + clienteDto.Nombre);
                throw new Exception("Hubo un problema al intentar editar el cliente. Contacte a sistemas.");
            }
        }

        private void RegistrarAuditoriaAlta(CoordinadorPuertoDto clienteDto)
        {
            var clienteBd = this.repositorio.Obtener<CoordinadorPuerto>(c => c.Nombre.ToUpper() == clienteDto.Nombre.ToUpper());
            
            var auditoria = new Auditoria
            {
                Entidad_Id = clienteBd != null? clienteBd.Id : 0,
                EntidadNombre = "CoordinadorPuerto",
                UsuarioEjecuta = clienteDto.Usuario,
                ValorNuevo = clienteDto.Nombre,
                Propiedad = "Nombre",
                FechaModificacion = DateTime.Now,
                Accion = "Registro de cliente."
            };

            this.repositorio.Agregar(auditoria);
            this.repositorio.GuardarCambios();
        }

        private void RegistrarAuditoriaEdicion(CoordinadorPuertoDto clienteDto, CoordinadorPuerto clienteBd)
        {
            var auditoria = new Auditoria
            {
                Entidad_Id = clienteDto.Id,
                EntidadNombre = "CoordinadorPuerto",
                UsuarioEjecuta = clienteDto.Usuario,
                ValorAnterior = clienteBd.Nombre,
                ValorNuevo = clienteDto.Nombre,
                Propiedad = "Nombre",
                FechaModificacion = DateTime.Now,
                Accion = "Edicion de cliente."
            };

            this.repositorio.Agregar(auditoria);
            this.repositorio.GuardarCambios();
        }

        private void RegistrarAuditoriaHabilitacion(CoordinadorPuertoDto clienteDto)
        {
            var auditoria = new Auditoria
            {
                Entidad_Id = clienteDto.Id,
                EntidadNombre = "CoordinadorPuerto",
                UsuarioEjecuta = clienteDto.Usuario,
                ValorAnterior = "0",
                ValorNuevo = "1",
                Propiedad = "Habilitado",
                FechaModificacion = DateTime.Now,
                Accion = "Habilita cliente."
            };

            this.repositorio.Agregar(auditoria);
            this.repositorio.GuardarCambios();
        }

        public ListaPaginada<CoordinadorPuertoDto> ListarClientesPuerto(Paginacion paginacion, string nombre = null)
        {
            return repositorio.ListarConsultaPaginada(new ListarClientesConsulta(paginacion, nombre));
        }
    }
}
