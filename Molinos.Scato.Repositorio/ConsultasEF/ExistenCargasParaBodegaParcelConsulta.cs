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

            var bodegasParam = string.Join(",", _bodegas.Select(b => $"'{b}'"));

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
                FROM ModuloDeCargaPlanillaDeTurnosDetallesLiquido mdcpdtdl
                INNER JOIN ModuloDeCargaPlanillaDeTurnos mdcpdt ON mdcpdt.Id = mdcpdtdl.ModuloDeCargaPlanillaDeTurnos_Id
                INNER JOIN LineUp l ON l.ModuloDeCarga_Id = mdcpdt.ModuloDeCarga_Id
                INNER JOIN PlanoDeCargaBodega pdc ON pdc.PlanoDeCarga_Id = l.PlanoDeCarga_Id
                WHERE mdcpdt.ModuloDeCarga_Id = @_moduloDeCargaId AND pdc.BodegaParcel IN ({bodegasParam})";

            return contexto.Database.SqlQuery<int>(query, new SqlParameter("@_moduloDeCargaId", _moduloDeCargaId)).First() > 0;
        }

        private bool ExisteBajaCargaLiquido(DbContext contexto, string bodegasParam)
        {
            var query = $@"
                SELECT COUNT(1)
                FROM ModuloDeCargaPlanillaDeTurnosCortes mdcpdtc
                INNER JOIN ModuloDeCargaPlanillaDeTurnos mdcpdt ON mdcpdt.Id = mdcpdtc.ModuloDeCargaPlanillaDeTurnos_Id
                INNER JOIN LineUp l ON l.ModuloDeCarga_Id = mdcpdt.ModuloDeCarga_Id
                INNER JOIN PlanoDeCargaBodega pdc ON pdc.PlanoDeCarga_Id = l.PlanoDeCarga_Id
                WHERE mdcpdt.ModuloDeCarga_Id = @_moduloDeCargaId AND pdc.BodegaParcel IN ({bodegasParam}) 
                AND mdcpdtC.MotivosDeCorte_Id IN (SELECT ID FROM MotivosFallasBalanza WHERE Nombre = 'Normal' OR BajaCargaLiquido = 1)";

            return contexto.Database.SqlQuery<int>(query, new SqlParameter("@_moduloDeCargaId", _moduloDeCargaId)).First() > 0;
        }

        private bool ExistePlanillaDeEmbarqueLiquidos(DbContext contexto, string bodegasParam)
        {
            var query = $@"
                SELECT COUNT(1)
                FROM ModuloDeCargaPlanillaDeEmbarque mdcpde
                INNER JOIN ModuloDeCarga mc ON mc.id = mdcpde.ModuloDeCarga_Id
                INNER JOIN Lineup l ON l.ModuloDeCarga_Id = mc.id
                INNER JOIN PlanoDeCargaBodega pdc ON pdc.PlanoDeCarga_Id = l.PlanoDeCarga_Id
                WHERE mdcpde.ModuloDeCarga_Id = @_moduloDeCargaId AND pdc.BodegaParcel IN ({bodegasParam})";

            return contexto.Database.SqlQuery<int>(query, new SqlParameter("@_moduloDeCargaId", _moduloDeCargaId)).First() > 0;
        }

        private bool ExisteCargaSolido(DbContext contexto, string bodegasParam)
        {
            var query = $@"
                SELECT COUNT(1)
                FROM ModuloDeCargaPlanillaDeTurnosDetallesSolido mdcpdtds
                INNER JOIN ModuloDeCargaPlanillaDeTurnos mdcpdt ON mdcpdt.Id = mdcpdtds.ModuloDeCargaPlanillaDeTurnos_Id
                INNER JOIN LineUp l ON l.ModuloDeCarga_Id = mdcpdt.ModuloDeCarga_Id
                INNER JOIN PlanoDeCargaBodega pdc ON pdc.PlanoDeCarga_Id = l.PlanoDeCarga_Id
                WHERE mdcpdt.ModuloDeCarga_Id = @_moduloDeCargaId AND pdc.BodegaParcel IN ({bodegasParam})";

            return contexto.Database.SqlQuery<int>(query, new SqlParameter("@_moduloDeCargaId", _moduloDeCargaId)).First() > 0;
        }

        private bool ExisteBajaCargaSolido(DbContext contexto, string bodegasParam)
        {
            var query = $@"
                SELECT COUNT(1)
                FROM BalanzasCortes bc
                INNER JOIN ModuloDeCargaPlanillaDeTurnosCortes mdcpdtc ON mdcpdtc.idBalanzaCorte = bc.Id
                INNER JOIN ModuloDeCargaPlanillaDeTurnos mdcpdt ON mdcpdt.Id = mdcpdtC.ModuloDeCargaPlanillaDeTurnos_Id
                INNER JOIN LineUp l ON l.ModuloDeCarga_Id = mdcpdt.ModuloDeCarga_Id
                INNER JOIN PlanoDeCargaBodega pdc ON pdc.PlanoDeCarga_Id = l.PlanoDeCarga_Id
                WHERE mdcpdt.ModuloDeCarga_Id = @_moduloDeCargaId AND pdc.BodegaParcel IN ({bodegasParam}) 
                AND mdcpdtC.MotivosDeCorte_Id IN (SELECT ID FROM MotivosFallasBalanza WHERE Nombre = 'Normal' OR BajaCargaSolido = 1)";

            return contexto.Database.SqlQuery<int>(query, new SqlParameter("@_moduloDeCargaId", _moduloDeCargaId)).First() > 0;
        }
    }
}