using Molinos.Scato.Dominio.Entidades;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;

namespace Molinos.Scato.Repositorio.ComandosEF
{

    /// <summary>
    /// Obtiene el nombre del buque que coincide con el patrón dado y que ha recalado en los últimos 30 días.
    /// </summary>
    public class ObtenerNombreBuque : IComando<string>
    {
        private readonly string nombreBuque;

        public ObtenerNombreBuque(string nombreBuque)
        {
            this.nombreBuque = nombreBuque;
        }

        public string Ejecutar(DbContext contexto)
        {
            return contexto.Database.SqlQuery<string>(@"
                SELECT TOP 1 V.Nombre FROM LineUp L 
                    INNER JOIN Embarque E ON L.Embarque_Id = E.Id
                    INNER JOIN Vapor V on E.Vapor_Id = V.Id
                    LEFT JOIN VaporInformacion VI ON VI.Vapor_Id = V.Id
                WHERE (VI.TipoBuque = 'Bulk Carrier' OR VI.TipoBuque IS NULL)
                    AND E.SanBenito = 1
                    AND V.Nombre LIKE @NombreBuque + '%'
                    AND E.FechaRecalada >= DATEADD(DAY, -30, GETDATE())
                ORDER BY L.Id DESC"
                , new SqlParameter("@NombreBuque", nombreBuque)
            ).FirstOrDefault();
        }
    }
}
