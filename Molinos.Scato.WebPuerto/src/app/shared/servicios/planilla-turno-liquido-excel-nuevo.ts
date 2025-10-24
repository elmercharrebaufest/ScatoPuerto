import { Injectable } from "@angular/core";
import { ObsCalidad } from "@ScatoModels/obs-calidad";
import { CorteTurno } from "@ScatoModels/planilla-turnos/corte-turno";
import { PlanillaDeTurnos, TurnoDetalleLiquido, TurnoPuerto } from "@ScatoModels/planilla-turnos/planilla-de-turnos";
import { BorderStyle, Cell, CellValue, Workbook, Worksheet } from 'exceljs';
import { saveAs } from "file-saver";
import { PlanoDeCargaService } from "./plano-de-carga.service";
import { DatosEmbarquesProcesoService } from "./datosEmbarqueProceso.service";
import { take } from "rxjs/operators";
import { PlanoDeCargaBodega } from "@ScatoModels/plano-de-carga-bodega";
import { HorariosExportador } from "@ScatoModels/calidad/horarios-exportador";
import { ModuloDeCargaService } from "./modulo-de-carga.service";
import { Mail } from "@ScatoModels/mail";
import { ConfirmationDialogService } from "./confirmation-dialog.service";
import { EnvioMailDialogService } from "./envio-mail-dialog.service";
import { Tipoalerta } from "@ScatoEnums/tipo-alerta";

interface ExportadorDestinoProducto {
  n: number // identificador
  exportador: string;
  destino: string;
  producto: string;
  columna: string;
  color: string;
}

interface GrupoCantidad {
  grupo: ExportadorDestinoProducto;
  cantidad: number;
}

interface TurnoDia {
  turno: TurnoPuerto;
  detalles: GrupoCantidad[];
  cortes: CorteTurno[];
  observaciones: ObsCalidad[];
}

interface TurnosPorDias {
  fecha: string;
  turnos: TurnoDia[];
}

@Injectable({
  providedIn: 'root'
})
export class PlanillaTurnoLiquidoExcelNuevoService {
  private workbook: Workbook;
  private worksheet: Worksheet;

  private colores = ['ffff99', 'fcd5b4', 'b6dde8', 'd7e4bc', 'e5b8b7', 'ccc1da', 'c4bd96', 'd8d8d8'];
  private grupos: ExportadorDestinoProducto[];

  constructor(
    private procesoService: DatosEmbarquesProcesoService,
    private planoCargaService: PlanoDeCargaService,
    private moduloCargaService: ModuloDeCargaService,
    private confirmationDialogService: ConfirmationDialogService,
    private envioDialogService: EnvioMailDialogService
  ) { }

  // #region Métodos de manejo de excel

  /**
   * Obtiene el objeto referencia a la celda.
   * Si se especifica un rango, hace un merge de las celdas.
   * @param cell
   * @returns
   */
  private celda(cell: string): Cell {
    if (cell.includes(':')) {
      this.worksheet.mergeCells(cell);
      cell = cell.split(':')[0];
    }
    return this.worksheet.getCell(cell);
  }

