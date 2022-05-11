

    using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{

    public class ProcesadorModificarEmbarqueGeolocalizacion : ProcesadorModificar<ModificarEmbarqueGeolocalizacion>
    {
       
        public ProcesadorModificarEmbarqueGeolocalizacion(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        protected override void ModificarEntidad(ModificarEmbarqueGeolocalizacion comando)
        {
            try
            {
                Embarque embarque = Repositorio.Obtener<Embarque>(x => x.Destino.Nombre == comando.BanderaBuque && x.Patente == comando.NombreBuque && x.TipoBuque == comando.TipoBuque);

                if (embarque.EmbarqueInformacion.Count == 0 && comando.DtoInformacion != null)
                {
                     EmbarqueInformacion inf= new EmbarqueInformacion
                    {
                        Embarque = embarque,
                        IMO = comando.DtoInformacion.IMO,
                        MMSI = comando.DtoInformacion.MMSI,
                        Bandera = comando.DtoInformacion.Bandera,
                        Tonelaje = comando.DtoInformacion.Tonelaje,
                        TonelajePesoMuerto = comando.DtoInformacion.TonelajePesoMuerto,
                        LargoxAnchoExtremo = comando.DtoInformacion.LargoxAnchoExtremo,
                        FotoEmbarque = comando.DtoInformacion.FotoEmbarque,
                        FechaRegistro = DateTime.Now,
                    };
                   embarque.EmbarqueInformacion.Add(inf);
                    
                }

                if (embarque.EmbarqueInformacionViaje.Count == 0 && comando.DtoViaje != null)
                {
                    EmbarqueInformacionViaje viaje = new EmbarqueInformacionViaje
                    {
                        Embarque = embarque,
                        PaisOrigen = comando.DtoViaje.PaisOrigen,
                        PuertoOrigen = comando.DtoViaje.PuertoOrigen,
                        PaisDestino = comando.DtoViaje.PaisDestino,
                        PuertoDestino = comando.DtoViaje.PuertoDestino,
                        ATD = comando.DtoViaje.ATD,
                        ATA = comando.DtoViaje.ATA,
                        ETA_Reportado = comando.DtoViaje.ETA_Reportado,
                        Destino_Reportado = comando.DtoViaje.Destino_Reportado,
                        Peso_Reportado = comando.DtoViaje.Peso_Reportado,
                        VelocidadRecorrido = comando.DtoViaje.VelocidadRecorrido,
                        FechaRegistro = DateTime.Now,
                    };
                    embarque.EmbarqueInformacionViaje.Add(viaje);
                }

                if (embarque.EmbarquePosicion.Count > 0 && comando.DtoPosicion != null)
                {
                    var embarqPos = embarque.EmbarquePosicion.FirstOrDefault();

                    EmbarquePosicionHistorico posicionHist = new EmbarquePosicionHistorico
                    {
                        Embarque_id = embarqPos.Embarque.Id,
                        HoraUTCPosicionRecibida = embarqPos.HoraUTCPosicionRecibida,
                        HoraLocalBarco = embarqPos.HoraLocalBarco,
                        Area = embarqPos.Area,
                        PuertoActual = embarqPos.PuertoActual,
                        Latitud = embarqPos.Latitud,
                        Longitud = embarqPos.Longitud,
                        Estado = embarqPos.Estado,
                        VelocidadCurso = embarqPos.VelocidadCurso,
                        FechaRegistro = embarqPos.FechaRegistro,
                    };
                    //   embarque.EmbarquePosicion.Add(embarqPos);
                    Repositorio.Agregar(posicionHist);

                    embarqPos.HoraUTCPosicionRecibida = comando.DtoPosicion.HoraUTCPosicionRecibida;
                    embarqPos.HoraLocalBarco = comando.DtoPosicion.HoraLocalBarco;
                    embarqPos.Area = comando.DtoPosicion.Area;
                    embarqPos.PuertoActual = comando.DtoPosicion.PuertoActual;
                    embarqPos.Latitud = comando.DtoPosicion.Latitud;
                    embarqPos.Longitud = comando.DtoPosicion.Longitud;
                    embarqPos.Estado = comando.DtoPosicion.Estado;
                    embarqPos.VelocidadCurso = comando.DtoPosicion.VelocidadCurso;
                    embarqPos.FechaRegistro = comando.DtoPosicion.FechaRegistro;
                    //  Repositorio.GuardarCambios();

                }
                else if (comando.DtoPosicion != null)
                {
                    EmbarquePosicion posicion = new EmbarquePosicion
                    {
                        Embarque = embarque,
                        HoraUTCPosicionRecibida = comando.DtoPosicion.HoraUTCPosicionRecibida,
                        HoraLocalBarco = comando.DtoPosicion.HoraLocalBarco,
                        Area = comando.DtoPosicion.Area,
                        PuertoActual = comando.DtoPosicion.PuertoActual,
                        Latitud = comando.DtoPosicion.Latitud,
                        Longitud = comando.DtoPosicion.Longitud,
                        Estado = comando.DtoPosicion.Estado,
                        VelocidadCurso = comando.DtoPosicion.VelocidadCurso,
                        FechaRegistro = comando.DtoPosicion.FechaRegistro,
                    };
                    embarque.EmbarquePosicion.Add(posicion);
                }
                Repositorio.GuardarCambios();
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        

        protected override void Validar(ModificarEmbarqueGeolocalizacion comando, Resultado resultado)
        {

        }


    }
}