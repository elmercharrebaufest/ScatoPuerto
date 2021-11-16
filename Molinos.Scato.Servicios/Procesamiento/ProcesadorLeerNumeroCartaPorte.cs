using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using Molinos.Scato.Dominio.Comandos;
using Molinos.Scato.Dominio.Entidades;
using Molinos.Scato.Repositorio;
using Molinos.Scato.Servicios.Conversiones;
using Ninject.Extensions.Logging;
using Spire.Barcode;

namespace Molinos.Scato.Servicios.Procesamiento
{
    public class ProcesadorLeerNumeroCartaPorte : ProcesadorComando<LeerNumeroCartaPorte>
    {
        public ProcesadorLeerNumeroCartaPorte(IRepositorio repositorio, IConversor conversor, ILogger log)
            : base(repositorio, conversor, log)
        {
        }

        public override Resultado Ejecutar(LeerNumeroCartaPorte comando)
        {
            var resultado = new ResultadoLeerNumeroCartaPorte();

            try
            {
                string[] lectura;

                using (MemoryStream mStream = new MemoryStream(comando.CodigoBarrasCartaPorte))
                {
                    using (Image img = Image.FromStream(mStream))
                    {
                        var margenInferior = img.Height - img.Height / 8;
                        using (Image imagenCortada = CropImage(img, 400, 500, 100, margenInferior))
                        {
                            using (var ms = new MemoryStream())
                            {
                                imagenCortada.Save(ms, ImageFormat.Jpeg);
                                lectura = BarcodeScanner.Scan(ms);
                            }
                        }
                    }
                }

                resultado.NumeroCartaPorte = lectura[0];
            }
            
            catch (Exception e)
            {
                Log.Error(e, "Error al reconocer el numero de Carta de Porte desde el Barcode para el archivo {0}", comando.NombreArchivo);
                resultado.Error("", e.Message);
            }
            return resultado;
        }

        private static Image CropImage(Image img, int? margenIzq, int? margenDer, int? margenTop, int? margenInf)
        {
            Bitmap bmpImage = new Bitmap(img);

            return bmpImage.Clone(new Rectangle(margenIzq ?? 0, margenTop ?? 0, img.Width - (margenIzq ?? 0) - (margenDer ?? 0), img.Height - (margenTop ?? 0) - (margenInf ?? 0)), bmpImage.PixelFormat);
        }
    }
}
