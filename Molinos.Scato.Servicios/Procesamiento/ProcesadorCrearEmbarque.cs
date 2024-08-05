using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Enums;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorCrearEmbarque : ProcesadorComando<CrearEmbarque>
    {
        public ProcesadorCrearEmbarque(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(CrearEmbarque comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                var workflow = Repositorio.Obtener<Workflow>(f => f.Codigo == "WorkflowPuerto");

                if (workflow != null)
                {
                    var vapor = Repositorio.Obtener<Vapor>(x => x.Nombre == comando.Embarque.NombreBuque) ?? new Vapor
                    {
                        Nombre = comando.Embarque.NombreBuque
                    };
                    var centro = Repositorio.Obtener<Centro>(comando.Embarque.CentroId);

                    var workflowDefinicion = Repositorio.Obtener<WorkflowDefinicion>(1377);
                    var chofer = Repositorio.Obtener<Chofer>(x => x.Nombre == "Capitan") ??
                        Repositorio.Agregar(new Chofer
                        {
                            Nombre = "Capitan",
                            Apellido = "Capitan",
                            NumeroDeDocumento = "30999999",
                            Cuil = "20-30999999-1",
                            TipoDocumentoIdentidad = Repositorio.Obtener<TipoDocumentoIdentidad>(1)
                        });
                    var recorrido = new Recorrido
                    {
                        InstanciaWorkflow = Guid.NewGuid(),
                        Usuario = comando.Usuario,
                        Workflow = workflow,
                        Centro = centro,
                        Patente = comando.Embarque.Patente,
                        TipoDocumentoIngreso = TipoDocumentoIngreso.Embarque,
                        FechaInicio = DateTime.Now,
                        WorkflowDefinicion = workflowDefinicion,
                        TipoVehiculo = TipoVehiculo.Vapor,
                        Chofer = chofer,
                        TipoComercial = Repositorio.Obtener<TipoComercial>(x => x.CodigoSap == "107")
                    };

                    var embarque = new Embarque
                    {
                        Vapor = vapor,
                        FechaRecalada = comando.Embarque.FechaRecalada,
                        HoraRecalada = comando.Embarque.HoraRecalada,

                        Agencias = (comando.Embarque.Agencias != null) ? Repositorio.Obtener<AgenciaMaritimaPuerto>(comando.Embarque.Agencias.Id) : null,
                        ObligacionCarga = comando.Embarque.ObligacionCarga,
                        Senasa = comando.Embarque.Senasa,
                        Observaciones = comando.Embarque.Observaciones,
                        Vicentin = comando.Embarque.Vicentin,
                        Noryon = comando.Embarque.Noryon,
                        OtrosMuelles = comando.Embarque.OtrosMuelles,
                        Centro = centro,
                        Patente = comando.Embarque.Patente,
                        TipoBuque = comando.Embarque.TipoDeBuque != null ? comando.Embarque.TipoDeBuque.Nombre : "",
                        Freeboard = comando.Embarque.Freeboard,
                        Ubicacion = comando.Embarque.UbicacionDeBuque != null ? comando.Embarque.UbicacionDeBuque.Id : 0,
                        SanBenito = comando.Embarque.SanBenito,
                        ATA = (comando.Embarque.ATA != null) ? Repositorio.Obtener<ATAPuerto>(comando.Embarque.ATA.Id) : null,
                        EsLiquido = comando.Embarque.EsLiquido,
                        //HORAS A LA ESPERA DE LIMPIEZA
                        FechaDesdeLimpieza = comando.Embarque.FechaDesdeLimpieza,
                        HoraDesdeLimpieza = comando.Embarque.HoraDesdeLimpieza,
                        FechaHastaLimpieza = comando.Embarque.FechaHastaLimpieza,
                        HoraHastaLimpieza = comando.Embarque.HoraHastaLimpieza,
                        MotivosLimpieza = (comando.Embarque.MotivosLimpieza != null) ? Repositorio.Obtener<MotivosLimpieza>(comando.Embarque.MotivosLimpieza.Id) : null,
                        ObservacionesLimpieza = comando.Embarque.ObservacionesLimpieza,
                        //SHIP PARTICULAR
                        Destino = (comando.Embarque.Destino != null) ? Repositorio.Obtener<Destino>(comando.Embarque.Destino.Id) : null,
                        PorteNeto = comando.Embarque.PorteNeto,
                        PorteBruto = comando.Embarque.PorteBruto,
                        Eslora = comando.Embarque.Eslora,
                        Manga = comando.Embarque.Manga,
                        Puntal = comando.Embarque.Puntal,
                        FechaLibrePlatica = comando.Embarque.FechaLibrePlatica,
                        HoraLibrePlatica = comando.Embarque.HoraLibrePlatica,
                        EstadoBuque = Repositorio.Obtener<EstadoBuque>(x => x.Descripcion == "PreOperativo"),
                        //Imo = comando.Embarque.Imo;
                        CantidadBodegasTanques = comando.Embarque.CantidadBodegasTanques,
                        Recorrido = recorrido
                    };

                    Repositorio.Agregar(embarque);

                    //embarque bandera

                    foreach (var mat in comando.Embarque.MaterialesPuertoCantidad.Where(y => y.Cantidad > 0))
                    {
                        Repositorio.Agregar(new MaterialPuertoCantidad
                        {
                            Cantidad = mat.Cantidad,
                            MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(mat.MaterialId),
                            Embarque = embarque,
                            Color = mat.Color
                        });
                    }

                    var embarqueCoordinadores = comando.Embarque.Coordinadores.Select(coo => new EmbarqueCoordinador
                    {
                        CoordinadorPuerto = Repositorio.Obtener<CoordinadorPuerto>(coo.CoordinadorPuerto?.Id ?? coo.Id),
                        Embarque = embarque
                    }).ToList();

                    foreach (var item in embarqueCoordinadores)
                    {
                        Repositorio.Agregar(item);
                    }

                    var embarqueInfor = comando.Embarque.EmbarqueInformacion.SingleOrDefault();
                    Bandera band = Repositorio.Obtener<Bandera>(x => x.Id == embarqueInfor.Bandera.Id);
                    Repositorio.Agregar(new EmbarqueInformacion
                    {
                        Embarque = embarque,
                        IMO = embarqueInfor.IMO,
                        Bandera = band,
                        FechaRegistro = DateTime.Now
                    });
                    Repositorio.GuardarCambios();
                    recorrido.NumeroDocumentoIngreso = embarque.Id.ToString();

                    #region LINEUP

                    var lineup = Repositorio.Obtener<LineUp>(x => x.Recorrido.Id == recorrido.Id);

                    if (lineup == null)
                    {
                        lineup = new LineUp
                        {
                            Recorrido = recorrido,
                            Embarque = embarque,
                            PlanoDeCarga = new PlanoDeCarga(),
                            ModuloDeCarga = new ModuloDeCarga(),
                            Orden = embarque != null ? embarque.Id : int.MaxValue,
                            Ocultar = false
                        };

                        Repositorio.Agregar(lineup);
                    }
                    //else
                    //{
                    //    lineup.CartaDeSubidaEnviada = comando.LineUp.CartaDeSubidaEnviada;
                    //    lineup.CartaDeSubidaAprobada = comando.LineUp.CartaDeSubidaAprobada;
                    //    lineup.CargaEnSap = comando.LineUp.CargaEnSap;
                    //    lineup.NominacionDePractico = comando.LineUp.NominacionDePractico;
                    //    lineup.SeguridadPortuaria = comando.LineUp.SeguridadPortuaria;
                    //    lineup.InspeccionSenasa = comando.LineUp.InspeccionSenasa;
                    //    lineup.ControlSenasa = comando.LineUp.ControlSenasa;
                    //    lineup.ControlPrivado = comando.LineUp.ControlPrivado;
                    //    lineup.Amarrador = comando.LineUp.Amarrador;
                    //    lineup.AgenciaContactada = comando.LineUp.AgenciaContactada;
                    //    lineup.PlanoDeCargaEnviado = comando.LineUp.PlanoDeCargaEnviado;
                    //    lineup.Orden = comando.LineUp.Orden;
                    //}

                    //lineup.Embarque.Ubicacion = comando.LineUp.Ubicacion;
                    Repositorio.GuardarCambios();
                    resultado.Id = embarque.Id;
                    #endregion LINEUP
                }
            }
            catch (Exception e)
            {
                resultado.Error("", Textos.OrdenCargaInterna_Error);
            }

            return resultado;
        }
    }
}