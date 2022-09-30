export enum PermisosScato {
  // LineUp
  LineUp_Ver = 'LineUp_Ver', // IMPLEMENTADO
  LineUp_AltaEmbarque = 'LineUp_AltaEmbarque', // IMPLEMENTADO
  LineUp_VerCalendario = 'LineUp_VerCalendario', // IMPLEMENTADO
  LineUp_VerGeo = 'LineUp_VerGeo', // IMPLEMENTADO
  LineUp_EditarEmbarqueEnCalidad = 'LineUp_EditarEmbarqueEnCalidad', // IMPLEMENTADO
  LineUp_EditarOrdenEmbarque = 'LineUp_EditarOrdenEmbarque', // IMPLEMENTADO
  LineUp_EditarUbicacionEmbarque = 'LineUp_EditarUbicacionEmbarque', // IMPLEMENTADO
  LineUp_EditarChecksEmbarque = 'LineUp_EditarChecksEmbarque', // IMPLEMENTADO
  LineUp_EditarPlanoDeCarga = 'LineUp_EditarPlanoDeCarga', // IMPLEMENTADO
  LineUp_EditarBuque = 'LineUp_EditarBuque', // IMPLEMENTADO
  LineUp_EliminarBuque = 'LineUp_EliminarBuque', // IMPLEMENTADO
  LineUp_EnviarMail = 'LineUp_EnviarMail', // nuevo, agregar // IMPLEMENTADO
  LineUp_Exportar = 'LineUp_Exportar', // nuevo, agregar // IMPLEMENTADO

  // PlanoDeCarga
  PlanoDeCarga_Ver = 'PlanoDeCarga_Ver', // IMPLEMENTADO
  PlanoDeCarga_Bodegas_Modificar = 'PlanoDeCarga_Bodegas_Modificar', // nuevo, agregar. // IMPLEMENTADO
  PlanoDeCarga_CargasComerciales_Modificar = 'PlanoDeCarga_CargasComerciales_Modificar', // nuevo, agregar. // IMPLEMENTADO
  PlanoDeCarga_DefensasMoviles_Modificar = 'PlanoDeCarga_DefensasMoviles_Modificar', // nuevo, agregar. // IMPLEMENTADO
  PlanoDeCarga_Fumigacion_Modificar = 'PlanoDeCarga_Fumigacion_Modificar', // nuevo, agregar. // IMPLEMENTADO
  PlanoDeCarga_Estiba_Modificar = 'PlanoDeCarga_Estiba_Modificar', // nuevo, agregar.
  PlanoDeCarga_AgenciaControlPrivado_Modificar = 'PlanoDeCarga_AgenciaControlPrivado_Modificar', // nuevo, agregar.
  PlanoDeCarga_AgentesControlPrivado_Modificar = 'PlanoDeCarga_AgentesControlPrivado_Modificar', // nuevo, agregar.
  PlanoDeCarga_Observaciones_Modificar = 'PlanoDeCarga_Observaciones_Modificar', // nuevo, agregar. // IMPLEMENTADO
  PlanoDeCarga_CaladoSalida_Modificar = 'PlanoDeCarga_CaladoSalida_Modificar', // nuevo, agregar. // IMPLEMENTADO
  PlanoDeCarga_Modificar = 'PlanoDeCarga_Modificar', // nuevo, agregar. Permiso general
  PlanoDeCarga_AgregarNuevoBuque = 'PlanoDeCarga_AgregarNuevoBuque', // IMPLEMENTADO
  PlanoDeCarga_AMB = 'PlanoDeCarga_AMB', // IMPLEMENTADO
  PlanoDeCarga_Adjuntar = 'PlanoDeCarga_Adjuntar', // IMPLEMENTADO
  PlanoDeCarga_Guardar = 'PlanoDeCarga_Guardar', // IMPLEMENTADO
  PlanoDeCarga_Finalizar = 'PlanoDeCarga_Finalizar', // IMPLEMENTADO
  PlanoDeCarga_Imprimir = 'PlanoDeCarga_Imprimir', // IMPLEMENTADO
  PlanoDeCarga_Cancelar = 'PlanoDeCarga_Cancelar', // IMPLEMENTADO

  // Sólido
  GraficoDeCeldas_Modificar = 'GraficoDeCeldas_Modificar',
  ConformacionManosEmbarque_Modificar = 'ConformacionManosEmbarque_Modificar', // IMPLEMENTADO
  Tabiques_Modificar = 'Tabiques_Modificar', // nuevo, agregar. // IMPLEMENTADO
  Operadores_EnviarATablerista = 'Operadores_EnviarATablerista', // nuevo, agregar // IMPLEMENTADO

  // TableroSolido
  TableroSolido_Amarre_Modificar = 'TableroSolido_Amarre_Modificar', // IMPLEMENTADO
  TableroSolido_Umap_EliminarRegistro = 'TableroSolido_Umap_EliminarRegistro', // IMPLEMENTADO
  TableroSolido_Umap_AgregarEncendido = 'TableroSolido_Umap_AgregarEncendido', // IMPLEMENTADO
  TableroSolido_Umap_Modificar = 'TableroSolido_Umap_Modificar', // nuevo, agregar // IMPLEMENTADO
  TableroSolido_IniciarCargaBalanzas = 'TableroSolido_IniciarCargaBalanzas', // IMPLEMENTADO
  TableroSolido_CorteManualBalanzas = 'TableroSolido_CorteManualBalanzas', // IMPLEMENTADO
  TableroSolido_MotivoCorte_Editar = 'TableroSolido_MotivoCorte_Editar', // IMPLEMENTADO
  TableroSolido_TerminarCarga_Exportar = 'TableroSolido_TerminarCarga_Exportar', // IMPLEMENTADO
  TableroSolido_VerRitmosEmbarqueBlzas78 = 'TableroSolido_VerRitmosEmbarqueBlzas78', // IMPLEMENTADO
  TableroSolido_VerCargasBodegas = 'TableroSolido_VerCargasBodegas', // IMPLEMENTADO
  TableroSolido_VerRitmos = 'TableroSolido_VerRitmos', // IMPLEMENTADO
  TableroSolido_VerInformacionAdicional = 'TableroSolido_VerInformacionAdicional', // IMPLEMENTADO

  // Liquido
  Liquido_VerPeriodoDeCarga = 'Liquido_VerPeriodoDeCarga',
  Liquido_EditarPeriodoDeCarga = 'Liquido_EditarPeriodoDeCarga', // IMPLEMENTADO
  Liquido_VerHabilitacionTanques = 'Liquido_VerHabilitacionTanques',
  Liquido_EditarHabilitacionTanques = 'Liquido_EditarHabilitacionTanques', // IMPLEMENTADO
  Liquido_ConformacionLineasEmb_Editar = 'Liquido_ConformacionLineasEmb_Editar', // IMPLEMENTADO
  Liquido_ConformacionLineasEmb_Eliminar = 'Liquido_ConformacionLineasEmb_Eliminar', // IMPLEMENTADO
  Liquido_PlanillaEmbarque_Editar = 'Liquido_PlanillaEmbarque_Editar', // IMPLEMENTADO

  // TableroLiquido
  TableroLiquido_Planilla_Editar = 'TableroLiquido_Planilla_Editar', // IMPLEMENTADO
  TableroLiquido_AgregarTurno = 'TableroLiquido_AgregarTurno', // IMPLEMENTADO
  TableroLiquido_GuardarTurno = 'TableroLiquido_GuardarTurno', // IMPLEMENTADO
  TableroLiquido_EnviarARecibidores = 'TableroLiquido_EnviarARecibidores', // IMPLEMENTADO
  TableroLiquido_AgregarCorte = 'TableroLiquido_AgregarCorte', // IMPLEMENTADO
  TableroLiquido_Exportar = 'TableroLiquido_Exportar', // IMPLEMENTADO
  TableroLiquido_VerRitmos = 'TableroLiquido_VerRitmos',

  // Recibidores / Calidad
  Recibidores_Ver = 'Recibidores_Ver',
  Recibidores_ExportarEnviarPlanillas = "Recibidores_ExportarEnviarPlanillas", // nuevo, agregar // IMPLEMENTADO
  Recibidores_EmitirRecibo = "Recibidores_EmitirRecibo", // nuevo, agregar // IMPLEMENTADO
  Recibidores_Nir_AgregarNuevaFila = "Recibidores_Nir_AgregarNuevaFila", // nuevo, agregar // IMPLEMENTADO
  Recibidores_Nir_EliminarFila = "Recibidores_Nir_EliminarFila", // nuevo, agregar // IMPLEMENTADO
  Recibidores_Nir_EnviarNir = "Recibidores_Nir_EnviarNir", // nuevo, agregar // IMPLEMENTADO
  Recibidores_Nir_GuardarNir = "Recibidores_Nir_GuardarNir",
  Recibidores_Recibo_Imprimir = "Recibidores_Recibo_Imprimir", // nuevo, agregar // IMPLEMENTADO
  Recibidores_Recibo_ConfirmarDatos = "Recibidores_Recibo_ConfirmarDatos", // nuevo, agregar // IMPLEMENTADO
  Recibidores_Imprimir = "Recibidores_Imprimir", // nuevo, agregar // IMPLEMENTADO

  // Geolocalizacion
  Geolocalizacion_Ver = 'Geolocalizacion_Ver',

  // Buques
  Buque_Ver = 'Buque_Ver',
  Buque_Operatoria_Ver = 'Buque_Operatoria_Ver',
  
  Buques_Resumen_De_Operatoria = 'Buques_Resumen_De_Operatoria',
}
