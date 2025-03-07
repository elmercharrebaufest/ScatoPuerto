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
import { HorariosExportador } from "@ScatoModels/calidad/horarios-exportador";
import { take } from "rxjs/operators";
import { NirManualPuerto } from "@ScatoModels/nir";

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
  id?: number;
  nombre: string;
  color: string;
  abbr: string;
  descDb: string;
  maximo: number;
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
    private envioDialogService: EnvioMailDialogService
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

  public async generarExcel(planillasDeTurnos: PlanillaDeTurnos[], enviar: boolean, verObsCalidad: boolean, cortesOcultos: number[], horarios: HorariosExportador[], esFin: boolean = false) {
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
    this.setHorarios(horarios);
    this.setReferencias();
    this.setAnchoColumnas();

    const imgMolinos = await this.getImgMolinos();
    const molinosImg = this.workbook.addImage({ buffer: imgMolinos, extension: 'png' });
    this.worksheet.addImage(molinosImg, 'A1:B4');

    this.ajustesFinales();

    await this.generarNIR();

    const { id, nombreBuque } = this.procesoService.getEmbarqueSelected();
    const buffer = await this.workbook.xlsx.writeBuffer();
    const archivo = id + ' - ' + nombreBuque;
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
      await this.enviarPlanillaSolido(base64String, moduloDeCargaId, cortesOcultos, verObsCalidad, esFin);
    } else {
      await this.moduloCargaService.guardarPlanillaTurnoSolido(moduloDeCargaId, base64String).pipe(take(1)).toPromise();
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
      { nombre: 'Harina', color: 'ffc000', abbr: 'HP', descDb: 'SBMHP', maximo: 0 },
      { nombre: 'PeCaSo', color: '00b050', abbr: 'SHP', descDb: 'SBH', maximo: 0 },
      { nombre: 'Maiz', color: 'fabf8f', abbr: 'CORN', descDb: 'CORN', maximo: 0 },
      { nombre: 'Trigo', color: 'c4bd97', abbr: 'WHEAT', descDb: 'WHEAT', maximo: 0 },
    ];

    for (const bodega of planoDeCarga.planoDeCargaBodegas) {
      const mPuerto = bodega.materialPuerto;
      let material = this.materiales.find(m => m.descDb == mPuerto.descripcionCortaIngles);
      if (!material) {
        material = {
          nombre: mPuerto.descripcion,
          color: mPuerto.color.replace('#', ''),
          abbr: mPuerto.descripcionCortaIngles,
          descDb: mPuerto.descripcionCortaIngles,
          maximo: 0
        };
      }
      material.id = mPuerto.id;

      const bodegaExcel: BodegaExcel = { cantidad: bodega.cantidad, material };
      this.bodegas[bodega.bodegaParcel - 1] = bodegaExcel;
    }

    for (const cargaComercial of planoDeCarga.cargasComerciales) {
      const material = this.materiales.find(m => m.descDb == cargaComercial.materialPuerto.descripcionCortaIngles);
      if (material) {
        material.maximo += cargaComercial.cantidad;
      }
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

  private setHorarios(horarios: HorariosExportador[]) {
    const nRowTitulos = this.filaUltimaCarga + 17;

    this.worksheet.mergeCells(nRowTitulos - 1, 1, nRowTitulos - 1, 2);
    const celdaHorarios = this.worksheet.getRow(nRowTitulos - 1).getCell('A');
    celdaHorarios.value = 'HORARIOS';
    this.setBorders(celdaHorarios, 'medium', 'medium', 'medium', 'medium');
    this.setFont(celdaHorarios, 10);
    this.setBgColor(celdaHorarios, 'f2f2f2');
    this.centrar(celdaHorarios);

    const cols = ['A', 'B', 'D', 'F', 'G'];
    const titulos = ['Expo.', 'Comenzó', 'Finalizó', 'A bordo', 'Prod.'];

    for (let i = 0; i <= horarios.length; i++) {
      const row = this.worksheet.getRow(nRowTitulos + i);

      this.worksheet.mergeCells(nRowTitulos + i, 2, nRowTitulos + i, 3);
      this.worksheet.mergeCells(nRowTitulos + i, 4, nRowTitulos + i, 5);

      if (i > 0) {
        this.setDefaultBorders(nRowTitulos + i, 7);
      }

      for (let j = 0; j < 5; j++) {
        const col = cols[j];
        const celda = row.getCell(col);
        let fontSize = 10;

        if (i === 0) { // Fila de títulos
          celda.value = titulos[j];
          fontSize = 11;
          this.setBorders(celda, 'medium', 'medium', 'medium', 'medium');
          this.setBgColor(celda, 'f2f2f2');
        } else {
          const horario = horarios[i - 1]; // Obtenemos el objeto HorariosExportador correspondiente
          switch (j) {
            case 0: // Exportador
              celda.value = horario.exportador?.nombre; // Asegúrate de que `exportador.nombre` sea el valor deseado
              break;
            case 1: // Comenzó
              celda.value = horario.inicio ? this.formatFechaHora(new Date(horario.inicio)) : ''; // Formateo de fecha
              break;
            case 2: // Finalizó
              celda.value = horario.fin ? this.formatFechaHora(new Date(horario.fin)) : ''; // Formateo de fecha
              break;
            case 3: // Cantidad
              celda.value = horario.cantidad;
              celda.numFmt = '0.00'; // Formato numérico
              break;
            case 4: // Material
              celda.value = horario.materialPuerto?.descripcionCortaIngles;
              break;
          }
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

      const celdaMaterial = row.getCell('M');
      this.setBgColor(celdaMaterial, material.color);
      this.setBorders(celdaMaterial, 'medium', 'medium', 'medium', 'medium');
      if (material.maximo) {
        celdaMaterial.value = material.maximo.toLocaleString('es-AR') + ' max';
        this.centrar(celdaMaterial);
      }
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

      // Esta condición sólo se dará con turnos completamente vacíos
      if (!turnoPorDia.turnosExportador.some(te => te.turno == turno)) {
        const turnoExportador = this.crearTurnoExportador(turno);
        turnoPorDia.turnosExportador.push(turnoExportador);
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
      turnoExportador = this.crearTurnoExportador(turno, exportador);
      turnoPorDia.turnosExportador.push(turnoExportador);
    }
    return turnoExportador;
  }

  private crearTurnoExportador(turno: string, exportador: string = ''): TurnoExportador {
    return {
      turno,
      exportador: exportador,
      bodegas: new Array(9).fill(0), // [0, 0, 0, 0, 0, 0, 0, 0, 0]
      observaciones: ''
    };
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

  private async enviarPlanillaSolido(base64String: string | ArrayBuffer, idModuloDeCarga: number, cortesOcultos: number[], verObsCalidad: boolean, esFin: boolean) {
    const titulo = "Enviar Planilla de Turno Sólido";
    let mail = new Mail();
    try {
      const resp: Mail = await this.moduloCargaService.obtenerDatosMailPlanillaSolidos(idModuloDeCarga, cortesOcultos, verObsCalidad, esFin).pipe(take(1)).toPromise() as any;
      mail.body = resp.body;
      mail.destinatarios = resp.destinatarios;
      mail.copia = resp.copia;
      mail.titulo = resp.titulo;

      const confirm = await this.envioDialogService.confirm(titulo, 'Cuerpo del Mail:', mail.titulo, 'Enviar', 'Cancelar', 'xl', mail, null, "Para:", "CC:", true);
      if (!confirm) {
        return;
      }

      await this.moduloCargaService.enviarPlanillaTurnoSolido(idModuloDeCarga, mail, base64String).toPromise();
      this.confirmationDialogService.exito('Se ha enviado con éxito la planilla de turnos.', 'Planilla enviada');
    } catch (err) {
      console.error(err);
      this.confirmationDialogService.error('Ocurrió un error al enviar el email');
    }
  }

  private ocultarCortesObservaciones(planillaDeTurnos: PlanillaDeTurnos[], ids: number[], verObsCalidad: boolean) {
    for (const turno of planillaDeTurnos) {
      turno.moduloDeCargaPlanillaDeTurnosCortes = turno.moduloDeCargaPlanillaDeTurnosCortes.filter(c => c.motivosDeCorte.siglas != 'N' && !ids.includes(c.id));
      if (!verObsCalidad) {
        turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad = [];
      }
    }
  }


  private formatFechaHora(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  }

  //#region NIR
  private async generarNIR() {
    const moduloDeCargaId = this.procesoService.getModuloDeCargaId();
    const nir = await this.moduloCargaService.obtenerNir(moduloDeCargaId).pipe(take(1)).toPromise();
    if (!nir?.length) {
      return;
    }
    const nombreBuque = this.procesoService.getEmbarqueSelected().nombreBuque;

    this.worksheet = this.workbook.addWorksheet('NIR');

    this.worksheet.mergeCells('B2:M2');
    const celTitulo = this.celda('B2');
    celTitulo.value = 'Resultados según Nir Puerto.'
    celTitulo.font = { name: 'Calibri', family: 2, size: 14, bold: true };
    this.centrar(celTitulo);

    const celLabelBuque = this.celda('B4');
    celLabelBuque.value = 'Buque:';
    celLabelBuque.font = { name: 'Calibri', family: 2, size: 12, bold: true };
    this.setBgColor(celLabelBuque, 'd8d8d8');
    this.setBorders(celLabelBuque, 'medium', 'medium', 'medium', 'medium');
    this.centrar(celLabelBuque);

    this.worksheet.mergeCells('C4:E4');
    const celBuque = this.celda('C4');
    celBuque.value = nombreBuque.toUpperCase();
    celBuque.font = { name: 'Calibri', family: 2, size: 12, bold: true };
    this.setBgColor(celBuque, 'd8d8d8');
    this.setBorders(celBuque, 'medium', 'medium', 'medium', 'medium');
    this.centrar(celBuque);

    this.llenarMano(1, nir);
    this.llenarMano(2, nir);

    this.configurarPromediosNIR();

    this.setAnchoColumnasNIR();
  }

  private llenarMano(numMano: number, nir: NirManualPuerto[]) {
    const nombreMano = 'mano' + numMano;
    const registros = nir.filter(n => n.mano == nombreMano);
    if (!registros?.length) {
      return;
    }
    //11: Maíz - 17: Trigo.
    const material = registros[0].material_id == 11 ? 'Maíz' : 'Trigo';
    const color = material == 'Maíz' ? '99cc00' : 'ff9900';

    const primerCol = numMano == 1 ? 'B' : 'H';
    const ultimaCol = String.fromCharCode(primerCol.charCodeAt(0) + 5);

    this.worksheet.mergeCells(`${primerCol}5:${ultimaCol}5`);
    const celNombreMano = this.celda(primerCol + '5');
    celNombreMano.value = `Mano ${numMano}: ${material}`;
    celNombreMano.font = { name: 'Arial', family: 2, size: 10 };
    this.setBgColor(celNombreMano, color);
    this.setBorders(celNombreMano, 'medium', 'medium', 'medium', 'medium');
    this.centrar(celNombreMano);

    const titulos = ['Fecha', 'Hora', '% HD', 'PH', 'Origen', 'Bodega'];
    for (let i = 0; i < titulos.length; i++) {
      const titulo = titulos[i];
      const col = String.fromCharCode(primerCol.charCodeAt(0) + i);
      const celTitulo = this.celda(col + '6');
      celTitulo.value = titulo;
      celTitulo.font = { name: 'Calibri', family: 2, size: 11, bold: true };
      this.setBgColor(celTitulo, 'd8d8d8');
      this.setBorders(celTitulo, 'medium', 'medium', 'medium', 'medium');
      this.centrar(celTitulo);
    }

    // Armado de cuerpo de tabla
    for (let i = 7; i <= 43; i++) {
      const colIndex = primerCol.charCodeAt(0);
      const bordeSup: BorderStyle = i == 7 ? 'medium' : 'thin';
      const bordeInf: BorderStyle = i == 43 ? 'medium' : 'thin';
      for (let j = colIndex; j <= colIndex + 5; j++) {
        const col = String.fromCharCode(j);
        const celda = this.celda(col + i.toString());
        celda.font = { name: 'Calibri', family: 2, size: 12 };
        this.setBorders(celda, bordeSup, col == ultimaCol ? 'medium' : 'thin', bordeInf, col == primerCol ? 'medium' : 'thin');
        this.centrar(celda);
      }
    }

    // Llenado cuerpo de tabla
    for (let i = 0; i < registros.length; i++) {
      const regNir = registros[i];
      let col = primerCol;
      const siguenteCol = () => String.fromCharCode(col.charCodeAt(0) + 1);

      const fecha = new Date(regNir.fecha + 'Z');
      const celFecha = this.celda(col + (i + 7).toString());
      celFecha.value = fecha;
      celFecha.numFmt = 'dd-MMM';
      col = siguenteCol();

      const celHora = this.celda(col + (i + 7).toString());
      celHora.value = fecha;
      celHora.numFmt = 'HH:mm';
      col = siguenteCol();

      const celHD = this.celda(col + (i + 7).toString());
      celHD.value = +regNir.hd;
      celHD.numFmt = '0.00';
      col = siguenteCol();

      const celPH = this.celda(col + (i + 7).toString());
      celPH.value = +regNir.ph;
      celHD.numFmt = '0.00';
      col = siguenteCol();

      const celOrigen = this.celda(col + (i + 7).toString());
      celOrigen.value = regNir.origen;
      col = siguenteCol();

      const celBodega = this.celda(col + (i + 7).toString());
      celBodega.value = (regNir.bodega as any).nombre.split(' ').pop();
    }
  }

  private configurarPromediosNIR() {
    this.worksheet.mergeCells('B44:C44');
    const celLblPromedio = this.celda('B44');
    celLblPromedio.value = 'Promedio';
    celLblPromedio.font = { name: 'Calibri', family: 2, size: 12, bold: true };
    this.setBorders(celLblPromedio, 'medium', 'medium', 'medium', 'medium');
    this.centrar(celLblPromedio);

    const promedios = [
      { celda: 'D44', formula: 'AVERAGE(D7:D43)' },
      { celda: 'E44', formula: 'AVERAGE(E7:E43)' },
      { celda: 'J44', formula: 'AVERAGE(J7:J43)' },
      { celda: 'K44', formula: 'AVERAGE(K7:K43)' },
    ];

    for (const { celda, formula } of promedios) {
      const cel = this.celda(celda);
      cel.value = { formula: `IFERROR(${formula};"")`, date1904: false };
      cel.font = { name: 'Calibri', family: 2, size: 12, bold: true };
      cel.numFmt = '0.00';
      this.setBorders(cel, 'medium', 'medium', 'medium', 'medium');
      this.centrar(cel);
    }

    this.worksheet.mergeCells('B46:C46');
    this.worksheet.mergeCells('B47:C47');

    const finales = [
      { row: '46', lbl: 'Promedio HD TOTAL:', formula: 'AVERAGE(D44;J44)/100' },
      { row: '47', lbl: 'Promedio HD TOTAL:', formula: 'AVERAGE(E44;K44)/100' },
    ];

    for (const { row, lbl, formula } of finales) {
      const celdaLbl = this.celda('B' + row);
      celdaLbl.value = lbl;
      celdaLbl.font = { name: 'Calibri', family: 2, size: 13, bold: true };
      this.centrar(celdaLbl);

      const celdaFormula = this.celda('D' + row);
      celdaFormula.value = { formula, date1904: false };
      celdaFormula.font = { name: 'Calibri', family: 2, size: 13, bold: true };
      celdaFormula.numFmt = '0.00" "%';
      this.centrar(celdaFormula);
    }
  }

  private setAnchoColumnasNIR() {
    // Estos son los valores de ancho que me figuraban al inspeccionar el ancho de las columnas en el original
    // Se le suma 0.72 a c/u porque al exportar siempre quedaban atrás por esta cantidad.
    const anchos = [10.71, 11.86, 10.86, 12.71, 10.71, 18.86, 8.43, 11.86, 10.86, 12.71, 10.71, 18.86, 8.43];
    for (let i = 0; i < anchos.length; i++) {
      this.worksheet.getColumn(i + 1).width = anchos[i] + 0.72;
    }
  }
  //#endregion NIR
}
