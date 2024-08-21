import { Injectable } from "@angular/core";
import { PlanillaDeTurnos } from "@ScatoModels/planilla-turnos/planilla-de-turnos";
import { BorderStyle, Cell, CellValue, Font, Workbook, Worksheet } from 'exceljs';
import { saveAs } from "file-saver";
import { PlanoDeCargaService } from "./plano-de-carga.service";
import { DatosEmbarquesProcesoService } from "./datosEmbarqueProceso.service";
import { PlanoDeCarga } from "@ScatoModels/plano-de-carga";
import { Mail } from "@ScatoModels/mail";
import { ConfirmationDialogService } from "./confirmation-dialog.service";
import { ModuloDeCargaService } from "./modulo-de-carga.service";
import { EnvioMailDialogService } from "./envio-mail-dialog.service";

interface TurnoPorDia {
  dia: string;
  turnosExportador: TurnoExportador[];
}

interface TurnoExportador {
  turno: string;
  exportador: string;
  bodegas: number[];
  observaciones: string;
}

interface BodegaExcel {
  cantidad: number;
  material: MaterialBodega;
}

interface MaterialBodega {
  nombre: string;
  color: string;
  abbr: string;
  descDb: string;
}

@Injectable({
  providedIn: 'root'
})
export class PanillaTurnoSolidoExcelNuevoService {

  private workbook: Workbook;
  private worksheet: Worksheet;

  private filaUltimaCarga: number = 0;

  private materiales: MaterialBodega[] = [];
  private bodegas: BodegaExcel[] = [];

  constructor(
    private procesoService: DatosEmbarquesProcesoService,
    private planoDeCargaService: PlanoDeCargaService,
    private moduloCargaService: ModuloDeCargaService,
    private confirmationDialogService: ConfirmationDialogService,
    private envioDialogService: EnvioMailDialogService,
  ) { }

  private celda(cell: string): Cell {
    return this.worksheet.getCell(cell);
  }

