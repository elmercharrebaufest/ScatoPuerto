import { Pipe, PipeTransform } from "@angular/core";
@Pipe({
  name: 'filtroBuque'
})
export class BuqueFilterPipe implements PipeTransform {

  transform(historialBuques: any[], filtroBuques: any): any[] {

    if (filtroBuques == null) return historialBuques;
    if (historialBuques == null) return;
    if (historialBuques.length == 0) return;

    if (filtroBuques.controls.vaporId.value > 0) return historialBuques;
    let historialBuquesFiltro = historialBuques;

    if (filtroBuques.controls.producto != undefined) {
      if (filtroBuques.controls.producto.value.length > 0) {
        historialBuquesFiltro = historialBuques.filter(item => {
          let bEncontrado = false;
          if (item.productoExportador != null) {
            for (let producto of item.productoExportador) {
              const filtro = filtroBuques.controls.producto.value.filter(x => x.descripcionCorta == producto.nombreMaterial);
              if (filtro.length > 0) {
                bEncontrado = true;
                break;
              }
            }
            return bEncontrado;

          }
        });
      }
    }

    return historialBuquesFiltro.filter(item => {

      if (filtroBuques != undefined) {

        const itemBuque = item.nombreBuque != null ? item.nombreBuque.toUpperCase() : '';
        const itemDestino = item.destino != null ? item.destino.toUpperCase() : '';
        const itemControl = item.agenciaControlPrivado != null ? item.agenciaControlPrivado.toUpperCase() : '';
        const itemATA = item.nombreAta != null ? item.nombreAta.toUpperCase() : '';

        const filBuque = filtroBuques.controls.buque.value != null ? filtroBuques.controls.buque.value.toUpperCase() : '';
        const filDestino = filtroBuques.controls.destino.value != null ? filtroBuques.controls.destino.value.toUpperCase() : '';
        const filControl = filtroBuques.controls.control.value != null ? filtroBuques.controls.control.value.toUpperCase() : '';
        const filATA = filtroBuques.controls.ata.value != null ? filtroBuques.controls.ata.value.toUpperCase() : '';
        return (
          (filDestino.length > 0 ? itemDestino.indexOf(filDestino) !== -1 : itemDestino.indexOf(itemDestino) !== -1) &&
          (filBuque.length > 0 ? itemBuque.indexOf(filBuque) !== -1 : itemBuque.indexOf(itemBuque) !== -1) &&
          (filControl.length > 0 ? itemControl.indexOf(filControl) !== -1 : itemControl.indexOf(itemControl) !== -1) &&
          (filATA.length > 0 ? itemATA.indexOf(filATA) !== -1 : itemATA.indexOf(itemATA) !== -1)
        );

      }
      return item;
    });

  }

}