using Molinos.Scato.Dominio.Entidades;
using System.Data.Entity;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ObtenerModuloDeCargaActivoPorVapor : IConsultaEscalar<ModuloDeCarga>
    {
        private string vapor;

        public ObtenerModuloDeCargaActivoPorVapor(string vapor)
        {
            this.vapor = vapor;
        }

        public ModuloDeCarga Ejecutar(DbContext contexto)
        {
            return contexto.Set<LineUp>()
                .Where(q => q.Embarque.Vapor.Nombre.Equals(vapor))
                .Where(q => q.Embarque.Ubicacion != 1)
                .Where(q => q.Embarque.SanBenito == true)
                .Select(q => q.ModuloDeCarga)
                .FirstOrDefault();
        }
    }
}