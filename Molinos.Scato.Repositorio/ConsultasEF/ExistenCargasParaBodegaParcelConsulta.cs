using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.Linq;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class ExistenCargasParaBodegaParcelConsulta : IConsultaEscalar<bool>
    {
        private readonly int _moduloDeCargaId;
        private readonly string[] _bodegas;

        public ExistenCargasParaBodegaParcelConsulta(int moduloDeCargaId, string[] bodegas)
        {
            this._moduloDeCargaId = moduloDeCargaId;
            this._bodegas = bodegas;
        }

        public bool Ejecutar(DbContext contexto)
        {
            ((IObjectContextAdapter)contexto).ObjectContext.CommandTimeout = 180;

            var bodegasParam = string.Join(",", _bodegas);

            return ExisteCargaLiquido(contexto, bodegasParam) ||
                   ExisteBajaCargaLiquido(contexto, bodegasParam) ||
                   ExistePlanillaDeEmbarqueLiquidos(contexto, bodegasParam) ||
                   ExisteCargaSolido(contexto, bodegasParam) ||
                   ExisteBajaCargaSolido(contexto, bodegasParam);
        }

        private bool ExisteCargaLiquido(DbContext contexto, string bodegasParam)
        {
            var query = $@"
                SELECT COUNT(1)
                FROM ModuloDeCargaPlanillaDeTurnosDetallesLiquido DL
                INNER JOIN ModuloDeCargaPlanillaDeTurnos PT ON PT.Id = DL.ModuloDeCargaPlanillaDeTurnos_Id
                WHERE PT.ModuloDeCarga_Id = @_moduloDeCargaId AND DL.BodegaParcel IN ({bodegasParam})";

            return contexto.Database.SqlQuery<int>(query, new SqlParameter("@_moduloDeCargaId", _moduloDeCargaId)).First() > 0;
        }

        private bool ExisteBajaCargaLiquido(DbContext contexto, string bodegasParam)
        {
            var query = $@"
                SELECT COUNT(1)
                FROM ModuloDeCargaPlanillaDeTurnosCortes TC
                INNER JOIN ModuloDeCargaPlanillaDeTurnos PT ON PT.Id = TC.ModuloDeCargaPlanillaDeTurnos_Id
                WHERE PT.ModuloDeCarga_Id = @_moduloDeCargaId AND TC.BodegaParcel IN ({bodegasParam})";

            return contexto.Database.SqlQuery<int>(query, new SqlParameter("@_moduloDeCargaId", _moduloDeCargaId)).First() > 0;
        }

        private bool ExistePlanillaDeEmbarqueLiquidos(DbContext contexto, string bodegasParam)
        {
            var query = $@"
                SELECT COUNT(1)
                FROM ModuloDeCargaPlanillaDeEmbarque
                WHERE ModuloDeCarga_Id = @_moduloDeCargaId AND BodegaParcel IN ({bodegasParam})";

            return contexto.Database.SqlQuery<int>(query, new SqlParameter("@_moduloDeCargaId", _moduloDeCargaId)).First() > 0;
        }

        private bool ExisteCargaSolido(DbContext contexto, string bodegasParam)
        {
            var nombresBodega = bodegasParam.Split(',').Select(n => $"'BODEGA {n}'").ToList();
            var nombresBodegaSql = string.Join(", ", nombresBodega);
            var query = $@"
                Select COUNT(1)
                FROM ModuloDeCargaPlanillaDeTurnosDetallesSolido DS
                INNER JOIN ModuloDeCargaPlanillaDeTurnos PT ON PT.Id = DS.ModuloDeCargaPlanillaDeTurnos_Id
                INNER JOIN Bodega BO ON BO.id = DS.Bodega_Id
                WHERE PT.ModuloDeCarga_Id = @_moduloDeCargaId 
                AND BO.nombre IN ({nombresBodegaSql})";

            return contexto.Database.SqlQuery<int>(query, new SqlParameter("@_moduloDeCargaId", _moduloDeCargaId)).First() > 0;
        }

        private bool ExisteBajaCargaSolido(DbContext contexto, string bodegasParam)
        {
            var nombresBodega = bodegasParam.Split(',').Select(n => $"'BODEGA {n}'").ToList();
            var nombresBodegaSql = string.Join(", ", nombresBodega);
            var query = $@"
                SELECT COUNT(1)
                FROM ModuloDeCargaPlanillaDeTurnosCortes TC
                INNER JOIN BalanzasCortes BC ON TC.idBalanzaCorte = BC.Id
                INNER JOIN ModuloDeCargaPlanillaDeTurnos PT ON TC.ModuloDeCargaPlanillaDeTurnos_Id = PT.Id
                INNER JOIN Bodega BO ON BC.Bodega_Id = BO.Id
                WHERE PT.ModuloDeCarga_Id = @_moduloDeCargaId 
                AND BO.nombre IN ({nombresBodegaSql})";

            return contexto.Database.SqlQuery<int>(query, new SqlParameter("@_moduloDeCargaId", _moduloDeCargaId)).First() > 0;
        }
    }
}