  private setBgColor(celda: Cell | string, color: string) {
    if (typeof celda == 'string') {
      celda = this.celda(celda);
    }
    celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + color.toUpperCase() } };
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

  public async generarExcel(planillasDeTurnos: PlanillaDeTurnos[], enviar: boolean, verObsCalidad: boolean, cortesOcultos: number[]) {
    const planoDeCarga = await this.planoDeCargaService.obtenerPlanoDeCarga(this.procesoService.getPlanoDeCargaId()).toPromise();

    // Copio la planilla en un nuevo objeto para no modificarle los valores al original
    const turnos: PlanillaDeTurnos[] = JSON.parse(JSON.stringify(planillasDeTurnos));
    this.ocultarCortesObservaciones(turnos, cortesOcultos, verObsCalidad);

    this.iniciarBodegasMateriales(planoDeCarga);

    this.workbook = new Workbook();
    this.worksheet = this.workbook.addWorksheet(
      "Detalle de Carga",
      { views: [{ state: 'frozen', ySplit: 6, activeCell: 'A1', showGridLines: false }] }
    );

    this.setCabeceraExcel();
    this.setPlanillaDeTurnosHeader();
    this.setPlanillaDeTurnos(turnos);
    this.setPlanillaDeTurnosFooter();
    this.setDraftAduana();
    this.setPlanoDeCarga();
    this.setSecuencia();
    this.setHorarios();
    this.setReferencias();
    this.setAnchoColumnas();

    const imgMolinos = await this.getImgMolinos();
    const molinosImg = this.workbook.addImage({ buffer: imgMolinos, extension: 'png' });
    this.worksheet.addImage(molinosImg, 'A1:B4');

    this.ajustesFinales();

    const nombreBuque = this.procesoService.getEmbarqueSelected().nombreBuque;
    const buffer = await this.workbook.xlsx.writeBuffer();
    const archivo = nombreBuque;
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    if (enviar) {
      const ultimoTurno = planillasDeTurnos[0].turnoPuerto.nombre.toString().replace("-", " a ");
      const moduloDeCargaId = this.procesoService.getModuloDeCargaId();
      await this.enviarPlanillaSolido(blob, nombreBuque, moduloDeCargaId, ultimoTurno, cortesOcultos);
    } else {
      saveAs(blob, archivo);
    }
  }

  private async getImgMolinos() {
    let response = await fetch('assets/logo-molinos-excel.jpg');
    let buffer = await response.arrayBuffer();
    return buffer;
  }

  private setAnchoColumnas() {
    // Estos son los valores de ancho que me figuraban al inspeccionar el ancho de las columnas en el original
    // Se le suma 0.72 a c/u porque al exportar siempre quedaban atrás por esta cantidad.
    const anchos = [11.71, 10.57, 9.71, 11, 11, 14.43, 11, 11, 11, 11, 11, 11, 12.43, 10, 98.29]
    for (let i = 0; i < 15; i++) {
      this.worksheet.getColumn(i + 1).width = anchos[i] + 0.72;
    }

    const altos = [12.75, 13.5, 20.25, 5.25];
    for (let i = 0; i < 4; i++) {
      this.worksheet.getRow(i + 1).height = altos[i];
    }
  }

  private setCabeceraExcel() {
    this.worksheet.mergeCells('A1:B4'); // Imágen
    this.worksheet.mergeCells('C1:N2'); // Código F-2287
    this.worksheet.mergeCells('O1:O2'); // Revisión 01
    this.worksheet.mergeCells('C3:O4'); // PLANILLA GENERAL DE EMBARQUE - Sólidos
    this.celda('C1').value = 'Código F-2287';
    this.celda('O1').value = 'Revisión 01';
    this.celda('C3').value = 'PLANILLA GENERAL DE EMBARQUE - Sólidos';

    this.setBorders('A1', 'medium', 'medium', 'medium', 'medium');

    for (const cell of ['C1', 'O1', 'C3']) {
      const currentCell = this.celda(cell);
      this.setBorders(currentCell, 'medium', 'medium', 'medium', 'medium');
      this.centrar(currentCell);

      currentCell.font = {
        name: 'Arial',
        family: 2,
        size: cell == 'C1' ? 12 : cell == 'O1' ? 10 : 13,
        bold: true
      };

      this.setBgColor(currentCell, 'c0c0c0');
    }
  };

  private iniciarBodegasMateriales(planoDeCarga: PlanoDeCarga) {
    this.materiales = [
      { nombre: 'Harina', color: 'ffc000', abbr: 'HP', descDb: 'SBMHP' },
      { nombre: 'PeCaSo', color: '00b050', abbr: 'SHP', descDb: 'SBH' },
      { nombre: 'Maiz', color: 'fabf8f', abbr: 'CORN', descDb: 'CORN' },
      { nombre: 'Trigo', color: 'c4bd97', abbr: 'WHEAT', descDb: 'WHEAT' },
    ];

    for (const bodega of planoDeCarga.planoDeCargaBodegas) {
      let material = this.materiales.find(m => m.descDb == bodega.materialPuerto.descripcionCortaIngles);
      if (!material) {
        const mPuerto = bodega.materialPuerto;
        material = {
          nombre: mPuerto.descripcion,
          color: mPuerto.color.replace('#', ''),
          abbr: mPuerto.descripcionCortaIngles,
          descDb: mPuerto.descripcionCortaIngles
        };
      }

      const bodegaExcel: BodegaExcel = { cantidad: bodega.cantidad, material };
      this.bodegas[bodega.bodegaParcel - 1] = bodegaExcel;
    }
  }

  private setPlanillaDeTurnos(planillasDeTurnos: PlanillaDeTurnos[]) {
    const turnosPorDias = this.agruparTurnos(planillasDeTurnos);

    let nRow = 7;
    for (const turnosDia of turnosPorDias) {
      const fecha = this.formatearFecha(turnosDia.dia);
      const rowFinDia = nRow + turnosDia.turnosExportador.length - 1;

      this.worksheet.mergeCells(nRow, 14, rowFinDia, 14); // T/Dia
      this.worksheet.getRow(nRow).getCell('N').value = { formula: `SUM(M${nRow}:M${rowFinDia})`, date1904: false }; // T/Dia

      for (const turno of turnosDia.turnosExportador) {
        const row = this.worksheet.getRow(nRow);

        row.getCell('A').value = fecha; // Fecha
        row.getCell('B').value = turno.turno.replace('-', ' a '); // Turno
        row.getCell('C').value = turno.exportador; // Exportador

        // Bodegas
        for (let i = 1; i <= 9; i++) {
          const celdaBodega = row.getCell(i + 3);
          celdaBodega.value = turno.bodegas[i - 1] || '';
        }

        // En caso de que hayan otros exportadores y éste sea el primero, combino las celdas de total turno y observaciones.
        const esPrimerExportador = (turnosDia.turnosExportador.find(t => t.turno == turno.turno) == turno);
        const otrosExportadores = turnosDia.turnosExportador.filter(t => t.turno == turno.turno && t.exportador != turno.exportador);
        let rowFinTurno = nRow + otrosExportadores.length;
        if (otrosExportadores.length && esPrimerExportador) {
          this.worksheet.mergeCells(nRow, 13, rowFinTurno, 13); // T/Turno
          this.worksheet.mergeCells(nRow, 15, rowFinTurno, 15); // Observaciones
        }

        // Las observaciones se agruparon previamente sólo para el primer exportador.
        if (esPrimerExportador) {
          row.getCell('M').value = { formula: `SUM(D${nRow}:L${rowFinTurno})`, date1904: false }; // T/Turno
          row.getCell('O').value = turno.observaciones; // Observaciones
        }

        for (let i = 1; i <= 15; i++) {
          const celda = row.getCell(i);
          celda.alignment = { horizontal: i == 15 ? 'left' : 'center', vertical: 'middle' };
          // Las celdas de las bodegas son (i > 3 && i < 13)
          const esBodega = (i > 3 && i < 13);
          const negrita = esBodega || [13, 14].includes(i);
          const fontSize = esBodega ? 9 : i == 14 ? 8 : 10;
          this.setFont(celda, fontSize, negrita);

          if (negrita) {
            celda.numFmt = '0.000';
          }
        }

        this.setDefaultBorders(nRow);
        nRow++;
      }

      const ultimoRowDia = this.worksheet.getRow(nRow - 1);
      for (let i = 1; i <= 15; i++) {
        const celda = ultimoRowDia.getCell(i);
        celda.style.border.bottom.style = 'double';
      }
    }

    // Relleno con vacíos hasta la fila 26
    while (nRow < 27) {
      this.setDefaultBorders(nRow);
      nRow++;
    }

    this.filaUltimaCarga = nRow - 1;
  }

  private setPlanillaDeTurnosHeader() {
    this.worksheet.mergeCells('A5:A6'); // Fecha
    this.worksheet.mergeCells('B5:B6'); // Turno
    this.worksheet.mergeCells('M5:M6'); // T/Turno
    this.worksheet.mergeCells('N5:N6'); // T/Dia
    this.worksheet.mergeCells('O5:O6'); // Observaciones

    const celdasValores = [
      ['A5', 'Fecha'], ['B5', 'Turno'], ['C5', 'Producto'], ['C6', 'Exportador'],
      ['M5', 'T/Turno'], ['N5', 'T/Día'], ['O5', 'Observaciones / Reclamos / Paradas'],
    ];

    for (const [cell, valor] of celdasValores) {
      const celda = this.celda(cell);
      celda.value = valor;
      this.setBgColor(celda, 'f2f2f2');
      this.setFont(celda, 11)
    }

    this.setFont('C5', 9);
    this.setFont('C6', 9);
    this.setFont('O5', 10);

    this.setDefaultBorders(5);
    this.setDefaultBorders(6);

    // Centrar titulos
    for (let i = 1; i <= 15; i++) {
      const celda1 = this.worksheet.getRow(5).getCell(i);
      const celda2 = this.worksheet.getRow(6).getCell(i);
      this.centrar(celda1);
      this.centrar(celda2);
    }

    // Bodegas
    for (let i = 0; i < 9; i++) {
      const celdaNombre = this.worksheet.getRow(6).getCell(i + 4);
      celdaNombre.value = 'Bga. ' + (i + 1).toString();
      this.setFont(celdaNombre, 10);

      const material = this.bodegas[i]?.material;
      if (material) {
        const celdaMaterial = this.worksheet.getRow(5).getCell(i + 4);
        celdaMaterial.value = material.abbr;
        this.setBgColor(celdaMaterial, material.color);
        this.setFont(celdaMaterial, 10);
      }
    }
  }

  private setPlanillaDeTurnosFooter() {
    const nRow = this.filaUltimaCarga + 1;
    this.setDefaultBorders(nRow);
    const row = this.worksheet.getRow(nRow);

    for (let i = 1; i <= 14; i++) {
      const celda = row.getCell(i);
      celda.style.border.bottom.style = 'medium';
      celda.numFmt = '0.000';
      this.setFont(celda, 10);
      this.centrar(celda);
    }

    for (let i = 1; i <= 3; i++) {
      this.setBgColor(row.getCell(i), 'f2f2f2');
    }

    // Bodegas
    for (let i = 4; i <= 12; i++) {
      const celda = row.getCell(i);
      const col = celda.address.charAt(0);
      celda.value = { formula: `SUM(${col}7:${col}${this.filaUltimaCarga})`, date1904: false };
    }

    const celdaTotalTurnos = row.getCell('M');
    celdaTotalTurnos.value = { formula: `SUM(M7:M${this.filaUltimaCarga})`, date1904: false };

    // Celda con total
    this.worksheet.mergeCells(nRow + 1, 13, nRow + 2, 14);
    const celdaTotal = this.worksheet.getRow(nRow + 1).getCell('M');
    this.setBorders(celdaTotal, 'medium', 'medium', 'medium', 'medium');
    this.centrar(celdaTotal);
    celdaTotal.value = { formula: `SUM(D${nRow}:L${nRow})`, date1904: false };
    celdaTotal.numFmt = '0.000';
  }

  private setDraftAduana() {
    const nRow = this.filaUltimaCarga + 1;
    const celdaDraftTitulo = this.worksheet.getRow(nRow).getCell('O');
    const celdaDraftTotal = this.worksheet.getRow(nRow + 1).getCell('O');
    const celdaDraftDiferencia = this.worksheet.getRow(nRow + 2).getCell('O');
    const celdaDraftPorcentaje = this.worksheet.getRow(nRow + 3).getCell('O');

    celdaDraftTitulo.value = 'RESULTADO DE DRAFT DE ADUANA';
    celdaDraftTotal.value = 'TOTAL:';
    celdaDraftDiferencia.value = 'DIFERENCIA:';
    celdaDraftPorcentaje.value = '%:';

    this.centrar(celdaDraftTitulo);

    this.setFont(celdaDraftTitulo, 9);
    this.setFont(celdaDraftTotal, 10, false, 'ff0000');
    this.setFont(celdaDraftDiferencia, 10, false, 'ff0000');
    this.setFont(celdaDraftPorcentaje, 10, false, 'ff0000');

    this.setBorders(celdaDraftTitulo, 'medium', 'medium', 'dashDot', 'medium');
    this.setBorders(celdaDraftTotal, 'dashDot', 'medium', 'dotted', 'medium');
    this.setBorders(celdaDraftDiferencia, 'dotted', 'medium', 'dotted', 'medium');
    this.setBorders(celdaDraftPorcentaje, 'dotted', 'medium', 'medium', 'medium');
  }

  private setPlanoDeCarga() {
    const nRowTitulos = this.filaUltimaCarga + 4;

    this.worksheet.mergeCells(nRowTitulos, 1, nRowTitulos, 4); // Pie Cubico de Bodegas
    this.worksheet.mergeCells(nRowTitulos, 5, nRowTitulos, 7); // Plano de Carga

    const celdasTitulos = ['A', 'E', 'H', 'I', 'J'];
    const titulos = ['Pie Cubico de Bodegas', 'Plano de Carga', 'POUR N°', 'HOLD N°', 'TNS'];

    const rowTitulos = this.worksheet.getRow(nRowTitulos);
    for (let i = 0; i < 5; i++) {
      const celda = rowTitulos.getCell(celdasTitulos[i]);
      celda.value = titulos[i];

      this.centrar(celda);
      this.setFont(celda, i == 0 ? 11 : 10);
      this.setBgColor(celda, 'f2f2f2');
      this.setBorders(celda, 'medium', 'medium', i > 1 ? 'medium' : 'thin', 'medium');
    }

    const romanos = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
    const celdasValores = ['A', 'B', 'E', 'F'];

    for (let i = 1; i <= 10; i++) {
      const nRow = nRowTitulos + i;
      this.worksheet.mergeCells(nRow, 2, nRow, 4);
      this.worksheet.mergeCells(nRow, 6, nRow, 7);

      const row = this.worksheet.getRow(nRow);
      this.setDefaultBorders(nRow, 7);

      let valores: CellValue[];
      let bgColor: string;
      if (i < 10) {
        const bodega = this.bodegas[i - 1];
        valores = ['Bga. ' + romanos[i - 1], '', 'Bga.' + i, bodega?.cantidad || ''];
        bgColor = bodega?.material.color || '';
      } else {
        valores = [
          'TOTAL:', { formula: `SUM(B${nRowTitulos + 1}:B${nRowTitulos + 9})`, date1904: false },
          'TOTAL:', { formula: `SUM(F${nRowTitulos + 1}:F${nRowTitulos + 9})`, date1904: false },
        ];
        bgColor = 'bfbfbf';
      }

      if (bgColor) {
        this.setBgColor(row.getCell('F'), bgColor);
      }

      for (let j = 0; j < 4; j++) {
        const columna = celdasValores[j];
        const celda = row.getCell(columna);
        celda.value = valores[j];

        let fontSize: number;
        if (i < 10) {
          fontSize = j % 2 ? 10 : 11;
        } else {
          fontSize = j == 3 ? 10 : 12;
        }

        this.centrar(celda);
        this.setFont(celda, fontSize);

        if (j > 1) {
          celda.style.border.right = undefined;
        }

        if (i == 10) {
          celda.style.border.bottom.style = 'medium';
        }
      }

      row.getCell('B').border.right.style = 'medium';
      row.getCell('B').numFmt = '0.000';
      row.getCell('F').numFmt = '0.00';
    }
  }

  private setSecuencia() {
    const nRowTitulos = this.filaUltimaCarga + 4;

    this.worksheet.mergeCells(`I${nRowTitulos - 1}:J${nRowTitulos - 1}`);
    const cellSecuencia = this.celda(`I${nRowTitulos - 1}`);
    cellSecuencia.value = 'SECUENCIA';
    this.setFont(cellSecuencia, 10);
    this.setBgColor(cellSecuencia, 'f2f2f2');
    this.setBorders(cellSecuencia, 'medium', 'medium', 'medium', 'medium');
    this.centrar(cellSecuencia);

    const arial = (bold: boolean = false): Partial<Font> => ({ name: 'Arial', family: 2, size: 10, bold });
    for (let i = 0; i < 8; i++) {
      const nRow = nRowTitulos + 1 + (i * 2);

      this.worksheet.mergeCells(nRow, 8, nRow + 1, 8);

      const celdaPour = this.worksheet.getRow(nRow).getCell('H');
      celdaPour.value = i + 1;
      celdaPour.style.font = arial();
      this.centrar(celdaPour);
      this.setBorders(celdaPour, 'medium', 'medium', 'medium', 'medium');
      if (i < 5) {
        celdaPour.border.left = undefined;
      }

      for (let j = 0; j < 2; j++) {
        const celdaHold = this.worksheet.getCell(nRow + j, 9);
        const celdaTns = this.worksheet.getCell(nRow + j, 10);

        celdaHold.style.font = arial();
        celdaTns.style.font = arial(true);

        this.setBorders(celdaHold, j == 0 ? 'medium' : 'thin', 'thin', j == 1 ? 'medium' : 'thin', 'medium');
        this.setBorders(celdaTns, j == 0 ? 'medium' : 'thin', 'medium', j == 1 ? 'medium' : 'thin', 'thin');
        this.centrar(celdaHold);
        this.centrar(celdaTns);
      }
    }
  }

  private setHorarios() {
    const nRowTitulos = this.filaUltimaCarga + 17;

    this.worksheet.mergeCells(nRowTitulos - 1, 1, nRowTitulos - 1, 2);
    const celdaHorarios = this.worksheet.getRow(nRowTitulos - 1).getCell('A');
    celdaHorarios.value = 'HORARIOS';
    this.setBorders(celdaHorarios, 'medium', 'medium', 'medium', 'medium');
    this.setFont(celdaHorarios, 10);
    this.setBgColor(celdaHorarios, 'f2f2f2');
    this.centrar(celdaHorarios);

    const cols = ['A', 'B', 'D', 'F'];
    const titulos = ['Expo.', 'Comenzó', 'Finalizó', 'A bordo'];
    for (let i = 0; i < 9; i++) {
      const row = this.worksheet.getRow(nRowTitulos + i);

      this.worksheet.mergeCells(nRowTitulos + i, 2, nRowTitulos + i, 3);
      this.worksheet.mergeCells(nRowTitulos + i, 4, nRowTitulos + i, 5);

      if (i > 0) {
        this.setDefaultBorders(nRowTitulos + i, 6);
      }

      for (let j = 0; j < 4; j++) {
        const col = cols[j];
        const celda = row.getCell(col);
        let fontSize = 10

        if (i == 0) { // Fila de títulos
          celda.value = titulos[j];
          fontSize = 11;
          this.setBorders(celda, 'medium', 'medium', 'medium', 'medium');
          this.setBgColor(celda, 'f2f2f2');
        } else if (i == 8) {
          celda.style.border.bottom.style = 'medium';
        }

        if (i > 0 && j == 3) { // A bordo
          celda.numFmt = '0.00';
          celda.style.font = { name: 'Arial', family: 2, size: 10 };
        }

        this.setFont(celda, fontSize);
        this.centrar(celda);
      }
    }

  }

  private setReferencias() {
    const nRow = this.filaUltimaCarga + 7;

    this.worksheet.mergeCells(nRow - 1, 12, nRow - 1, 13);
    const celdaTitulo = this.worksheet.getRow(nRow - 1).getCell('L');
    celdaTitulo.value = 'Referencias';
    this.setFont(celdaTitulo, 11);
    this.centrar(celdaTitulo);
    celdaTitulo.style.font.underline = true;

    for (let i = 0; i < this.materiales.length; i++) {
      const material = this.materiales[i];
      const row = this.worksheet.getRow(nRow + i);

      this.worksheet.mergeCells(nRow + i, 13, nRow + i, 14);

      const celdaNombre = row.getCell('L');
      celdaNombre.value = material.nombre;
      this.setFont(celdaNombre, 11);

      const celdaColor = row.getCell('M');
      this.setBgColor(celdaColor, material.color);
      this.setBorders(celdaColor, 'medium', 'medium', 'medium', 'medium');
    }
  }

  /**
   * Setea wrap para las observaciones y ajusta el ancho de la columna de exportador
   */
  private ajustesFinales() {
    let maxWidth = 9.71;
    for (let i = 7; i <= this.filaUltimaCarga; i++) {
      const row = this.worksheet.getRow(i);
      const celdaObservaciones = row.getCell('O');
      celdaObservaciones.alignment = { wrapText: true };

      const celdaExportador = row.getCell('C');
      const cellWidth = celdaExportador.value ? celdaExportador.value.toString().length * 1.2 : 0;
      if (cellWidth > maxWidth) {
        maxWidth = cellWidth;
      }
    }
    this.worksheet.getColumn('C').width = maxWidth;
  }

  /**
   * Agrupa los turnos por día, y dentro de cada día suma los valores por bodega y exportador.
   */
  private agruparTurnos(planillasDeTurnos: PlanillaDeTurnos[]): TurnoPorDia[] {
    const turnosPorDias: TurnoPorDia[] = [];
    for (const planillaTurno of planillasDeTurnos) {
      // Aprovecho que ya vienen ordenados por fecha y turno para agruparlos
      const dia = planillaTurno.fecha.split('T')[0] as string;
      let turnoPorDia = turnosPorDias.find(td => td.dia == dia);
      if (!turnoPorDia) {
        turnoPorDia = { dia, turnosExportador: [] };
        turnosPorDias.push(turnoPorDia);
      }

      const turno = planillaTurno.turnoPuerto.nombre;

      for (const detalle of planillaTurno.moduloDeCargaPlanillaDeTurnosDetallesSolido) {
        const turnoExportador = this.getTurnoExportador(turnoPorDia, turno, detalle.exportador.nombre);
        const nBodega = Number(detalle.bodega.nombre.split(' ').pop());
        turnoExportador.bodegas[nBodega - 1] += (detalle.cantidad / 1000);
      }

      for (const corte of planillaTurno.moduloDeCargaPlanillaDeTurnosCortes) {
        const turnoExportador = this.getTurnoExportador(turnoPorDia, turno);
        if (turnoExportador.observaciones) {
          turnoExportador.observaciones += ' | ';
        }

        turnoExportador.observaciones += `${corte.horaInicio} a ${corte.horaFin} ${corte.motivosDeCorte.nombre}`;
        if (corte.observaciones) {
          turnoExportador.observaciones += ' ' + corte.observaciones;
        }
      }

      for (const observacionCalidad of planillaTurno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad) {
        const turnoExportador = this.getTurnoExportador(turnoPorDia, turno);
        if (turnoExportador.observaciones) {
          turnoExportador.observaciones += ' | ';
        }

        turnoExportador.observaciones += observacionCalidad.observaciones;
      }
    }
    return turnosPorDias;
  }

  /**
   * Obtiene el turno correspondiente basandose en el turno y el exportador especificado.
   * En caso de que el turno no exista, lo crea.
   * En caso de que no se especifique el exportador, se toma el primero.
   */
  private getTurnoExportador(turnoPorDia: TurnoPorDia, turno: string, exportador: string = '') {
    let turnoExportador = turnoPorDia.turnosExportador.find(te => te.turno == turno && (exportador == '' || te.exportador == exportador));
    if (!turnoExportador) {
      turnoExportador = {
        turno,
        exportador: exportador,
        bodegas: new Array(9).fill(0), // [0, 0, 0, 0, 0, 0, 0, 0, 0]
        observaciones: ''
      };
      turnoPorDia.turnosExportador.push(turnoExportador);
    }
    return turnoExportador;
  }

  /**
   * Convierte un día de formato 'yyyy-mm-dd' en 'dd-mmm-yy'.
   * Ej: '2024-08-16' => '16-ago-24'
   */
  private formatearFecha(fecha: string) {
    let [anio, mes, dia] = fecha.split('-');
    anio = anio.slice(-2);
    const nMes = Number(mes) - 1;
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    mes = meses[nMes];
    dia = Number(dia).toString();
    return dia + '-' + mes + '-' + anio;
  }

  /**
   * Establece los bordes por default de cada fila.
   * Siempre el primero y el último serán gruesos, mientras que los intermedios finos.
   */
  private setDefaultBorders(nRow: number, lastCol: number = 15) {
    const row = this.worksheet.getRow(nRow);
    for (let i = 1; i <= lastCol; i++) {
      const celda = row.getCell(i);
      this.setBorders(celda, 'thin', i == lastCol ? 'medium' : 'thin', 'thin', i == 1 ? 'medium' : 'thin');
    }
    return;
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

  private centrar(celda: Cell) {
    celda.style.alignment = { horizontal: 'center', vertical: 'middle' };
  }

  private async enviarPlanillaSolido(blob: Blob, nombreBuque: string, idModuloDeCarga: number, ultimoTurno: string, cortesOcultos: number[]) {
    const titulo = "Enviar Planilla de Turno Sólido";
    const asunto = "Turno " + ultimoTurno + " - " + nombreBuque + " - MUELLE SAN BENITO"
    let mail = new Mail();
    try {
      const resp: Mail = await this.moduloCargaService.obtenerDatosMailPlanillaSolidos(idModuloDeCarga, cortesOcultos).toPromise() as any;
      mail.body = resp.body;
      mail.destinatarios = resp.destinatarios;
      mail.copia = resp.copia;
      mail.titulo = asunto;

      const confirm = await this.envioDialogService.confirm(titulo, 'Cuerpo del Mail:', asunto, 'Enviar', 'Cancelar', 'xl', mail, null, "Para:", "CC:", true);
      if (!confirm) {
        return;
      }

      const convertBlobToBase64 = (blob: Blob) => new Promise<string | ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader;
        reader.onerror = reject;
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });

      const base64String = await convertBlobToBase64(blob);

      await this.moduloCargaService.enviarPlanillaTurnoSolido(idModuloDeCarga, mail, base64String).toPromise();
      this.confirmationDialogService.exito('Se ha enviado con éxito la planilla de turnos.', 'Planilla enviada');
    } catch (err) {
      console.error(err);
      this.confirmationDialogService.error('Ocurrió un error al enviar el email');
    }
  }

  private ocultarCortesObservaciones(planillaDeTurnos: PlanillaDeTurnos[], ids: number[], verObsCalidad: boolean) {
    for (const turno of planillaDeTurnos) {
      turno.moduloDeCargaPlanillaDeTurnosCortes = turno.moduloDeCargaPlanillaDeTurnosCortes.filter(t => !ids.includes(t.id));
      if (!verObsCalidad) {
        turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad = [];
      }
    }
  }
}
