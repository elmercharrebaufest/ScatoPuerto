import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { MaterialPuerto } from "@ScatoModels/material-puerto";
import { EmbarqueService } from "@ScatoServicios/embarque.service";
import { tap } from "rxjs/operators";
import { GetObtenerProductos } from "./material.actions";

export class ProductoStateModel {
    productos: MaterialPuerto[];
    selectedBuque: any;
}

@State<ProductoStateModel>({
    name: 'productos',
    defaults: {
        productos: [],
        selectedBuque: null
    }
})

@Injectable()
export class ProductoState{

    constructor(private embarqueService: EmbarqueService) {
    }

    @Selector()
    static getListaProductos(state: ProductoStateModel) {
        return state.productos;
    }

    @Action(GetObtenerProductos)
    getObtenerProductos({getState, setState}: StateContext<ProductoStateModel>) {
        return this.embarqueService.obtenerListadoMateriales().pipe(tap((result) => {
            const state = getState();
            setState({
                ...state,
                productos: result,
            });
        }));
    }

}