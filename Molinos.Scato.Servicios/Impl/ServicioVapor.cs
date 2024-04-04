using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Consultas;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Repositorio.ConsultasEF;
using Molinos.Scato.Servicios.Conversiones;
using Newtonsoft.Json;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Molinos.Scato.Servicios.Impl
{
    public class ServicioVapor : IServicioVapor
    {
        private readonly IRepositorio repositorio;
        private readonly IConversor conversor;
        private readonly ILogger log;
        private readonly IServicioComandos servicioComandos;
        private readonly IServicioRepositorio servicioRepositorio;

        public ServicioVapor(IRepositorio repositorio, IConversor conversor, ILogger log, IServicioComandos servicioComandos, IServicioRepositorio servicioRepositorio)
        {
            this.repositorio = repositorio;
            this.conversor = conversor;
            this.log = log;
            this.servicioComandos = servicioComandos;
            this.servicioRepositorio = servicioRepositorio;
        }

        public ListaPaginada<VaporInformacionDto> ListarVaporInformacion(Paginacion paginacion, string buque = null, string imo = null, List<string> tipoBuque = null, string bandera = null)
        {
            return repositorio.ListarConsultaPaginada(new ListarVaporInformacionConsulta(paginacion, buque, imo, tipoBuque, bandera));

        }


        public void GuardarVaporInformacion(VaporInformacionDto VaporInformacionDto)
        {
            var crearBuque = new CrearBuque() { VaporInformacion = VaporInformacionDto };
            servicioComandos.Ejecutar(crearBuque);
        }

        public List<VaporInformacionDto> DevolverHistoricoVapor(int id)
        {
            var log = servicioRepositorio.ObtenerInformacionLog(id);
            var vapores = TransformarVaporJsonToDto(log);
            return vapores;
        }

        public List<VaporInformacionDto> TransformarVaporJsonToDto(List<LogABM> log)
        {
            var vapores = new List<VaporInformacionDto>();
            if (log != null && log.Count > 0)
            {
                foreach (var item in log)
                {
                    var vapor = JsonConvert.DeserializeObject<VaporInformacionDto>(item.Entidad);
                    vapor.Usuario = item.Usuario;
                    vapor.FechaModificacion = item.Fecha;
                    vapores.Add(vapor);
                }
            }
            return vapores;
        }

        public string ValidarBuque(string bandera, string nombreBuque, string IMO, int? id)
        {
          
            if (repositorio.Existe<VaporInformacion>(x=> x.Vapor.Id != id && x.Vapor.Nombre.ToUpper() == nombreBuque.ToUpper()))
            {
                return "El buque ingresado ya existe. Por favor verifique que los datos del buque sean correctos";
            }
            if (repositorio.Existe<VaporInformacion>(x => x.Vapor.Id != id && x.ImoVapor == IMO))
            {
                return "El IMO ingresado ya existe. Por favor verifique que los datos del buque sean correctos";
            }


            return "";
        }


        #region Metodos Utiles
        private IList<TDto> Listar<TEntidad, TDto>() where TEntidad : class
        {
            return conversor.ConvertirList<TEntidad, TDto>(repositorio.Listar<TEntidad>());
        }
        private IList<TDto> Listar<TEntidad, TDto>(Expression<Func<TEntidad, bool>> expresionFiltro) where TEntidad : class
        {
            return conversor.ConvertirList<TEntidad, TDto>(repositorio.Listar(expresionFiltro));
        }
        private TDto Obtener<TEntidad, TDto>(int id) where TEntidad : class
        {
            return conversor.Convertir<TEntidad, TDto>(repositorio.Obtener<TEntidad>(id));
        }
        private TDto Obtener<TEntidad, TDto>(Expression<Func<TEntidad, bool>> expresionFiltro) where TEntidad : class
        {
            return conversor.Convertir<TEntidad, TDto>(repositorio.Obtener(expresionFiltro));
        }
        #endregion

        #region Eliminar Buque
        public void DeshabilitarVapor(VaporDto vapor)
        {
            if (ExisteNominacionActivaBuque(vapor))
                throw new Exception("No se puede eliminar el buque debido a que él mismo esta siendo utilizado" +
                    " en una nominación activa.");

            if (ExisteBuqueEnLineUp(vapor))
                throw new Exception("No se puede eliminar el buque debido a que él mismo se encuentra actualmente en LineUp");
            try
            {
                vapor.Habilitado = false;
                var modificarVapor = new ModificarVapor() { Dto = vapor };
                servicioComandos.Ejecutar(modificarVapor);
                RegistrarAuditoriaEliminacion(vapor);
            }
            catch (Exception e)
            {
                log.Error(e, $"Hubo un error al intentar eliminar buque con id: {vapor.Id}");
                throw e;
            }
        }

        private bool ExisteNominacionActivaBuque(VaporDto vapor)
        {
            var existeNominacion = (from n in repositorio.Listar<Nominacion>()
                                    where !n.FechaEliminacion.HasValue && !n.FechaEnvioLineUp.HasValue &&
                                    n.NominacionDatoTecnico.VaporInformacion.Vapor.Id == vapor.Id
                                    select (n)).Any();
            return existeNominacion;
        }

        private bool ExisteBuqueEnLineUp(VaporDto vapor)
        {
            var existeEnLineUp = (from e in repositorio.Listar<Embarque>()
                                  join l in repositorio.Listar<LineUp>() on e.Id equals l.Embarque?.Id
                                  where e.Ubicacion != 1 && l.ModuloDeCarga != null && l.ModuloDeCarga.Id > 0
                                  && e.Vapor.Id == vapor.Id
                                  select (e)).Any();
            return existeEnLineUp;
        }

        private void RegistrarAuditoriaEliminacion(VaporDto vapor)
        {
            var auditoria = new Auditoria
            {
                Entidad_Id = vapor.Id,
                EntidadNombre = "Vapor",
                UsuarioEjecuta = vapor.Usuario,
                ValorAnterior = "1",
                ValorNuevo = "0",
                Propiedad = "Habilitado",
                FechaModificacion = DateTime.Now,
                Accion = "Deshabilita buque."
            };

            this.repositorio.Agregar(auditoria);
            this.repositorio.GuardarCambios();
        }

        #endregion

    }
}