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
export class PlanillaTurnoLiquidoExcelService {

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
    private setCabeceraExcel(worksheet, molinosImg, procesoService){
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
        worksheet.getCell('C4').value = "Título: Planilla Embarque de Líquidos";
        worksheet.getCell('A5').alignment = { vertical: 'middle', horizontal: 'right' };
        worksheet.getCell('A5').value = "Buque:";
        worksheet.getCell('C5').value = procesoService.getEmbarqueSelected().nombreBuque;
    }
    private setAnchoColumnas(worksheet){
        //Seteo el ancho de todas las columnas.
        worksheet.columns = [
            { width: 12 },
            { width: 11 },
            { width: 30 },
            { width: 10 },
            { width: 9 },
            { width: 30 },
            { width: 15 },
            { width: 11 },
            { width: 17 },
            { width: 17 },
            { width: 17 },
            { width: 17 },
            { width: 17 },
          ];
    }
    private setPlanillaTurnoReferencia(planillaEmbarqueData,planillaDeEmbarque, worksheet, rowOffset, referencias, headerPlanilla, borders){
        [8, 9, 10, 11, 12, 13, 14, 15, 16, 17].forEach((x) => {
            worksheet.mergeCells(`C${x}:D${x}`);
            worksheet.mergeCells(`F${x}:G${x}`);
          });

          let headerInserted1 = worksheet.getRow(8);
          headerPlanilla.forEach((text, index) => {
            let currentCell = headerInserted1.getCell(index + 1);
            if (text) {
              currentCell.value = text;
              currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
              currentCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFCCFFCC' }
              }
              currentCell.border = borders;
              currentCell.font = {
                name: 'Arial',
                family: 2,
                size: 11,
                bold: true
              }
            }
          });

        if (planillaEmbarqueData != undefined || planillaEmbarqueData != null) {
            planillaEmbarqueData.forEach((row, i) => {
              let currentRow = worksheet.getRow(rowOffset + i);
              currentRow.getCell('A').value = planillaDeEmbarque[i].exportador.nombre;
              currentRow.getCell('B').value = planillaDeEmbarque[i].bodegaParcel;
              currentRow.getCell('C').value = planillaDeEmbarque[i].tanqueDeAbordo;
              currentRow.getCell('E').value = planillaDeEmbarque[i].destino.nombre;
              currentRow.getCell('F').value = planillaDeEmbarque[i].tk;
              currentRow.getCell('H').value = planillaDeEmbarque[i].tn;
              currentRow.getCell('I').value = planillaDeEmbarque[i].materialPuerto.descripcion;

            });
          }

