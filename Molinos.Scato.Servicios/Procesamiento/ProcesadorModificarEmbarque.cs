using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using System;
using System.Configuration;
using System.IO;
using System.Linq;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorModificarEmbarque : ProcesadorModificar<ModificarEmbarque>
    {
        public ProcesadorModificarEmbarque(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        protected override void ModificarEntidad(ModificarEmbarque comando)
        {

            var Embarque = Repositorio.Obtener<Embarque>(comando.Dto.Id);

            #region Modificacion del Embarque
            if (comando.Dto.ATA != null)
                Embarque.ATA = Repositorio.Obtener<ATAPuerto>(comando.Dto.ATA.Id);
            else
                Embarque.ATA = null;
            if (comando.Dto.Agencias != null)
                Embarque.Agencias = Repositorio.Obtener<AgenciaMaritimaPuerto>(comando.Dto.Agencias.Id);
            else
                Embarque.Agencias = null;
            if (comando.Dto.Coordinadores != null)
                Embarque.Coordinadores = Repositorio.Obtener<CoordinadorPuerto>(comando.Dto.Coordinadores.Id);
            else
                Embarque.Coordinadores = null;

            if (comando.Dto.MotivosLimpieza != null)
                Embarque.MotivosLimpieza = Repositorio.Obtener<MotivosLimpieza>(comando.Dto.MotivosLimpieza.Id);
            else
                Embarque.MotivosLimpieza = null;

            if (comando.Dto.Destino != null)
                Embarque.Destino = Repositorio.Obtener<Destino>(comando.Dto.Destino.Id);
            else
                Embarque.Destino = null;

            Embarque.FechaDesdeLimpieza = comando.Dto.FechaDesdeLimpieza != null ? comando.Dto.FechaDesdeLimpieza : null;
            Embarque.FechaHastaLimpieza = comando.Dto.FechaHastaLimpieza != null ? comando.Dto.FechaHastaLimpieza : null;
            Embarque.ObligacionCarga = comando.Dto.ObligacionCarga != null ? comando.Dto.ObligacionCarga : null;
            Embarque.FechaRecalada = comando.Dto.FechaRecalada != null ? comando.Dto.FechaRecalada : null;

            Embarque.HoraDesdeLimpieza = comando.Dto.HoraDesdeLimpieza != null ? comando.Dto.HoraDesdeLimpieza : null;
            Embarque.HoraHastaLimpieza = comando.Dto.HoraHastaLimpieza != null ? comando.Dto.HoraHastaLimpieza : null;
            Embarque.HoraRecalada = comando.Dto.HoraRecalada != null ? comando.Dto.HoraRecalada : null;


            Embarque.Observaciones = comando.Dto.Observaciones;
            Embarque.ObservacionesLimpieza = comando.Dto.ObservacionesLimpieza;
            Embarque.Freeboard = comando.Dto.Freeboard;

            Embarque.CantidadBodegasTanques = comando.Dto.CantidadBodegasTanques;
            Embarque.PorteNeto              = comando.Dto.PorteNeto ;
            Embarque.PorteBruto             = comando.Dto.PorteBruto;
            Embarque.Eslora                 = comando.Dto.Eslora    ;
            Embarque.Manga                  = comando.Dto.Manga     ;
            Embarque.Puntal                 = comando.Dto.Puntal;
            Embarque.Senasa = comando.Dto.Senasa;
            Embarque.Vicentin = comando.Dto.Vicentin;
            Embarque.Noryon = comando.Dto.Noryon;
            Embarque.SanBenito = comando.Dto.SanBenito;
            Embarque.OtrosMuelles = comando.Dto.OtrosMuelles;

            Embarque.TipoBuque = comando.Dto.TipoDeBuque != null ? comando.Dto.TipoDeBuque.Nombre.ToString() : "";
            Embarque.Ubicacion = comando.Dto.UbicacionDeBuque != null ? comando.Dto.UbicacionDeBuque.Id : 0;
            Embarque.Vapor = Repositorio.Obtener<Vapor>(x => x.Nombre == comando.Dto.NombreBuque) ?? new Vapor
            {
                Nombre = comando.Dto.NombreBuque
            };
            Embarque.Patente = comando.Dto.NombreBuque;
            Repositorio.RemoverTodos(Embarque.MaterialPuertoCantidad.ToList());

            foreach (var mat in comando.Dto.MaterialesPuertoCantidad.Where(y => y.Cantidad > 0))
            {
                Embarque.MaterialPuertoCantidad.Add(new MaterialPuertoCantidad
                {
                    Cantidad = mat.Cantidad,
                    MaterialPuerto = Repositorio.Obtener<MaterialPuerto>(mat.MaterialId),
                    Embarque = Embarque,
                    Color = mat.Color
                });
            }

            LimpiarCarpetaDeArchivosDeEmbarques(comando.Dto.Id);
            if (comando.Dto.filePathShipParticular != null)
                Embarque.filePathShipParticular = GuardarArchivoEmbarque(comando.Dto.filePathShipParticular, comando.Dto.shipParticularArchivoNombre, comando.Dto.Id);
            else
                Embarque.filePathShipParticular = null;

            #endregion

            #region Modificacion de Información del Embarque
            foreach (var informacion in comando.Dto.EmbarqueInformacion)
            {
                var embarqueInformacion_DB = Repositorio.Obtener<EmbarqueInformacion>(informacion.Id);
                if (embarqueInformacion_DB == null)
                {
                    embarqueInformacion_DB = new EmbarqueInformacion();
                    embarqueInformacion_DB.Bandera = Repositorio.Obtener<Bandera>(informacion.Bandera.Id);
                    embarqueInformacion_DB.Embarque = Embarque;
                    embarqueInformacion_DB.IMO = informacion.IMO;
                    embarqueInformacion_DB.FechaRegistro = DateTime.Now;
                    Embarque.EmbarqueInformacion.Add(embarqueInformacion_DB);
                }
                else
                {
                    embarqueInformacion_DB.Bandera = Repositorio.Obtener<Bandera>(informacion.Bandera.Id);
                    embarqueInformacion_DB.IMO = informacion.IMO;
                    embarqueInformacion_DB.Embarque = Embarque;
                    embarqueInformacion_DB.FechaRegistro = DateTime.Now;
                }
            }
            #endregion

            Repositorio.GuardarCambios();

        }

        protected override void Validar(ModificarEmbarque comando, Resultado resultado)
        {

        }

        public string GuardarArchivoEmbarque(string archivoBase64, string nombreArchivo, int embarque_Id)
        {
            try
            {
                var path = ConfigurationManager.AppSettings["ArchivosPath"];
                var directorio = "Embarque";
                var archivoBase64Split = archivoBase64.Contains(',') ? archivoBase64.Split(',')[1] : archivoBase64;
                var archivo = Convert.FromBase64String(archivoBase64Split);

                var rutaDestino = path + (path.EndsWith("\\") ? "" : "\\") + directorio + "\\" + embarque_Id + "\\" + nombreArchivo;

                if (!Directory.Exists(Path.GetDirectoryName(rutaDestino)))
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(rutaDestino));
                }
                using (var outputStream = File.OpenWrite(rutaDestino))
                {
                    outputStream.Write(archivo, 0, archivo.Length);
                }
                return rutaDestino;
            }
            catch (Exception ex)
            {
                Log.Error(ex, "");
            }
            return null;
        }

        private void LimpiarCarpetaDeArchivosDeEmbarques(int embarque_Id)
        {
            var path = ConfigurationManager.AppSettings["ArchivosPath"];
            var directorio = "Embarque";
            DirectoryInfo di = new DirectoryInfo(path + (path.EndsWith("\\") ? "" : "\\") + directorio + "\\" + embarque_Id);

            if (di.Exists)
            {
                foreach (FileInfo file in di.GetFiles())
                {
                    file.Delete();
                }
            }
        }
    }
}
