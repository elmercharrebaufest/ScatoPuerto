export enum PermisosScato {
  // LineUp
  LineUp_Ver = 'LineUp_Ver',
  LineUp_AltaEmbarque = 'LineUp_AltaEmbarque',
  LineUp_VerCalendario = 'LineUp_VerCalendario',
  LineUp_VerGeo = 'LineUp_VerGeo',
  LineUp_EditarEmbarqueEnCalidad = 'LineUp_EditarEmbarqueEnCalidad',
  LineUp_EditarOrdenEmbarque = 'LineUp_EditarOrdenEmbarque',
  LineUp_EditarUbicacionEmbarque = 'LineUp_EditarUbicacionEmbarque',
  LineUp_EditarChecksEmbarque = 'LineUp_EditarChecksEmbarque',
  LineUp_EditarBuque = 'LineUp_EditarBuque',
  LineUp_EliminarBuque = 'LineUp_EliminarBuque',
  LineUp_EnviarMail = 'LineUp_EnviarMail',
  LineUp_Exportar = 'LineUp_Exportar',
  LineUp_Adjuntar = 'LineUp_Adjuntar',

  // Plano de Carga
  PDC_Ver = 'PDC_Ver',
  PDC_Guardar = "PDC_Guardar",
  PDC_Finalizar = "PDC_Finalizar",

  // CARGA
  Carga_Ver = 'Carga_Ver',
  PlanoDeCarga_Bodegas_Modificar = 'PlanoDeCarga_Bodegas_Modificar',
  PlanoDeCarga_CargasComerciales_Modificar = 'PlanoDeCarga_CargasComerciales_Modificar',
  PlanoDeCarga_DefensasMoviles_Modificar = 'PlanoDeCarga_DefensasMoviles_Modificar',
  PlanoDeCarga_Fumigacion_Modificar = 'PlanoDeCarga_Fumigacion_Modificar',
  PlanoDeCarga_Estiba_Modificar = 'PlanoDeCarga_Estiba_Modificar',
  PlanoDeCarga_AgenciaControlPrivado_Modificar = 'PlanoDeCarga_AgenciaControlPrivado_Modificar',
  PlanoDeCarga_AgentesControlPrivado_Modificar = 'PlanoDeCarga_AgentesControlPrivado_Modificar',
  PlanoDeCarga_Observaciones_Modificar = 'PlanoDeCarga_Observaciones_Modificar',
  PlanoDeCarga_CaladoSalida_Modificar = 'PlanoDeCarga_CaladoSalida_Modificar',
  PlanoDeCarga_Modificar = 'PlanoDeCarga_Modificar',
  PlanoDeCarga_AgregarNuevoBuque = 'PlanoDeCarga_AgregarNuevoBuque',
  PlanoDeCarga_AMB = 'PlanoDeCarga_AMB',
  PlanoDeCarga_Adjuntar = 'PlanoDeCarga_Adjuntar',
  PlanoDeCarga_Guardar = 'PlanoDeCarga_Guardar',
  PlanoDeCarga_Finalizar = 'PlanoDeCarga_Finalizar',
  PlanoDeCarga_Imprimir = 'PlanoDeCarga_Imprimir',
  PlanoDeCarga_Cancelar = 'PlanoDeCarga_Cancelar',

  // Sólido
  GraficoDeCeldas_Modificar = 'GraficoDeCeldas_Modificar',
  ConformacionManosEmbarque_Modificar = 'ConformacionManosEmbarque_Modificar',
  Tabiques_Modificar = 'Tabiques_Modificar',
  Operadores_EnviarATablerista = 'Operadores_EnviarATablerista',

  // TableroSolido
  TableroSolido_Amarre_Modificar = 'TableroSolido_Amarre_Modificar',
  TableroSolido_Umap_EliminarRegistro = 'TableroSolido_Umap_EliminarRegistro',
  TableroSolido_Umap_AgregarEncendido = 'TableroSolido_Umap_AgregarEncendido',
  TableroSolido_Umap_Modificar = 'TableroSolido_Umap_Modificar',
  TableroSolido_IniciarCargaBalanzas = 'TableroSolido_IniciarCargaBalanzas',
  TableroSolido_CorteManualBalanzas = 'TableroSolido_CorteManualBalanzas',
  TableroSolido_MotivoCorte_Editar = 'TableroSolido_MotivoCorte_Editar',
  TableroSolido_TerminarCarga_Exportar = 'TableroSolido_TerminarCarga_Exportar',
  TableroSolido_VerRitmosEmbarqueBlzas78 = 'TableroSolido_VerRitmosEmbarqueBlzas78',
  TableroSolido_VerCargasBodegas = 'TableroSolido_VerCargasBodegas',
  TableroSolido_VerRitmos = 'TableroSolido_VerRitmos',
  TableroSolido_VerInformacionAdicional = 'TableroSolido_VerInformacionAdicional',

  // Liquido
  Liquido_VerPeriodoDeCarga = 'Liquido_VerPeriodoDeCarga',
  Liquido_EditarPeriodoDeCarga = 'Liquido_EditarPeriodoDeCarga',
  Liquido_PeriodoDeCarga_Guardar = 'Liquido_PeriodoDeCarga_Guardar',
  Liquido_VerHabilitacionTanques = 'Liquido_VerHabilitacionTanques',
  Liquido_EditarHabilitacionTanques = 'Liquido_EditarHabilitacionTanques',
  Liquido_ConformacionLineasEmb_Editar = 'Liquido_ConformacionLineasEmb_Editar',
  Liquido_ConformacionLineasEmb_Eliminar = 'Liquido_ConformacionLineasEmb_Eliminar',
  Liquido_PlanillaEmbarque_Editar = 'Liquido_PlanillaEmbarque_Editar',

  // TableroLiquido
  TableroLiquido_Planilla_Editar = 'TableroLiquido_Planilla_Editar',
  TableroLiquido_AgregarTurno = 'TableroLiquido_AgregarTurno',
  TableroLiquido_GuardarTurno = 'TableroLiquido_GuardarTurno',
  TableroLiquido_AgregarLinea = 'TableroLiquido_AgregarLinea',
  TableroLiquido_EliminarLinea = 'TableroLiquido_EliminarLinea',
  TableroLiquido_EnviarARecibidores = 'TableroLiquido_EnviarARecibidores',
  TableroLiquido_AgregarCorte = 'TableroLiquido_AgregarCorte',
  TableroLiquido_Exportar = 'TableroLiquido_Exportar',
  TableroLiquido_VerRitmos = 'TableroLiquido_VerRitmos',

  // Recibidores / Calidad
  Recibidores_Ver = 'Recibidores_Ver',
  Recibidores_ExportarEnviarPlanillas = "Recibidores_ExportarEnviarPlanillas",
  Recibidores_ObsCalidad_Agregar = "Recibidores_ObsCalidad_Agregar",
  Recibidores_EmitirRecibo = "Recibidores_EmitirRecibo",
  Recibidores_Nir_AgregarNuevaFila = "Recibidores_Nir_AgregarNuevaFila",
  Recibidores_Nir_EliminarFila = "Recibidores_Nir_EliminarFila",
  Recibidores_Nir_EnviarNir = "Recibidores_Nir_EnviarNir",
  Recibidores_Nir_GuardarNir = "Recibidores_Nir_GuardarNir",
  Recibidores_Nir_Modificar = "Recibidores_Nir_Modificar",
  Recibidores_Recibo_Imprimir = "Recibidores_Recibo_Imprimir",
  Recibidores_Recibo_ConfirmarDatos = "Recibidores_Recibo_ConfirmarDatos",
  Recibidores_Imprimir = "Recibidores_Imprimir",
  Recibidores_Finalizar = "Recibidores_Finalizar",

  // Geolocalizacion
  Geolocalizacion_Ver = 'Geolocalizacion_Ver',

  // Buques
  Buque_Ver = 'Buque_Ver',
  Buque_Operatoria_Ver = 'Buque_Operatoria_Ver',  
  Buques_Resumen_De_Operatoria = 'Buques_Resumen_De_Operatoria',

  //Programa de embarque

  Comex_Nominacion_Nominar = "Comex_Nominacion_Nominar",
  Comex_Nominacion_Eliminar = "Comex_Nominacion_Eliminar",
  Comex_Nominacion_Modificar = "Comex_Nominacion_Modificar",
  Comex_Nominacion_Guardar = "Comex_Nominacion_Guardar",
  Comex_Nominacion_Ver = "Comex_Nominacion_Ver",
  Comex_Nominacion_Enviar_LineUp = "Comex_Nominacion_Enviar_LineUp",

  //Vapor

  Vapor_Visualizar = "Vapor_Visualizar",
  Vapor_Editar = "Vapor_Editar",
  Vapor_Crear = "Vapor_Crear",
  Vapor_Eliminar = "Vapor_Eliminar",

  //Exportadores ó Cargadores
  Exportadores_Visualizar = "Exportadores_Visualizar",

  // Afip

  Caratula_Visualizar="Caratula_Visualizar",
  Caratula_Editar="Caratula_Editar",
  Caratula_Crear="Caratula_Crear",
  Caratula_Eliminar="Caratula_Eliminar",

  Coem_Visualizar="Coem_Visualizar",
  Coem_Editar="Coem_Editar",
  Coem_Crear="Coem_Crear",
  Coem_Eliminar="Coem_Eliminar",

  Code_Visualizar="Code_Visualizar",
  Code_Editar="Code_Editar",
  Code_Crear="Code_Crear",
  Code_Eliminar="Code_Eliminar",

  //Clientes

  Clientes_Visualizar = "Clientes_Visualizar",
  Clientes_Editar = "Clientes_Editar",
  Clientes_Crear = "Clientes_Crear",
  Clientes_Eliminar = "Clientes_Eliminar",

}
