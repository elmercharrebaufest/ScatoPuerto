using System;
using System.Linq;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Dominio.Recursos;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorGuardarNominacionDetalleIntervencion : ProcesadorComando<GuardarNominacionDetalleIntervencion>
    {
        public ProcesadorGuardarNominacionDetalleIntervencion(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }
        public override Resultado Ejecutar(GuardarNominacionDetalleIntervencion comando)
        {
            var resultado = new ResultadoCrear();
            try
            {
                //Me fijo si hay un detalle intervención              
                if (comando.Dto != null)
                {
                    //Me obtengo el objeto de la base de datos
                    NominacionDetalleIntervencion nominacionDetalleIntervencion = comando.Dto != null && comando.Dto.Id > 0 ? Repositorio.Obtener<NominacionDetalleIntervencion>(x => x.Id == comando.Dto.Id) : null;

                    //Me fijo si no es nulo
                    if (nominacionDetalleIntervencion != null)
                    {
                        //Piso los valores
                        TipoDeFumigacion tipoDeFumigacion = comando.Dto.TipoDeFumigacion != null && comando.Dto.TipoDeFumigacion.Id > 0 ? Repositorio.Obtener<TipoDeFumigacion>(x => x.Id == comando.Dto.TipoDeFumigacion.Id) : null;
                        CompaniaDeFumigacion companiaDeFumigacion = comando.Dto.CompaniaDeFumigacion != null && comando.Dto.CompaniaDeFumigacion.Id > 0 ? Repositorio.Obtener<CompaniaDeFumigacion>(x => x.Id == comando.Dto.CompaniaDeFumigacion.Id) : null;
                        nominacionDetalleIntervencion.CompaniaACuentaDe = comando.Dto.CompaniaACuentaDe;
                        nominacionDetalleIntervencion.Fumigacion = comando.Dto.Fumigacion;
                        nominacionDetalleIntervencion.Precintado = comando.Dto.Precintado;
                        nominacionDetalleIntervencion.DraftSurvey = comando.Dto.DraftSurvey;
                        nominacionDetalleIntervencion.Observaciones = comando.Dto.Observaciones;
                        nominacionDetalleIntervencion.SurveyACuentaDe = comando.Dto.SurveyACuentaDe;
                        nominacionDetalleIntervencion.EstibadorYTrimado = comando.Dto.EstibadorYTrimado;
                        nominacionDetalleIntervencion.PermisoDeEmbarque = comando.Dto.PermisoDeEmbarque;
                        nominacionDetalleIntervencion.PrecintadoACuentaDe = comando.Dto.PrecintadoACuentaDe;
                        nominacionDetalleIntervencion.TipoDeFumigacion = tipoDeFumigacion != null ? tipoDeFumigacion : null;
                        nominacionDetalleIntervencion.CompaniaDeFumigacion = companiaDeFumigacion != null ? companiaDeFumigacion : null;

                        foreach (Senasa item in nominacionDetalleIntervencion.Senasa.ToList())
                        {
                            bool reciboBorrado = comando.Dto.Senasa.ToList().FindAll(x => x.Id == item.Id).Count == 0;

                            //En caso de no estar, lo elimino de la base de datos.
                            if (reciboBorrado)
                            {
                                Repositorio.Remover(item);
                            }
                        }

                        //Recorro todos los senasa a guardar
                        foreach (var senasa in comando.Dto.Senasa)
                        {
                            //Me traigo el senasa de la DB.
                            Senasa senasaDB = senasa.Id > 0 ? Repositorio.Obtener<Senasa>(x => x.Id == senasa.Id) : null;
                            //Busco la entidad destino asociada en la DB.
                            Destino destinoDB = senasa.Destino != null && senasa.Destino.Id > 0 ? Repositorio.Obtener<Destino>(x => x.Id == senasa.Destino.Id) : null;
                            //Busco la entidad exportador asociada en la DB.
                            Exportador exportadorDB = senasa.Exportador != null && senasa.Exportador.Id > 0 ? Repositorio.Obtener<Exportador>(x => x.Id == senasa.Exportador.Id) : null;


                            //En caso de que exista piso su data.
                            if (senasaDB != null)
                            {
                                senasaDB.IP = senasa.IP;
                                senasaDB.GMO = senasa.GMO;
                                senasaDB.FITO = senasa.FITO;
                                senasaDB.Destino = destinoDB != null ? destinoDB : null;
                                senasaDB.Consumo = senasa.Consumo;
                                senasaDB.ACuentaDe = senasa.ACuentaDe;
                                senasaDB.Exportador = exportadorDB != null ? exportadorDB : null;
                                senasaDB.TieneSenasa = senasa.TieneSenasa;
                                senasaDB.Observaciones = senasa.Observaciones;
                                senasaDB.MuestraOficial = senasa.MuestraOficial;
                                senasaDB.CertificadoInocuidad = senasa.CertificadoInocuidad;
                                senasaDB.CertificadoVeterinario = senasa.CertificadoVeterinario;
                                senasaDB.NominacionDetalleIntervencion = nominacionDetalleIntervencion;
                            }
                            //Si no existe lo agrego a la DB.
                            else
                            {                                
                                senasaDB = new Senasa()
                                {
                                    IP = senasa.IP,
                                    GMO = senasa.GMO,
                                    FITO = senasa.FITO,
                                    Destino = destinoDB != null ? destinoDB : null,
                                    Consumo = senasa.Consumo,
                                    ACuentaDe = senasa.ACuentaDe,
                                    Exportador = exportadorDB != null ? exportadorDB : null,
                                    TieneSenasa = senasa.TieneSenasa,
                                    Observaciones = senasa.Observaciones,
                                    MuestraOficial = senasa.MuestraOficial,
                                    CertificadoInocuidad = senasa.CertificadoInocuidad,
                                    CertificadoVeterinario = senasa.CertificadoVeterinario,
                                    NominacionDetalleIntervencion = nominacionDetalleIntervencion
                                };
                                //Guardo toda la data en la DB.
                                Repositorio.Agregar(senasaDB);
                            }
                        }



                        var nominacion = Repositorio.Obtener<Nominacion>(x => x.Id == comando.nominacion_id); 
                        if (nominacion.FechaEnvioLineUp !=null && nominacion.Embarque.Id > 0)
                        {
                            var embarque = Repositorio.Obtener<Embarque>(x => x.Id == nominacion.Embarque.Id);
                            var lineUp = Repositorio.Obtener<LineUp>(x => x.Embarque.Id == embarque.Id);
                            if (nominacion.NominacionDetalleIntervencion != null && nominacion.NominacionDetalleIntervencion.Senasa.Count > 0)
                            {
                                var senasa = nominacion.NominacionDetalleIntervencion.Senasa.ElementAt(0);
                                embarque.Senasa = senasa.TieneSenasa;
                            }
                            else
                            {
                                embarque.Senasa = false;
                            }

                            if (nominacionDetalleIntervencion.Fumigacion.ToUpper().Equals("SI"))
                            {
                                lineUp.PlanoDeCarga.Fumigacion = true;
                                lineUp.PlanoDeCarga.EmpresaFumigadora = nominacionDetalleIntervencion.CompaniaDeFumigacion.Descripcion;
                            }
                            else
                            {
                                lineUp.PlanoDeCarga.Fumigacion = false;
                                lineUp.PlanoDeCarga.EmpresaFumigadora = string.Empty;
                            }
                        }

                        Repositorio.GuardarCambios();
                    }
                    else
                    {
                        //Me obtengo el objeto de la nominación de la base de datos.
                        Nominacion nominacion = comando.nominacion_id != null && comando.nominacion_id > 0 ? Repositorio.Obtener<Nominacion>(x => x.Id == comando.nominacion_id) : null;
                        TipoDeFumigacion tipoDeFumigacion = comando.Dto.TipoDeFumigacion != null && comando.Dto.TipoDeFumigacion.Id > 0 ?  Repositorio.Obtener<TipoDeFumigacion>(x => x.Id == comando.Dto.TipoDeFumigacion.Id) : null;
                        CompaniaDeFumigacion companiaDeFumigacion = comando.Dto.CompaniaDeFumigacion != null && comando.Dto.CompaniaDeFumigacion.Id > 0 ? Repositorio.Obtener<CompaniaDeFumigacion>(x => x.Id == comando.Dto.CompaniaDeFumigacion.Id) : null;

                        nominacion.NominacionDetalleIntervencion = new NominacionDetalleIntervencion()
                        {
                            CompaniaACuentaDe = comando.Dto.CompaniaACuentaDe,
                            Fumigacion = comando.Dto.Fumigacion,
                            Precintado = comando.Dto.Precintado,
                            DraftSurvey = comando.Dto.DraftSurvey,
                            Observaciones = comando.Dto.Observaciones,
                            SurveyACuentaDe = comando.Dto.SurveyACuentaDe,
                            EstibadorYTrimado = comando.Dto.EstibadorYTrimado,
                            PermisoDeEmbarque = comando.Dto.PermisoDeEmbarque,
                            PrecintadoACuentaDe = comando.Dto.PrecintadoACuentaDe,
                            TipoDeFumigacion = tipoDeFumigacion != null ? tipoDeFumigacion : null,
                            CompaniaDeFumigacion = companiaDeFumigacion != null ? companiaDeFumigacion : null
                        };

                        Repositorio.Agregar(nominacion.NominacionDetalleIntervencion);
                        //Guardo antes para poder asociar la "NominacionDetalleIntervencion"
                        Repositorio.GuardarCambios();

                        //Recorro todos los senasa a guardar
                        foreach (var senasa in comando.Dto.Senasa)
                        {
                            //Busco la entidad destino asociada en la DB.
                            Destino destinoDB = senasa.Destino != null && senasa.Destino.Id > 0 ?  Repositorio.Obtener<Destino>(x => x.Id == senasa.Destino.Id) : null;
                            //Busco la entidad exportador asociada en la DB.
                            Exportador exportadorDB = senasa.Exportador != null && senasa.Exportador.Id > 0 ?  Repositorio.Obtener<Exportador>(x => x.Id == senasa.Exportador.Id) : null;

                            //Creo el objeto de senasa
                            Senasa senasaDB = new Senasa()
                            {
                                IP = senasa.IP,
                                GMO = senasa.GMO,
                                FITO = senasa.FITO,
                                Destino = destinoDB != null ? destinoDB : null,
                                Consumo = senasa.Consumo,
                                ACuentaDe = senasa.ACuentaDe,
                                Exportador = exportadorDB != null ? exportadorDB : null,
                                TieneSenasa = senasa.TieneSenasa,
                                Observaciones = senasa.Observaciones,
                                MuestraOficial = senasa.MuestraOficial,
                                CertificadoInocuidad = senasa.CertificadoInocuidad,
                                CertificadoVeterinario = senasa.CertificadoVeterinario,
                                NominacionDetalleIntervencion = nominacion.NominacionDetalleIntervencion
                            };
                            //Lo agrego
                            Repositorio.Agregar(senasaDB);
                        }
                        //Lo guardo
                        Repositorio.GuardarCambios();
                    }

                }
            }
            catch (Exception e)
            {
                resultado.Error("", Textos.Error_ActualizarGenerico);
                Log.Error("Error al crear dato tecnico {0}", e.StackTrace);
            }
            return resultado;
        }
    }
}
