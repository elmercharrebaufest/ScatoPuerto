using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorArmarCuerpoMailDocumentos : ProcesadorComando<ArmarCuerpoMailDocumentos>
    {
        public ProcesadorArmarCuerpoMailDocumentos(IRepositorio repositorio, IConversor conversor, ILogger log) : base(repositorio, conversor, log) { }

        public override Resultado Ejecutar(ArmarCuerpoMailDocumentos comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var documentosFiltrados = this.Repositorio.Incluir<NominacionDocumento>()
                .Where(nd => nd.Documento.DocumentoTipo.Nombre == "A solicitar en la nominación" && nd.NominacionDocumentoEstado.Estado != "Documento Cerrado")
                .Select(nd => new
                {
                    nd.ConfiguracionDocumento.Nominacion,
                    ConfiguracionDocumento = nd.ConfiguracionDocumento,
                    NominacionDocumento = nd
                })
                .ToList();

                var cantidadComentarios = int.Parse(ConfigurationManager.AppSettings["CantComentsMailDocumentacion"]);

                var nominacionesFiltradas = documentosFiltrados.GroupBy(x => x.Nominacion)
                    .Select(g => new Nominacion
                    {
                        Id = g.Key.Id,
                        FechaCreacion = g.Key.FechaCreacion,
                        NominacionDatoTecnico = g.Key.NominacionDatoTecnico,
                        ConfiguracionDocumentos = g.GroupBy(x => x.ConfiguracionDocumento)
                            .Select(cg => new ConfiguracionDocumento
                            {
                                Id = cg.Key.Id,
                                CoordinadorPuerto = cg.Key.CoordinadorPuerto,
                                Destino = cg.Key.Destino,
                                CantidadDeJuegos = cg.Key.CantidadDeJuegos,
                                NominacionDocumentos = cg.Select(x => new NominacionDocumento
                                {
                                    Id = x.NominacionDocumento.Id,
                                    Documento = x.NominacionDocumento.Documento,
                                    NominacionDocumentoEstado = x.NominacionDocumento.NominacionDocumentoEstado,
                                    Comentarios = x.NominacionDocumento.Comentarios.OrderByDescending(c => c.Fecha).Take(3).ToList()
                                }).ToList()
                            }).ToList()
                    }).ToList();

                string cuerpoMail;

                if (nominacionesFiltradas.Count() > 0)
                {
                    cuerpoMail = this.GenerarCuerpoMailDocumentacionPendiente(nominacionesFiltradas);
                }
                else
                {
                    cuerpoMail = "No hay documentación pendiente";
                }

                resultado.Mensaje = cuerpoMail;
            }
            catch (Exception e)
            {
                resultado.Error("", e.Message);
                Log.Error("Error al armar el cuerpo del mail de documentos {0}", e);
            }
            return resultado;
        }

        private string GenerarCuerpoMailDocumentacionPendiente(IList<Nominacion> nominaciones)
        {
            var cuerpoCorreo = new StringBuilder();
            cuerpoCorreo.AppendLine("<ul>");

            foreach (var nominacion in nominaciones)
            {
                var vaporNombre = nominacion.NominacionDatoTecnico.VaporInformacion.NombreBuque;
                var fechaNominacion = nominacion.NominacionDatoTecnico.ETARecalada?.ToString("dd-MM-yyyy") ?? "N/A";
                var producto = nominacion.NominacionDatoTecnico.MaterialPuerto.Descripcion;

                cuerpoCorreo.AppendLine($"<li>Buque {vaporNombre} / Fecha de nominación: {fechaNominacion} / Producto: {producto}");
                cuerpoCorreo.AppendLine("<ul>");

                var configuraciones = nominacion.ConfiguracionDocumentos.Where(cd => cd.NominacionDocumentos.Any(nd => nd.NominacionDocumentoEstado.Estado != "Documento Cerrado"));

                foreach (var configDoc in configuraciones)
                {
                    var destinoNombre = configDoc.Destino.Nombre;
                    var clienteNombre = configDoc.CoordinadorPuerto.Nombre;
                    var cantidadDeJuegos = configDoc.CantidadDeJuegos;

                    cuerpoCorreo.AppendLine($"<li>Destino: {destinoNombre} / Cliente: {clienteNombre} / Cant. de juegos {cantidadDeJuegos}");
                    cuerpoCorreo.AppendLine("<ul>");

                    var documentos = configDoc.NominacionDocumentos.Where(nd => nd.NominacionDocumentoEstado.Estado != "Documento Cerrado");

                    foreach (var nomDoc in documentos)
                    {
                        var docNombre = nomDoc.Documento.Nombre;
                        var estado = nomDoc.NominacionDocumentoEstado.Estado;

                        var comentarios = "N/A";
                        if (nomDoc.Comentarios.Count > 0)
                        {
                            comentarios = string.Join(" | ", nomDoc.Comentarios.Select(c =>
                            c.Fecha.Date == DateTime.Today
                            ? $"<b>{c.Fecha:dd-MM-yyyy} - {c.Usuario}: {c.Comentario}</b>"
                            : $"{c.Fecha:dd-MM-yyyy} - {c.Usuario}: {c.Comentario}"));
                        }

                        cuerpoCorreo.AppendLine($"<li>{docNombre} / Estado: \"{estado}\" / Comentarios: {comentarios}</li>");
                    }

                    cuerpoCorreo.AppendLine("</ul></li>");
                }

                cuerpoCorreo.AppendLine("</ul></li>");
            }

            cuerpoCorreo.AppendLine("</ul>");
            return cuerpoCorreo.ToString();
        }
    }
}
