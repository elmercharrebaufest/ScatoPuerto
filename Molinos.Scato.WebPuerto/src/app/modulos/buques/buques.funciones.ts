export default class UtilesBuques {

  public static listarAnios() {
    let listaAnios = []

    const anioActual = new Date().getFullYear();
    const anioInicio = 2021;
    const anioFinal = anioActual + 10;

    for (let i = anioInicio; i <= anioFinal; i++) {
      const objAnio = {
        numeroAnio: i,
        nombreAnio: i,
      }
      listaAnios.push(objAnio);
    }

    return listaAnios;
  }

  public static listarMeses() {
    let listaMeses = [];
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    meses.forEach((mes, index) => {
      const objMes = {
        numeroMes: index + 1,
        nombreMes: mes,
      }
      listaMeses.push(objMes);
    });

    return listaMeses;
  }

  public static convertToDatetime(dtStr) {
    if (!dtStr) return null
    let dateParts = dtStr.split("/");
    let timeParts = dateParts[2].split(" ")[1].split(":");
    dateParts[2] = dateParts[2].split(" ")[0];
    // month is 0-based, that's why we need dataParts[1] - 1
    return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0], timeParts[0], timeParts[1], timeParts[2]);
  }

  public static formatDiaMesAnio(fecha) {
    var dd = String(new Date(fecha).getDate()).padStart(2, '0');
    var mm = String(new Date(fecha).getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = new Date(fecha).getFullYear();
    return dd + '/' + mm + '/' + yyyy;
  }

}