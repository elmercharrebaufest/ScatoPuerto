import { Injectable } from '@angular/core';
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';
import { Mail } from '@ScatoModels/mail';
import { CorteTurno } from '@ScatoModels/planilla-turnos/corte-turno';
import { PlanillaDeTurnos } from '@ScatoModels/planilla-turnos/planilla-de-turnos';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';
import { ConfirmationDialogService } from './confirmation-dialog.service';
import { ModuloDeCargaService } from './modulo-de-carga.service';

@Injectable({
    providedIn: 'root'
  })
export class PlanillaTurnoSolidoExcelService {

    constructor(
        private moduloCargaService: ModuloDeCargaService,
        private confirmationDialogService: ConfirmationDialogService,

      ) {
    }

    private async getImgMolinos() {
        let response = await fetch('assets/iconMolinos.png');
        let buffer = await response.arrayBuffer();
        return buffer;
    }

    private formatoFechaHora(esFecha, fecha) {
       let formatoFecha = '';
       const fechaHora = new Date(fecha);
       if (esFecha) {
         formatoFecha = ("00" + fechaHora.getDate()).slice(-2) + '/' +
           ("00" + (fechaHora.getMonth() + 1)).slice(-2) + '/' +
           fechaHora.getFullYear().toString();
       } else {
         formatoFecha = ("00" + fechaHora.getHours()).slice(-2) + ':' +
           ("00" + fechaHora.getMinutes()).slice(-2)
       }
       return formatoFecha;
    }
    private getDiferenciaCortes(inicio, fin){
       const fechaValInicio = '1900-01-01 ' + inicio;
       const fechaValFin = '1900-01-01 ' + fin;
       const fechaInicio = new Date(fechaValInicio);
       const fechaFin = new Date(fechaValFin);
       const horaInicio = fechaInicio.getHours();
       const horaFin = fechaFin.getHours();
       const minInicio = fechaInicio.getMinutes();
       const minFin = fechaFin.getMinutes();
       const horas = horaFin - horaInicio;
       const minutos= minFin - minInicio;
       let resultado = '';
       if(horas > 0)
         resultado = horas.toString() + '.' + minutos.toString();
       else
         resultado = minutos.toString();
       return resultado;
    }


