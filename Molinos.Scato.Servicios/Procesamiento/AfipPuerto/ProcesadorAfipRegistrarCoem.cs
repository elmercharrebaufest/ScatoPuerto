using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.Enumeradores;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorAfipRegistrarCoem : ProcesadorComando<AfipRegistrarCoem>
    {
        private IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper;
        public ProcesadorAfipRegistrarCoem(IRepositorio repositorio, IConversor conversor, ILogger log, IComunicacionEmbarqueServicioHelper comunicacionEmbarqueServicioHelper) : base(repositorio, conversor, log) 
        {
            this.comunicacionEmbarqueServicioHelper = comunicacionEmbarqueServicioHelper;    
        }

        public override Resultado Ejecutar(AfipRegistrarCoem comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var coem = comando.Dto;
                if (coem.Id == 0) // Registro
                {
                    var caratula = Repositorio.Obtener<AfipCaratula>(x => x.IdentificadorCaratula == coem.IdentificadorCaratula);
                    if (caratula == null)
                    {
                        throw new Exception("No existe la caratula a cual asociar la COEM");
                    }

                    var res = this.comunicacionEmbarqueServicioHelper.RegistrarCOEM(coem);
                    var cuerpoRespuesta = res.Body.RegistrarCOEMResult.ListaErrores[0];

                    if (cuerpoRespuesta.Codigo != 0)
                    {
                        throw new Exception(String.Format("Ocurrió un error al registrar la COEM: {0} {1}", cuerpoRespuesta.Descripcion, cuerpoRespuesta.DescripcionAdicional));
                    }
                    var coemId = cuerpoRespuesta.DescripcionAdicional;
                    //var coemId = Guid.NewGuid().ToString().Substring(0, 10);

                    var contenedoresConCarga = coem.ContenedoresConCarga.Select(x => Conversor.Convertir<AfipCoemContenedorConCargaDto, AfipCoemContenedorConCarga>(x)).ToList();
                    var contenedoresVacios = coem.ContenedoresVacios.Select(x => Conversor.Convertir<AfipCoemContenedorVacioDto, AfipCoemContenedorVacio>(x)).ToList();
                    var mercaderiasSueltas = coem.MercaderiasSueltas.Select(x => Conversor.Convertir<AfipCoemMercaderiaSueltaDto, AfipCoemMercaderiaSuelta>(x)).ToList();
                    
                    caratula.Estado = EstadosCaratulaAFIP.Enviado;
                    var estado = Repositorio.Obtener<AfipCoemEstado>(x => x.Codigo == "PRE");
                    var coemDb = new AfipCoem
                    {
                        AfipCaratula = caratula,
                        IdentificadorCOEM = coemId,
                        IdentificadorCaratula = coem.IdentificadorCaratula,
                        ContenedoresConCarga = contenedoresConCarga,
                        ContenedoresVacios = contenedoresVacios,
                        MercaderiasSueltas = mercaderiasSueltas,
                        AfipCoemEstado = estado,
                        FechaRegistro = DateTime.Now
                    };
                    Repositorio.Agregar(coemDb);
                }
             
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al registrar Coem {0}", e.Message);                
            }
            return resultado;
        }
    }
}
