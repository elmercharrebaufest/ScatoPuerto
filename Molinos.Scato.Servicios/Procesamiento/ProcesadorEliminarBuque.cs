using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Molinos.Scato.Servicios.ServiciosSap;
using Molinos.Scato.Utils;
using Ninject.Extensions.Logging;
using System;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorEliminarBuque : ProcesadorComando<EliminarBuque>
    {
        private readonly ZSDWS_SCATO servicioSap;

        public ProcesadorEliminarBuque(IRepositorio repositorio, IConversor conversor, ILogger log, ZSDWS_SCATO servicioSap)
            : base(repositorio, conversor, log)
        {
            this.servicioSap = servicioSap;
        }

        public override Resultado Ejecutar(EliminarBuque comando)
        {
            var resultado = new Resultado();
            try
            {
                var vapor = Repositorio.Obtener<Vapor>(v => v.Id == comando.Id);
                vapor.Habilitado = false;
                var vaporInformacion = Repositorio.Obtener<VaporInformacion>(v => v.Vapor.Id == comando.Id);
                if (vaporInformacion != null)
                {
                    vaporInformacion.EnSap = false;
                    EnviarBajaASap(vaporInformacion, comando.UsuarioEjecuta);
                }
                var vaporDto = Conversor.Convertir<Vapor, VaporDto>(vapor);
                AgregarLogBaja(comando, vaporDto);
                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {
                resultado.Error("", ex.Message);
                Log.Error($"Error al intentar deshabilitar Buque id: {comando.Id}", ex);
                throw ex;
            }
            return resultado;
        }

        private void EnviarBajaASap(VaporInformacion vaporInformacion, string usuario)
        {
            var tipoCarga = vaporInformacion.TipoBuque == "Bulk Carrier" ? "S" : vaporInformacion.TipoBuque == "Oil Tanker" ? "L" : string.Empty;

            var eslora = TruncarDosDecimales(vaporInformacion.Eslora);
            var manga = TruncarDosDecimales(vaporInformacion.Manga);
            var puntal = TruncarDosDecimales(vaporInformacion.Puntual);
            var porteBruto = TruncarDosDecimales(vaporInformacion.PorteBruto);
            var porteNeto = TruncarDosDecimales(vaporInformacion.PorteNeto);

            var requestSap = new Z_SDMF_RFC_ABM_BUQUERequest
            {
                Z_SDMF_RFC_ABM_BUQUE = new Z_SDMF_RFC_ABM_BUQUE
                {
                    IM_FLAG = "B",
                    IM_IMO = vaporInformacion.ImoVapor,
                    IM_DESCR = (vaporInformacion.NombreBuque ?? string.Empty).Length > 40 ? vaporInformacion.NombreBuque.Substring(0, 40) : vaporInformacion.NombreBuque,
                    IM_CARACT = string.Empty,
                    IM_ESLORA = eslora,
                    IM_ESLORASpecified = eslora > 0,
                    IM_MANGA = manga,
                    IM_MANGASpecified = manga > 0,
                    IM_PUNTAL = puntal,
                    IM_PUNTALSpecified = puntal > 0,
                    IM_PAISPROC = vaporInformacion.Bandera != null ? vaporInformacion.Bandera.Abreviatura : string.Empty,
                    IM_PORTEBRUTO = porteBruto,
                    IM_PORTEBRUTOSpecified = porteBruto > 0,
                    IM_PORTENETO = porteNeto,
                    IM_PORTENETOSpecified = porteNeto > 0,
                    IM_TIPOCARGA = tipoCarga,
                    IM_BODEGAS = vaporInformacion.CantidadBodegasTks,
                    IM_BODEGASSpecified = vaporInformacion.CantidadBodegasTks > 0,
                    IM_FECHA = DateTime.Now.ToString("yyyy-MM-dd")
                }
            };
            var transaccion = new TransaccionesSAP
            {
                Entidad = "VaporInformacion",
                Entidad_Id = vaporInformacion.Id,
                Operacion = "B",
                PayloadXML = XmlConverter<Z_SDMF_RFC_ABM_BUQUERequest>.Serialize(requestSap),
                Estado = "Pendiente",
                Reintento = 0,
                FechaCreacion = DateTime.Now,
                Usuario = usuario
            };

            Repositorio.Agregar(transaccion);

            try
            {
                var response = servicioSap.Z_SDMF_RFC_ABM_BUQUE(requestSap);
                var responseXml = XmlConverter<Z_SDMF_RFC_ABM_BUQUEResponse1>.Serialize(response);
                transaccion.Estado = response.Z_SDMF_RFC_ABM_BUQUEResponse.EX_RESPONSE == "OK" ? "Enviado" : "Error";
                transaccion.ResponseSAP = responseXml;
            }
            catch (Exception ex)
            {
                transaccion.Estado = "Error";
                transaccion.ResponseSAP = "<Error><Exception>" + ex.Message + "</Exception></Error>";
            }
        }

        private decimal TruncarDosDecimales(decimal valor)
        {
            return Math.Truncate(valor * 100m) / 100m;
        }

        private void AgregarLogBaja(EliminarBuque comando, VaporDto vapor)
        {
            var logBaja = new LogABM
            {
                Pantalla = comando.GetType().Name,
                Usuario = comando.UsuarioEjecuta,
                Fecha = DateTime.Now,
                Evento = EventoABM.Baja,
                Entidad = vapor.ToJson(),
                ClaseId = vapor.Id
            };
            Repositorio.Agregar(logBaja);
        }
    }
}