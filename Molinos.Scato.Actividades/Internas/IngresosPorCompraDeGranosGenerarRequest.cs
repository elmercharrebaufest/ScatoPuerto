using System;
using System.Activities;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Dto;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Helpers;
using Molinos.Scato.Servicios;
using Molinos.Scato.Servicios.ServiciosSap;

namespace Molinos.Scato.Actividades.Internas
{
    public class IngresosPorCompraDeGranosGenerarRequest : CodeActivity
    {
        [RequiredArgument]
        public InArgument<CartaPorteDto> CartaPorte { get; set; }
        [RequiredArgument]
        public InArgument<CaladoDto> Calado { get; set; }
        [RequiredArgument]
        public InArgument<VehiculoDto> Vehiculo { get; set; }
        [RequiredArgument]
        public InArgument<DateTime> FechaEgreso { get; set; }
        [RequiredArgument]
        public InArgument<int> PesoTara { get; set; }
        [RequiredArgument]
        public InArgument<int> PesoBruto { get; set; }
        [RequiredArgument]
        public InArgument<int> PesoNeto { get; set; }
        [RequiredArgument]
        public InArgument<DateTime> FechaPesoTara { get; set; }
        [RequiredArgument]
        public InArgument<DateTime> FechaPesoBruto { get; set; }
        [RequiredArgument]
        public InArgument<DateTime> FechaPesoNeto { get; set; }
        [RequiredArgument]
        public InArgument<int> CamaraId { get; set; }
        [RequiredArgument]
        public InArgument<bool> CamionRechazado { get; set; }
        [RequiredArgument]
        public InArgument<int> CentroId { get; set; }
        [RequiredArgument]
        public InArgument<Guid> InstanceId { get; set; }
        public OutArgument<Resultado> ResultadoRequest { get; set; }
        public OutArgument<Fill_Z1000Request> Request { get; set; }
        public OutArgument<Resultado> Resultado { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var resultado = new Resultado();
            Fill_Z1000Request request = null;
            try
            {
                var srvRepositorio = context.GetExtension<IServicioRepositorio>();
                var servicioComandos = context.GetExtension<IServicioComandos>();
                var cartaPorte = CartaPorte.Get<CartaPorteDto>(context);
                var calado = Calado.Get<CaladoDto>(context);
                var fechaEgreso = FechaEgreso.Get<DateTime>(context);
                var pesoTara = PesoTara.Get<int>(context);
                var vehiculo = Vehiculo.Get<VehiculoDto>(context);
                var pesoBruto = PesoBruto.Get<int>(context);
                var pesoNeto = PesoNeto.Get<int>(context);
                var fechaPesoNeto = FechaPesoNeto.Get<DateTime>(context);
                var fechaPesoBruto = FechaPesoBruto.Get<DateTime>(context);
                var fechaPesoTara = FechaPesoTara.Get<DateTime>(context);
                var camionRechazado = CamionRechazado.Get<bool>(context);
                var centro = srvRepositorio.ObtenerCentro(CentroId.Get<int>(context));
                var instanceId = InstanceId.Get<Guid>(context);

                var camaraExcepcion = srvRepositorio.ObtenerCamaraDeExcepcionDescuento(instanceId, cartaPorte.MaterialId, centro.Id);
                var camara = camaraExcepcion ?? srvRepositorio.ObtenerCamara(CamaraId.Get<int>(context));

                var asignacion = srvRepositorio.ObtenerAsignacionDePuestoComando(instanceId.ToString("D"));
                var balanza = srvRepositorio.ObtenerBalanza(asignacion.BalanzaTaraId ?? 0);
                AlmacenDto almacen = null;
                if (ConfigurationManager.AppSettings["SepararAlmacenSustentable"].ToLower() == "false" && srvRepositorio.EsRecorridoSustentable(instanceId))
                {
                    almacen = srvRepositorio.ListarAlmacenesPorCentroYesSustentable(centro.Id, true).FirstOrDefault();
                }
                if (almacen == null)
                {
                    almacen = srvRepositorio.ObtenerAlmacen(asignacion.AlmacenId);
                }

                calado = srvRepositorio.ObtenerCaladoPorGuid(instanceId);
                var carAnalizadas = srvRepositorio.ObtenerAnalisisDeCalidadPorCaladoId(calado.Id);
                var material = srvRepositorio.ObtenerMaterialPorCentro(centro.Id, cartaPorte.MaterialId);
                var caracteristicasDeCAlidad = srvRepositorio.ListarCaracteristicasDeCalidadPorMaterial(cartaPorte.MaterialId,centro.Id);
                var kilosNetosDescontados = pesoNeto - srvRepositorio.TotalKilosDescuentos(calado, carAnalizadas, pesoNeto);
                var random = srvRepositorio.ObtenerNumeroAleatorio();

                var firmasCuit = srvRepositorio.ListarCuitfirmas();

                var tieneAnalisisInterno = random < (material.AnalisisInterno ?? 0);
                var muestraEnvioACamara = srvRepositorio.ObtenerUltimaMuestraEnvioACamaraPorCaladoId(calado.Id);
                var chofer = cartaPorte.Chofer.Apellido + " " + cartaPorte.Chofer.Nombre;

                if (muestraEnvioACamara != null)
                {
                    muestraEnvioACamara.TieneAnalisisInterno = tieneAnalisisInterno;
                    servicioComandos.Ejecutar(new ModificarEnvioACamara() { Dto = muestraEnvioACamara });
                }
                
                var destinatarioCTG = srvRepositorio.ObtenerDestinatarioCTGporGuid(instanceId);
                var data = new Fill_Z1000
                    {
                        RecepcionesYDespachos = new[]
                            {
                                new ZMPES0010
                                    {
                                        ACOPLADO = vehiculo.PatenteAcoplado,
                                        AGENTE_DE_COMPRA = PadProveedor(cartaPorte.AgenteComprasCodigoSap),
                                        SECUENCIA = vehiculo.NumeroVehiculo.ToString(CultureInfo.InvariantCulture),
                                        ALMACEN = almacen != null ? almacen.CodigoSAP.Substring(Math.Max(0, almacen.CodigoSAP.Length - 4)) : null,
                                        APARCERIA = cartaPorte.Aparceria ? "S" : "N",
                                        BALANZA = balanza.CodigoCabezal.Substring(Math.Max(0, balanza.CodigoCabezal.Length - 4)),
                                        BRUTO = pesoBruto.ToString(CultureInfo.InvariantCulture),
                                        BRUTO_ORIGEN = vehiculo.PesoBrutoOrigen.ToString(),
                                        CAMARA_A_PRESENT = camara != null ? camara.CodigoSAP : null,
                                        CARATULA = cartaPorte.Caratula != null ? cartaPorte.Caratula.ToString() : null,
                                        CARGADOR = PadProveedor(cartaPorte.TitularCartaPorteCodigoSap),
                                        CCPP_REF = "",
                                        ANALISIS_INT = tieneAnalisisInterno ? "S" : "N",
                                        CENTRO = centro.CodigoSAP.Substring(Math.Max(0, centro.CodigoSAP.Length - 4)),
                                        CHOFER = chofer.Length > 20 ? chofer.Substring(0,20) : chofer,
                                        CONTRATO = cartaPorte.AcuerdoMarco,
                                        DESTINO = cartaPorte.DestinoCodigoSap.Substring(Math.Max(0, cartaPorte.DestinoCodigoSap.Length - 4)),
                                        ENTRADA_O_SALIDA = cartaPorte.TipoComercialSentido,
                                        ESTADO = camionRechazado ? "R" : "A",
                                        FECHA_ALTA = cartaPorte.FechaEmision.ToString("yyyyMMdd", CultureInfo.InvariantCulture),
                                        FECHA_BRUTO = fechaPesoBruto.ToString("yyyyMMdd", CultureInfo.InvariantCulture),
                                        FECHA_CALADO = calado.FechaCreacion.Value.ToString("yyyyMMdd", CultureInfo.InvariantCulture),
                                        FECHA_EGRESO = fechaEgreso.ToString("yyyyMMdd", CultureInfo.InvariantCulture),
                                        FECHA_INGRESO = cartaPorte.FechaEmision.ToString("yyyyMMdd", CultureInfo.InvariantCulture),
                                        FECHA_NETO = fechaPesoNeto.ToString("yyyyMMdd", CultureInfo.InvariantCulture),
                                        FECHA_TARA = fechaPesoTara.ToString("yyyyMMdd", CultureInfo.InvariantCulture),
                                        KM_RECOR = cartaPorte.KmRecorrer.HasValue ? cartaPorte.KmRecorrer.Value.ToString("0") : null,
                                        MATERIAL = cartaPorte.MaterialCodigoSap,
                                        MUESTRA_CONJUNTO = calado.MuestraConjunto.HasValue ? calado.MuestraConjunto.ToString() : null,
                                        NETO = pesoNeto.ToString(CultureInfo.InvariantCulture),
                                        NETO_ORIGEN = vehiculo.PesoNetoOrigen.ToString(),
                                        NRODOCHOFER = cartaPorte.Chofer.NumeroDeDocumento.ToString(CultureInfo.InvariantCulture),
                                        NUMCARPOR = cartaPorte.NroCartaPorte,
                                        PATENTE = vehiculo.Patente,
                                        PESADA = balanza.Modalidad == Modalidad.Automática ? "A" : "M",
                                        PRESTADOR = PadProveedor(cartaPorte.PrestadorCodigoSap),
                                        PROVEEDOR = PadProveedor(cartaPorte.TitularCartaPorteCodigoSap),
                                        PROCEDENCIA = cartaPorte.ProcedenciaCodigoSap,
                                        PROV_PROC = cartaPorte.ProvinciaCodigoSap,
                                        REMITENTE_COM = PadProveedor(cartaPorte.RtteComercialCodigoSap),
                                        TARA = pesoTara.ToString(CultureInfo.InvariantCulture),
                                        TARA_ORIGEN = vehiculo.PesoTaraOrigen.ToString(),
                                        TIPODOCHOFER = cartaPorte.Chofer.TipoDocumentoIdentidadCodigoSap,
                                        TIPO_COMERCIAL = cartaPorte.TipoComercialCodigoSap,
                                        TIP_VEHI = cartaPorte.TipoVehiculo == TipoVehiculo.Tren ? "T" : "C",
                                        TRANSPORTISTA = cartaPorte.TransportistaCUIT.Replace("-", ""),
                                        VARIEDAD = cartaPorte.Variedad,
                                        CORREDOR = PadProveedor(cartaPorte.CorredorCodigoSap),
                                        NETO_DESCONTADO = ((int)decimal.Round(kilosNetosDescontados)).ToString(CultureInfo.InvariantCulture),
                                        CUENTAORDEN = firmasCuit.Any(x => x == cartaPorte.DestinatarioCuil) ? PadProveedor(cartaPorte.RtteComercialCodigoSap) : PadProveedor(cartaPorte.DestinatarioCodigoSap),
                                        HORA_BRUTO = fechaPesoBruto.ToString("HHmmss", CultureInfo.InvariantCulture),
                                        HORA_CALADO = calado.FechaCreacion.Value.ToString("HHmmss", CultureInfo.InvariantCulture),
                                        HORA_EGRESO = fechaEgreso.ToString("HHmmss", CultureInfo.InvariantCulture),
                                        HORA_INGRESO = cartaPorte.FechaEmision.ToString("HHmmss", CultureInfo.InvariantCulture),
                                        HORA_NETO = fechaPesoNeto.ToString("HHmmss", CultureInfo.InvariantCulture),
                                        HORA_TARA = fechaPesoTara.ToString("HHmmss", CultureInfo.InvariantCulture),
                                        COSECHA = cartaPorte.Cosecha,
                                        ESTABLECIMIENTO = cartaPorte.CodEstab,
                                        CTG = cartaPorte.CTG,
                                        FECHA_CTG = fechaEgreso.ToString("yyyyMMdd", CultureInfo.InvariantCulture),
                                        CUIT_DESTINATARI = cartaPorte.DestinatarioCuil != null ? cartaPorte.DestinatarioCuil.Replace("-", "") : "",
                                        INTER_FLETE = cartaPorte.IntermediarioFleteCodigoSap,
                                        CLASIFICACION = cartaPorte.TipoCategoria ,
                                        CALIDAD_ESPECIAL = cartaPorte.TrigoEspecial ? "X" : string.Empty,                                        
                                    }
                            },
                        CuentaYOrden = new[]
                            {
                                new ZMPES0180
                                    {
                                        SECUENCIA = vehiculo.NumeroVehiculo.ToString(CultureInfo.InvariantCulture),
                                        ENTRADA_O_SALIDA = cartaPorte.TipoComercialSentido,
                                        NUMCARPOR = cartaPorte.NroCartaPorte,
                                        CUENTA_ORDEN = PadProveedor(cartaPorte.IntermediarioCodigoSap)
                                    }
                            }
                        
                    };
       
                var lista = new List<ZMPES0020>();

                foreach (var cal in calado.CaladosPorCaracteristica.Where(x => x.EnviaASap).ToList())
                {
                    lista.Add(new ZMPES0020
                        {
                            CARACTERISTICA = cal.CaracteristicaCodigoSap,
                            DESCKILOS = cal.DescuentoEnKg.ToString(CultureInfo.InvariantCulture),
                            DESCPORC = cal.DescuentoEnPorcentaje.ToString(CultureInfo.InvariantCulture),
                            ENTRADA_O_SALIDA = cartaPorte.TipoComercialSentido,
                            NUMCARPOR = cartaPorte.NroCartaPorte,
                            SECUENCIA = vehiculo.NumeroVehiculo.ToString(CultureInfo.InvariantCulture),
                            TIPO_MUEST = cal.TipoDeAnalisis == TipoAnalisis.Calado ? "C" : "I",
                            RESULTADO = cal.ValorCalado.HasValue ? cal.ValorCalado.Value.ToString(CultureInfo.InvariantCulture) : null
                        });
                }
                
                if (carAnalizadas != null)
                {
                    foreach (var ana in carAnalizadas.CaracteristicasAnalizadas.Where(x => x.EnviaASap).ToList())
                    {
                        if (lista.Exists(f => f.CARACTERISTICA == ana.CaracteristicaCodigoSap))
                        {
                            if (ana.ValorAnalisis.HasValue)
                            {
                                var caracteristica = lista.Find(f => f.CARACTERISTICA == ana.CaracteristicaCodigoSap);
                                caracteristica.DESCKILOS = ana.DescuentoEnKg.ToString(CultureInfo.InvariantCulture);
                                caracteristica.DESCPORC = ana.DescuentoEnPorcentaje.ToString(CultureInfo.InvariantCulture);
                                caracteristica.TIPO_MUEST = ana.TipoDeAnalisis == TipoAnalisis.Calado ? "C" : "I";
                                caracteristica.RESULTADO = ana.ValorAnalisis.Value.ToString(CultureInfo.InvariantCulture);
                            }
                                
                        }
                        else
                        {
                            lista.Add(new ZMPES0020
                                {
                                    CARACTERISTICA = ana.CaracteristicaCodigoSap,
                                    DESCKILOS = ana.DescuentoEnKg.ToString(CultureInfo.InvariantCulture),
                                    DESCPORC = ana.DescuentoEnPorcentaje.ToString(CultureInfo.InvariantCulture),
                                    ENTRADA_O_SALIDA = cartaPorte.TipoComercialSentido,
                                    NUMCARPOR = cartaPorte.NroCartaPorte,
                                    SECUENCIA = vehiculo.NumeroVehiculo.ToString(CultureInfo.InvariantCulture),
                                    TIPO_MUEST = ana.TipoDeAnalisis == TipoAnalisis.Calado ? "C" : "I",
                                    RESULTADO = ana.ValorAnalisis.HasValue ? ana.ValorAnalisis.Value.ToString(CultureInfo.InvariantCulture) : null
                                });
                        }
                    }
                }

                if (caracteristicasDeCAlidad != null && tieneAnalisisInterno)
                {
                    foreach (var car in caracteristicasDeCAlidad.Where(x => x.Analisis == TipoAnalisis.Interno))
                    {
                        if (!lista.Exists(f => f.CARACTERISTICA == car.CodigoSAP))
                        {
                            lista.Add(new ZMPES0020
                            {
                                CARACTERISTICA = car.CodigoSAP,
                                DESCKILOS = "0",
                                DESCPORC = "0",
                                ENTRADA_O_SALIDA = cartaPorte.TipoComercialSentido,
                                NUMCARPOR = cartaPorte.NroCartaPorte,
                                SECUENCIA = vehiculo.NumeroVehiculo.ToString(CultureInfo.InvariantCulture),
                                TIPO_MUEST = "I",
                                RESULTADO = "0"
                            });

                        }
                    }
                }

                if (destinatarioCTG != null)
                {
                    var CTGAfip =
                        new ZMPES0510
                            {
                                CANJEREMITCOM = destinatarioCTG.CanjeRemito,
                                CCPP = destinatarioCTG.NumeroCCPP,
                                COSECHA = destinatarioCTG.Cosecha,
                                CTG = destinatarioCTG.CTG,
                                CUIT_CANJEADOR = destinatarioCTG.CuitCanjeador,
                                CUIT_DESTINATARI = destinatarioCTG.CuitDestinatario,
                                CUIT_DESTINO = destinatarioCTG.CuitDestino,
                                ESPECIE = destinatarioCTG.Especie,
                                ESTABLECIMIENTO = destinatarioCTG.Establecimiento,
                                ESTADO = destinatarioCTG.Estado,
                                FE_HR_CONF = destinatarioCTG.FechaConf,
                                PESO_NETO_CARGA = destinatarioCTG.PesoNetoCarga,
                                SOLICITANTE = destinatarioCTG.Solicitante,
                                COD_CUPO = destinatarioCTG.Cupo
                            };

                    data.CTGAfip = new[]
                        {
                            CTGAfip
                        };
                }
                else
                {
                    data.CTGAfip = new ZMPES0510[0];
                }
                
                data.RecepcionesYDespachosII = lista.ToArray();
                request = new Fill_Z1000Request(data);


                try
                {
                    if (ConfigurationManager.AppSettings["LoguearRequestsSap"] == "1")
                    {
                        var srv = context.GetExtension<IServicioComandos>();
                        srv.Ejecutar(new CrearControlRecorrido
                            {
                                Dto = new ControlRecorridoDto
                                    {
                                        Actividad = "IngresosPorCompraDeGranosGenerarRequest",
                                        Fecha = DateTime.Now,
                                        Comentario = request.ToXml(),
                                        NombreUsuario = "",
                                        WorkflowInstanceId = context.WorkflowInstanceId,
                                    }
                            });
                    }
                }
                catch (Exception e)
                {
                    resultado.Errores.Add("ControlRecorrido", "ULTIMO " + e.Message);
                }
                
            }
            catch (Exception e)
            {
                resultado.Errores.Add("", e.Message);

            }
            Request.Set(context,request);
            Resultado.Set(context, resultado);
        }
        
        private string PadProveedor(string codigoSap)
        {
            if (String.IsNullOrEmpty(codigoSap))
            {
                return string.Empty;
            }
            // Si el código de proveedor no es numérico no hace el padd con ceros. Este es el caso de los corrredores.
            return Numeric.IsMatch(codigoSap) ? codigoSap.PadLeft(10, '0') : codigoSap;
        }

        private static readonly Regex Numeric = new Regex(@"^\d+$");
    }
}
