using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Dto.AfipPuerto;
using Molinos.Scato.Dominio.Entidades;
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
    public class ProcesadorAfipRegistrarCoem : ProcesadorComando<AfipRegistrarCoem>
    {
        public ProcesadorAfipRegistrarCoem(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

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
                    var estadoCaratula = Repositorio.Obtener<AfipCaratulaEstado>(x => x.Estado.Contains("Enviado"));
                    if (estadoCaratula == null)
                    {
                        throw new Exception("No se encuentra el estado de caratula \"Enviado\" en la Base de datos");
                    }
                    var estado = Repositorio.Obtener<AfipCoemEstado>(x => x.Codigo == "PRE");
                    var guid = Guid.NewGuid().ToString("N");
                    var contenedoresConCarga = coem.ContenedoresConCarga.Select(x => Conversor.Convertir<AfipCoemContenedorConCargaDto, AfipCoemContenedorConCarga>(x)).ToList();
                    var contenedoresVacios = coem.ContenedoresVacios.Select(x => Conversor.Convertir<AfipCoemContenedorVacioDto, AfipCoemContenedorVacio>(x)).ToList();
                    var mercaderiasSueltas = coem.MercaderiasSueltas.Select(x => Conversor.Convertir<AfipCoemMercaderiaSueltaDto, AfipCoemMercaderiaSuelta>(x)).ToList();
                    var coemDb = new AfipCoem
                    {
                        AfipCaratula = caratula,
                        IdentificadorCOEM = guid.Substring(guid.Length - 16),
                        IdentificadorCaratula = coem.IdentificadorCaratula,
                        ContenedoresConCarga = contenedoresConCarga,
                        ContenedoresVacios = contenedoresVacios,
                        MercaderiasSueltas = mercaderiasSueltas,
                        AfipCoemEstado = estado,
                        FechaRegistro = DateTime.Now
                    };
                    Repositorio.Agregar(coemDb);
                }
                else // Rectificación
                {
                    var contenedoresConCarga = Repositorio.Listar<AfipCoemContenedorConCarga>(x => x.AfipCoem.Id == coem.Id);
                    foreach (var contenedor in contenedoresConCarga) Repositorio.Remover(contenedor);
                    var contenedoresVacios = Repositorio.Listar<AfipCoemContenedorVacio>(x => x.AfipCoem.Id == coem.Id);
                    foreach (var contenedor in contenedoresVacios) Repositorio.Remover(contenedor);
                    var mercaderiasSueltas = Repositorio.Listar<AfipCoemMercaderiaSuelta>(x => x.AfipCoem.Id == coem.Id);
                    foreach (var mercaderia in mercaderiasSueltas) Repositorio.Remover(mercaderia);

                    var coemDb = Repositorio.Obtener<AfipCoem>(coem.Id);
                    if (coemDb == null)
                    {
                        throw new Exception("No existe la COEM con el id especificado");
                    }

                    foreach (var contenedorConCarga in coem.ContenedoresConCarga)
                    {
                        var contenedorConCargaDb = this.Conversor.Convertir<AfipCoemContenedorConCargaDto, AfipCoemContenedorConCarga>(contenedorConCarga);
                        coemDb.ContenedoresConCarga.Add(contenedorConCargaDb);
                    }
                    foreach (var contenedorVacio in coem.ContenedoresVacios)
                    {
                        var contenedorVacioDb = this.Conversor.Convertir<AfipCoemContenedorVacioDto, AfipCoemContenedorVacio>(contenedorVacio);
                        coemDb.ContenedoresVacios.Add(contenedorVacioDb);
                    }
                    foreach (var mercaderiaSuelta in coem.MercaderiasSueltas)
                    {
                        var mercaderiaSueltaDb = this.Conversor.Convertir<AfipCoemMercaderiaSueltaDto, AfipCoemMercaderiaSuelta>(mercaderiaSuelta);
                        coemDb.MercaderiasSueltas.Add(mercaderiaSueltaDb);
                    }
                }
                Repositorio.GuardarCambios();
            }
            catch (Exception e)
            {
                Log.Error("Error al registrar Coem {0}", e.StackTrace);
                throw e;
            }
            return resultado;
        }
    }
}
