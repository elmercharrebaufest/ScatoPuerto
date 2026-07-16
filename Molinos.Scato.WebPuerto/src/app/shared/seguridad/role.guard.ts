import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateChild, Router } from "@angular/router";
import { ConfirmationDialogService } from "@ScatoServicios/confirmation-dialog.service";
import { SessionService } from "@ScatoServicios/session.service";
import { Tipoalerta } from '@ScatoEnums/tipo-alerta';

@Injectable()
export class RoleGuard implements CanActivateChild{

    confirmationDialogService: any;

    constructor(private router: Router,
                private session: SessionService,
                confirmationDialogService: ConfirmationDialogService){
        this.confirmationDialogService = confirmationDialogService;
    }

    canActivateChild(route: ActivatedRouteSnapshot){
        let permisos = this.session.getUser().permisos;
        let ruta = route.pathFromRoot
            .map(x => x.routeConfig?.path)
            .find(x => !!x) || '';

        if (this.tieneSoloPermisoAduana(permisos) && ruta !== 'aduana') {
            this.navigate(permisos, ruta);
            return false;
        }

        // switcheamos sobre la ultima parte de la ruta y preguntamos si tiene el permiso, sino redireccionamosa su home
        switch (ruta) {
            case "": {
                if (permisos.find(x => x === 'LineUp_Ver')){
                    return true;
                }else{
                    this.navigate(permisos, "");
                }
                break;
            };
            case "lineup": {
                if (permisos.find(x => x === 'LineUp_Ver')){
                    return true;
                }else{
                    this.navigate(permisos, "lineup");
                }
                break;
            }
            case "geolocalizacion": {
                if (permisos.find(x => x === 'Geolocalizacion_Ver')){
                    return true;
                }else{
                    this.navigate(permisos, "geolocalizacion");
                }
                break;
            }
            case 'alta-embarque': {
                if (permisos.find(x => x === 'LineUp_AltaEmbarque') && route.params.state){
                    return true;
                } else{
                    this.navigate(permisos, "alta-embarque");
                }
                break;
            }
            case 'buques': {
                if (permisos.find(x => x === 'Buque_Ver')){
                    return true;
                }else{
                    this.navigate(permisos, "buque");
                }
                break;
            }
            case 'operatoria': {
                if (permisos.find(x => x === 'Buque_Operatoria_Ver') && route.params.state){
                    return true;
                }else{
                    this.navigate(permisos, "operatoria de buque");
                }
                break;
            }
            case 'plano-de-carga': {
                if (permisos.find(x => x === 'PDC_Ver') && route.params.id){
                    return true;
                }else{
                    this.navigate(permisos, "plano-de-carga");
                }
                break;
            }
            case "carga": {
                if (permisos.find(x => x === 'Carga_Ver')){
                    return true;
                }else{
                    this.navigate(permisos, "carga");
                }
                break;
            }
            case "aduana": {
                if (permisos.find(x => x === 'Aduana_Consultar')){
                    return true;
                }else{
                    this.navigate(permisos, "aduana");
                }
                break;
            }
            case 'calidad': {
                if (permisos.find(x => x === 'Recibidores_Ver')){
                    return true;
                }else{
                    this.navigate(permisos, "calidad");
                }
                break;
            }

            case 'programa': {
                if (permisos.find(x => (x === 'Comex_Nominacion_Ver' || x=== 'Moc_Nominacion_Ver'))){
                    return true;
                }else{
                    this.navigate(permisos, "programa");
                }
                break;
            }
            case 'nominacion': {
                if (permisos.find(x => (x === 'Comex_Nominacion_Ver' || x=== 'Moc_Nominacion_Ver'))){
                    return true;
                }else{
                    this.navigate(permisos, "nominacion");
                }
                break;
            }
            case 'vapor': {
                if (permisos.find(x => x === 'Vapor_Visualizar')){
                    return true;
                }else{
                    this.navigate(permisos, "vapor");
                }
                break;
            }
            case 'caratula': {
                if(permisos.find(x => x === 'Caratula_Visualizar')){
                    return true;
                }else{
                    this.navigate(permisos, "caratula");
                }
                break;
            }
            case 'coem': {
                if (permisos.find(x => x === 'Coem_Visualizar')) {
                    return true;
                }else{
                    this.navigate(permisos, "coem");
                }
                break;
            }
            case 'clientes': {
                if (permisos.find(x => x === 'Vapor_Visualizar')) { // TODO: Modificar
                    return true;
                }else{
                    this.navigate(permisos, "clientes");
                }
                break;
            }
            case 'embarque': {
                if (permisos.find(x => x === 'Vapor_Visualizar') || permisos.find(x => x === 'Productos_Visualizar')){
                    return true;
                }else{
                    this.navigate(permisos, 'embarque');
                }
                break;
            }
            case 'destinos': {
              if (permisos.find(x => x === 'Destinos_Visualizar')) {
                  return true;
              }else{
                  this.navigate(permisos, "destinos");
              }
              break;
            }
            case 'afip': {
                if (permisos.find(x => x === 'Caratula_Visualizar') || permisos.find(x => x === 'Coem_Visualizar')) {
                    return true;
                }else{
                    this.navigate(permisos, 'afip');
                }
                break;
            }
            case 'documentos': {
                if (permisos.find(x => x === 'Documentos_Visualizar') || permisos.find(x => x === 'Moc_Documentos_Visualizar')) {
                    return true;
                }else{
                    this.navigate(permisos, 'documentos');
                }
                break;
            }
            case 'administracion': {
                if (permisos.find(x => x === 'Administracion_Visualizar') || permisos.find(x => x === 'Tarifario_Visualizar')) {
                    return true;
                }else{
                    this.navigate(permisos, "consulta-embarques");
                }
                break;
            }
            case "comprobantes": {
                if (permisos.find(x => x === 'Comprobantes_EditarNumeroInicial')) {
                    return true;
                } else {
                    this.navigate(permisos, "comprobantes");
                }
                break;
            }
            case 'carga-otros-muelles': {
                if (permisos.find(x => x === 'Comex_Nominacion_Ver') || permisos.find(x => x === 'Moc_Nominacion_Ver') || permisos.find(x => x === 'Coordinacion_EditarHistorial') || permisos.find(x => x === 'Comex_EditarHistorial')) {
                    return true;
                } else {
                    this.navigate(permisos, 'carga-otros-muelles');
                }
                break;
            }
            case 'puerto-logistica': {
                if (
                    permisos.find(x => x === 'Embarques_Ver') ||
                    permisos.find(x => x === 'ReportePesada_Ver') ||
                    permisos.find(x => x === 'BalanzaPuerto_Configuracion') ||
                    permisos.find(x => x === 'EmbarquesPorBuques_Ver') ||
                    permisos.find(x => x === 'EtiquetaPuerto_Ver') ||
                    permisos.find(x => x === 'LineUp_Ver') ||
                    permisos.find(x => x === 'Administracion_Visualizar') ||
                    permisos.find(x => x === 'Comex_Nominacion_Ver')
                ) {
                    return true;
                } else {
                    this.navigate(permisos, 'puerto-logistica');
                }
                break;
            }
        }
    }