  private setBgColor(celda: Cell | string, color: string) {
    if (typeof celda == 'string') {
      celda = this.celda(celda);
    }
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color.toUpperCase() } };
  }

  private setBorders(celda: Cell | string, top: BorderStyle, right: BorderStyle, bottom: BorderStyle, left: BorderStyle) {
    if (typeof celda == 'string') {
      celda = this.worksheet.getCell(celda);
    }
    celda.style.border = {
      top: { style: top },
      right: { style: right },
      bottom: { style: bottom },
      left: { style: left }
    };
  }

  private setFont(celda: Cell | string, size: number, bold: boolean = false, color?: string) {
    if (typeof celda == 'string') {
      celda = this.celda(celda);
    }
    celda.font = { name: 'Bookman Old Style', family: 1, size, bold };
    if (color) {
      celda.font.color = { argb: 'FF' + color.toUpperCase() }
    }
  }

  private centrar(celda: Cell) {
    celda.style.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  }
  // #endregion Métodos de manejo de excel

  // #region Estructura Tabla
  private setAnchoColumnas() {
    // Estos son los valores de ancho que me figuraban al inspeccionar el ancho de las columnas en el original
    // Se le suma 0.72 a c/u porque al exportar siempre quedaban atrás por esta cantidad.
    const anchos = [15.14, 11.43, 13.71, 13.71, 13.71, 13.71, 13.71, 13.71, 24.29, 21.57, 13.71, 13.71, 144.14];
    for (let i = 0; i < 15; i++) {
      this.worksheet.getColumn(i + 1).width = anchos[i] + 0.72;
    }

    for (let i = 7; i <= 28; i++) {
      this.worksheet.getRow(i).height = 22.5;
    }
  }

  private async setImgMolinos() {
    this.worksheet.mergeCells('A1:B4'); // Imágen
    let response = await fetch('assets/logo-molinos-excel.jpg');
    let buffer = await response.arrayBuffer();
    const molinosImg = this.workbook.addImage({ buffer, extension: 'png' });
    this.worksheet.addImage(molinosImg, 'A1:B4');
    this.setBorders('A1', 'medium', 'medium', 'medium', 'medium');
  }

  private crearCeldaEncabezado(rango: string, texto: string, size: number, tipo: number = 1, bg: boolean = true) {
    const celda = this.celda(rango);
    this.setBorders(celda, 'medium', 'medium', 'medium', 'medium');
    this.centrar(celda);
    celda.value = texto;
    if (tipo == 1) {
      this.setBgColor(celda, 'c0c0c0');
      celda.font = { name: 'Arial', family: 2, size, bold: true };
    } else {
      if (bg) {
        this.setBgColor(celda, 'fde9d9');
      }
      this.setFont(celda, size);
    }
  }

  private async crearEncabezadoExcel() {
    await this.setImgMolinos();
    this.crearCeldaEncabezado('C1:H2', 'Código F-2288', 12);
    this.crearCeldaEncabezado('I1:M2', 'Revisión 2', 10);
    this.crearCeldaEncabezado('C3:M4', 'PLANILLA GENERAL DE EMBARQUE - Líquidos', 13);
  };

  private crearEncabezadoTablaTurnos() {
    this.crearCeldaEncabezado('A5:A6', 'Fecha', 11, 2);
    this.crearCeldaEncabezado('B5:B6', 'Turno', 11, 2);
    this.crearCeldaEncabezado('C5:J5', 'Exportadores', 13, 2);
    this.crearCeldaEncabezado('K5:M5', '', 10, 1);

    // Celda de nombres de exportadores. C6 A J6
    for (let i = 0; i < 8; i++) {
      const col = String.fromCharCode(67 + i); // 67 = C, 68 = D ... etc
      this.crearCeldaEncabezado(col + '6', '', 11, 2, false);
    }

    this.crearCeldaEncabezado('K6', 'T/Turno', 11, 2, false);
    this.crearCeldaEncabezado('L6', 'T/Día', 11, 2, false);
    this.crearCeldaEncabezado('M6', 'Observaciones/Reclamos por calidad, etc.', 8, 2, false);
  }

  private crearCuerpoTablaTurnos(cantTurnos: number) {
    const lastRow = Math.max(cantTurnos + 6, 27);
    for (let nrow = 7; nrow <= lastRow; nrow++) {
      for (let ncol = 65; ncol <= 77; ncol++) {
        const col = String.fromCharCode(ncol); // 65 = A, 66 = B ... 77 = M
        const celda = this.celda(col + nrow.toString());
        this.centrar(celda);
        this.setFont(celda, 10);
        this.setBorders(celda,
          nrow == 7 ? 'medium' : 'thin', // Arriba
          col == 'M' ? 'medium' : 'thin', // Derecha
          nrow == lastRow ? 'medium' : 'thin', // Abajo
          col == 'A' ? 'medium' : 'thin' // Izquierda
        );

        switch (col) {
          case 'A': // Fecha
            this.setBgColor(celda, 'fde9d9');
            celda.numFmt = 'dd-mmm-yy';
            break;
          case 'B': // Turno
            this.setBgColor(celda, 'fde9d9');
            break;
          case 'K':  // T/Turno
            celda.value = { formula: `IF(SUM(C${nrow}:J${nrow})=0,"",SUM(C${nrow}:J${nrow}))`, date1904: false };
            break;
        }
      }
    }
  }

  private crearDraftAduana(nrow: number) {
    const celsDraft: { cel: string, val: string, bTop: BorderStyle, bBottom: BorderStyle, red?: boolean }[] = [
      { cel: `M${nrow}`, val: 'RESULTADO DE DRAFT DE ADUANA', bTop: 'medium', bBottom: 'dashDot' },
      { cel: `M${nrow + 1}`, val: 'TOTAL:', bTop: 'dashDot', bBottom: 'dotted', red: true },
      { cel: `M${nrow + 2}`, val: 'DIFERENCIA:', bTop: 'dotted', bBottom: 'dotted', red: true },
      { cel: `M${nrow + 3}`, val: '%:', bTop: 'dotted', bBottom: 'medium', red: true },
    ];

    for (const { cel, val, bTop, bBottom, red } of celsDraft) {
      const celda = this.celda(cel);
      celda.value = val;
      this.setBorders(cel, bTop, 'medium', bBottom, 'medium');
      this.setFont(cel, 10, false, red ? 'ff0000' : null);
    }
  }

  private crearFooterTablaTurnos(cantTurnos: number) {
    const nrow = Math.max(cantTurnos + 7, 28);

    const celdas: { cel: string, val: CellValue, size: number }[] = [
      { cel: `A${nrow}:B${nrow}`, val: 'Totales por exportador', size: 10 },
      { cel: `K${nrow}:L${nrow}`, val: 'Totales de Embarque', size: 10 },
      { cel: `K${nrow + 1}:L${nrow + 2}`, val: { formula: `SUM(C${nrow}:J${nrow})`, date1904: false }, size: 12 } // Calculo total de Embarque
    ];
    for (const { cel, val, size } of celdas) {
      const celda = this.celda(cel);
      celda.value = val;
      this.setFont(celda, size);
      this.setBgColor(celda, 'bfbfbf');
      this.setBorders(celda, 'medium', 'medium', 'medium', 'medium');
      this.centrar(celda);
    }

    // Totales por exportador
    for (let ncol = 67; ncol <= 74; ncol++) {
      const col = String.fromCharCode(ncol); // 65 = A, 66 = B ... 77 = M
      const celda = this.celda(col + nrow.toString());
      celda.value = { formula: `SUM(${col}7:${col}${nrow - 1})`, date1904: false };
      this.setFont(celda, 10);
      this.setBorders(celda, 'medium', ncol == 74 ? 'medium' : 'thin', 'medium', ncol == 67 ? 'medium' : 'thin');
      this.centrar(celda);
    }

    this.crearDraftAduana(nrow);
  }

  private crearCeldaExportador(cel: string, val?: CellValue, bg: boolean = false) {
    const celda = this.celda(cel);
    this.setFont(celda, 10);
    this.setBorders(celda, 'medium', 'medium', 'medium', 'medium');
    if (val) {
      celda.value = val;
    }
    if (bg) {
      this.setBgColor(celda, 'bfbfbf');
    }
    this.centrar(celda);
    return celda;
  }

  private crearTablasExportadores(cantTurnos: number) {
    const nrow = Math.max(cantTurnos + 10, 31);
    this.crearCeldaExportador(`B${nrow}:C${nrow}`, 'Plano de carga', true);
    this.crearCeldaExportador(`H${nrow}:I${nrow}`, 'Horarios', true);

    const titulos = ['Exportador', 'Tanques a bordo', '', 'Parcel n°', 'Cantidad', '', 'Destino', 'Exportador', 'Comenzó', 'Finalizó', 'Total a bordo'];

    for (let i = 1; i <= 9; i++) {
      const row = (nrow + i).toString();
      this.worksheet.mergeCells(`B${row}:C${row}`);
      for (let j = 0; j <= 10; j++) {
        const col = String.fromCharCode(65 + j); // 65 = A, 66 = B, etc
        if (i == 1) {
          const titulo = titulos[j];
          if (titulo) {
            this.crearCeldaExportador(col + row, titulo, true);
          }
        } else {
          const celda = this.crearCeldaExportador(col + row);
          celda.style.border.top.style = i == 2 ? 'medium' : 'thin';
          celda.style.border.bottom.style = i == 9 ? 'medium' : 'thin';
        }
      }
    }

    this.crearCeldaExportador(`E${nrow + 10}`, { formula: `SUM(E${nrow + 2}:E${nrow + 9})`, date1904: false }, true);
  }

  private async generarEstructura(cantTurnos: number) {
    this.workbook = new Workbook();
    this.worksheet = this.workbook.addWorksheet('Detalle de Carga', { views: [{ showGridLines: false }] });

    this.setAnchoColumnas();
    await this.crearEncabezadoExcel();
    this.crearEncabezadoTablaTurnos();
    this.crearCuerpoTablaTurnos(cantTurnos);
    this.crearFooterTablaTurnos(cantTurnos);
    this.crearTablasExportadores(cantTurnos);
  }
  // #endregion Estructura Tabla

  // #region Llenado de Datos

  // Ordena primero por fecha y luego por turno
  private ordenarTurnos(planillaTurnos: PlanillaDeTurnos[]) {
    return [...planillaTurnos].sort((a, b) => {
      const fechaA = (a.fecha as string).split('T')[0];
      const fechaB = (b.fecha as string).split('T')[0];

      if (fechaA > fechaB) return 1;
      if (fechaA < fechaB) return -1;
      return a.turnoPuerto.orden - b.turnoPuerto.orden;
    });
  }

  // Crea una combinación de exportador/destino/producto
  private crearGrupo(exportador: string, destino: string, producto: string) {
    const n = this.grupos.length;
    const color = this.colores[n];
    const columna = String.fromCharCode(67 + n) // 67 = C
    const grupo: ExportadorDestinoProducto = { n, exportador, destino, producto, color, columna };
    this.grupos.push(grupo);
    return grupo;
  }

  // Obtiene la combinación de exportador/destino/producto
  private obtenerGrupo(detalle: TurnoDetalleLiquido) {
    const exportador = detalle.exportador.nombre;
    const destino = detalle.destino.nombre;
    const producto = detalle.materialPuerto.descripcionCorta;

    let grupo = this.grupos.find(g => g.exportador == exportador && g.destino == destino && g.producto == producto);
    if (!grupo && this.grupos.length < 8) { // El excel solo tiene lugar para 8 combinaciones
      grupo = this.crearGrupo(exportador, destino, producto);
    }

    return grupo;
  }

  private agruparTurnosPorDia(planillaTurnos: PlanillaDeTurnos[]) {
    const dias: TurnosPorDias[] = [];
    const turnos = this.ordenarTurnos(planillaTurnos);

    for (const turno of turnos) {
      const fecha = (turno.fecha as string).split('T')[0];

      let dia = dias.find(d => d.fecha == fecha);
      if (!dia) {
        dia = { fecha, turnos: [] };
        dias.push(dia);
      }

      let turnoDia = dia.turnos.find(t => t.turno.id == turno.turnoPuerto.id);
      if (!turnoDia) {
        turnoDia = {
          turno: turno.turnoPuerto,
          cortes: turno.moduloDeCargaPlanillaDeTurnosCortes,
          observaciones: turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad,
          detalles: []
        };
        dia.turnos.push(turnoDia);
      }

      // En caso de que el detalle pertenezca al mismo exportador/destino/producto la cantidad se suma
      for (const detalle of turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido) {
        const grupo = this.obtenerGrupo(detalle);
        if (!grupo) {
          continue;
        }
        let grupoCantidad = turnoDia.detalles.find(d => d.grupo.n == grupo.n);
        if (grupoCantidad) {
          grupoCantidad.cantidad += detalle.cantidad;
        } else {
          grupoCantidad = { grupo, cantidad: detalle.cantidad };
          turnoDia.detalles.push(grupoCantidad);
        }
      }
    }

    return dias;
  }

  private llenarColumnasExportadores(cantTurnos: number) {
    for (const grupo of this.grupos) {
      const celda = this.celda(grupo.columna + '6');
      celda.value = grupo.exportador;
      this.setBgColor(celda, grupo.color);

      const rowMax = Math.max(28, cantTurnos + 7);
      const celdaFooter = this.celda(grupo.columna + rowMax);
      this.setBgColor(celdaFooter, grupo.color);
    }
  }

  private obtenerObservaciones(turno: TurnoDia, verObservaciones: boolean, cortesOcultos: number[]) {
    const obsCortes: { hora: string, texto: string }[] = [];
    if (verObservaciones) {
      for (const observacion of turno.observaciones) {
        const hora = observacion.fechaHora.substring(11, 16);
        obsCortes.push({ hora, texto: observacion.observaciones });
      }
    }

    for (const corte of turno.cortes) {
      if (cortesOcultos.includes(corte.id)) {
        continue;
      }
      const hora = corte.horaInicio + ' a ' + corte.horaFin;
      const texto = corte.motivosDeCorte.siglas + ' ' + corte.observaciones;
      obsCortes.push({ hora, texto });
    }

    obsCortes.sort((a, b) => a.hora < b.hora ? -1 : a.hora > b.hora ? 1 : 0);

    return obsCortes.map(o => o.hora + ' ' + o.texto).join(' | ');
  }

  private llenarTurnos(planillaTurnos: PlanillaDeTurnos[], verObservaciones: boolean, cortesOcultos: number[]) {
    this.grupos = [];
    let row = 7;
    const dias = this.agruparTurnosPorDia(planillaTurnos);
    this.llenarColumnasExportadores(planillaTurnos.length);
    for (const { fecha, turnos } of dias) {
      for (const turno of turnos) {
        this.celda('A' + row).value = new Date(fecha + 'T00:00:00');
        this.celda('B' + row).value = (turno.turno.nombre as string).replace('-', ' a ');

        for (const detalle of turno.detalles) {
          const celda = this.celda(detalle.grupo.columna + row);
          celda.value = detalle.cantidad;
          this.setBgColor(celda, detalle.grupo.color);
        }

        const esUltimo = turno == turnos[turnos.length - 1];
        if (esUltimo) {
          // Celda T/Día
          const fromRow = row - (turnos.length - 1);
          const celdaTotalDia = this.celda(`L${fromRow}:L${row}`);
          celdaTotalDia.value = { formula: `IF(SUM(K${fromRow}:K${row})=0,"",SUM(K${fromRow}:K${row}))`, date1904: false };
          this.setBgColor(celdaTotalDia, 'd8d8d8');

          // Borde inferior grueso para el final del día
          for (let i = 65; i <= 77; i++) { // 65 = A, 77 = M
            const col = String.fromCharCode(i);
            this.celda(col + row).style.border.bottom.style = 'medium';
          }
        }

        const observaciones = this.obtenerObservaciones(turno, verObservaciones, cortesOcultos);
        if (observaciones) {
          const celda = this.celda('M' + row);
          celda.value = observaciones;
          this.setBgColor(celda, 'd8d8d8');
          if (observaciones.length > 170 || observaciones.includes('\n')) {
            this.worksheet.getRow(row).height = undefined;
          }
        }

        row++;
      }
    }
  }

  private obtenerHorarioGrupo(grupo: ExportadorDestinoProducto, horarios: HorariosExportador[]) {
    return horarios.find(horario =>
      horario.exportador.nombre == grupo.exportador &&
      horario.destino.nombre == grupo.destino &&
      horario.materialPuerto.descripcionCorta == grupo.producto
    );
  }

  private async agruparBodegasHorarios(horarios: HorariosExportador[]) {
    const planoDeCarga = await this.planoCargaService.obtenerPlanoDeCarga(this.procesoService.getPlanoDeCargaId()).pipe(take(1)).toPromise();
    const bodegasHorarioGrupo: { grupo: ExportadorDestinoProducto, bodega: PlanoDeCargaBodega, cantidad: number, horario: HorariosExportador }[] = [];
    for (const bodega of planoDeCarga.planoDeCargaBodegas) {
      const producto = bodega.materialPuerto.descripcionCorta;

      for (const destinoExp of bodega.destinos) {
        const destino = destinoExp.destino.nombre;
        const exportador = destinoExp.exportador?.nombre;
        const grupo = this.grupos.find(g => g.exportador == exportador && g.destino == destino && g.producto == producto);
        if (!grupo) {
          continue;
        }

        let bodegaGrupo = bodegasHorarioGrupo.find(bg => bg.grupo.n == grupo.n);
        if (bodegaGrupo) {
          bodegaGrupo.cantidad += destinoExp.cantidad;
        } else {
          const horario = this.obtenerHorarioGrupo(grupo, horarios);
          bodegaGrupo = { grupo, bodega, horario, cantidad: destinoExp.cantidad };
          bodegasHorarioGrupo.push(bodegaGrupo);
        }
      }
    }
    return bodegasHorarioGrupo;
  }

  private formatearFechaHora(fechaStr: string): string {
    if (!fechaStr) {
      return '';
    }
    const [fecha, horario] = fechaStr.split("T");
    const [anio, mes, dia] = fecha.split("-");
    const [hs, mins] = horario.split(":");

    return `${dia}/${mes}/${anio.slice(2)} ${hs}:${mins}hs`;
  }

  private async llenarPlanoHorarios(cantTurnos: number, horarios: HorariosExportador[]) {
    const bodegasHorarioGrupo = await this.agruparBodegasHorarios(horarios);

    let nrow = Math.max(cantTurnos + 12, 33);
    for (const bodegaGrupo of bodegasHorarioGrupo) {
      // Plano de carga
      this.celda('A' + nrow).value = bodegaGrupo.grupo.exportador;
      this.celda('B' + nrow).value = bodegaGrupo.bodega.tanqueDeAbordo;
      this.celda('D' + nrow).value = bodegaGrupo.bodega.bodegaParcel;
      this.celda('E' + nrow).value = bodegaGrupo.cantidad;
      // Producto y destino
      this.celda('F' + nrow).value = bodegaGrupo.grupo.producto;
      this.celda('G' + nrow).value = bodegaGrupo.grupo.destino;
      // Horarios
      this.celda('H' + nrow).value = bodegaGrupo.grupo.exportador;
      this.celda('I' + nrow).value = this.formatearFechaHora(bodegaGrupo.horario?.inicio?.toString());
      this.celda('J' + nrow).value = this.formatearFechaHora(bodegaGrupo.horario?.fin?.toString());
      this.celda('K' + nrow).value = bodegaGrupo.horario?.cantidad;

      for (const col of ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']) {
        const celda = this.celda(col + nrow);
        this.setBgColor(celda, bodegaGrupo.grupo.color);
      }

      nrow++;
    }
  }
  // #endregion Llenado de Datos

  private async enviarPlanillaLiquido(base64String: string | ArrayBuffer, idModuloDeCarga: number, idsOcultos: number[], verObservaciones: boolean) {
    const titulo = "Enviar Planilla de Turno Líquido";
    const text = "Cuerpo del Mail:";
    let mail = new Mail();
    try {
      const resp: Mail = await this.moduloCargaService.obtenerDatosMailPlanillaLiquidos(idModuloDeCarga, idsOcultos, verObservaciones).pipe(take(1)).toPromise() as any;
      mail.body = resp.body;
      mail.destinatarios = resp.destinatarios;
      mail.copia = resp.copia;
      mail.titulo = resp.titulo;

      const confirm = await this.envioDialogService.confirm(titulo, text, mail.titulo, 'Enviar', 'Cancelar', 'xl', mail, null, "Para:", "CC:", true);
      if (!confirm) {
        return;
      }

      // Si el email fue modificado por el usuario, el plugin CKEditor rompe las tablas, por lo que hay que repararlas
      if (mail.body.includes('<figure class="table">')) {
        const htmlOriginal = mail.body;

        let htmlLimpio = htmlOriginal
          .replace(/<figure class="table">/g, '')
          .replace(/<\/figure>/g, '')
          .replace(/<th(?!ead)([^>]*)>/g,'<th$1 style="border: 1px solid black; padding: 8px; text-align: left;">')
          .replace(/<td([^>]*)>/g, '<td$1 style="border: 1px solid black; padding: 8px; text-align: left;">');

        mail.body = `<div style="font-family: Arial, sans-serif; font-size: 14px;">${htmlLimpio}</div>`;;
      }

      await this.moduloCargaService.enviarPlanillaTurnoLiquido(idModuloDeCarga, mail, base64String).toPromise();
      this.confirmationDialogService.confirm('Planilla enviada', 'Se ha enviado con éxito la planilla de turnos.', 'Cerrar', '', null, null, Tipoalerta.Success);
    } catch (err) {
      console.error(err);
      this.confirmationDialogService.error('Ocurrió un error al enviar el email');
    }
  }

  public async generarExcel(planillaTurnos: PlanillaDeTurnos[], horarios: HorariosExportador[], verObservaciones: boolean, cortesOcultos: number[], enviar: boolean) {
    await this.generarEstructura(planillaTurnos.length);
    this.llenarTurnos(planillaTurnos, verObservaciones, cortesOcultos);
    await this.llenarPlanoHorarios(planillaTurnos.length, horarios);

    const { id, nombreBuque } = this.procesoService.getEmbarqueSelected();
    const nombreArchivo = id + ' - ' + nombreBuque;
    const buffer = await this.workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const convertBlobToBase64 = (blob: Blob) => new Promise<string | ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

    const base64String = await convertBlobToBase64(blob);
    const moduloDeCargaId = this.procesoService.getModuloDeCargaId();

    if (enviar) {
      await this.enviarPlanillaLiquido(base64String, moduloDeCargaId, cortesOcultos, verObservaciones);
    } else {
      await this.moduloCargaService.guardarPlanillaTurnoLiquido(moduloDeCargaId, base64String).pipe(take(1)).toPromise();
      saveAs(blob, nombreArchivo);
    }
  }

}