          if (planillaDeEmbarque != undefined || planillaDeEmbarque != null) {
            let rowsTable1 = worksheet.getRows(9, planillaDeEmbarque.length);
            if (rowsTable1 != undefined || rowsTable1 != null) {
              rowsTable1.forEach((row) => {
                [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach((number) => {
                  let currentCell = row.getCell(number);
                  currentCell.border = borders;
                });
              });
            }
          }

          referencias.forEach((ref, index) => {
            let numCelda = index + 8;
            let currentCell = worksheet.getCell(`K${numCelda}`);
            currentCell.value = ref;
          });
    }
    private setCabeceraPlanillaTurno(worksheet, offset, borders, esRecibidores: boolean = false){
        let headerDetallePlanilla = null;
        if (esRecibidores)
            headerDetallePlanilla = ["Exportador", "Línea", "Partida", "Producto", "Tk", "Cant."];
            else
            headerDetallePlanilla = ["Exportador", "Línea", "Partida", "Producto", "Tk", "°C", "Med. Ini. Cm.", "Med. Ini. Mm.", "Med. fin. Cm.", "Med. fin. Cm.", "Destino", "Cant."];

        headerDetallePlanilla.forEach((text, index) => {
            let currentCell = worksheet.getRow(offset).getCell(index + 3);
            if (text) {
              currentCell.value = text;
              currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
              currentCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFCCFFCC' }
              }
              currentCell.border = borders;
              currentCell.font = {
                name: 'Arial',
                family: 2,
                size: 11,
                bold: true
              }
            }
        });
    }
    private setObservacionesCalidad(headerObservaciones,worksheet, offset, borders){
        headerObservaciones.forEach((text, index) => {
            let currentCell = worksheet.getRow(offset).getCell(3 + (index));

            if (index == 2)
              worksheet.mergeCells(`E${offset}:H${(offset)}`);

            if (text) {
              currentCell.value = text;
              currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
              currentCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC5101A' }
              }
              currentCell.border = borders;
              currentCell.font = {
                name: 'Arial',
                family: 2,
                size: 11,
                bold: true
              }
            }
        });
    }
    private setAgrupadorTurnos(turno, worksheet, offset,numeroTurno,totalNumeroTurnos, borders, esRecibidores: boolean = false, esTurnoSinDetalle: boolean = false){
        const nombreTurno = turno.turnoPuerto.nombre;
        let inicioTurnoMerge = offset;
        let finTurnoMerge    = inicioTurnoMerge;
        let toneladas: number = 0;
        turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.forEach(item => {
          toneladas+= item.cantidad;
        });
        console.log('toneladas--->>', toneladas)

        if(esTurnoSinDetalle){
            if (esRecibidores){
                let numeroObservaciones = turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length;
                numeroObservaciones = numeroObservaciones > 0 ? numeroObservaciones + 1 : numeroObservaciones;
                inicioTurnoMerge+=1;
                finTurnoMerge    = inicioTurnoMerge;
                finTurnoMerge += numeroObservaciones;
            }else{
              inicioTurnoMerge+=1;
              finTurnoMerge = inicioTurnoMerge;
            }
            worksheet.mergeCells(`B${inicioTurnoMerge}:B${(finTurnoMerge)}`);
            worksheet.getCell(`B${inicioTurnoMerge}`).value =`${nombreTurno} \r\n ${toneladas} tn`;
            worksheet.getCell(`B${inicioTurnoMerge}`).alignment = { vertical: 'middle', horizontal: 'center',  wrapText: true}
            worksheet.getCell(`B${inicioTurnoMerge}`).border = borders;
        }else{
            let registrosTurno = turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length - 1;

            if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0) {
              registrosTurno = turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length
              const registroCorte = turno.moduloDeCargaPlanillaDeTurnosCortes.length;
              registrosTurno += registroCorte;
            }

            if (esRecibidores){
                let numeroObservaciones = turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length;
                numeroObservaciones = numeroObservaciones > 0 ? numeroObservaciones + 1 : numeroObservaciones;
                registrosTurno += numeroObservaciones;
            }

            let finTurnoMerge = offset + registrosTurno;
            worksheet.mergeCells(`B${inicioTurnoMerge}:B${(finTurnoMerge)}`);
            worksheet.getCell(`B${inicioTurnoMerge}`).value = `${nombreTurno} \n\n ${toneladas} tn`;
            worksheet.getCell(`B${inicioTurnoMerge}`).alignment = { vertical: 'middle', horizontal: 'center',  wrapText: true}
            worksheet.getCell(`B${inicioTurnoMerge}`).border = borders;

            /*
            if (turno.moduloDeCargaPlanillaDeTurnosCortes.length == 0) {
              if (turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length > 0) {
                if (numeroTurno != totalNumeroTurnos) {
                  const filaRellenoTurno = inicioTurnoMerge + numRegistroTurno;
                  worksheet.getCell(`B${filaRellenoTurno}`).border = borders;
                  worksheet.getCell(`B${filaRellenoTurno}`).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFCCFFCC' }
                  };
                };
              }
            }

            if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0) {
              if (turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length > 0) {
                let filaRellenoTurno = finTurnoMerge;
                if (numeroTurno != totalNumeroTurnos) {
                  filaRellenoTurno = finTurnoMerge + 1;
                  worksheet.getCell(`B${filaRellenoTurno}`).border = borders;
                  worksheet.getCell(`B${filaRellenoTurno}`).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFCCFFCC' }
                  };
                }
              }
            }*/

            worksheet.getCell(`B${offset}`).border = borders;
        }
    }
    private setDetallePlanillaTurno(lineas, turno, worksheet, offset, borders, esRecibidores: boolean) {
        let lineaDescripcion;
        const lineaFiltro = lineas.filter(linea => linea.id == turno.linea_Id);
        if (lineaFiltro.length > 0) {
          lineaDescripcion = lineaFiltro[0].tipoLineaEmbarque != null ? lineaFiltro[0].tipoLineaEmbarque.linea : '';
        }

        if (!esRecibidores){
            worksheet.getRow(offset).getCell(2).alignment = { vertical: 'middle', horizontal: 'center',  wrapText: true};
            worksheet.getRow(offset).height = 50;
            worksheet.getRow(offset).getCell(3).value = turno.exportador.nombre;
            worksheet.getRow(offset).getCell(4).value = lineaDescripcion;
            worksheet.getRow(offset).getCell(5).value = turno.bodegaParcel;
            worksheet.getRow(offset).getCell(6).value = turno.materialPuerto.descripcion;
            worksheet.getRow(offset).getCell(7).value = turno.tk;
            worksheet.getRow(offset).getCell(8).value = turno.temperatura;
            worksheet.getRow(offset).getCell(9).value = turno.medidaInicialCM;
            worksheet.getRow(offset).getCell(10).value = turno.medidaFinalMM;
            worksheet.getRow(offset).getCell(11).value = turno.medidaFinalCM;
            worksheet.getRow(offset).getCell(12).value = turno.medidaFinalMM;
            worksheet.getRow(offset).getCell(13).value = turno.destino?.nombre;
            worksheet.getRow(offset).getCell(14).value = turno.cantidad;
        }else{
            worksheet.getRow(offset).getCell(2).alignment = { vertical: 'middle', horizontal: 'center',  wrapText: true};
            worksheet.getRow(offset).getCell(3).value = turno.exportador.nombre;
            worksheet.getRow(offset).getCell(4).value = lineaDescripcion;
            worksheet.getRow(offset).getCell(5).value = turno.bodegaParcel;
            worksheet.getRow(offset).getCell(6).value = turno.materialPuerto.descripcion;
            worksheet.getRow(offset).getCell(7).value = turno.tk;
            worksheet.getRow(offset).getCell(8).value = parseInt(turno.cantidad.toString());
        }

        if (!esRecibidores){
            let celdaDetalle = 3
            for (let indexCell = 1; indexCell <= 12; indexCell++) {
              worksheet.getRow(offset).getCell(celdaDetalle).border = borders;
              celdaDetalle += 1;
            }
        }else{
            let celdaDetalle = 3
            for (let indexCell = 1; indexCell <= 6; indexCell++) {
              worksheet.getRow(offset).getCell(celdaDetalle).border = borders;
              celdaDetalle += 1;
            }
        }
    }
    private setPlanillaOrdenarTurnos(planillaDeTurnos, diaOrder){      
        planillaDeTurnos = planillaDeTurnos.sort((a, b) => {
            return (new Date(b.fecha).getDate() - new Date(a.fecha).getDate());
          });


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
        return diaOrder;
    }
    private setDetalleObservacionesCalidad(worksheet, observacion, offset ){
        worksheet.mergeCells(`E${offset}:H${(offset)}`);
          let fechaObs = '';
          let horaObs = '';
          if (observacion.fechaHora != undefined) {
            if (observacion.fechaHora != null) {
              fechaObs = this.formatoFechaHora(true, observacion.fechaHora)
              horaObs = this.formatoFechaHora(false, observacion.fechaHora)
            }
          }

        worksheet.getRow(offset).getCell(3).value = fechaObs;
        worksheet.getRow(offset).getCell(4).value = horaObs;
        worksheet.getRow(offset).getCell(5).value = observacion.observaciones;

        let celdaCorte = 3
        for (let indexCell = 1; indexCell <= 5; indexCell++) {
        worksheet.getRow(offset).getCell(celdaCorte).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
        celdaCorte += 1;
        }
    }
    private getNombreArchivo(esRecibidores: boolean){
        let nombreArchivo = "";
        const horaActual = new Date();
        const horaActualFormat = horaActual.getHours() + '_' + horaActual.getMinutes() + '_' + horaActual.getSeconds();

        if (esRecibidores)
            nombreArchivo='Planilla_Recibidores_Lq_' + horaActualFormat;
        else
            nombreArchivo='Planilla_Tablerista_Lq_' + horaActualFormat;
        return nombreArchivo;
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
    private setCabeceraPlanillaCortes(headerCortes, worksheet, offset, borders, esRecibidores: boolean){
        if (esRecibidores){
            worksheet.mergeCells(`C${offset}:C${offset}`);
            worksheet.mergeCells(`D${offset}:D${offset}`);
            worksheet.mergeCells(`E${offset}:E${offset}`);
            worksheet.mergeCells(`F${offset}:F${offset}`);
            worksheet.mergeCells(`G${offset}:H${offset}`);
        }else{
            worksheet.mergeCells(`C${offset}:D${offset}`);
            worksheet.mergeCells(`E${offset}:F${offset}`);
            worksheet.mergeCells(`G${offset}:H${offset}`);
            worksheet.mergeCells(`I${offset}:J${offset}`);
            worksheet.mergeCells(`K${offset}:N${offset}`);
        }

        headerCortes.forEach((text, index) => {
          let currentCell = null;
          if (esRecibidores)
              currentCell = worksheet.getRow(offset).getCell(3 + (1 * index));
              else
              currentCell = worksheet.getRow(offset).getCell(3 + (2 * index));

          if (text) {
            currentCell.value = text;
            currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
            currentCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFC5101A' }
            }
            currentCell.border = borders;
            currentCell.font = {
              name: 'Arial',
              family: 2,
              size: 11,
              bold: true
            }
          }
        });
    }
    private setDetallePlanillaCortes(worksheet, turno, offset, borders, esRecibidores){
        if (!esRecibidores){
            worksheet.mergeCells(`C${offset}:D${offset}`);
            worksheet.mergeCells(`E${offset}:F${offset}`);
            worksheet.mergeCells(`G${offset}:H${offset}`);
            worksheet.mergeCells(`I${offset}:J${offset}`);
            worksheet.mergeCells(`K${offset}:N${offset}`);

            worksheet.getRow(offset).getCell(3).value = turno.motivosDeCorte!=null?turno.motivosDeCorte.nombre : '';
            worksheet.getRow(offset).getCell(5).value = turno.horaInicio!=null?turno.horaInicio:'';
            worksheet.getRow(offset).getCell(7).value = turno.horaFin!=null?turno.horaFin:'';
            worksheet.getRow(offset).getCell(9).value = turno.tiempoTotal!=null?turno.tiempoTotal:'';
            worksheet.getRow(offset).getCell(11).value = turno.observaciones!=null?turno.observaciones:'';

            let celdaCorte = 3
            for (let indexCell = 1; indexCell <= 5; indexCell++) {
              worksheet.getRow(offset).getCell(celdaCorte).border = borders;
              celdaCorte += 2;
            }
        }else{
            worksheet.mergeCells(`C${offset}:C${offset}`);
            worksheet.mergeCells(`D${offset}:D${offset}`);
            worksheet.mergeCells(`E${offset}:E${offset}`);
            worksheet.mergeCells(`F${offset}:F${offset}`);
            worksheet.mergeCells(`G${offset}:H${offset}`);

            worksheet.getRow(offset).getCell(3).value = turno.motivosDeCorte? turno.motivosDeCorte.nombre : '';
            worksheet.getRow(offset).getCell(4).value = turno.horaInicio;
            worksheet.getRow(offset).getCell(5).value = turno.horaFin;
            worksheet.getRow(offset).getCell(6).value = turno.tiempoTotal;
            worksheet.getRow(offset).getCell(7).value = turno.observaciones;

            let celdaCorte = 3
            for (let indexCell = 1; indexCell <= 5; indexCell++) {
              worksheet.getRow(offset).getCell(celdaCorte).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
              celdaCorte += 1;
            }
        }
    }
    private enviarPlanillaLiquido(blob, nombreBuque,idModuloDeCarga) {

        const titulo = "Enviar Planilla de Turno Líquido";
        const text = "Cuerpo del Mail:"
        const textoCuerpoMail = `Se enviara la planilla de turnos. \n
          Buque: ${nombreBuque}`;
        const inputTitle = "Destinatarios";
        const mail = new Mail(`Planilla de turnos.`, `${textoCuerpoMail}`);
        this.moduloCargaService.obtenerDestinatariosPlanillaTurnos('PlanillaDeTurnosLiquido').subscribe(x => mail.destinatarios = x);
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
    async generarExcelPorParcel(procesoService, planillaDeTurnos, lineas,esEnviarPlanilla: boolean=false, esRecibidores=false, totalABordo=0, toneladasLineas:any[]=[]) {

      planillaDeTurnos.forEach((turno: PlanillaDeTurnos) => {
        turno.moduloDeCargaPlanillaDeTurnosCortes.forEach((corte: CorteTurno, index ) => {
          if(corte.motivosDeCorte==null)
            turno.moduloDeCargaPlanillaDeTurnosCortes.pop();

        });

      });


      const fname = this.getNombreArchivo(esRecibidores);
        const imgMolinos = await this.getImgMolinos();
        let workbook = new Workbook();
        const headerObservaciones = ["Fecha", "Hora", "Observación de calidad"];
        const headerPlanilla = ["Exportador", "Partida", "Tks de abordo", , "Destino", "Tks Tierra", , "TN", "Producto"];
        const headerCortes = ["Motivo", "Inicio", "Fin", "Tiempo total", "Observaciones"];
        const referencias = ["REFERENCIAS",
          "CSBO = ACTE CRUDO DE SOJA",
          "CSFO = ACTE CRUDO DE GSOL.",
          "RSBO = ACTE REFINADO DE SOJA",
          "RSFO = ACTE REFINADO DE GSOL.",
          "FAME = BIODIESEL"];
        const borders: any = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
            }

        const molinosImg = workbook.addImage({buffer: imgMolinos, extension: 'png'});

        let worksheet = workbook.addWorksheet("Turnos",{
            views: [{ state: 'frozen', activeCell: 'A1', showGridLines: false }]
        });

        //Ancho Columnas
        this.setAnchoColumnas(worksheet);

        //Merge cells cabecera
        this.setCabeceraExcel(worksheet, molinosImg, procesoService);

        // Planilla de embarque
        const rowOffset = 9;
        const planillaDeEmbarque = procesoService.getModuloDeCarga()?.moduloDeCargaPlanillaDeEmbarque;
        const planillaEmbarqueData = worksheet.getRows(rowOffset, planillaDeEmbarque.length)

        this.setPlanillaTurnoReferencia(planillaEmbarqueData,planillaDeEmbarque, worksheet, rowOffset, referencias, headerPlanilla, borders);

        // Ordenamos los turnos por fecha y turno correspondiente
        let diaOrder = 0;
        diaOrder = this.setPlanillaOrdenarTurnos(planillaDeTurnos, diaOrder);

        let baseCell = 20;
        let offset = baseCell;
        //Calculo la cantidad de rows que va a ocupar la planilla
        let numeroTurno = 0;
        let totalNumeroTurnos = planillaDeTurnos.length;

        planillaDeTurnos.forEach((turno: PlanillaDeTurnos) => {
          // sino tiene informacion de detalle de turnos y cortes no lo considera
          if (turno.moduloDeCargaPlanillaDeTurnosCortes.length == 0 && turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length == 0) {
            totalNumeroTurnos -= 1;
          }
        });

        //Renderizo todos los detalles
        planillaDeTurnos.forEach((turno: PlanillaDeTurnos) => {

          // sino tiene informacion de detalle de turnos y cortes no lo considera
          if (turno.moduloDeCargaPlanillaDeTurnosCortes.length == 0 && turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length == 0) {
            return;
          }

          numeroTurno += 1;
          /* Planilla de turnos */
          if (turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length == 0)
            this.setAgrupadorTurnos(turno, worksheet, offset,numeroTurno,totalNumeroTurnos,borders, esRecibidores, true);

          if (turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length > 0) {

            // Cargando Detalle de Planillas
            this.setCabeceraPlanillaTurno(worksheet, offset, borders, esRecibidores);
            offset = offset + 1;

            // Cargando Agrupador de Turnos
            this.setAgrupadorTurnos(turno, worksheet, offset,numeroTurno,totalNumeroTurnos,borders, esRecibidores, false);

            turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.forEach((turno: any, index) => {
              this.setDetallePlanillaTurno(lineas, turno, worksheet, offset, borders, esRecibidores)
              offset = offset + 1;
            });
          }

          if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0) {

              this.setCabeceraPlanillaCortes(headerCortes, worksheet, offset, borders, esRecibidores);
              offset = offset + 1;
              turno.moduloDeCargaPlanillaDeTurnosCortes.forEach((turno: CorteTurno, index) => {
                this.setDetallePlanillaCortes(worksheet, turno, offset, borders, esRecibidores);
                offset = offset + 1;
              });

          }
          if (esRecibidores){
            if (turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length > 0) {
                this.setObservacionesCalidad(headerObservaciones,worksheet, offset, borders);
                offset = offset + 1;
                turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.forEach((observacion: any) => {
                    this.setDetalleObservacionesCalidad(worksheet, observacion, offset);
                    offset = offset + 1;
                });
            }
          }
        });

        //renderizo detalles
        for (let dia = 0; dia <= diaOrder; dia++) {          
          let CantRows = 0;
          let fechaDia;
          let cantidadToneladasPorFecha = 0;
          planillaDeTurnos.forEach((turno: PlanillaDeTurnos) => {              

            //si es el mismo día cuento las filas que voy a necesitar para calcular el merge
            if (turno.indexDia == dia) {
              turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.forEach(element => {
                cantidadToneladasPorFecha += element.cantidad;
              });
              fechaDia = new Date(turno.fecha);
              if (turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido.length > 0) {
                CantRows = CantRows + (turno.moduloDeCargaPlanillaDeTurnosDetallesLiquido?.length + 1);
              }
              if (turno.moduloDeCargaPlanillaDeTurnosCortes.length > 0) {
                CantRows = CantRows + (turno.moduloDeCargaPlanillaDeTurnosCortes?.length + 1);
              }
              if (esRecibidores){
                if (turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad.length > 0) {
                    CantRows = CantRows + (turno.moduloDeCargaPlanillaDeTurnosObservacionesDeCalidad?.length + 1);
                }
              }
            }
          });
          if (CantRows == 0) continue;
          const diaTurno = `${(fechaDia.getDate())}`.padStart(2, '0');
          const mesTurno = `${(fechaDia.getMonth() + 1)}`.padStart(2, '0');
          const anioTurno = fechaDia.getFullYear();
          const fechaTurno = `${diaTurno}-${mesTurno}-${anioTurno}`;
        
          /* Contenido Fecha */
          worksheet.getCell(`A${baseCell + 1}`).value = `${fechaTurno} \r\n ${cantidadToneladasPorFecha} tn`;
          worksheet.getCell(`A${baseCell + 1}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
          worksheet.getCell(`A${baseCell + 1}`).border = borders;     

          /* Cabeceras Fecha */
          worksheet.mergeCells(`A${baseCell + 1}:A${baseCell + (CantRows > 0 ? CantRows - 1 : CantRows)}`);
          worksheet.getCell(`A${baseCell}`).value = "Fecha";

          worksheet.getCell(`A${baseCell}`).fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' } };
          worksheet.getCell(`A${baseCell}`).border = borders;
          worksheet.getCell(`A${baseCell}`).font   = { name: 'Arial', family: 2, size: 11, bold: true }

          /* Cabeceras Turno */
          worksheet.getCell(`B${baseCell}`).value  = "Turno";
          worksheet.getCell(`B${baseCell + 1}`).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
          worksheet.getCell(`B${baseCell}`).fill   = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' }};
          worksheet.getCell(`B${baseCell}`).border = borders;
          worksheet.getCell(`B${baseCell}`).font   = {name: 'Arial',family: 2,size: 11,bold: true}          
          
          baseCell = baseCell + (CantRows > 0 ? CantRows : CantRows);

        }


        baseCell = baseCell + 1;
        worksheet.getCell(`A${baseCell}`).value  = "Total a Bordo: ";
        worksheet.getCell(`A${baseCell}`).fill   = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' }};
        worksheet.getCell(`A${baseCell}`).border = borders;
        worksheet.getCell(`A${baseCell}`).font   = {name: 'Arial',family: 2,size: 9,bold: true}

        worksheet.getCell(`B${baseCell}`).value  = totalABordo + ' tn';
       // worksheet.getCell(`B${baseCell}`).fill   = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' }};
        worksheet.getCell(`B${baseCell}`).border = borders;
        worksheet.getCell(`B${baseCell}`).font   = {name: 'Arial',family: 2,size: 11,bold: true}


        baseCell = baseCell + 2;
        worksheet.mergeCells(`A${baseCell}:B${baseCell}`);
        worksheet.getCell(`A${baseCell}:B${baseCell}`).value = 'LINEAS';
        worksheet.getCell(`A${baseCell}:B${baseCell}`).alignment = { horizontal:'center'} ;
        worksheet.getCell(`A${baseCell}:B${baseCell}`).fill   = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' }};
        worksheet.getCell(`A${baseCell}:B${baseCell}`).border = borders;
        worksheet.getCell(`A${baseCell}:B${baseCell}`).font   = {name: 'Arial',family: 2,size: 9,bold: true}

        toneladasLineas.forEach(item => {
          baseCell = baseCell + 1;
          worksheet.getCell(`A${baseCell}`).value  = item.linea;
          worksheet.getCell(`A${baseCell}`).fill   = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' }};
          worksheet.getCell(`A${baseCell}`).border = borders;
          worksheet.getCell(`A${baseCell}`).font   = {name: 'Arial',family: 2,size: 9,bold: true}

          worksheet.getCell(`B${baseCell}`).value  = item.total +' tn';
         // worksheet.getCell(`B${baseCell}`).fill   = {type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCFFCC' }};
          worksheet.getCell(`B${baseCell}`).border = borders;
          worksheet.getCell(`B${baseCell}`).font   = {name: 'Arial',family: 2,size: 11,bold: true}


        });


        workbook.xlsx.writeBuffer().then((data) => {
          const archivo = fname + '.xlsx'
          const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          if (esEnviarPlanilla){
             this.enviarPlanillaLiquido(blob, procesoService.getEmbarqueSelected().nombreBuque,procesoService.getModuloDeCargaId())
          }else{
             saveAs(blob, archivo);
          }
        });
    }
}
