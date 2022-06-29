export interface Usuario{
    username: string;
    // permisos: number[];
    permisos: string[];
    token: any;
    autenticado: boolean;
}