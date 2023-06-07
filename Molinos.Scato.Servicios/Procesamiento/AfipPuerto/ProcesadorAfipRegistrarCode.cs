using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorAfipRegistrarCode : ProcesadorComando<AfipRegistrarCode>
    {
        public ProcesadorAfipRegistrarCode(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(AfipRegistrarCode comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var codeDto = comando.Dto;
                if (Repositorio.Obtener<AfipCode>(x => x.AfipCaratula.IdentificadorCaratula == codeDto.IdentificadorCaratula) != null)
                {
                    throw new Exception("Ya se registró una CODE para la carátula especificada");
                }
                var caratula = Repositorio.Obtener<AfipCaratula>(x => x.IdentificadorCaratula == codeDto.IdentificadorCaratula);
                if (caratula == null)
                {
                    throw new Exception("No se encontró la carátula especificada");
                }
                var identificadoresCoem = codeDto.IdentificadoresCOEM.Select(x => x.Identificador);
                var afipCoems = Repositorio.Listar<AfipCoem>(x => identificadoresCoem.Contains(x.IdentificadorCOEM));
                if (afipCoems.Count == 0)
                {
                    throw new Exception("No se han conseguido las COEMs especificadas");
                }
                var coems = afipCoems.Select(x => new AfipCodeCoem { AfipCoem = x }).ToList();
                var code = new AfipCode()
                {
                    AfipCaratula = caratula,
                    IdentificadorCaratula = caratula.IdentificadorCaratula,
                    NumeroViaje = codeDto.NumeroViaje,
                    IdentificadoresCOEM = coems
                };
                Repositorio.Agregar(code);
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                resultado.Error("", Textos.Error_ActualizarGenerico);
                Log.Error("Error al registrar caratula {0}", e.StackTrace);
                throw e;
            }
            return resultado;
        }
    }
}