    tieneSoloPermisoAduana(permisos: string[]): boolean {
        return !!permisos?.length && permisos.every(x => x === 'Aduana_Consultar');
    }

    // En caso de que no tenga permisos, redireccionamos a donde si tenga permisos
    navigate(permisos, navegarHacia: string=''){
        this.msjeAdvertencia(navegarHacia);

        let primerPermiso = permisos.find((p: string)=>
            p == 'Aduana_Consultar' ||
            p == 'LineUp_Ver' ||
            p == 'Carga_Ver' ||
            p == 'Recibidores_Ver' ||
            p == 'Geolocalizacion_Ver' ||
            p == 'Buque_Ver'
        );
        switch(primerPermiso){
            case 'Aduana_Consultar': {
                this.router.navigate(['/aduana/pesadas-online']);
                break;
            }
            case 'LineUp_Ver': {
                this.router.navigate(['/lineup']);
                break;
            };
            case 'Carga_Ver': {
                this.router.navigate(['/carga']);
                break;
            }
            case 'Recibidores_Ver': {
                this.router.navigate(['/calidad']);
                break;
            }
            case 'Geolocalizacion_Ver': {
                this.router.navigate(['/geolocalizacion']);
                break;
            }
            case 'Buque_Ver': {
                this.router.navigate(['/buques']);
                break;
            }
            case 'Buque_Ver': {
                this.router.navigate(['/programa']);
                break;
            }
            case 'Vapor_Visualizar': {
                this.router.navigate(['/vapor']);
                break;
            }
            case 'Caratula_Visualizar':{
                this.router.navigate(['afip/caratula']);
                break;
            }
            case 'Coem_Visualizar':{
                this.router.navigate(['afip/coem']);
                break;
            }
            case 'Clientes_Visualizar':{
                this.router.navigate(['/clientes']);
                break;
            }
            case 'Destinos_Visualizar':{
                this.router.navigate(['/destinos']);
                break;
            }
            case 'Administracion_Visualizar':{
                this.router.navigate(['administracion/consulta-embarques']);
                break;
            }
            case 'Acuerdos_Visualizar':{
                this.router.navigate(['/acuerdos']);
                break;
            }
        }
    }

    msjeAdvertencia(navegarHacia: string=''){
        const titulo = 'Acceso Denegado';
        const msje = 'No posee permisos para la acción';

        this.confirmationDialogService.confirm(titulo, msje, 'Continuar', '', null, null, Tipoalerta.Warning)
        .then( (confirmed) => {
            if (confirmed) console.log(msje);
        })
        .catch(() => {
            console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
        });
    }
}
