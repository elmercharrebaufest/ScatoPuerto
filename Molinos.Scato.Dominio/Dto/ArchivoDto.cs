using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Molinos.Scato.Dominio.Dto
{
    [DataContract]
    public class ArchivoDto
    {
        [DataMember]
        public string Nombre { get; set; }

        [DataMember]
        public byte[] Contenido { get; set; }

        [DataMember]
        public string TipoContenido { get; set; }

        public ArchivoDto(string rutaArchivo)
        {
            if (!File.Exists(rutaArchivo))
            {
                throw new FileNotFoundException("El archivo no fue encontrado", rutaArchivo);
            }
            Contenido = File.ReadAllBytes(rutaArchivo);
            Nombre = Path.GetFileName(rutaArchivo);
            TipoContenido = ObtenerTipoContenido(Path.GetExtension(rutaArchivo));
        }

        public ArchivoDto(HttpPostedFile archivo)
        {
            if (archivo == null)
            {
                throw new ArgumentNullException(nameof(archivo));
            }

            Nombre = archivo.FileName;
            TipoContenido = archivo.ContentType;
            Contenido = LeerArchivoComoBytes(archivo.InputStream);
        }

        private byte[] LeerArchivoComoBytes(Stream input)
        {
            using (var memoryStream = new MemoryStream())
            {
                input.CopyTo(memoryStream);
                return memoryStream.ToArray();
            }
        }

        private string ObtenerTipoContenido(string extension)
        {
            switch (extension.ToLower())
            {
                case ".txt": return "text/plain";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".png": return "image/png";
                case ".pdf": return "application/pdf";
                case ".doc": return "application/msword";
                case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                // Agregar más tipos MIME según sea necesario
                default: return "application/octet-stream"; // Tipo por defecto
            }
        }
    }
}
