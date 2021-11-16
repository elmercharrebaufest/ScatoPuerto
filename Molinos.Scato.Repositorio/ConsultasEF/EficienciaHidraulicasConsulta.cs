using System;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using Molinos.Scato.Dominio.Dto;

namespace Molinos.Scato.Repositorio.ConsultasEF
{
    public class EficienciaHidraulicasConsulta : IConsultaEscalar<GraficoEficienciaHidraulicasDto>
    {
        private readonly int centroId;
        private readonly int materialId;
        private readonly DateTime fecha;

        private GraficoEficienciaHidraulicasDto modelo;

        public EficienciaHidraulicasConsulta(GraficoEficienciaHidraulicasDto model, int centroId)
        {
            modelo = model;
            fecha = model.Fecha;
            this.centroId = centroId;
            materialId = model.MaterialId;
        }

        public GraficoEficienciaHidraulicasDto Ejecutar(DbContext contexto)
        {
            var consulta = @"select count(lah.PuestoDeTrabajo_Id) as Valor, ISNULL(sum(lah.PesoTara), 0 ) as Toneladas, p.Codigo as Clave from PuestosDeCargaDescarga p WITH (NOLOCK)
				left join (
				select max(cr.PuestoDeTrabajo_Id) as PuestoDeTrabajo_Id, SUM (r.PesoTara) / 1000 as PesoTara from Recorrido R WITH (NOLOCK)
						   inner join ControlRecorrido cr WITH (NOLOCK) on R.instanciaworkflow = cr.WorkflowInstanceId
						   where R.pesotarafecha is not null and cr.ActividadXaml = 'ConfirmacionDeCargaDescarga' and cast(@fecha as date) = cast(R.pesotarafecha as date) and cr.PuestoDeTrabajo_Id is not null
								AND R.Rechazado = 0 AND R.centro_id = @centroId and (R.Material_Id = @materialId OR @materialId = 0 )
								group by R.instanciaworkflow
							) as lah
						on lah.PuestoDeTrabajo_Id = p.PuestoDeTrabajo_Id
				group by p.Codigo";

            var query = contexto.Database.SqlQuery<ClaveStringValorDto>(consulta,
                new SqlParameter("@materialId", materialId),
                new SqlParameter("@centroId", centroId),
                new SqlParameter("@fecha", fecha));

            modelo.CamionesPorHidraulica = query.ToList();
            return modelo;
        }
    }
}
