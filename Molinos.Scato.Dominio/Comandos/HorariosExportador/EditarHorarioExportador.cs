using Molinos.Scato.Dominio.Dto.HorariosExportador;
using System;

namespace Molinos.Scato.Dominio.Comandos.HorariosExportador
{
    public class EditarHorarioExportador : Comando
    {
        public EdicionHorarioExportador Obj {  get; set; }
    }
}