  async generarExcelPorParcel(planillaDeTurnos, procesoService, lineas,   bEnviarPlanilla: boolean) {

    let fname = "Planilla_Recibidores_Sol";
    const headerDetalles = ["Exportador", "Bodega", "Producto", "Destino", "Cant."];
    const headerCortes = ["Motivo", "Inicio", "Fin", "Tiempo total", "Observaciones"];
    const headerObservaciones = ["Fecha", "Hora", "Observación de calidad"];

    // let datosModal = obtenerDatosExportarParcel();
    const imgMolinos = await this.getImgMolinos();
    // datosModal.parcelSeleccionados.forEach((element, i) => {
    let workbook = new Workbook();

    const molinosImg = workbook.addImage({
      buffer: imgMolinos,
      extension: 'png',
    });

    let worksheet = workbook.addWorksheet("Turnos",
      {
        views: [
          { state: 'frozen', activeCell: 'A1', showGridLines: false }
        ]
      });

    //Seteo el ancho de todas las columnas.
    worksheet.columns = [
      { width: 12 },
      { width: 11 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 30 },
      { width: 20 },
      { width: 11 },
      { width: 16 },
      { width: 11 },  
      { width: 17 },
      { width: 11 },
      { width: 11 },
    ];

    //Merge cells cabecera
    worksheet.mergeCells('A1:B4');
    worksheet.mergeCells('C1:H3');
    worksheet.mergeCells('I1:M3');
    worksheet.mergeCells('C4:M4');
    worksheet.mergeCells('A5:B5');
    worksheet.mergeCells('C5:M5');
    worksheet.addImage(molinosImg, 'A1:B4');
    ['C1', 'I1', 'C4', 'A5', 'C5'].forEach((cell) => {
      let currentCell = worksheet.getCell(cell);
      currentCell.border = {
        top: { style: 'medium' },
        left: { style: 'medium' },
        bottom: { style: 'medium' },
        right: { style: 'medium' },
      };
      currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
      currentCell.font = {
        name: 'Arial',
        family: 2,
        size: 12,
        bold: true
      }
    });
    ['C1', 'I1', 'C4'].forEach((cell) => {
      let currentCell = worksheet.getCell(cell);
      currentCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC0C0C0' }
      };
    });
    worksheet.getCell('C1').value = "Código: F-XXXX";
    worksheet.getCell('I1').value = "Revisión: 01";
    worksheet.getCell('C4').value = "Título: Planilla Embarque de Solidos";
    worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'right' };
    worksheet.getCell('A5').value = "Buque:";
    worksheet.getCell('C5').value = procesoService.getEmbarqueSelected().nombreBuque;

    // Ordenamos los turnos por fecha y turno correspondiente
    planillaDeTurnos = planillaDeTurnos.sort((a, b) => {
      return (a.fechaMiliseconds - b.fechaMiliseconds) && (a.turnoPuerto.orden - b.turnoPuerto.orden);
    });

    let diaOrder = 0;
    planillaDeTurnos.forEach((turno: PlanillaDeTurnos, i) => {
      if (i == 0) {
        turno.indexDia = diaOrder;
      } else {
        //
        if (new Date(turno.fecha).getDate() == new Date(planillaDeTurnos[i - 1].fecha).getDate() &&
          new Date(turno.fecha).getMonth() == new Date(planillaDeTurnos[i - 1].fecha).getMonth() &&
          new Date(turno.fecha).getFullYear() == new Date(planillaDeTurnos[i - 1].fecha).getFullYear()) {
          turno.indexDia = diaOrder;
        } else {
          diaOrder++;
          turno.indexDia = diaOrder;
        }
      }
    });


    console.log('modulo de carga')
    console.log(procesoService.getModuloDeCarga())

    let baseCell = 9;//37

    let offset = baseCell;
    //Calculo la cantidad de rows que va a ocupar la planilla

    let numeroTurno = 0;
    let totalNumeroTurnos = planillaDeTurnos.length;

    planillaDeTurnos.forEach((turno: PlanillaDeTurnos) => {
      // sino tiene informacion de detalle de turnos y cortes no lo considera
      if (turno.moduloDeCargaPlanillaDeTurnosCortes.length == 0 && turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length == 0) {
        totalNumeroTurnos -= 1;
      }
    });

    //Renderizo todos los detalles
    planillaDeTurnos.forEach((turno: PlanillaDeTurnos) => {

      // sino tiene informacion de detalle de turnos y cortes no lo considera
      if (turno.moduloDeCargaPlanillaDeTurnosCortes.length == 0 && turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length == 0) {
        return;
      }

      numeroTurno += 1;
      if (turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length > 0) {
        /* Planilla de turnos */
        headerDetalles.forEach((text, index) => {

          let currentCellDiv = worksheet.getRow(offset).getCell(index + 1);
          currentCellDiv.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCFFCC' }
          }
          currentCellDiv.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }

          let currentCell = worksheet.getRow(offset).getCell(index + 3);

          if (text) {

            currentCell.value = text;
            currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
            currentCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFCCFFCC' }
            }
            currentCell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
            currentCell.font = {
              name: 'Arial',
              family: 2,
              size: 11,
              bold: true
            }

          }
        });

        offset = offset + 1;

        // Cargando Agrupador de Turnos
        let registrosTurno = turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length - 1;
        const nombreTurno = turno.turnoPuerto.nombre;

        if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0) {
          registrosTurno = turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length
          const registroCorte = turno.moduloDeCargaPlanillaDeTurnosCortes.length;
          registrosTurno += registroCorte;

        }
        if (turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length > 0) {
          const numeroObservaciones = turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length;
          registrosTurno += numeroObservaciones + 1;
        }
        const inicioTurnoMerge = offset;
        const finTurnoMerge = offset + registrosTurno;
        worksheet.mergeCells(`B${inicioTurnoMerge}:B${(finTurnoMerge)}`);
        worksheet.getCell(`B${inicioTurnoMerge}`).value = nombreTurno;
        worksheet.getCell(`B${inicioTurnoMerge}`).alignment = { vertical: 'middle', horizontal: 'center' }

        turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.forEach((turno: any, index) => {

          let lineaDescripcion;
          const lineaFiltro = lineas.filter(linea => linea.id == turno.linea_Id);
          if (lineaFiltro.length > 0) {
            lineaDescripcion = lineaFiltro[0].linea != null ? lineaFiltro[0].linea : '';
          }

          worksheet.getRow(offset).getCell(3).value = turno.exportador?.nombre;
          worksheet.getRow(offset).getCell(4).value = turno.bodega.nombre;
          worksheet.getRow(offset).getCell(5).value = turno.materialPuerto?.descripcion;
          worksheet.getRow(offset).getCell(6).value = turno.destino?.nombre;
          worksheet.getRow(offset).getCell(7).value = turno.cantidad/1000;

          let celdaDetalle = 2
          for (let indexCell = 1; indexCell <= 6; indexCell++) {
            worksheet.getRow(offset).getCell(celdaDetalle).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
            celdaDetalle += 1;
          }
          offset = offset + 1;
        });

      }

      if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0) {

        headerCortes.forEach((text, index) => {
          let currentCell = worksheet.getRow(offset).getCell(3 + (index));

          if (text) {
            currentCell.value = text;
            currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
            currentCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFC5101A' }
            }
            currentCell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
            currentCell.font = {
              name: 'Arial',
              family: 2,
              size: 11,
              bold: true
            }
          }
        });

        offset = offset + 1;
        turno.moduloDeCargaPlanillaDeTurnosCortes.forEach((turno: CorteTurno, index) => {

          worksheet.getRow(offset).getCell(3).value = turno.motivosDeCorte ? turno.motivosDeCorte.nombre : '';
          worksheet.getRow(offset).getCell(4).value = turno.horaInicio;
          worksheet.getRow(offset).getCell(5).value = turno.horaFin;
          worksheet.getRow(offset).getCell(6).value = this.getDiferenciaCortes(turno.horaInicio, turno.horaFin);
          worksheet.getRow(offset).getCell(7).value = turno.observaciones;

          let celdaCorte = 3
          for (let indexCell = 1; indexCell <= 5; indexCell++) {
            worksheet.getRow(offset).getCell(celdaCorte).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
            celdaCorte += 1;
          }

          offset = offset + 1;
        });

      }
      if (turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length > 0) {
        headerObservaciones.forEach((text, index) => {
          let currentCell = worksheet.getRow(offset).getCell(3 + (index));

          if (index == 2) {
            worksheet.mergeCells(`E${offset}:G${(offset)}`);
          }

          if (text) {
            currentCell.value = text;
            currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
            currentCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFC5101A' }
            }
            currentCell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            }
            currentCell.font = {
              name: 'Arial',
              family: 2,
              size: 11,
              bold: true
            }
          }
        });

        offset = offset + 1;
        turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.forEach((observacion: any, index) => {
          worksheet.mergeCells(`E${offset}:G${(offset)}`);
          worksheet.getRow(offset).getCell(3).value = this.formatoFechaHora(true, observacion.fechaHora);
          worksheet.getRow(offset).getCell(4).value = this.formatoFechaHora(false, observacion.fechaHora);
          worksheet.getRow(offset).getCell(5).value = observacion.observaciones;
          let celdaCorte = 3
          for (let indexCell = 1; indexCell <= 5; indexCell++) {
            worksheet.getRow(offset).getCell(celdaCorte).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
            celdaCorte += 1;
          }
          offset = offset + 1;
        });
      }
    });

    //renderizo detalles
    for (let dia = 0; dia <= diaOrder; dia++) {
      let CantRows = 0;
      let fechaDia;
      planillaDeTurnos.forEach((turno: PlanillaDeTurnos) => {
        //si es el mismo día cuento las filas que voy a necesitar para calcular el merge
        if (turno.indexDia == dia) {
          fechaDia = new Date(turno.fecha);
          if (turno.moduloDeCargaPlanillaDeTurnosDetallesSolido.length > 0) {
            CantRows = CantRows + (turno.moduloDeCargaPlanillaDeTurnosDetallesSolido?.length + 1);
          }
          if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0) {
            CantRows = CantRows + (turno.moduloDeCargaPlanillaDeTurnosCortes?.length + 1);
          }
          if (turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length > 0) {
            CantRows = CantRows + (turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad?.length + 1);
          }
        }
      });

      if (CantRows == 0) continue;

      const diaTurno = `${(fechaDia.getDate())}`.padStart(2, '0');
      const mesTurno = `${(fechaDia.getMonth() + 1)}`.padStart(2, '0');
      const anioTurno = fechaDia.getFullYear();
      const fechaTurno = `${diaTurno}-${mesTurno}-${anioTurno}`;
      /* Contenido Fecha */
      worksheet.getCell(`A${baseCell + 1}`).value = fechaTurno;
      worksheet.getCell(`A${baseCell + 1}`).alignment = { vertical: 'middle', horizontal: 'center' }
      worksheet.getCell(`A${baseCell + 1}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      /* Cabeceras Fecha */
      worksheet.mergeCells(`A${baseCell + 1}:A${baseCell + (CantRows > 0 ? CantRows - 1 : CantRows)}`);
      worksheet.getCell(`A${baseCell}`).value = "Fecha";


      worksheet.getCell(`A${baseCell}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCFFCC' }
      };
      worksheet.getCell(`A${baseCell}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      worksheet.getCell(`A${baseCell}`).font = {
        name: 'Arial',
        family: 2,
        size: 11,
        bold: true
      }

      /* Cabeceras Turno */
      worksheet.getCell(`B${baseCell}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCFFCC' }
      };
      worksheet.getCell(`B${baseCell}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
      worksheet.getCell(`B${baseCell}`).font = {
        name: 'Arial',
        family: 2,
        size: 11,
        bold: true
      }
      worksheet.getCell(`B${baseCell}`).value = "Turno";
      baseCell = baseCell + (CantRows > 0 ? CantRows : CantRows);

    }
    console.log('workbook.xlsx.writeBuffer()');
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });


      if (bEnviarPlanilla) {
        this.enviarPlanillaSolido(blob, procesoService.getModuloDeCargaId(), procesoService.getEmbarqueSelected().nombreBuque);
      } else {
        saveAs(blob, fname + '.xlsx');
      }
    });
  }

  private enviarPlanillaSolido(blob, idModuloDeCarga, nombreBuque) {
    const titulo = "Enviar Planilla de Turno Solido";
    const text = "Cuerpo del Mail:"
    const textoCuerpoMail = `Se enviara la planilla de turnos. \n
      Buque: ${nombreBuque}`;
    const inputTitle = "Destinatarios";
    const mail = new Mail(`Planilla de turnos.`, `${textoCuerpoMail}`);
    this.moduloCargaService.obtenerDestinatariosPlanillaTurnos('PlanillaDeTurnosSolido').subscribe(x => mail.destinatarios = x);
    const button1 = 'Enviar';
    const button2 = 'Cancelar';

    this.confirmationDialogService.confirm(titulo, text, button1, button2, 'lg', mail, null, inputTitle, true)
      .then(async (confirmed) => {
        if (confirmed) {
          const convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
            const reader = new FileReader;
            reader.onerror = reject;
            reader.onload = () => {
              resolve(reader.result);
            };
            reader.readAsDataURL(blob);
          });

          const base64String = await convertBlobToBase64(blob);
          this.moduloCargaService.guardarPlanillaDeTurnosEnviarMail(idModuloDeCarga, mail, base64String).subscribe(resp => {
            this.confirmationDialogService.confirm('Planilla enviada', 'Se ha enviado con éxito la planilla de turnos.', 'Cerrar', '', null, null, Tipoalerta.Success)
          });
        }
      })
      .catch((e) => {
        return
      });
  }

}