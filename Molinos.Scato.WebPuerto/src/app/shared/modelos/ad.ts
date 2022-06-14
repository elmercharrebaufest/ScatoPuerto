export class PermisosUsuario {
    nombre: string;
    email: string;
    gruposAd: ADPuertoGruposAd[];
}

export class ADPuertoGruposAd {
    id: number;
    nombreGrupoAd: string;
    roles: ADPuertoRoles[];
}

export class ADPuertoRoles {
    id: number;
    nombreRol: string;
    permisos: ADPuertoPermisos[]
}

export class ADPuertoPermisos {
    id: number;
    nombrePermiso: string;
}