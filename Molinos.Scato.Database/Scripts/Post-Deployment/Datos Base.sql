

--Tipo de Buque Puerto
IF NOT EXISTS (select 1 from TipoDeBuquePuerto where Nombre = 'Handy-sized') BEGIN insert into TipoDeBuquePuerto(Nombre) values ('Handy-sized'); END
IF NOT EXISTS (select 1 from TipoDeBuquePuerto where Nombre = 'Handy-max') BEGIN insert into TipoDeBuquePuerto(Nombre) values ('Handy-max'); END
IF NOT EXISTS (select 1 from TipoDeBuquePuerto where Nombre = 'Wood-chip carriers') BEGIN insert into TipoDeBuquePuerto(Nombre) values ('Wood-chip carriers'); END
IF NOT EXISTS (select 1 from TipoDeBuquePuerto where Nombre = 'WPanamax') BEGIN insert into TipoDeBuquePuerto(Nombre) values ('WPanamax'); END
IF NOT EXISTS (select 1 from TipoDeBuquePuerto where Nombre = 'Bulk Carrier') BEGIN insert into TipoDeBuquePuerto(Nombre) values ('Bulk Carrier'); END
IF NOT EXISTS (select 1 from TipoDeBuquePuerto where Nombre = 'Oil Tanker') BEGIN insert into TipoDeBuquePuerto(Nombre) values ('Oil Tanker'); END
GO

--Ubicación de Buque Puerto
IF NOT EXISTS (select 1 from UbicacionDeBuquePuerto where Nombre = 'Zarpó') BEGIN insert into UbicacionDeBuquePuerto(Nombre, Orden) values ('Zarpó', 1); END
IF NOT EXISTS (select 1 from UbicacionDeBuquePuerto where Nombre = 'Muelle de Carga') BEGIN insert into UbicacionDeBuquePuerto(Nombre, Orden) values ('Muelle de Carga', 2); END
IF NOT EXISTS (select 1 from UbicacionDeBuquePuerto where Nombre = 'Rada de Carga') BEGIN insert into UbicacionDeBuquePuerto(Nombre, Orden) values ('Rada de Carga', 3); END
IF NOT EXISTS (select 1 from UbicacionDeBuquePuerto where Nombre = 'Otra Rada') BEGIN insert into UbicacionDeBuquePuerto(Nombre, Orden) values ('Otra Rada', 4); END
IF NOT EXISTS (select 1 from UbicacionDeBuquePuerto where Nombre = 'Otro Muelle') BEGIN insert into UbicacionDeBuquePuerto(Nombre, Orden) values ('Otro Muelle', 5); END
IF NOT EXISTS (select 1 from UbicacionDeBuquePuerto where Nombre = 'Subiendo') BEGIN insert into UbicacionDeBuquePuerto(Nombre, Orden) values ('Subiendo', 6); END
IF NOT EXISTS (select 1 from UbicacionDeBuquePuerto where Nombre = 'Recalada') BEGIN insert into UbicacionDeBuquePuerto(Nombre, Orden) values ('Recalada', 7); END
IF NOT EXISTS (select 1 from UbicacionDeBuquePuerto where Nombre = 'En Viaje') BEGIN insert into UbicacionDeBuquePuerto(Nombre, Orden) values ('En Viaje', 8); END

GO

--Celdas de Mano de Embarque
IF NOT EXISTS (select 1 from CeldaManoDeEmbarque where Nombre = '7') BEGIN insert into CeldaManoDeEmbarque(Nombre, Posicion) values ('7', 1); END
IF NOT EXISTS (select 1 from CeldaManoDeEmbarque where Nombre = '20') BEGIN insert into CeldaManoDeEmbarque(Nombre, Posicion) values ('20', 2); END
IF NOT EXISTS (select 1 from CeldaManoDeEmbarque where Nombre = '23') BEGIN insert into CeldaManoDeEmbarque(Nombre, Posicion) values ('23', 3); END
IF NOT EXISTS (select 1 from CeldaManoDeEmbarque where Nombre = '30') BEGIN insert into CeldaManoDeEmbarque(Nombre, Posicion) values ('30', 4); END
IF NOT EXISTS (select 1 from CeldaManoDeEmbarque where Nombre = 'Silo 31') BEGIN insert into CeldaManoDeEmbarque(Nombre, Posicion) values ('Silo 31', 5); END
IF NOT EXISTS (select 1 from CeldaManoDeEmbarque where Nombre = 'Silo 32') BEGIN insert into CeldaManoDeEmbarque(Nombre, Posicion) values ('Silo 32', 6); END
IF NOT EXISTS (select 1 from CeldaManoDeEmbarque where Nombre = 'Silo Logística') BEGIN insert into CeldaManoDeEmbarque(Nombre, Posicion) values ('Silo Logística', 7); END
IF NOT EXISTS (select 1 from CeldaManoDeEmbarque where Nombre = 'PVO5') BEGIN insert into CeldaManoDeEmbarque(Nombre, Posicion) values ('PVO5', 11); END
IF NOT EXISTS (select 1 from CeldaManoDeEmbarque where Nombre = 'PV06/7') BEGIN insert into CeldaManoDeEmbarque(Nombre, Posicion) values ('PV06/7', 12); END
GO

--Sentidos de Mano de Embarque
IF NOT EXISTS (select 1 from SentidoManoDeEmbarque where Nombre = 'Norte a sur') BEGIN insert into SentidoManoDeEmbarque(Nombre, Posicion) values ('Norte a sur', 1); END
IF NOT EXISTS (select 1 from SentidoManoDeEmbarque where Nombre = 'Sur a norte') BEGIN insert into SentidoManoDeEmbarque(Nombre, Posicion) values ('Sur a norte', 2); END
IF NOT EXISTS (select 1 from SentidoManoDeEmbarque where Nombre = 'Centro a sur') BEGIN insert into SentidoManoDeEmbarque(Nombre, Posicion) values ('Centro a sur', 3); END
IF NOT EXISTS (select 1 from SentidoManoDeEmbarque where Nombre = 'Centro a norte') BEGIN insert into SentidoManoDeEmbarque(Nombre, Posicion) values ('Centro a norte', 4); END
IF NOT EXISTS (select 1 from SentidoManoDeEmbarque where Nombre = 'Oeste a este') BEGIN insert into SentidoManoDeEmbarque(Nombre, Posicion) values ('Oeste a este', 5); END
IF NOT EXISTS (select 1 from SentidoManoDeEmbarque where Nombre = 'Este a oeste') BEGIN insert into SentidoManoDeEmbarque(Nombre, Posicion) values ('Este a oeste', 6); END
IF NOT EXISTS (select 1 from SentidoManoDeEmbarque where Nombre = 'Centro a este') BEGIN insert into SentidoManoDeEmbarque(Nombre, Posicion) values ('Centro a este', 7); END
IF NOT EXISTS (select 1 from SentidoManoDeEmbarque where Nombre = 'Centro a Oeste') BEGIN insert into SentidoManoDeEmbarque(Nombre, Posicion) values ('Centro a Oeste', 8); END
IF NOT EXISTS (select 1 from SentidoManoDeEmbarque where Nombre = 'Gravedad') BEGIN insert into SentidoManoDeEmbarque(Nombre, Posicion) values ('Gravedad', 9); END
IF NOT EXISTS (select 1 from SentidoManoDeEmbarque where Nombre = 'Descarga') BEGIN insert into SentidoManoDeEmbarque(Nombre, Posicion) values ('Descarga', 10); END
IF NOT EXISTS (select 1 from SentidoManoDeEmbarque where Nombre = 'Producción') BEGIN insert into SentidoManoDeEmbarque(Nombre, Posicion) values ('Producción', 11); END
GO

--Motivos Horas a la Espera de Limpieza
IF NOT EXISTS (select 1 from MotivosLimpieza where Nombre = 'Falta de Limpieza') BEGIN insert into MotivosLimpieza(Nombre) values ('Falta de Limpieza'); END
IF NOT EXISTS (select 1 from MotivosLimpieza where Nombre = 'Insectos Vivos') BEGIN insert into MotivosLimpieza(Nombre) values ('Insectos Vivos'); END
IF NOT EXISTS (select 1 from MotivosLimpieza where Nombre = 'Cascarones') BEGIN insert into MotivosLimpieza(Nombre) values ('Cascarones'); END
IF NOT EXISTS (select 1 from MotivosLimpieza where Nombre = 'Resto de Óxido') BEGIN insert into MotivosLimpieza(Nombre) values ('Resto de Óxido'); END
IF NOT EXISTS (select 1 from MotivosLimpieza where Nombre = 'Resto de Carga Anterior') BEGIN insert into MotivosLimpieza(Nombre) values ('Resto de Carga Anterior'); END
IF NOT EXISTS (select 1 from MotivosLimpieza where Nombre = 'Otros') BEGIN insert into MotivosLimpieza(Nombre) values ('Otros'); END
GO

--Motivos Fallas de Balanzas
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Baja Carga Buque') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Baja Carga Buque', 'BCB'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Baja Carga Puerto') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Baja Carga Puerto', 'BCP'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Calidad de Mercadería') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Calidad de Mercadería', 'C'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Fallas Eléctricas de equipos de MOA') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Fallas Eléctricas de equipos de MOA', 'E'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Por Fuleo de bodegas') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Por Fuleo de bodegas', 'F'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Por Habilitación del buque') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Por Habilitación del buque', 'H'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Fallas Mecánicas de equipos de MOA') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Fallas Mecánicas de equipos de MOA', 'M'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Operativas de Puerto MOA') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Operativas de Puerto MOA', 'OP'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Operativas de MOA Comercial') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Operativas de MOA Comercial', 'OC'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Operativas del Buque') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Operativas del Buque', 'OB'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Pala/Paleo') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Pala/Paleo', 'P'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Terceros') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Terceros', '3ro'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Otros') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Otros', 'T'); END

IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Normal') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Normal', 'N'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Espera Determinante') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Espera Determinante', 'ED'); END
GO

--Motivos De Corte
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Baja Carga Buque') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Baja Carga Buque', 'BCB'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Baja Carga Puerto') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Baja Carga Puerto', 'BCP'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Calidad de Mercadería') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Calidad de Mercadería', 'C'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Fallas Eléctricas de equipos de MOA') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Fallas Eléctricas de equipos de MOA', 'E'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Por Fuleo de bodegas') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Por Fuleo de bodegas', 'F'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Por Habilitación del buque') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Por Habilitación del buque', 'H'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Fallas Mecánicas de equipos de MOA') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Fallas Mecánicas de equipos de MOA', 'M'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Normal') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Normal', 'N'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Operativas de Puerto MOA') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Operativas de Puerto MOA', 'OP'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Operativas de MOA Comercial') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Operativas de MOA Comercial', 'OC'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Operativas del Buque') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Operativas del Buque', 'OB'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Terceros') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Terceros', '3ro'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Otros') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Otros', 'T'); END
-- IF NOT EXISTS (select 1 from MotivosDeCorte where Nombre = 'Espera Determinante') BEGIN insert into MotivosDeCorte(Nombre, Siglas) values ('Espera Determinante', 'ED'); END
-- GO

--Turnos de Puerto
IF NOT EXISTS (select 1 from TurnoPuerto where Nombre = '00-06') BEGIN insert into TurnoPuerto(Nombre, Orden) values ('00-06', 1); END
IF NOT EXISTS (select 1 from TurnoPuerto where Nombre = '06-12') BEGIN insert into TurnoPuerto(Nombre, Orden) values ('06-12', 2); END
IF NOT EXISTS (select 1 from TurnoPuerto where Nombre = '12-18') BEGIN insert into TurnoPuerto(Nombre, Orden) values ('12-18', 3); END
IF NOT EXISTS (select 1 from TurnoPuerto where Nombre = '18-24') BEGIN insert into TurnoPuerto(Nombre, Orden) values ('18-24', 4); END
GO


--Estados del buque
IF NOT EXISTS (select 1 from EstadoBuque where Descripcion = 'PreOperativo' and Id = 1) BEGIN insert into EstadoBuque(Descripcion, Id) values ('PreOperativo',1); END
IF NOT EXISTS (select 1 from EstadoBuque where Descripcion = 'Cargando' and Id = 2) BEGIN insert into EstadoBuque(Descripcion, Id) values ('Cargando',2); END
IF NOT EXISTS (select 1 from EstadoBuque where Descripcion = 'ControlCalidad' and Id = 3) BEGIN insert into EstadoBuque(Descripcion, Id) values ('ControlCalidad',3); END
IF NOT EXISTS (select 1 from EstadoBuque where Descripcion = 'PostOperativo' and Id = 4) BEGIN insert into EstadoBuque(Descripcion, Id) values ('PostOperativo',4); END
GO

--Parámetros
IF NOT EXISTS (select 1 from Parametros where Descripcion = 'ConsoleLog' and Id = 1) BEGIN insert into Parametros(Id, Descripcion, Activo, Parametro1, Parametro2, Parametro3) values (1, 'ConsoleLog', 0, 0, 0, ''); END
IF NOT EXISTS (select 1 from Parametros where Descripcion = 'tiempoActualizacionBalanzas' and Id = 2) BEGIN insert into Parametros(Id, Descripcion, Activo, Parametro1, Parametro2, Parametro3) values (2, 'tiempoActualizacionBalanzas', 0, 0, 15000, ''); END
IF NOT EXISTS (select 1 from Parametros where Descripcion = 'tiempoActualizacionRitmosBlzas78' and Id = 3) BEGIN insert into Parametros(Id, Descripcion, Activo, Parametro1, Parametro2, Parametro3) values (3, 'tiempoActualizacionRitmosBlzas78', 0, 0, 15000, ''); END
IF NOT EXISTS (select 1 from Parametros where Descripcion = 'toneladasBajaCarga' and Id = 4) BEGIN insert into Parametros(Id, Descripcion, Activo, Parametro1, Parametro2, Parametro3) values (4, 'toneladasBajaCarga', 0, 0, 950, ''); END
IF NOT EXISTS (select 1 from Parametros where Descripcion = 'tiempoActualizacionRelojes' and Id = 5) BEGIN insert into Parametros(Id, Descripcion, Activo, Parametro1, Parametro2, Parametro3) values (5, 'tiempoActualizacionRelojes', 0, 0, 15000, ''); END
IF NOT EXISTS (select 1 from Parametros where Descripcion = 'NumeroInicioComprobante' and Id = 6) BEGIN insert into Parametros(Id, Descripcion, Activo, Parametro1, Parametro2, Parametro3) values (6, 'NumeroInicioComprobante', 0, 0, 0, '0000000000'); END
GO

--Correo Planilla de Turnos
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'PlanillaDeTurnos') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('PlanillaDeTurnos','SupervisoresPuertosanLorenzo@molinosagro.com.ar;sebastian.bolger@molinosagro.com.ar,fabricio.herrera@molinosagro.com.ar;jose.luis.gomez@molinosagro.com.ar;marcelo.gustavo.lopez@molinosagro.com.ar;sebastian.muniz@molinosagro.com.ar;german.turcutto@molinosagro.com.ar;Pablo.Yturres@molinosagro.com.ar;mauro.mir@molinosagro.com.ar;nestor.abalos@molinosagro.com.ar'); END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'PlanillaDeTurnosSolido') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('PlanillaDeTurnosSolido','mauro.mir@molinosagro.com.ar; cristian.leonori@molinosagro.com.ar; martin.amado@molinosagro.com.ar;rodolfo.benegas@mocommodities.com; German.Castagnani@molinosagro.com.ar;juan.catala@molinosagro.com.ar; gabriel.conde@mocommodities.com;romina.escudero@molinosagro.com.ar; gustavo.fridrich@molinosagro.com.ar;guido.gallo@mocommodities.com; GrupoPeritosDeEmbarque@molinosagro.com.ar;Antonela.Labonia@molinosagro.com.ar; Ariel.Lascano@molinosagro.com.ar;macarena.asqueri@molinosagro.com.ar;paulino.martinez@Molinosagro.com.ar;omar.mazany@molinosagro.com.ar; ariel.pedrozo@molinosagro.com.ar;liz.pereira@molinosagro.com.ar; pablo.piras@mocommodities.com;jimena.rodriguez@molinosagro.com.ar; federico.romano@molinosagro.com.ar;SupervisoresPuertosanLorenzo@molinosagro.com.ar; joaquin.sarachaga@mocommodities.com;Grupo-Turnosyfinalizacindeembarques@molinosagro.onmicrosoft.com;paulino.martinez@Molinosagro.com.ar'); END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'PlanillaDeTurnosLiquido') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('PlanillaDeTurnosLiquido','mauro.mir@molinosagro.com.ar; cristian.leonori@molinosagro.com.ar; martin.amado@molinosagro.com.ar;rodolfo.benegas@mocommodities.com; German.Castagnani@molinosagro.com.ar;juan.catala@molinosagro.com.ar; gabriel.conde@mocommodities.com;romina.escudero@molinosagro.com.ar; gustavo.fridrich@molinosagro.com.ar;guido.gallo@mocommodities.com; GrupoPeritosDeEmbarque@molinosagro.com.ar;Antonela.Labonia@molinosagro.com.ar; Ariel.Lascano@molinosagro.com.ar;macarena.asqueri@molinosagro.com.ar;paulino.martinez@Molinosagro.com.ar;omar.mazany@molinosagro.com.ar; ariel.pedrozo@molinosagro.com.ar;liz.pereira@molinosagro.com.ar; pablo.piras@mocommodities.com;jimena.rodriguez@molinosagro.com.ar; federico.romano@molinosagro.com.ar;SupervisoresPuertosanLorenzo@molinosagro.com.ar; joaquin.sarachaga@mocommodities.com;Grupo-Turnosyfinalizacindeembarques@molinosagro.onmicrosoft.com;paulino.martinez@Molinosagro.com.ar'); END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'PlanillaProgramaEmbarque') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('PlanillaProgramaEmbarque', 'supervisorespuertosanlorenzo@molinosagro.com.ar; macarena.asqueri@molinosagro.com.ar; romina.escudero@molinosagro.com.ar; gustavo.fridrich@molinosagro.com.ar; antonela.labonia@molinosagro.com.ar; ariel.pedrozo@molinosagro.com.ar; liz.pereira@molinosagro.com.ar; federico.romano@molinosagro.com.ar'); END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'PlanillaProgramaEmbarqueCopia') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('PlanillaProgramaEmbarqueCopia', 'scatoprodMOA@molinosagro.com.ar'); END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'NominacionesExcel') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('NominacionesExcel', 'macarena.asqueri@molinosagro.com.ar; gustavo.fridrich@molinosagro.com.ar; cintia.maltoni@molinosagro.com.ar; alejandra.sarquis@molinosagro.com.ar; hugo.baratto@molinosagro.com.ar; omar.mazany@molinosagro.com.ar; diego.mazettelle@molinosagro.com.ar; mauricio.mezzavilla@molinosagro.com.ar; nestor.kantt@molinosagro.com.ar; pablo.noceda@molinosagro.com.ar; edgardo.ponce@molinosagro.com.ar; sergio.mossin@molinosagro.com.ar; pablo.kieffer@molinosagro.com.ar; mauro.ortega@molinosagro.com.ar; cristian.frank@molinosagro.com.ar; rodrigo.gonzalez@molinosagro.com.ar; adrian.mauri@molinosagro.com.ar; martin.amado@molinosagro.com.ar; federico.romano@molinosagro.com.ar; damian.calvet@molinosagro.com.ar; daniel.santos@molinosagro.com.ar; sebastian.bertazzo@molinosagro.com.ar; ruben.bisson@molinosagro.com.ar; fabricio.herrera@molinosagro.com.ar; sebastian.muniz@molinosagro.com.ar; marcelo.gustavo.lopez@molinosagro.com.ar; jose.luis.gomez@molinosagro.com.ar; cristian.leonori@molinosagro.com.ar; nestor.sosaguerci@Molinosagro.com.ar; norberto.moriconi@molinosagro.com.ar; sebastian.bolger@molinosagro.com.ar; matias.abramor@molinosagro.com.ar; martin.manoni@molinosagro.com.ar; mauro.mir@molinosagro.com.ar; leandro.armendari@molinosagro.com.ar; lucioano.arario@molinosagro.com.ar; Antonela.Labonia@molinosagro.com.ar; ariel.pedrozo@molinosagro.com.ar; melina.corio@mocommodities.com; ileana.rodriguez@mocommodities.com; rosario.viana@mocommodities.com; liz.pereira@molinosagro.com.ar; Trading@mocommodities.com; leandro.varela@molinosagro.com.ar; german.turcutto@molinosagro.com.ar; GrupoPeritosDeEmbarque@molinosagro.com.ar; Ariel.Lascano@molinosagro.com.ar; joaquin.sarachaga@mocommodities.com; German.Castagnani@molinosagro.com.ar; jimena.rodriguez@molinosagro.com.ar; emanuel.venica@molinosagro.com.ar; juan.lapissonde@molinosagro.com.ar; hernan.ferreira@mocommodities.com') END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'EmbarqueZarpo') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('EmbarqueZarpo', 'ariel.pedrozo@molinosagro.com.ar; federico.romano@molinosagro.com.ar') END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'AvisoLecturaProgramaEmbarque') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('AvisoLecturaProgramaEmbarque', 'macarena.asqueri@molinosagro.com.ar; romina.escudero@molinosagro.com.ar') END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'DocumentacionPendiente') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('DocumentacionPendiente', 'ileana.rodriguez@mocommodities.com; melina.corio@mocommodities.com; romina.escudero@molinosagro.com.ar; macarena.asqueri@molinosagro.com.ar') END
GO

-- Puntos de Interes para geolocalizacion.
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-35.61958  ' and Longitud='-55.88947') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Recalada','Fondeadero','ancla','','AR','30','-35.61958  ','-55.88947',5,'','','',15000,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-35.04461  ' and Longitud='-56.05877') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Recalada','Fondeadero','ancla','','UR','30','-35.04461  ','-56.05877',5,'','','',15000,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-34.75356  ' and Longitud='-57.83023') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Zona Común La Plata','Fondeadero','ancla','','AR','22','-34.75356  ','-57.83023',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-34.851389' and Longitud='-57.889167') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('La Plata','Puerto','ancla','','AR','22','-34.851389','-57.889167',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-34.595528' and Longitud='-58.364056') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Buenos Aires','Puerto','ancla','','AR','22','-34.595528','-58.364056',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-34.155139' and Longitud='-58.955889') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Campana','Puerto','ancla','','AR','18','-34.155139','-58.955889',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-34.066278' and Longitud='-59.034306') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Zárate','Puerto','ancla','','AR','16','-34.066278','-59.034306',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-33.685667' and Longitud='-59.639361') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('San Pedro','Puerto','ancla','','AR','14','-33.685667','-59.639361',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-33.351389' and Longitud='-60.175139') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('San Nicolás','Puerto','ancla','','AR','6','-33.351389','-60.175139',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-33.2392' and Longitud='-60.30121') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Villa Constitución/Arroyo Seco','Puerto','ancla','','AR','2.5','-33.2392','-60.30121',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.951014' and Longitud='-60.626017') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Rosario ','Puerto','ancla','','AR','1','-32.951014','-60.626017',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.6935' and Longitud='-60.7085') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('San Lorenzo','Puerto','ancla','','AR','0','-32.6935','-60.7085',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.774917' and Longitud='-60.719611') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('San Benito','Muelle de carga','ubicacion','San Lorenzo','AR','0','-32.774917','-60.719611',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.776111' and Longitud='-60.723611') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Vicentín','Muelle de carga','ubicacion','San Lorenzo','AR','3','-32.776111','-60.723611',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.766167' and Longitud='-60.723028') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Nouryon','Muelle de carga','ubicacion','San Lorenzo','AR','3','-32.766167','-60.723028',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.653694' and Longitud='-60.738028') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Terminal 6','Otro muelle','ubicacion','','AR','3','-32.653694','-60.738028',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.583444' and Longitud='-60.780944') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Renova','Otro muelle','ubicacion','','AR','3','-32.583444','-60.780944',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.694889' and Longitud='-60.723444') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('COFCO (PGSM)','Otro muelle','ubicacion','','AR','3','-32.694889','-60.723444',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.603722' and Longitud='-60.762722') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('COFCO (Timbúes)','Otro muelle','ubicacion','','AR','3','-32.603722','-60.762722',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.596833' and Longitud='-60.769833') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('LDC Timbúes (Dreyfus)','Otro muelle','ubicacion','','AR','3','-32.596833','-60.769833',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.648167' and Longitud='-60.743750') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('MINERA','Otro muelle','ubicacion','','AR','3','-32.648167','-60.743750',0,'','','',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.56767762941911 ' and Longitud='-60.73236436084971') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Zona 02','Zona 02','','','','0','-32.56767762941911 ','-60.73236436084971',0,'Cuadrado','Zona San Benito','1',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.578881501707684' and Longitud='-60.78554497297118') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Zona 02','Zona 02','','','','0','-32.578881501707684','-60.78554497297118',0,'Cuadrado','Zona San Benito','2',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.810044421311005' and Longitud='-60.70848960825942') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Zona 02','Zona 02','','','','0','-32.810044421311005','-60.70848960825942',0,'Cuadrado','Zona San Benito','3',0,1,getdate()) END
if not exists(select 1 from PuntosInteresGeolocalizacion where Latitud = '-32.7987566445919  ' and Longitud='-60.65799492589506') BEGIN insert into PuntosInteresGeolocalizacion (Nombre, TipoUbicacion, Imagen,Puerto, Pais, HorasSanBenito, Latitud, Longitud, DistanciaKM, TipoZona, AgrupadorZona, PosicionZona, RadioPunto, Estado, FechaRegistro) values('Zona 02','Zona 02','','','','0','-32.7987566445919  ','-60.65799492589506',0,'Cuadrado','Zona San Benito','4',0,1,getdate()) END


go

-- tabla Bandera
if not exists(select 1 from Bandera where Nombre = 'Afganistán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AF', 'Afganistán');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Gland') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AX', 'Islas Gland');  end
if not exists(select 1 from Bandera where Nombre = 'Albania') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AL', 'Albania');  end
if not exists(select 1 from Bandera where Nombre = 'Alemania') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('DE', 'Alemania');  end
if not exists(select 1 from Bandera where Nombre = 'Andorra') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AD', 'Andorra');  end
if not exists(select 1 from Bandera where Nombre = 'Angola') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AO', 'Angola');  end
if not exists(select 1 from Bandera where Nombre = 'Anguilla') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AI', 'Anguilla');  end
if not exists(select 1 from Bandera where Nombre = 'Antártida') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AQ', 'Antártida');  end
if not exists(select 1 from Bandera where Nombre = 'Antigua y Barbuda') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AG', 'Antigua y Barbuda');  end
if not exists(select 1 from Bandera where Nombre = 'Antillas Holandesas') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AN', 'Antillas Holandesas');  end
if not exists(select 1 from Bandera where Nombre = 'Arabia Saudí') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SA', 'Arabia Saudí');  end
if not exists(select 1 from Bandera where Nombre = 'Argelia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('DZ', 'Argelia');  end
if not exists(select 1 from Bandera where Nombre = 'Argentina') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AR', 'Argentina');  end
if not exists(select 1 from Bandera where Nombre = 'Armenia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AM', 'Armenia');  end
if not exists(select 1 from Bandera where Nombre = 'Aruba') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AW', 'Aruba');  end
if not exists(select 1 from Bandera where Nombre = 'Australia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AU', 'Australia');  end
if not exists(select 1 from Bandera where Nombre = 'Austria') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AT', 'Austria');  end
if not exists(select 1 from Bandera where Nombre = 'Azerbaiyán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AZ', 'Azerbaiyán');  end
if not exists(select 1 from Bandera where Nombre = 'Bahamas') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BS', 'Bahamas');  end
if not exists(select 1 from Bandera where Nombre = 'Bahréin') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BH', 'Bahréin');  end
if not exists(select 1 from Bandera where Nombre = 'Bangladesh') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BD', 'Bangladesh');  end
if not exists(select 1 from Bandera where Nombre = 'Barbados') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BB', 'Barbados');  end
if not exists(select 1 from Bandera where Nombre = 'Bielorrusia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BY', 'Bielorrusia');  end
if not exists(select 1 from Bandera where Nombre = 'Bélgica') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BE', 'Bélgica');  end
if not exists(select 1 from Bandera where Nombre = 'Belice') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BZ', 'Belice');  end
if not exists(select 1 from Bandera where Nombre = 'Benin') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BJ', 'Benin');  end
if not exists(select 1 from Bandera where Nombre = 'Bermudas') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BM', 'Bermudas');  end
if not exists(select 1 from Bandera where Nombre = 'Bhután') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BT', 'Bhután');  end
if not exists(select 1 from Bandera where Nombre = 'Bolivia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BO', 'Bolivia');  end
if not exists(select 1 from Bandera where Nombre = 'Bosnia y Herzegovina') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BA', 'Bosnia y Herzegovina');  end
if not exists(select 1 from Bandera where Nombre = 'Botsuana') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BW', 'Botsuana');  end
if not exists(select 1 from Bandera where Nombre = 'Isla Bouvet') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BV', 'Isla Bouvet');  end
if not exists(select 1 from Bandera where Nombre = 'Brasil') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BR', 'Brasil');  end
if not exists(select 1 from Bandera where Nombre = 'Brunéi') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BN', 'Brunéi');  end
if not exists(select 1 from Bandera where Nombre = 'Bulgaria') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BG', 'Bulgaria');  end
if not exists(select 1 from Bandera where Nombre = 'Burkina Faso') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BF', 'Burkina Faso');  end
if not exists(select 1 from Bandera where Nombre = 'Burundi') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('BI', 'Burundi');  end
if not exists(select 1 from Bandera where Nombre = 'Cabo Verde') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CV', 'Cabo Verde');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Caimán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('KY', 'Islas Caimán');  end
if not exists(select 1 from Bandera where Nombre = 'Camboya') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('KH', 'Camboya');  end
if not exists(select 1 from Bandera where Nombre = 'Camerún') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CM', 'Camerún');  end
if not exists(select 1 from Bandera where Nombre = 'Canadá') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CA', 'Canadá');  end
if not exists(select 1 from Bandera where Nombre = 'República Centroafricana') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CF', 'República Centroafricana');  end
if not exists(select 1 from Bandera where Nombre = 'Chad') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TD', 'Chad');  end
if not exists(select 1 from Bandera where Nombre = 'República Checa') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CZ', 'República Checa');  end
if not exists(select 1 from Bandera where Nombre = 'Chile') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CL', 'Chile');  end
if not exists(select 1 from Bandera where Nombre = 'China') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CN', 'China');  end
if not exists(select 1 from Bandera where Nombre = 'Chipre') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CY', 'Chipre');  end
if not exists(select 1 from Bandera where Nombre = 'Isla de Navidad') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CX', 'Isla de Navidad');  end
if not exists(select 1 from Bandera where Nombre = 'Ciudad del Vaticano') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('VA', 'Ciudad del Vaticano');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Cocos') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CC', 'Islas Cocos');  end
if not exists(select 1 from Bandera where Nombre = 'Colombia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CO', 'Colombia');  end
if not exists(select 1 from Bandera where Nombre = 'Comoras') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('KM', 'Comoras');  end
if not exists(select 1 from Bandera where Nombre = 'República Democrática del Congo') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CD', 'República Democrática del Congo');  end
if not exists(select 1 from Bandera where Nombre = 'Congo') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CG', 'Congo');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Cook') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CK', 'Islas Cook');  end
if not exists(select 1 from Bandera where Nombre = 'Corea del Norte') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('KP', 'Corea del Norte');  end
if not exists(select 1 from Bandera where Nombre = 'Corea del Sur') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('KR', 'Corea del Sur');  end
if not exists(select 1 from Bandera where Nombre = 'Costa de Marfil') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CI', 'Costa de Marfil');  end
if not exists(select 1 from Bandera where Nombre = 'Costa Rica') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CR', 'Costa Rica');  end
if not exists(select 1 from Bandera where Nombre = 'Croacia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('HR', 'Croacia');  end
if not exists(select 1 from Bandera where Nombre = 'Cuba') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CU', 'Cuba');  end
if not exists(select 1 from Bandera where Nombre = 'Dinamarca') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('DK', 'Dinamarca');  end
if not exists(select 1 from Bandera where Nombre = 'Dominica') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('DM', 'Dominica');  end
if not exists(select 1 from Bandera where Nombre = 'República Dominicana') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('DO', 'República Dominicana');  end
if not exists(select 1 from Bandera where Nombre = 'Ecuador') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('EC', 'Ecuador');  end
if not exists(select 1 from Bandera where Nombre = 'Egipto') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('EG', 'Egipto');  end
if not exists(select 1 from Bandera where Nombre = 'El Salvador') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SV', 'El Salvador');  end
if not exists(select 1 from Bandera where Nombre = 'Emiratos Árabes Unidos') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AE', 'Emiratos Árabes Unidos');  end
if not exists(select 1 from Bandera where Nombre = 'Eritrea') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('ER', 'Eritrea');  end
if not exists(select 1 from Bandera where Nombre = 'Eslovaquia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SK', 'Eslovaquia');  end
if not exists(select 1 from Bandera where Nombre = 'Eslovenia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SI', 'Eslovenia');  end
if not exists(select 1 from Bandera where Nombre = 'España') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('ES', 'España');  end
if not exists(select 1 from Bandera where Nombre = 'Islas ultramarinas de Estados Unidos') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('UM', 'Islas ultramarinas de Estados Unidos');  end
if not exists(select 1 from Bandera where Nombre = 'Estados Unidos') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('US', 'Estados Unidos');  end
if not exists(select 1 from Bandera where Nombre = 'Estonia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('EE', 'Estonia');  end
if not exists(select 1 from Bandera where Nombre = 'Etiopía') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('ET', 'Etiopía');  end
if not exists(select 1 from Bandera where Nombre = 'Inglaterra') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GB', 'Inglaterra');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Feroe') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('FO', 'Islas Feroe');  end
if not exists(select 1 from Bandera where Nombre = 'Filipinas') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PH', 'Filipinas');  end
if not exists(select 1 from Bandera where Nombre = 'Finlandia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('FI', 'Finlandia');  end
if not exists(select 1 from Bandera where Nombre = 'Fiyi') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('FJ', 'Fiyi');  end
if not exists(select 1 from Bandera where Nombre = 'Francia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('FR', 'Francia');  end
if not exists(select 1 from Bandera where Nombre = 'Gabón') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GA', 'Gabón');  end
if not exists(select 1 from Bandera where Nombre = 'Gambia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GM', 'Gambia');  end
if not exists(select 1 from Bandera where Nombre = 'Georgia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GE', 'Georgia');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Georgias del Sur y Sandwich del Sur') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GS', 'Islas Georgias del Sur y Sandwich del Sur');  end
if not exists(select 1 from Bandera where Nombre = 'Ghana') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GH', 'Ghana');  end
if not exists(select 1 from Bandera where Nombre = 'Gibraltar') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GI', 'Gibraltar');  end
if not exists(select 1 from Bandera where Nombre = 'Granada') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GD', 'Granada');  end
if not exists(select 1 from Bandera where Nombre = 'Grecia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GR', 'Grecia');  end
if not exists(select 1 from Bandera where Nombre = 'Groenlandia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GL', 'Groenlandia');  end
if not exists(select 1 from Bandera where Nombre = 'Guadalupe') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GP', 'Guadalupe');  end
if not exists(select 1 from Bandera where Nombre = 'Guam') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GU', 'Guam');  end
if not exists(select 1 from Bandera where Nombre = 'Guatemala') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GT', 'Guatemala');  end
if not exists(select 1 from Bandera where Nombre = 'Guayana Francesa') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GF', 'Guayana Francesa');  end
if not exists(select 1 from Bandera where Nombre = 'Guinea') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GN', 'Guinea');  end
if not exists(select 1 from Bandera where Nombre = 'Guinea Ecuatorial') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GQ', 'Guinea Ecuatorial');  end
if not exists(select 1 from Bandera where Nombre = 'Guinea-Bissau') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GW', 'Guinea-Bissau');  end
if not exists(select 1 from Bandera where Nombre = 'Guyana') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('GY', 'Guyana');  end
if not exists(select 1 from Bandera where Nombre = 'Haití') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('HT', 'Haití');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Heard y McDonald') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('HM', 'Islas Heard y McDonald');  end
if not exists(select 1 from Bandera where Nombre = 'Honduras') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('HN', 'Honduras');  end
if not exists(select 1 from Bandera where Nombre = 'Hong Kong') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('HK', 'Hong Kong');  end
if not exists(select 1 from Bandera where Nombre = 'Hungría') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('HU', 'Hungría');  end
if not exists(select 1 from Bandera where Nombre = 'India') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('IN', 'India');  end
if not exists(select 1 from Bandera where Nombre = 'Indonesia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('ID', 'Indonesia');  end
if not exists(select 1 from Bandera where Nombre = 'Irán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('IR', 'Irán');  end
if not exists(select 1 from Bandera where Nombre = 'Iraq') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('IQ', 'Iraq');  end
if not exists(select 1 from Bandera where Nombre = 'Irlanda') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('IE', 'Irlanda');  end
if not exists(select 1 from Bandera where Nombre = 'Islandia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('IS', 'Islandia');  end
if not exists(select 1 from Bandera where Nombre = 'Israel') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('IL', 'Israel');  end
if not exists(select 1 from Bandera where Nombre = 'Italia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('IT', 'Italia');  end
if not exists(select 1 from Bandera where Nombre = 'Jamaica') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('JM', 'Jamaica');  end
if not exists(select 1 from Bandera where Nombre = 'Japón') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('JP', 'Japón');  end
if not exists(select 1 from Bandera where Nombre = 'Jordania') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('JO', 'Jordania');  end
if not exists(select 1 from Bandera where Nombre = 'Kazajstán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('KZ', 'Kazajstán');  end
if not exists(select 1 from Bandera where Nombre = 'Kenia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('KE', 'Kenia');  end
if not exists(select 1 from Bandera where Nombre = 'Kirguistán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('KG', 'Kirguistán');  end
if not exists(select 1 from Bandera where Nombre = 'Kiribati') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('KI', 'Kiribati');  end
if not exists(select 1 from Bandera where Nombre = 'Kuwait') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('KW', 'Kuwait');  end
if not exists(select 1 from Bandera where Nombre = 'Laos') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('LA', 'Laos');  end
if not exists(select 1 from Bandera where Nombre = 'Lesotho') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('LS', 'Lesotho');  end
if not exists(select 1 from Bandera where Nombre = 'Letonia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('LV', 'Letonia');  end
if not exists(select 1 from Bandera where Nombre = 'Líbano') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('LB', 'Líbano');  end
if not exists(select 1 from Bandera where Nombre = 'Liberia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('LR', 'Liberia');  end
if not exists(select 1 from Bandera where Nombre = 'Libia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('LY', 'Libia');  end
if not exists(select 1 from Bandera where Nombre = 'Liechtenstein') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('LI', 'Liechtenstein');  end
if not exists(select 1 from Bandera where Nombre = 'Lituania') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('LT', 'Lituania');  end
if not exists(select 1 from Bandera where Nombre = 'Luxemburgo') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('LU', 'Luxemburgo');  end
if not exists(select 1 from Bandera where Nombre = 'Macao') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MO', 'Macao');  end
if not exists(select 1 from Bandera where Nombre = 'ARY Macedonia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MK', 'ARY Macedonia');  end
if not exists(select 1 from Bandera where Nombre = 'Madagascar') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MG', 'Madagascar');  end
if not exists(select 1 from Bandera where Nombre = 'Malasia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MY', 'Malasia');  end
if not exists(select 1 from Bandera where Nombre = 'Malawi') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MW', 'Malawi');  end
if not exists(select 1 from Bandera where Nombre = 'Maldivas') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MV', 'Maldivas');  end
if not exists(select 1 from Bandera where Nombre = 'Malí') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('ML', 'Malí');  end
if not exists(select 1 from Bandera where Nombre = 'Malta') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MT', 'Malta');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Malvinas') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('FK', 'Islas Malvinas');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Marianas del Norte') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MP', 'Islas Marianas del Norte');  end
if not exists(select 1 from Bandera where Nombre = 'Marruecos') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MA', 'Marruecos');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Marshall') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MH', 'Islas Marshall');  end
if not exists(select 1 from Bandera where Nombre = 'Martinica') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MQ', 'Martinica');  end
if not exists(select 1 from Bandera where Nombre = 'Mauricio') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MU', 'Mauricio');  end
if not exists(select 1 from Bandera where Nombre = 'Mauritania') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MR', 'Mauritania');  end
if not exists(select 1 from Bandera where Nombre = 'Mayotte') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('YT', 'Mayotte');  end
if not exists(select 1 from Bandera where Nombre = 'México') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MX', 'México');  end
if not exists(select 1 from Bandera where Nombre = 'Micronesia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('FM', 'Micronesia');  end
if not exists(select 1 from Bandera where Nombre = 'Moldavia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MD', 'Moldavia');  end
if not exists(select 1 from Bandera where Nombre = 'Mónaco') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MC', 'Mónaco');  end
if not exists(select 1 from Bandera where Nombre = 'Mongolia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MN', 'Mongolia');  end
if not exists(select 1 from Bandera where Nombre = 'Montserrat') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MS', 'Montserrat');  end
if not exists(select 1 from Bandera where Nombre = 'Mozambique') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MZ', 'Mozambique');  end
if not exists(select 1 from Bandera where Nombre = 'Myanmar') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('MM', 'Myanmar');  end
if not exists(select 1 from Bandera where Nombre = 'Namibia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NA', 'Namibia');  end
if not exists(select 1 from Bandera where Nombre = 'Nauru') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NR', 'Nauru');  end
if not exists(select 1 from Bandera where Nombre = 'Nepal') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NP', 'Nepal');  end
if not exists(select 1 from Bandera where Nombre = 'Nicaragua') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NI', 'Nicaragua');  end
if not exists(select 1 from Bandera where Nombre = 'Níger') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NE', 'Níger');  end
if not exists(select 1 from Bandera where Nombre = 'Nigeria') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NG', 'Nigeria');  end
if not exists(select 1 from Bandera where Nombre = 'Niue') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NU', 'Niue');  end
if not exists(select 1 from Bandera where Nombre = 'Isla Norfolk') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NF', 'Isla Norfolk');  end
if not exists(select 1 from Bandera where Nombre = 'Noruega') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NO', 'Noruega');  end
if not exists(select 1 from Bandera where Nombre = 'Nueva Caledonia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NC', 'Nueva Caledonia');  end
if not exists(select 1 from Bandera where Nombre = 'Nueva Zelanda') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NZ', 'Nueva Zelanda');  end
if not exists(select 1 from Bandera where Nombre = 'Omán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('OM', 'Omán');  end
if not exists(select 1 from Bandera where Nombre = 'Países Bajos') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('NL', 'Países Bajos');  end
if not exists(select 1 from Bandera where Nombre = 'Pakistán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PK', 'Pakistán');  end
if not exists(select 1 from Bandera where Nombre = 'Palau') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PW', 'Palau');  end
if not exists(select 1 from Bandera where Nombre = 'Palestina') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PS', 'Palestina');  end
if not exists(select 1 from Bandera where Nombre = 'Panamá') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PA', 'Panamá');  end
if not exists(select 1 from Bandera where Nombre = 'Papúa Nueva Guinea') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PG', 'Papúa Nueva Guinea');  end
if not exists(select 1 from Bandera where Nombre = 'Paraguay') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PY', 'Paraguay');  end
if not exists(select 1 from Bandera where Nombre = 'Perú') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PE', 'Perú');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Pitcairn') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PN', 'Islas Pitcairn');  end
if not exists(select 1 from Bandera where Nombre = 'Polinesia Francesa') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PF', 'Polinesia Francesa');  end
if not exists(select 1 from Bandera where Nombre = 'Polonia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PL', 'Polonia');  end
if not exists(select 1 from Bandera where Nombre = 'Portugal') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PT', 'Portugal');  end
if not exists(select 1 from Bandera where Nombre = 'Puerto Rico') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PR', 'Puerto Rico');  end
if not exists(select 1 from Bandera where Nombre = 'Qatar') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('QA', 'Qatar');  end
if not exists(select 1 from Bandera where Nombre = 'Reunión') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('RE', 'Reunión');  end
if not exists(select 1 from Bandera where Nombre = 'Ruanda') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('RW', 'Ruanda');  end
if not exists(select 1 from Bandera where Nombre = 'Rumania') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('RO', 'Rumania');  end
if not exists(select 1 from Bandera where Nombre = 'Rusia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('RU', 'Rusia');  end
if not exists(select 1 from Bandera where Nombre = 'Sahara Occidental') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('EH', 'Sahara Occidental');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Salomón') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SB', 'Islas Salomón');  end
if not exists(select 1 from Bandera where Nombre = 'Samoa') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('WS', 'Samoa');  end
if not exists(select 1 from Bandera where Nombre = 'Samoa Americana') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('AS', 'Samoa Americana');  end
if not exists(select 1 from Bandera where Nombre = 'San Cristóbal y Nevis') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('KN', 'San Cristóbal y Nevis');  end
if not exists(select 1 from Bandera where Nombre = 'San Marino') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SM', 'San Marino');  end
if not exists(select 1 from Bandera where Nombre = 'San Pedro y Miquelón') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('PM', 'San Pedro y Miquelón');  end
if not exists(select 1 from Bandera where Nombre = 'San Vicente y las Granadinas') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('VC', 'San Vicente y las Granadinas');  end
if not exists(select 1 from Bandera where Nombre = 'Santa Helena') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SH', 'Santa Helena');  end
if not exists(select 1 from Bandera where Nombre = 'Santa Lucía') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('LC', 'Santa Lucía');  end
if not exists(select 1 from Bandera where Nombre = 'Santo Tomé y Príncipe') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('ST', 'Santo Tomé y Príncipe');  end
if not exists(select 1 from Bandera where Nombre = 'Senegal') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SN', 'Senegal');  end
if not exists(select 1 from Bandera where Nombre = 'Serbia y Montenegro') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CS', 'Serbia y Montenegro');  end
if not exists(select 1 from Bandera where Nombre = 'Seychelles') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SC', 'Seychelles');  end
if not exists(select 1 from Bandera where Nombre = 'Sierra Leona') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SL', 'Sierra Leona');  end
if not exists(select 1 from Bandera where Nombre = 'Singapur') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SG', 'Singapur');  end
if not exists(select 1 from Bandera where Nombre = 'Siria') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SY', 'Siria');  end
if not exists(select 1 from Bandera where Nombre = 'Somalia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SO', 'Somalia');  end
if not exists(select 1 from Bandera where Nombre = 'Sri Lanka') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('LK', 'Sri Lanka');  end
if not exists(select 1 from Bandera where Nombre = 'Suazilandia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SZ', 'Suazilandia');  end
if not exists(select 1 from Bandera where Nombre = 'Sudáfrica') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('ZA', 'Sudáfrica');  end
if not exists(select 1 from Bandera where Nombre = 'Sudán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SD', 'Sudán');  end
if not exists(select 1 from Bandera where Nombre = 'Suecia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SE', 'Suecia');  end
if not exists(select 1 from Bandera where Nombre = 'Suiza') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('CH', 'Suiza');  end
if not exists(select 1 from Bandera where Nombre = 'Surinam') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SR', 'Surinam');  end
if not exists(select 1 from Bandera where Nombre = 'Svalbard y Jan Mayen') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('SJ', 'Svalbard y Jan Mayen');  end
if not exists(select 1 from Bandera where Nombre = 'Tailandia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TH', 'Tailandia');  end
if not exists(select 1 from Bandera where Nombre = 'Taiwán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TW', 'Taiwán');  end
if not exists(select 1 from Bandera where Nombre = 'Tanzania') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TZ', 'Tanzania');  end
if not exists(select 1 from Bandera where Nombre = 'Tayikistán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TJ', 'Tayikistán');  end
if not exists(select 1 from Bandera where Nombre = 'Territorio Británico del Océano Índico') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('IO', 'Territorio Británico del Océano Índico');  end
if not exists(select 1 from Bandera where Nombre = 'Territorios Australes Franceses') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TF', 'Territorios Australes Franceses');  end
if not exists(select 1 from Bandera where Nombre = 'Timor Oriental') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TL', 'Timor Oriental');  end
if not exists(select 1 from Bandera where Nombre = 'Togo') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TG', 'Togo');  end
if not exists(select 1 from Bandera where Nombre = 'Tokelau') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TK', 'Tokelau');  end
if not exists(select 1 from Bandera where Nombre = 'Tonga') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TO', 'Tonga');  end
if not exists(select 1 from Bandera where Nombre = 'Trinidad y Tobago') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TT', 'Trinidad y Tobago');  end
if not exists(select 1 from Bandera where Nombre = 'Túnez') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TN', 'Túnez');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Turcas y Caicos') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TC', 'Islas Turcas y Caicos');  end
if not exists(select 1 from Bandera where Nombre = 'Turkmenistán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TM', 'Turkmenistán');  end
if not exists(select 1 from Bandera where Nombre = 'Turquía') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TR', 'Turquía');  end
if not exists(select 1 from Bandera where Nombre = 'Tuvalu') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('TV', 'Tuvalu');  end
if not exists(select 1 from Bandera where Nombre = 'Ucrania') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('UA', 'Ucrania');  end
if not exists(select 1 from Bandera where Nombre = 'Uganda') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('UG', 'Uganda');  end
if not exists(select 1 from Bandera where Nombre = 'Uruguay') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('UY', 'Uruguay');  end
if not exists(select 1 from Bandera where Nombre = 'Uzbekistán') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('UZ', 'Uzbekistán');  end
if not exists(select 1 from Bandera where Nombre = 'Vanuatu') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('VU', 'Vanuatu');  end
if not exists(select 1 from Bandera where Nombre = 'Venezuela') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('VE', 'Venezuela');  end
if not exists(select 1 from Bandera where Nombre = 'Vietnam') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('VN', 'Vietnam');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Vírgenes Británicas') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('VG', 'Islas Vírgenes Británicas');  end
if not exists(select 1 from Bandera where Nombre = 'Islas Vírgenes de los Estados Unidos') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('VI', 'Islas Vírgenes de los Estados Unidos');  end
if not exists(select 1 from Bandera where Nombre = 'Wallis y Futuna') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('WF', 'Wallis y Futuna');  end
if not exists(select 1 from Bandera where Nombre = 'Yemen') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('YE', 'Yemen');  end
if not exists(select 1 from Bandera where Nombre = 'Yibuti') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('DJ', 'Yibuti');  end
if not exists(select 1 from Bandera where Nombre = 'Zambia') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('ZM', 'Zambia');  end
if not exists(select 1 from Bandera where Nombre = 'Zimbabue') begin INSERT INTO Bandera (Abreviatura, Nombre) VALUES('ZW', 'Zimbabue');  end

--Tipo Linea de Embarque
IF NOT EXISTS (select 1 from TipoLineaEmbarque where Linea = 'Nueva'    ) BEGIN insert into dbo.TipoLineaEmbarque(Linea)values('Nueva'    ); END
IF NOT EXISTS (select 1 from TipoLineaEmbarque where Linea = 'Vieja'    ) BEGIN insert into dbo.TipoLineaEmbarque(Linea)values('Vieja'    ); END
IF NOT EXISTS (select 1 from TipoLineaEmbarque where Linea = 'Vicentin' ) BEGIN insert into dbo.TipoLineaEmbarque(Linea)values('Vicentin' ); END
IF NOT EXISTS (select 1 from TipoLineaEmbarque where Linea = 'Biodiesel') BEGIN insert into dbo.TipoLineaEmbarque(Linea)values('Biodiesel'); END

-- PERMISOS AD
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Recibidores_Finalizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Recibidores_Finalizar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Recibidores') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Recibidores_Finalizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Recibidores'), (select Id from ADPuertoPermisos where NombrePermiso='Recibidores_Finalizar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Recibidores_Finalizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Recibidores_Finalizar')); end

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Liquido_PeriodoDeCarga_Guardar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Liquido_PeriodoDeCarga_Guardar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Tableristas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Liquido_PeriodoDeCarga_Guardar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Tableristas'), (select Id from ADPuertoPermisos where NombrePermiso='Liquido_PeriodoDeCarga_Guardar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Recibidores') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Liquido_PeriodoDeCarga_Guardar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Recibidores'), (select Id from ADPuertoPermisos where NombrePermiso='Liquido_PeriodoDeCarga_Guardar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Liquido_PeriodoDeCarga_Guardar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Liquido_PeriodoDeCarga_Guardar')); end

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='TableroLiquido_AgregarLinea') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('TableroLiquido_AgregarLinea'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Tableristas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='TableroLiquido_AgregarLinea')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Tableristas'), (select Id from ADPuertoPermisos where NombrePermiso='TableroLiquido_AgregarLinea')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='TableroLiquido_AgregarLinea')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='TableroLiquido_AgregarLinea')); end

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='TableroLiquido_EliminarLinea') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('TableroLiquido_EliminarLinea'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Tableristas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='TableroLiquido_EliminarLinea')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Tableristas'), (select Id from ADPuertoPermisos where NombrePermiso='TableroLiquido_EliminarLinea')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='TableroLiquido_EliminarLinea')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='TableroLiquido_EliminarLinea')); end

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Recibidores_ObsCalidad_Agregar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Recibidores_ObsCalidad_Agregar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Recibidores') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Recibidores_ObsCalidad_Agregar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Recibidores'), (select Id from ADPuertoPermisos where NombrePermiso='Recibidores_ObsCalidad_Agregar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Recibidores_ObsCalidad_Agregar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Recibidores_ObsCalidad_Agregar')); end

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Recibidores_Nir_Modificar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Recibidores_Nir_Modificar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Recibidores') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Recibidores_Nir_Modificar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Recibidores'), (select Id from ADPuertoPermisos where NombrePermiso='Recibidores_Nir_Modificar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Recibidores_Nir_Modificar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Recibidores_Nir_Modificar')); end

--- Actualizar a cero el idBalanzarCorte cuando sea null
update ModuloDeCargaPlanillaDeTurnosDetallesSolido set idBalanzaCorte = 0 where idBalanzaCorte is null

--cambios zona Vicentin
update PuntosInteresGeolocalizacion  set Latitud = '-32.77205351237338', Longitud = '-60.72096919438843' where Nombre = 'Vicentín'

--Scripts Material Puerto
IF NOT EXISTS (select 1 from MaterialPuerto where Descripcion = 'SoyBean Low Pro')
BEGIN 
insert into MaterialPuerto (Descripcion      , DescripcionCorta,CodigoSap,Almacen_Id,EsLiquido,Color    ,DescripcionCortaIngles) 
                    values ('SoyBean Low Pro', 'SBMLP'         ,'99497'  ,null      ,0        ,'#FFCF79','SBMLP')
END
GO
IF NOT EXISTS (select 1 from MaterialPuerto where Descripcion = 'Pellet de girasol')
BEGIN 
insert into MaterialPuerto (Descripcion        , DescripcionCorta,CodigoSap,Almacen_Id,EsLiquido,Color    ,DescripcionCortaIngles) 
                    values ('Pellet de girasol', 'SFPMP'         ,''       ,null      ,0        ,'#555554','SFPMP')
END
GO
IF NOT EXISTS (select 1 from MaterialPuerto where Descripcion = 'Pellet de girasol integral')
BEGIN 
insert into MaterialPuerto (Descripcion        , DescripcionCorta,CodigoSap,Almacen_Id,EsLiquido,Color    ,DescripcionCortaIngles) 
                    values ('Pellet de girasol integral', 'SFPLP'         ,''       ,null      ,0        ,'#262626','SFPLP')
END
GO
IF NOT EXISTS (select 1 from MaterialPuerto where Descripcion = 'Aceite de soja refinado')
BEGIN 
insert into MaterialPuerto (Descripcion        , DescripcionCorta,CodigoSap,Almacen_Id,EsLiquido,Color    ,DescripcionCortaIngles) 
                    values ('Aceite de soja refinado', 'RSBO'         ,''       ,null      ,1        ,'#AB3C05','RSBO')
END
GO
IF NOT EXISTS (select 1 from MaterialPuerto where Descripcion = 'Aceite de girasol refinado')
BEGIN 
insert into MaterialPuerto (Descripcion        , DescripcionCorta,CodigoSap,Almacen_Id,EsLiquido,Color    ,DescripcionCortaIngles) 
                    values ('Aceite de girasol refinado', 'RSFO'         ,''       ,null      ,1        ,'#CDAD0D','RSFO')
END
GO
IF NOT EXISTS (select 1 from MaterialPuerto where Descripcion = 'LECITINA DE SOJA') 
BEGIN
    insert into MaterialPuerto(Descripcion, DescripcionCorta, CodigoSap, EsLiquido, Color, DescripcionCortaIngles) 
    values ('LECITINA DE SOJA','LEC','99056', 1, '#FFFFFF', 'LEC') 
END
GO
IF NOT EXISTS (select 1 from MaterialPuerto where Descripcion = 'ACEITE DE SOJA NEUTRALIZADO') 
BEGIN
    insert into MaterialPuerto(Descripcion, DescripcionCorta, CodigoSap, EsLiquido, Color, DescripcionCortaIngles) 
    values ('ACEITE DE SOJA NEUTRALIZADO','SBO NEU','98855', 1, '#FFFFFF', 'SBO NEU')
END
GO

UPDATE MaterialPuerto SET EsLiquido = 1 WHERE Descripcion IN ('Aceite de soja refinado', 'Aceite de girasol refinado', 'LECITINA DE SOJA')

update MaterialPuerto set DescripcionCortaIngles = 'SB'    ,Color = '#D3B177' where descripcion = 'POROTO DE SOJA'
update MaterialPuerto set DescripcionCortaIngles = 'SBMHP' ,Color = '#FFE0A8' where descripcion = 'HARINA DE SOJA*' -- DUDA DE NOMBRE
update MaterialPuerto set DescripcionCortaIngles = 'SBH'   ,Color = '#96685D' where descripcion = 'PECASO'
update MaterialPuerto set DescripcionCortaIngles = 'CSBO'  ,Color = '#D34906' where descripcion = 'ACEITE CRUDO DE SOJA'
update MaterialPuerto set DescripcionCortaIngles = 'CSFO'  ,Color = '#F0CB10' where descripcion = 'ACEITE CRUDO DE GIRASOL'
update MaterialPuerto set DescripcionCortaIngles = 'CORN'  ,Color = '#F58920' where descripcion = 'MAIZ'
update MaterialPuerto set DescripcionCortaIngles = 'SME'   ,Color = '#32938C' where descripcion = 'BIODIESEL'
update MaterialPuerto set DescripcionCortaIngles = 'CSFOHO',Color = '#FFFFFF' where descripcion = 'ACEITE CRUDO DE GIRASOL ALTO OLEICO'
update MaterialPuerto set DescripcionCortaIngles = 'WHEAT' ,Color = '#92B234' where descripcion = 'TRIGO'
update MaterialPuerto set DescripcionCortaIngles = 'SBMLP' ,Color = '#FFCF79' where descripcion = 'SoyBean Low Pro' --ESTÁ MAL EL COLOR SEGÚN LA TABLA
update MaterialPuerto set DescripcionCortaIngles = 'SFPMP' ,Color = '#555554' where descripcion = 'Pellet de girasol'
UPDATE MaterialPuerto SET DescripcionCortaIngles = 'LEC'   ,Color = '#FFFFFF' WHERE Descripcion = 'LECITINA DE SOJA'
UPDATE MaterialPuerto SET DescripcionCortaIngles = 'SBO NEU', Color = '#FFFFFF' WHERE Descripcion = 'ACEITE DE SOJA NEUTRALIZADO'
UPDATE MaterialPuerto SET DescripcionCortaIngles = 'CORN OIL', Color = '#B76719' WHERE Descripcion = 'ACEITE CRUDO DE MAIZ'


declare @SB     int = (select top 1 Id from MaterialPuerto (nolock) where DescripcionCortaIngles = 'SB'     )
declare @SBMHP  int = (select top 1 Id from MaterialPuerto (nolock) where DescripcionCortaIngles = 'SBMHP'  )
declare @SBH    int = (select top 1 Id from MaterialPuerto (nolock) where DescripcionCortaIngles = 'SBH'    )
declare @CSBO   int = (select top 1 Id from MaterialPuerto (nolock) where DescripcionCortaIngles = 'CSBO'   )
declare @CSFO   int = (select top 1 Id from MaterialPuerto (nolock) where DescripcionCortaIngles = 'CSFO'   )
declare @CORN   int = (select top 1 Id from MaterialPuerto (nolock) where DescripcionCortaIngles = 'CORN'   )
declare @SME    int = (select top 1 Id from MaterialPuerto (nolock) where DescripcionCortaIngles = 'SME'    )
declare @WHEAT  int = (select top 1 Id from MaterialPuerto (nolock) where DescripcionCortaIngles = 'WHEAT'  )
declare @SFPMP  int = (select top 1 Id from MaterialPuerto (nolock) where DescripcionCortaIngles = 'SFPMP'  )
declare @SFPLP  int = (select top 1 Id from MaterialPuerto (nolock) where DescripcionCortaIngles = 'SFPLP'  )
declare @SBONEU int = (select top 1 Id from MaterialPuerto (nolock) where DescripcionCortaIngles = 'SBO NEU')


--Scripts TipoDeCalidad
IF NOT EXISTS (select 1 from TipoDeCalidad where Descripcion = 'Gafta 38' and MaterialPuerto_Id = @SB)
BEGIN 
insert into TipoDeCalidad (Descripcion, MaterialPuerto_Id) 
values ('Gafta 38', @SB)
END

IF NOT EXISTS (select 1 from TipoDeCalidad where Descripcion = 'Gafta 39' and MaterialPuerto_Id = @SBMHP)
BEGIN 
insert into TipoDeCalidad (Descripcion, MaterialPuerto_Id) 
values ('Gafta 39', @SBMHP)
END

IF NOT EXISTS (select 1 from TipoDeCalidad where Descripcion = 'Gafta 39' and MaterialPuerto_Id = @SBH)
BEGIN 
insert into TipoDeCalidad (Descripcion, MaterialPuerto_Id) 
values ('Gafta 39', @SBH)
END

IF NOT EXISTS (select 1 from TipoDeCalidad where Descripcion = 'Gafta 38' and MaterialPuerto_Id = @CORN)
BEGIN 
insert into TipoDeCalidad (Descripcion, MaterialPuerto_Id) 
values ('Gafta 38', @CORN)
END

IF NOT EXISTS (select 1 from TipoDeCalidad where Descripcion = 'Gafta 38' and MaterialPuerto_Id = @WHEAT)
BEGIN 
insert into TipoDeCalidad (Descripcion, MaterialPuerto_Id) 
values ('Gafta 38', @WHEAT)
END

IF NOT EXISTS (select 1 from TipoDeCalidad where Descripcion = 'Fosfa 51' and MaterialPuerto_Id = @CSBO)
BEGIN 
insert into TipoDeCalidad (Descripcion, MaterialPuerto_Id) 
values ('Fosfa 51', @CSBO)
END

IF NOT EXISTS (select 1 from TipoDeCalidad where Descripcion = 'Fosfa 51' and MaterialPuerto_Id = @CSFO)
BEGIN 
insert into TipoDeCalidad (Descripcion, MaterialPuerto_Id) 
values ('Fosfa 51', @CSFO)
END

IF NOT EXISTS (select 1 from TipoDeCalidad where Descripcion = 'Biodiesel' and MaterialPuerto_Id = @SME)
BEGIN 
insert into TipoDeCalidad (Descripcion, MaterialPuerto_Id) 
values ('Biodiesel', @SME)
END

IF NOT EXISTS (select 1 from TipoDeCalidad where Descripcion = 'Gafta 39' and MaterialPuerto_Id = @SFPMP)
BEGIN 
insert into TipoDeCalidad (Descripcion, MaterialPuerto_Id) 
values ('Gafta 39', @SFPMP)
END

IF NOT EXISTS (select 1 from TipoDeCalidad where Descripcion = 'Gafta 39' and MaterialPuerto_Id = @SFPLP)
BEGIN 
insert into TipoDeCalidad (Descripcion, MaterialPuerto_Id) 
values ('Gafta 39', @SFPLP)
END

IF NOT EXISTS (SELECT 1 FROM TipoDeCalidad WHERE Descripcion = 'Fosfa 51' AND MaterialPuerto_Id = @SBONEU) BEGIN
   INSERT INTO TipoDeCalidad (Descripcion, MaterialPuerto_Id) 
   VALUES ('Fosfa 51', @SBONEU)
END

--Scripts densidades (copia valores de CSBO para SBO NEU)
IF NOT EXISTS (SELECT 1 FROM DensidadPorTemperaturaDeMaterial WHERE MaterialPuerto_Id = @SBONEU) BEGIN
    INSERT INTO DensidadPorTemperaturaDeMaterial
    SELECT @SBONEU, Grado, Densidad FROM DensidadPorTemperaturaDeMaterial WHERE MaterialPuerto_Id = @CSBO
END

--Scripts CalidadValor
declare @CVSB     int = (select top 1 Id from TipoDeCalidad (nolock) where MaterialPuerto_Id = @SB     )
declare @CVSBMHP  int = (select top 1 Id from TipoDeCalidad (nolock) where MaterialPuerto_Id = @SBMHP  )
declare @CVSBH    int = (select top 1 Id from TipoDeCalidad (nolock) where MaterialPuerto_Id = @SBH    )
declare @CVCSBO   int = (select top 1 Id from TipoDeCalidad (nolock) where MaterialPuerto_Id = @CSBO   )
declare @CVCSFO   int = (select top 1 Id from TipoDeCalidad (nolock) where MaterialPuerto_Id = @CSFO   )
declare @CVCORN   int = (select top 1 Id from TipoDeCalidad (nolock) where MaterialPuerto_Id = @CORN   )
declare @CVSME    int = (select top 1 Id from TipoDeCalidad (nolock) where MaterialPuerto_Id = @SME    )
declare @CVWHEAT  int = (select top 1 Id from TipoDeCalidad (nolock) where MaterialPuerto_Id = @WHEAT  )
declare @CVSFPMP  int = (select top 1 Id from TipoDeCalidad (nolock) where MaterialPuerto_Id = @SFPMP  )
declare @CVSFPLP  int = (select top 1 Id from TipoDeCalidad (nolock) where MaterialPuerto_Id = @SFPLP  )
declare @CVSBONEU int = (select top 1 Id from TipoDeCalidad (nolock) where MaterialPuerto_Id = @SBONEU )

IF NOT EXISTS (select 1 from CalidadValor where  TipoDeCalidad_Id = @CVSB)
BEGIN 
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSB, 'Moisture','Max: 13.50 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSB, 'Oil on the seed tale quale','Basis: 18.50 % - Min: 18.00 % with non reciprocal allowance 1.50 % for each 1.00 %, fractions in proportion. ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSB, 'Protein (Dry Basis)','Protein on the seed tale quale Basis: 33.00 % - Min: 32.00 % with non reciprocal allowance 1.00% for each 1.0%, fractions in proportion. ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSB, 'Foreigh Matters','Basis: 1.00 % - Max: 2.00 % with non reciprocal allowance 1.0 % for each 1.0 %, fractions in proportion.')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSB, 'Green beans','Max: 5.00 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSB, 'Heat/burned damage','Max: 4.00 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSB, 'Damaged kernels','Basis: 8.00 % - Max: 8.50 % with non reciprocal allowance 1.0 % for each 1.0 %, fractions in proportion. ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSB, 'Split beans','Max: 20 %')
END

IF NOT EXISTS (select 1 from CalidadValor where  TipoDeCalidad_Id = @CVSBMHP)
BEGIN 

insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Protein','Basis: 46.50 % - Min: 45.50 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Fiber','Max: 3.80 % o Max: 4.00 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Moisture','Max: 12.75 % o Max: 13.00 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Fat','Max: 2.50 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Sand / Silica','Max: 2.50 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Urease Activity','Max: 0.20 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Solubility in KOH','Min: 78')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Ash','Max: 7.00 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Aflatoxin','Max: 20 ppb o Max: 50 ppb')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Free from added urea','')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Free from live insects and / or mould','')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Melamine Free','')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'GMP+ FSA assured','')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Arsenic (As)','Max: 2.0 mg/kg ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Lead (Pb)','Max: 10.0 mg/kg ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Aflatoxin B1','Max: 30.0 micro gram/kg ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Salmonella','No found in 25 grams')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBMHP, 'Goods to be finely ground on a representative loading samples 90 pct passing thru 4.50 mm sieve','')

END

IF NOT EXISTS (select 1 from CalidadValor where  TipoDeCalidad_Id = @CVSBH)
BEGIN 

insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBH, 'Moisture','Max: 13 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBH, 'Fiber','')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSBH, 'GMP + FSA assured','')

END

IF NOT EXISTS (select 1 from CalidadValor where  TipoDeCalidad_Id = @CVCORN)
BEGIN 
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCORN, 'Test Weight','Min: 72 Kg/Hl')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCORN, 'Heat Damaged Kernels ','Max: 5 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCORN, 'Broken Kernels','Max: 3 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCORN, 'Foreign Matters','Max: 1.50 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCORN, 'Grade','2 or better')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCORN, 'Aflatoxin','Menor a 20 ppb')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCORN, 'Moisture','Max: 14.50 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCORN, 'Arsenic (As)','Max: 2.0 mg/kg ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCORN, 'Lead (Pb)','Max: 10.0 mg/kg ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCORN, 'Aflatoxin B1','Max: 30.0 micro gram/kg ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCORN, 'Salmonella','No found in 25 grams')

END

IF NOT EXISTS (select 1 from CalidadValor where  TipoDeCalidad_Id = @CVWHEAT)
BEGIN 
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Moisture','Basis: 11.50 % - Max: 13.50 % or Basis: 12.50 % - Max: 13.50 % Trigo')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Test Weight','Min: 78Kg/Hl Trigo')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Vomitoxin','Max: 2 ppm')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Protein (Dry Basis)','Min: 11.50 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Falling number','Min: 280 sec')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Grade','2 or better')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Foreigh Matters','Max: 0.80 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Total Damaged','Max: 2 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Broken Kernels','Max: 1.20 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Insect Damaged','Max: 0.50  %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Wet Gluten','')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Aflatoxin B1 ','Max: 5.0 ppb')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Arsenic (As)','Max: 2.0mg/kg ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Lead (Pb)','Max: 10.0 mg/kg ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Aflatoxin B1','Max: 30.0 micro gram/kg')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVWHEAT, 'Salmonella','No found in 25 grams')

END

IF NOT EXISTS (select 1 from CalidadValor where  TipoDeCalidad_Id = @CVSFPMP)
BEGIN 
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSFPMP, 'Protein','Basis: 32/33 % protein and fat combined - Min: 30% protein')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSFPMP, 'Fiber','')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSFPMP, 'Moisture','')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSFPMP, 'Fat','')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSFPMP, 'GMP+ FSA assured','')
END

IF NOT EXISTS (select 1 from CalidadValor where  TipoDeCalidad_Id = @CVSFPLP)
BEGIN 
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSFPLP, 'Protein','Basis: 27 % - Min: 25.5 %  ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSFPLP, 'Fiber','28 % (+/-2 %)')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSFPLP, 'Moisture','12 % (+/-1 %), Max: 13 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSFPLP, 'Fat','Basis: 2 % - Stow factor: 80/82')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSFPLP, 'GMP+ FSA assured','')
END

IF NOT EXISTS (select 1 from CalidadValor where  TipoDeCalidad_Id = @CVCSBO)
BEGIN 
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCSBO, 'Free fatty acids (as oleic acid)','Basis: 1 % - Max: 1.25 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCSBO, 'Moisture and volatile matter','Max: 0.20 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCSBO, 'Insoluble impurities','Max: 0.10 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCSBO, 'Lecithin (expressed as phosphorus)','Base: 0.020 % - Max: 0.025 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCSBO, 'Unsaponifiable matter','Max: 1.50 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCSBO, 'Flash point','Superior a 250° F')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCSBO, 'Lovibond color 1” - Yellow','No más de 50 amarillo ')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCSBO, 'Lovibond color 1” - Red','No más de 5 rojo')
END

IF NOT EXISTS (select 1 from CalidadValor where  TipoDeCalidad_Id = @CVCSFO)
BEGIN 
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCSFO, 'Free fatty acids (as oleic acid)','Basis: 2 % - Max: 3 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVCSFO, 'Moisture and Impurities','Max: 0.50 %')
END

IF NOT EXISTS (select 1 from CalidadValor where  TipoDeCalidad_Id = @CVSME)
BEGIN 
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSME, 'CETANE','Min: 47')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSME, 'GREEN HOUSE GAS SAVING ','Min: 60 %')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSME, 'C.F.P.P.','Max: -2 d. centigrades')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSME, 'WATER ','Max: 350 ppm')
insert into CalidadValor (TipoDeCalidad_Id, Parametro,Valor) values(@CVSME, 'IODINE','Max: 135')
END

IF NOT EXISTS (SELECT 1 FROM CalidadValor WHERE TipoDeCalidad_Id = @CVSBONEU) BEGIN
   INSERT INTO CalidadValor (TipoDeCalidad_Id, Parametro, Valor) VALUES
   (@CVSBONEU, 'MOISTURE', '(%) 0.10 MAX. 0.10 ISO 8534:2017'),
   (@CVSBONEU, 'ACID (FFA)', '(%) 0,15 MAX. 0,20 ISO 660:2020'),
   (@CVSBONEU, 'FLASH POINT', '(°C) 150 MIN. 150 ISO 15267:1998'),
   (@CVSBONEU, 'PHOSPHORUS (PPM)', '5 MAX. 10 ISO 10540-3:2002'),
   (@CVSBONEU, 'SOAP', '85 MAX. 100 ISO 10539')
END

--Insercion de nuevo valor de calidad para algunos de los productos

IF NOT EXISTS (SELECT 1 FROM CalidadValor WHERE TipoDeCalidad_Id = @CVSBMHP and Valor = '' and Parametro = 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.')
BEGIN
INSERT INTO CalidadValor (TipoDeCalidad_Id, Parametro,Valor) VALUES(@CVSBMHP, 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.', '');
END

IF NOT EXISTS (SELECT 1 FROM CalidadValor WHERE TipoDeCalidad_Id = @CVSBH and Valor = '' and Parametro = 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.')
BEGIN
INSERT INTO CalidadValor (TipoDeCalidad_Id, Parametro,Valor) VALUES(@CVSBH, 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.', '');
END

IF NOT EXISTS (SELECT 1 FROM CalidadValor WHERE TipoDeCalidad_Id = @CVSB and Valor = '' and Parametro = 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.')
BEGIN
INSERT INTO CalidadValor (TipoDeCalidad_Id, Parametro,Valor) VALUES(@CVSB, 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.', '');
END

IF NOT EXISTS (SELECT 1 FROM CalidadValor WHERE TipoDeCalidad_Id = @CVSFPMP and Valor = '' and Parametro = 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.')
BEGIN
INSERT INTO CalidadValor (TipoDeCalidad_Id, Parametro,Valor) VALUES(@CVSFPMP, 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.', '');
END

IF NOT EXISTS (SELECT 1 FROM CalidadValor WHERE TipoDeCalidad_Id = @CVSFPLP and Valor = '' and Parametro = 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.')
BEGIN
INSERT INTO CalidadValor (TipoDeCalidad_Id, Parametro,Valor) VALUES(@CVSFPLP, 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.', '');
END

IF NOT EXISTS (SELECT 1 FROM CalidadValor WHERE TipoDeCalidad_Id = @CVCORN and Valor = '' and Parametro = 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.')
BEGIN
INSERT INTO CalidadValor (TipoDeCalidad_Id, Parametro,Valor) VALUES(@CVCORN, 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.', '');
END

IF NOT EXISTS (SELECT 1 FROM CalidadValor WHERE TipoDeCalidad_Id = @CVWHEAT and Valor = '' and Parametro = 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.')
BEGIN
INSERT INTO CalidadValor (TipoDeCalidad_Id, Parametro,Valor) VALUES(@CVWHEAT, 'La terminal necesita que el resultado de la inspección de las bodegas sea cargado inmediatamente en el sig bodegas a fin de evitar demoras/problemas.', '');
END

--Finaliza insercion de nuevos valores.






--Scripts Surveyor

if not exists(select 1 from Surveyor where Descripcion = 'EUROAMERICA') begin insert into Surveyor (Descripcion,Mail) values ('EUROAMERICA','operations@eagsurveyor.com') end
if not exists(select 1 from Surveyor where Descripcion = 'FIDES CONTROL') begin insert into Surveyor (Descripcion,Mail) values ('FIDES CONTROL','execution.ar@fidescontrol.com; commercial.ar@fidescontrol.com; rosario.faccone@fidescontrol.com') end
if not exists(select 1 from Surveyor where Descripcion = 'SGS AGRICULTURAL SERVICES') begin insert into Surveyor (Descripcion,Mail) values ('SGS AGRICULTURAL SERVICES','ar.nr.drycargo@sgs.com; ana.garcia@sgs.com') end
if not exists(select 1 from Surveyor where Descripcion = 'BUREAU VERITAS') begin insert into Surveyor (Descripcion,Mail) values ('BUREAU VERITAS','agri.bvbna@ar.bureauveritas.com; agriservices@ar.bureauveritas.com') end
if not exists(select 1 from Surveyor where Descripcion = 'CIS') begin insert into Surveyor (Descripcion,Mail) values ('CIS','execution-arg@cis-inspections.com') end
if not exists(select 1 from Surveyor where Descripcion = 'COTECNA') begin insert into Surveyor (Descripcion,Mail) values ('COTECNA','dl-buenos-aires-reporting@cotecna.com.ar; dl-buenos-aires-operations@cotecna.com.ar') end
if not exists(select 1 from Surveyor where Descripcion = 'RRMG SA') begin insert into Surveyor (Descripcion,Mail) values ('RRMG SA','exec.argentina@rrmgltda.com') end
if not exists(select 1 from Surveyor where Descripcion = 'HL CONTROL SERVICES') begin insert into Surveyor (Descripcion,Mail) values ('HL CONTROL SERVICES','operations@controlservices.com.ar') end
if not exists(select 1 from Surveyor where Descripcion = 'INTERTEK AGRI SERVICES') begin insert into Surveyor (Descripcion,Mail) values ('INTERTEK AGRI SERVICES','agri.argentina@intertek.com') end
if not exists(select 1 from Surveyor where Descripcion = 'AMSPEC') begin insert into Surveyor (Descripcion,Mail) values ('AMSPEC','trust.log.ba@amspecgroup.com; dardic.elisa@amspecgroup.com; demarco.leonardo@amspecgroup.com') end
if not exists(select 1 from Surveyor where Descripcion = 'MARONI GROUP') begin insert into Surveyor (Descripcion,Mail) values ('MARONI GROUP','operaciones@maronigroup.com.ar') end
if not exists(select 1 from Surveyor where Descripcion = 'OPERAGRO SURV') begin insert into Surveyor (Descripcion,Mail) values ('OPERAGRO SURV','surveyor@operagro.com; stamay@operagro.com; mlvilarino@operagro.com') end
if not exists(select 1 from Surveyor where Descripcion = 'COMETEC') begin insert into Surveyor (Descripcion,Mail) values ('COMETEC','cometec@cometecargentina.com.ar') end
if not exists(select 1 from Surveyor where Descripcion = 'ISB') begin insert into Surveyor (Descripcion,Mail) values ('ISB','mariano.rodriguez@isbargentina.com.ar; candelaria.zurro@isbargentina.com.ar; laura.martinez@isbargentina.com.ar; ag@isbargentina.com.ar') end
if not exists(select 1 from Surveyor where Descripcion = 'VIGLIENZONE') begin insert into Surveyor (Descripcion,Mail) values ('VIGLIENZONE','fballester@viglienzone.com; vgonzalez@viglienzone.com; sebastian.vara@viglienzone.com') end
if not exists(select 1 from Surveyor where Descripcion = 'CCIC') begin insert into Surveyor (Descripcion,Mail) values ('CCIC','inspections@ccicsa.com; shannon.yu@ccicsa.com') end
if not exists(select 1 from Surveyor where Descripcion = 'CONTROL INT') begin insert into Surveyor (Descripcion,Mail) values ('CONTROL INT','controlint@controlint.com.ar; Marcela.damia@controlint.com.ar') end
if not exists(select 1 from Surveyor where Descripcion = 'SAYBOLT ARGENTINA') begin insert into Surveyor (Descripcion,Mail) values ('SAYBOLT ARGENTINA','operaciones.argentina@sayboltargentina.com; Gustavo.sanchez@sayboltargentina.com') end
if not exists(select 1 from Surveyor where Descripcion = 'SCHUTTER ARGENTINA S.A.') begin insert into Surveyor (Descripcion,Mail) values ('SCHUTTER ARGENTINA S.A.','AHORA ES BUREAU VERITAS') end
if not exists(select 1 from Surveyor where Descripcion = 'BALTIC CONTROL') begin insert into Surveyor (Descripcion,Mail) values ('BALTIC CONTROL','hernansilveyra@balticargentina.com.ar; tomas.jensen@balticargentina.com.ar; ejecuciones@balticargentina.com.ar; admin@balticargentina.com.ar') end
if not exists(select 1 from Surveyor where Descripcion = 'ALEX STEWART') begin insert into Surveyor (Descripcion,Mail) values ('ALEX STEWART','cristinabeltrame@alexstewart.com.ar; jcmorandeyra@alexstewart.com.ar; logistic@alexstewart.com.ar') end
if not exists(select 1 from Surveyor where Descripcion = 'CUBCO') begin insert into Surveyor (Descripcion,Mail) values ('CUBCO','info@cubcosurveyor.com; eblanco@cubcosurveyor.com>; nbarrueco@cubcosurveyor.com; mcuccarese@cubcosurveyor.com; lsvampa@cubcosurveyor.com') end
if not exists(select 1 from Surveyor where Descripcion = 'RED FLINT') begin insert into Surveyor (Descripcion,Mail) values ('RED FLINT','walter.tolotti@redflint.com.ar; gabriela.ambrosioni@redflint.com.ar') end

--Scripts TasaDeCarga
if not exists(select 1 from TasaDeCarga where Descripcion = 'WWD SATAFSHEX EIU') begin insert into TasaDeCarga (Descripcion) values ('WWD SATAFSHEX EIU') end
if not exists(select 1 from TasaDeCarga where Descripcion = 'WWD SHINC') begin insert into TasaDeCarga (Descripcion) values ('WWD SHINC') end

--Scripts CompaniaDeFumigacion
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'AB GROUP') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('AB GROUP','abgroup@group-ab.com') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'FUGRAN SAN LORENZO') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('FUGRAN SAN LORENZO','rosario@fugran.com; ship@fugran.com') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'FUGRAN BAHIA BLANCA') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('FUGRAN BAHIA BLANCA','bblanca@fugran.com; ship@fugran.com') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'PROFUM') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('PROFUM','fumigaciones@profum.com.ar; sanlorenzo@profum.com.ar') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'AGROFUM') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('AGROFUM','agrofum@agrofum.com; comercial@agrofum.com; chavezyesica@agrofum.com; arronanahuel@agrofum.com; gustavo@agrofum.com; certificados@agrofum.com; claudia@agrofum.com; leonardo@agrofum.com') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'PEST CONTROL') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('PEST CONTROL','administracion@pestcontrolarg.com.ar; comercial@pestcontrolarg.com.ar') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'ECOTEC') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('ECOTEC','opsar@ecotecfumigation.com; argentina@ecotecfumigation.com') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'Tecnophos Services S.A.') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('Tecnophos Services S.A.','info@tecnophos.com.ar') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'ADC S.R.L.') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('ADC S.R.L.','info@adc.com.ar') end

--Scripts TipoContrato
if not exists(select 1 from TipoDeContrato where Descripcion = 'FOB') begin insert into TipoDeContrato (Descripcion) values ('FOB') end
if not exists(select 1 from TipoDeContrato where Descripcion = 'CIF') begin insert into TipoDeContrato (Descripcion) values ('CIF') end
if not exists(select 1 from TipoDeContrato where Descripcion = 'FAS') begin insert into TipoDeContrato (Descripcion) values ('FAS') end

--Scripts MuelleDeCarga
if not exists(select 1 from MuelleDeCarga where Descripcion = 'San Benito') begin insert into MuelleDeCarga (Descripcion) values ('San Benito') end
if not exists(select 1 from MuelleDeCarga where Descripcion = 'Vicentin') begin insert into MuelleDeCarga (Descripcion) values ('Vicentin') end
if not exists(select 1 from MuelleDeCarga where Descripcion = 'Nouryon') begin insert into MuelleDeCarga (Descripcion) values ('Nouryon') end
if not exists(select 1 from MuelleDeCarga where Descripcion = 'Otros Muelles') begin insert into MuelleDeCarga (Descripcion) values ('Otros Muelles') end

--Scripts TipoDeFumigacion
if not exists(select 1 from TipoDeFumigacion where Descripcion = 'Standard        Aluminium Phosphine    1 tablet/metric ton ') begin insert into TipoDeFumigacion (Descripcion) values ('Standard        Aluminium Phosphine    1 tablet/metric ton ') end
if not exists(select 1 from TipoDeFumigacion where Descripcion = 'Standard   Aluminium Phosphine    5 tablets/metric ton ') begin insert into TipoDeFumigacion (Descripcion) values ('Standard   Aluminium Phosphine    5 tablets/metric ton ') end
if not exists(select 1 from TipoDeFumigacion where Descripcion = 'Standard   Phosphine (PH3)   3grs / m3') begin insert into TipoDeFumigacion (Descripcion) values ('Standard   Phosphine (PH3)   3grs / m3') end
if not exists(select 1 from TipoDeFumigacion where Descripcion = 'Standard   Phosphine gas   2grs / m3') begin insert into TipoDeFumigacion (Descripcion) values ('Standard   Phosphine gas   2grs / m3') end
if not exists(select 1 from TipoDeFumigacion where Descripcion = 'Recirculation method      ') begin insert into TipoDeFumigacion (Descripcion) values ('Recirculation method      ') end
if not exists(select 1 from TipoDeFumigacion where Descripcion = 'SLEEVES      1gr / m3') begin insert into TipoDeFumigacion (Descripcion) values ('SLEEVES      1gr / m3') end



--Scripts Permisos de AD
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Nominar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Comex_Nominacion_Nominar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Nominar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Nominar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Nominar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Nominar')); end


if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Eliminar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Comex_Nominacion_Eliminar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Eliminar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Eliminar')); end

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Modificar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Comex_Nominacion_Modificar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Modificar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Modificar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Modificar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Modificar')); end


if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Guardar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Comex_Nominacion_Guardar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Guardar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Guardar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Guardar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Guardar')); end

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Ver') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Comex_Nominacion_Ver'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Ver')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Ver')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Ver')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Ver')); end

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Enviar_LineUp') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Comex_Nominacion_Enviar_LineUp'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Enviar_LineUp')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Enviar_LineUp')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Enviar_LineUp')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Nominacion_Enviar_LineUp')); end

--Visualizar Vapor
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Vapor_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Vapor_Visualizar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Visualizar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Visualizar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Visualizar')); end


--Visualizar Caratula AFIP
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Caratula_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Caratula_Visualizar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Caratula_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Caratula_Visualizar')); end

--Visualizar COEM AFIP
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Coem_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Coem_Visualizar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Coem_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Coem_Visualizar')); end

--Editar vapor
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Vapor_Editar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Vapor_Editar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Editar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Editar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Editar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Editar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Editar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Editar')); end

--Crear vapor
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Vapor_Crear') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Vapor_Crear'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Crear')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Crear')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Crear')); end


-- Eliminar Vapor
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Vapor_Eliminar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Vapor_Eliminar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Eliminar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Eliminar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Vapor_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Vapor_Eliminar')); end

-- Nuevos Paises
if not exists (select 1 from Pais where Descripcion = 'GEORGIA') begin insert into Pais (Descripcion) values ('GEORGIA'); end
if not exists (select 1 from Pais where Descripcion = 'LIBERIA') begin insert into Pais (Descripcion) values ('LIBERIA'); end
if not exists (select 1 from Pais where Descripcion = 'CANADA') begin insert into Pais (Descripcion) values ('CANADA'); end
if not exists (select 1 from Pais where Descripcion = 'MEXICO') begin insert into Pais (Descripcion) values ('MEXICO'); end

if not exists (select 1 from Destino where Nombre = 'GEORGIA') begin insert into Destino (Nombre) values ('GEORGIA'); end
if not exists (select 1 from Destino where Nombre = 'LIBERIA') begin insert into Destino (Nombre) values ('LIBERIA'); end
if not exists (select 1 from Destino where Nombre = 'CANADA') begin insert into Destino (Nombre) values ('CANADA'); end
if not exists (select 1 from Destino where Nombre = 'MEXICO') begin insert into Destino (Nombre) values ('MEXICO'); end


-- Nuevos Coordinadores
if not exists (select 1 from CoordinadorPuerto where Nombre = 'Agrocorp') begin insert into CoordinadorPuerto (Nombre) values ('Agrocorp'); end
if not exists (select 1 from CoordinadorPuerto where Nombre = 'Invictus') begin insert into CoordinadorPuerto (Nombre) values ('Invictus'); end
if not exists (select 1 from CoordinadorPuerto where Nombre = 'The Andersons') begin insert into CoordinadorPuerto (Nombre) values ('The Andersons'); end
if not exists (select 1 from CoordinadorPuerto where Nombre = 'Panocean') begin insert into CoordinadorPuerto (Nombre) values ('Panocean'); end
if not exists (select 1 from CoordinadorPuerto where Nombre = 'Sierentz') begin insert into CoordinadorPuerto (Nombre) values ('Sierentz'); end

/* SCRIPTS DATOS AFIP */
IF NOT EXISTS (SELECT 1 FROM AfipCoemEstado WHERE Codigo = 'CUR') BEGIN INSERT INTO AfipCoemEstado (Codigo, Estado) VALUES ('CUR', 'En Curso'); END
IF NOT EXISTS (SELECT 1 FROM AfipCoemEstado WHERE Codigo = 'REG') BEGIN INSERT INTO AfipCoemEstado (Codigo, Estado) VALUES ('REG', 'Registrada'); END
IF NOT EXISTS (SELECT 1 FROM AfipCoemEstado WHERE Codigo = 'PRE') BEGIN INSERT INTO AfipCoemEstado (Codigo, Estado) VALUES ('PRE', 'Presentada'); END
IF NOT EXISTS (SELECT 1 FROM AfipCoemEstado WHERE Codigo = 'AUTO') BEGIN INSERT INTO AfipCoemEstado (Codigo, Estado) VALUES ('AUTO', 'Autorizada'); END
IF NOT EXISTS (SELECT 1 FROM AfipCoemEstado WHERE Codigo = 'CODE') BEGIN INSERT INTO AfipCoemEstado (Codigo, Estado) VALUES ('CODE', 'CODE'); END
IF NOT EXISTS (SELECT 1 FROM AfipCoemEstado WHERE Codigo = 'ANU') BEGIN INSERT INTO AfipCoemEstado (Codigo, Estado) VALUES ('ANU', 'Anulada'); END
IF NOT EXISTS (SELECT 1 FROM AfipCoemEstado WHERE Codigo = 'REC') BEGIN INSERT INTO AfipCoemEstado (Codigo, Estado) VALUES ('REC', 'Rechazada'); END

DELETE FROM AfipCoemEstado WHERE Codigo IN ('CAN','AUT')

UPDATE AfipCoemEstado SET Orden = 0 WHERE Codigo = 'CUR'
UPDATE AfipCoemEstado SET Orden = 1 WHERE Codigo = 'REG'
UPDATE AfipCoemEstado SET Orden = 2 WHERE Codigo = 'PRE'
UPDATE AfipCoemEstado SET Orden = 3 WHERE Codigo = 'AUTO'
UPDATE AfipCoemEstado SET Orden = 4 WHERE Codigo = 'CODE'
UPDATE AfipCoemEstado SET Orden = 5 WHERE Codigo = 'ANU'
UPDATE AfipCoemEstado SET Orden = 6 WHERE Codigo = 'REC'

if not exists (select 1 from CoordinadorPuerto where Nombre = 'AMS Ameropa Marketing and Sales AG') begin insert into CoordinadorPuerto (Nombre) values ('AMS Ameropa Marketing and Sales AG'); end


/* AFIP MOTIVOS DE NO ABORDO */
IF NOT EXISTS (SELECT * FROM AfipMotivoNoABordo) BEGIN INSERT INTO AfipMotivoNoABordo (Codigo, Descripcion) VALUES ('1', 'OTROS'),('2', 'PEDIDO AGENCIA-ROLEO'),('3', 'CAMBIO BUQUE/BANDERA'),('4', 'IMG SCAN SOSPECHOSA'),('5', 'ALERTA / ADO'),('6', 'RAZONES CLIMATICAS'),('7', 'CONTENEDOR ABIERTO'),('8', 'DIFERENCIA PESO'); END

--Visualizar Clientes
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Clientes_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Clientes_Visualizar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Clientes_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Clientes_Visualizar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Clientes_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Clientes_Visualizar')); END

--Editar Clientes
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Clientes_Editar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Clientes_Editar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Clientes_Editar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Clientes_Editar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Clientes_Editar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Clientes_Editar')); END

--Crear Clientes
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Clientes_Crear') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Clientes_Crear'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Clientes_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Clientes_Crear')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Clientes_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Clientes_Crear')); END

-- Eliminar Cliente
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Clientes_Eliminar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Clientes_Eliminar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Clientes_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Clientes_Eliminar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Clientes_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Clientes_Eliminar')); END

--Visualizar Exportadores
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Exportadores_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Exportadores_Visualizar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Exportadores_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Exportadores_Visualizar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Exportadores_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Exportadores_Visualizar')); END

-- Agencias Maritimas y ATA
IF (SELECT COUNT(Cuit) FROM AgenciaMaritimaPuerto) = 0 BEGIN
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'MSA') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('MSA','30709247235') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'MARITIMA MARSA SRL') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('MARITIMA MARSA SRL','30709539023') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'BROADGRAIN') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('BROADGRAIN','30715631608') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'INTERGRAIN') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('INTERGRAIN','30708877189') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'AG.MARITIMA DELTA SA') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('AG.MARITIMA DELTA SA','30657927623') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'RIO PARANA SA') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('RIO PARANA SA','30507057574') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'NORMAN HNOS. SA') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('NORMAN HNOS. SA','30-57867162-1') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'AGCIA. MAR. EL HAUAR') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('AGCIA. MAR. EL HAUAR','30708793627') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'AGCIA. MARIT. DELTA') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('AGCIA. MARIT. DELTA','30657927623') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'AG.MAR.TRANSPARANA SA.') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('AG.MAR.TRANSPARANA SA.','30707428194') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'MULTIMAR') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('MULTIMAR','3068078995') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'AG. MARITIMA ARGENPAR S.A.') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('AG. MARITIMA ARGENPAR S.A.','30709509485') END
    IF NOT EXISTS(SELECT 1 FROM AgenciaMaritimaPuerto WHERE Nombre = 'MEDITERRANEAN SHIPPING COMPANY') BEGIN INSERT INTO AgenciaMaritimaPuerto(Nombre,Cuit) VALUES ('MEDITERRANEAN SHIPPING COMPANY','30693184947') END
    UPDATE AgenciaMaritimaPuerto SET Cuit = '33578648599' WHERE Nombre = 'CONSULTORES MARITIMOS'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30709874175' WHERE Nombre = 'INCHCAPE'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30645563472' WHERE Nombre = 'CLIPPER'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30645563472' WHERE Nombre = 'RIOPLAT'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30645563472' WHERE Nombre = 'seaplate'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30612732503' WHERE Nombre = 'NABSA'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30615647345' WHERE Nombre = 'ALPEMAR'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30650924424' WHERE Nombre = 'SUPERMAR'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30641739916' WHERE Nombre = 'CHRISTOPHERSEN'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30710931891' WHERE Nombre = 'Bonmar'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30680516959' WHERE Nombre = 'Faroship'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30680495064' WHERE Nombre = 'BALTZER'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30707691847' WHERE Nombre = 'FERTIMPORT'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30654214715' WHERE Nombre = 'WAVE'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30506727967' WHERE Nombre = 'DULCE'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30506764226' WHERE Nombre = 'MARSA'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30715788779' WHERE Nombre = 'WBL'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30715788779' WHERE Nombre = 'JNL'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30715312715' WHERE Nombre = 'AT PORT'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30708672870' WHERE Nombre = 'OCEAN WAY'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30708672870' WHERE Nombre = 'oceanway'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30709513490' WHERE Nombre = 'Antares'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30715326570' WHERE Nombre = 'B2B'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30708360496' WHERE Nombre = 'B&G'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30506888189' WHERE Nombre = 'AMI'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30709155705' WHERE Nombre = 'ABBEY SEA'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30717010708' WHERE Nombre = 'Argelan'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '33632809919' WHERE Nombre = 'argenbulk'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30716313146' WHERE Nombre = 'B&M Agencia Marítima'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30710243529' WHERE Nombre = 'BLUE STAR'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30506792165' WHERE Nombre = 'Cargill'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '33627794369' WHERE Nombre = 'EUROAMERICA'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30590162279' WHERE Nombre = 'HEINLEIN'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30708138750' WHERE Nombre = 'ISA'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30648168876' WHERE Nombre = 'Myrasa'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30648168876' WHERE Nombre = 'MIRASA'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30707647074' WHERE Nombre = 'Topsail'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '30710544871' WHERE Nombre = 'Waypoint'
    UPDATE AgenciaMaritimaPuerto SET Cuit = '11111111111' WHERE Nombre = 'a confirmar'
END

IF (SELECT COUNT(Cuit) FROM ATAPuerto) = 0 BEGIN
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'INCHCAPE') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('INCHCAPE','30709874175') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'RIOPLAT') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('RIOPLAT','30645563472') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'seaplate') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('seaplate','30645563472') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'SUPERMAR') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('SUPERMAR','30650924424') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'Bonmar') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('Bonmar','30710931891') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'AG. MARITIMA MARSA') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('AG. MARITIMA MARSA','30506764226') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'JNL') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('JNL','30715788779') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'OCEAN WAY') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('OCEAN WAY','30708672870') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'oceanway') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('oceanway','30708672870') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'Antares') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('Antares','30709513490') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'ABBEY SEA') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('ABBEY SEA','30709155705') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'Argelan') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('Argelan','30717010708') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'argenbulk') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('argenbulk','33632809919') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'B&M Agencia Marítima') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('B&M Agencia Marítima','30716313146') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'BLUE STAR') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('BLUE STAR','30710243529') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'Cargill') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('Cargill','30506792165') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'EUROAMERICA') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('EUROAMERICA','33627794369') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'HEINLEIN') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('HEINLEIN','30590162279') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'ISA') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('ISA','30708138750') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'Myrasa') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('Myrasa','30648168876') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'MIRASA') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('MIRASA','30648168876') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'Topsail') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('Topsail','30707647074') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'Waypoint') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('Waypoint','30710544871') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'AG.MARITIMA DELTA SA') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('AG.MARITIMA DELTA SA','30657927623') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'RIO PARANA SA') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('RIO PARANA SA','30507057574') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'NORMAN HNOS. SA') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('NORMAN HNOS. SA','30-57867162-1') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'AGCIA. MAR. EL HAUAR') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('AGCIA. MAR. EL HAUAR','30708793627') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'AGCIA. MARIT. DELTA') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('AGCIA. MARIT. DELTA','30657927623') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'AG.MAR.TRANSPARANA SA.') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('AG.MAR.TRANSPARANA SA.','30707428194') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'MULTIMAR') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('MULTIMAR','3068078995') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'AG. MARITIMA ARGENPAR S.A.') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('AG. MARITIMA ARGENPAR S.A.','30709509485') END
    IF NOT EXISTS(SELECT 1 FROM ATAPuerto WHERE Nombre = 'MEDITERRANEAN SHIPPING COMPANY') BEGIN INSERT INTO ATAPuerto(Nombre,Cuit) VALUES ('MEDITERRANEAN SHIPPING COMPANY','30693184947') END
    UPDATE ATAPuerto SET Cuit = '33578648599' WHERE Nombre = 'CONS.MARITIMOS SRL'
    UPDATE ATAPuerto SET Cuit = '30645563472' WHERE Nombre = 'CLIPPER SRL (seaplate)'
    UPDATE ATAPuerto SET Cuit = '30612732503' WHERE Nombre = 'AG.MARIT.NABSA S.A.'
    UPDATE ATAPuerto SET Cuit = '30615647345' WHERE Nombre = 'ALPEMAR SRL'
    UPDATE ATAPuerto SET Cuit = '30641739916' WHERE Nombre = 'CHRISTHOPHERSEN S.A.'
    UPDATE ATAPuerto SET Cuit = '30680516959' WHERE Nombre = 'FAROSHIP S.R.L.'
    UPDATE ATAPuerto SET Cuit = '30680495064' WHERE Nombre = 'BALTZER MARITIMA SRL'
    UPDATE ATAPuerto SET Cuit = '30707691847' WHERE Nombre = 'FERTIMPORT'
    UPDATE ATAPuerto SET Cuit = '30709247235' WHERE Nombre = 'MARITIME SHIPPING AGENCY SRL'
    UPDATE ATAPuerto SET Cuit = '30654214715' WHERE Nombre = 'WAVE AG. MARITIMA S.A.'
    UPDATE ATAPuerto SET Cuit = '30506727967' WHERE Nombre = 'AGENCIA MARITIMA DULCE S.A.'
    UPDATE ATAPuerto SET Cuit = '30709539023' WHERE Nombre = 'MARITIMA MARSA SRL'
    UPDATE ATAPuerto SET Cuit = '30715788779' WHERE Nombre = 'WBL (JNL MARITIMA)'
    UPDATE ATAPuerto SET Cuit = '30715312715' WHERE Nombre = 'at port'
    UPDATE ATAPuerto SET Cuit = '30715326570' WHERE Nombre = 'B2B'
    UPDATE ATAPuerto SET Cuit = '30708360496' WHERE Nombre = 'B&G'
    UPDATE ATAPuerto SET Cuit = '30506888189' WHERE Nombre = 'AMI'
    UPDATE ATAPuerto SET Cuit = '30715631608' WHERE Nombre = 'BROADGRAIN ARGENTINA'
    UPDATE ATAPuerto SET Cuit = '30708877189' WHERE Nombre = 'INTERGRAIN'
END

-- Permisos Destino
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Destinos_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Destinos_Visualizar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso ='Destinos_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Destinos_Visualizar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Destinos_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Destinos_Visualizar')); END

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Destinos_Editar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Destinos_Editar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Destinos_Editar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Destinos_Editar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Destinos_Editar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Destinos_Editar')); END

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Destinos_Crear') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Destinos_Crear'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Destinos_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Destinos_Crear')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Destinos_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Destinos_Crear')); END

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Destinos_Eliminar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Destinos_Eliminar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Destinos_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Destinos_Eliminar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Destinos_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Destinos_Eliminar')); END
if exists(select 1 from ModuloDeCarga where IngresoManualSolido is null) BEGIN update ModuloDeCarga set IngresoManualSolido = 0 where IngresoManualSolido is null END

-- Permisos Productos
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Productos_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Productos_Visualizar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso ='Productos_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Visualizar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Productos_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Visualizar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso ='Productos_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Moc'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Visualizar')); END

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Productos_Editar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Productos_Editar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Productos_Editar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Editar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Productos_Editar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Editar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Productos_Editar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Moc'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Editar')); END

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Productos_Crear') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Productos_Crear'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Productos_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Crear')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Productos_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Crear')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Productos_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Moc'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Crear')); END

if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Productos_Eliminar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Productos_Eliminar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Productos_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Eliminar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Productos_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Eliminar')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Productos_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Moc'), (select Id from ADPuertoPermisos where NombrePermiso='Productos_Eliminar')); END

--Permisos Documentos
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Documentos_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Documentos_Visualizar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Documentos_Visualizar')) BEGIN  insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Documentos_Visualizar')); END
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Documentos_Crear') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Documentos_Crear'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Documentos_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Documentos_Crear')); END
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Documentos_Editar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Documentos_Editar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Documentos_Editar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Documentos_Editar')); END
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Documentos_Eliminar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Documentos_Eliminar'); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Documentos_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Documentos_Eliminar')); END


UPDATE LineUp SET Ocultar = 0 WHERE Ocultar IS NULL

--Silos y Celdas
IF (SELECT COUNT(*) FROM SiloCelda) = 0 BEGIN
    INSERT INTO SiloCelda (Nombre, Color) 
	VALUES	('SILO 31', '#ccc0da'),
			('SILO 32', '#92cddc'),
			('Camiones', '#f33954'),
			('Silos Logística / Celda 29', '#948a54'),
			('CELDA 7', '#ffcc99'),
			('CELDA 20', '#ccffcc'),
			('CELDA 23', '#ffff99'),
			('CELDA 30', '#e6b8b7')
END

-- Permisos Supervisor Operaciones
DECLARE @IdGrupoSupervisor INT = (SELECT Id FROM ADPuertoGruposAd WHERE NombreGrupoAD = 'LAD_MOAAPP_PUERTO_OPERADORES_SUPERVISORES')
DECLARE @IdRolSupervisor INT = (SELECT Id FROM ADPuertoRoles WHERE NombreRol = 'Supervisores')
IF NOT EXISTS (SELECT 1 FROM ADPuertoGruposRoles WHERE Id_Grupo = @IdGrupoSupervisor AND Id_Rol = @IdRolSupervisor) BEGIN
    INSERT INTO ADPuertoGruposRoles (Id_Grupo, Id_Rol) VALUES (@IdGrupoSupervisor, @IdRolSupervisor)
END
IF NOT EXISTS (SELECT 1 FROM ADPuertoPermisos WHERE NombrePermiso = 'TableroSolido_EditarCargaHistorial') BEGIN
    INSERT INTO ADPuertoPermisos (NombrePermiso) VALUES ('TableroSolido_EditarCargaHistorial')
END
IF NOT EXISTS (SELECT 1 FROM ADPuertoPermisos WHERE NombrePermiso = 'Comprobantes_EditarNumeroInicial') BEGIN
    INSERT INTO ADPuertoPermisos (NombrePermiso) VALUES ('Comprobantes_EditarNumeroInicial')
END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @IdRolSupervisor and Id_Permiso = (select Id from ADPuertoPermisos where NombrePermiso='TableroSolido_EditarCargaHistorial')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values (@IdRolSupervisor, (select Id from ADPuertoPermisos where NombrePermiso='TableroSolido_EditarCargaHistorial')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='TableroSolido_EditarCargaHistorial')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='TableroSolido_EditarCargaHistorial')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @IdRolSupervisor and Id_Permiso = (select Id from ADPuertoPermisos where NombrePermiso='Comprobantes_EditarNumeroInicial')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values (@IdRolSupervisor, (select Id from ADPuertoPermisos where NombrePermiso='Comprobantes_EditarNumeroInicial')); END
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Sistemas') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comprobantes_EditarNumeroInicial')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Sistemas'), (select Id from ADPuertoPermisos where NombrePermiso='Comprobantes_EditarNumeroInicial')); END



--Estados de documentos
if not exists(select 1 from NominacionDocumentoEstado where Estado = 'Borrador Solicitado') BEGIN insert into NominacionDocumentoEstado(Estado) values ('Borrador Solicitado'); END
if not exists(select 1 from NominacionDocumentoEstado where Estado = 'Borrador Enviado') BEGIN insert into NominacionDocumentoEstado(Estado) values ('Borrador Enviado'); END
if not exists(select 1 from NominacionDocumentoEstado where Estado = 'Borrador Modificado') BEGIN insert into NominacionDocumentoEstado(Estado) values ('Borrador Modificado'); END
if not exists(select 1 from NominacionDocumentoEstado where Estado = 'Borrador Aprobado') BEGIN insert into NominacionDocumentoEstado(Estado) values ('Borrador Aprobado'); END
if not exists(select 1 from NominacionDocumentoEstado where Estado = 'Documento Enviado') BEGIN insert into NominacionDocumentoEstado(Estado) values ('Documento Enviado'); END
if not exists(select 1 from NominacionDocumentoEstado where Estado = 'Documento Cerrado') BEGIN insert into NominacionDocumentoEstado(Estado) values ('Documento Cerrado'); END

--Tipos de documentos
if not exists(select 1 from DocumentoTipo where Nombre = 'A solicitar en la nominación') BEGIN insert into DocumentoTipo(Nombre) values ('A solicitar en la nominación'); END
if not exists(select 1 from DocumentoTipo where Nombre = 'Interno') BEGIN insert into DocumentoTipo(Nombre) values ('Interno'); END
if not exists(select 1 from DocumentoTipo where Nombre = 'A compartir') BEGIN insert into DocumentoTipo(Nombre) values ('A compartir'); END


--Carga de Configuración de Documentos, Destino y Productos

if not exists(select 1 from Documento       )        BEGIN exec sp_CargaDocumento END
if not exists(select 1 from DocumentoDestino)        BEGIN exec sp_CargaDocumentoDestino END
if not exists(select 1 from DocumentoMaterialPuerto) BEGIN exec sp_CargaDocumentoProducto END

--Nuevo Rol MOC
if not exists(select 1 from ADPuertoRoles where Id=(select Id from ADPuertoRoles where NombreRol='Moc')) begin insert into ADPuertoRoles(NombreRol) values('Moc') end

--Nuevo grupo LAD_MOAAPP_PUERTO_MOC
if not exists(select 1 from ADPuertoGruposAd where Id=(select Id from ADPuertoGruposAd where NombreGrupoAD='LAD_MOAAPP_PUERTO_MOC')) begin insert into ADPuertoGruposAd(NombreGrupoAD) values('LAD_MOAAPP_PUERTO_MOC') end

--Asociacion Grupo LAD_MOAAPP_PUERTO_MOC con Rol MOC
if not exists(select 1 from ADPuertoGruposRoles where Id_Grupo=(select Id from ADPuertoGruposAd where NombreGrupoAD='LAD_MOAAPP_PUERTO_MOC') and Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc')) begin insert into ADPuertoGruposRoles(Id_Grupo, Id_Rol) values ((select Id from ADPuertoGruposAd where NombreGrupoAD='LAD_MOAAPP_PUERTO_MOC'), (select Id from ADPuertoRoles where NombreRol='Moc')); end

--Digitalizacion_Visualizar
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Digitalizacion_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Digitalizacion_Visualizar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Digitalizacion_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Digitalizacion_Visualizar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Digitalizacion_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Moc'), (select Id from ADPuertoPermisos where NombrePermiso='Digitalizacion_Visualizar')); end

--Archivo_Digitalizacion_Crear
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Crear') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Archivo_Digitalizacion_Crear'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Crear')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Crear')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Moc'), (select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Crear')); end

--Archivo_Digitalizacion_Modificar
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Modificar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Archivo_Digitalizacion_Modificar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Modificar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Modificar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Modificar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Moc'), (select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Modificar')); end

--Archivo_Digitalizacion_Eliminar
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Eliminar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Archivo_Digitalizacion_Eliminar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Eliminar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Eliminar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Moc'), (select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Eliminar')); end

--Archivo_Digitalizacion_Descargar
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Descargar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Archivo_Digitalizacion_Descargar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Descargar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Descargar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Descargar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Moc'), (select Id from ADPuertoPermisos where NombrePermiso='Archivo_Digitalizacion_Descargar')); end

--Comex_Documentos_Visualizar
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Comex_Documentos_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Comex_Documentos_Visualizar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Comex_Documentos_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Comex_Documentos_Visualizar')); end

--Moc_Documentos_Visualizar
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Moc_Documentos_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Moc_Documentos_Visualizar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Moc_Documentos_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Moc'), (select Id from ADPuertoPermisos where NombrePermiso='Moc_Documentos_Visualizar')); end

-- Motivos de Envio de alerta de documentacion
if not exists(select 1 from DocumentoMotivoAlerta where Motivo='Borradores') BEGIN insert into DocumentoMotivoAlerta(Motivo)values('Borradores'); END
if not exists(select 1 from DocumentoMotivoAlerta where Motivo='Documentos Fuera de término') BEGIN insert into DocumentoMotivoAlerta(Motivo)values('Documentos Fuera de término'); END
if not exists(select 1 from DocumentoMotivoAlerta where Motivo='Documentos compartidos') BEGIN insert into DocumentoMotivoAlerta(Motivo)values('Documentos compartidos'); END
if not exists(select 1 from DocumentoMotivoAlerta where Motivo='Otros') BEGIN insert into DocumentoMotivoAlerta(Motivo)values('Otros'); END

--Correo de alerta de documentos
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'AlertaDocumentos') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('AlertaDocumentos','macarena.asqueri@molinosagro.com.ar; romina.escudero@molinosagro.com.ar'); END


-- Permisos Moc para digitalización
if not exists(select 1 from ADPuertoPermisos where NombrePermiso = 'Moc_Nominacion_Ver') begin insert into ADPuertoPermisos(NombrePermiso) values('Moc_Nominacion_Ver'); end

GO

declare @par_Id_Rol_Moc int 
declare @par_Id_Permiso_Moc_Nominacion int
declare @par_Id_Documento_Visualizar int
declare @par_Id_Vapor_Visualizar int 
declare @par_Id_Vapor_Editar int 
declare @par_Id_Vapor_Crear int 
declare @par_Id_Vapor_Eliminar int 

declare @par_Id_Comex_Nominacion_Modificar int 
declare @par_Id_Comex_Nominacion_Eliminar int 
declare @par_IdComex_Nominacion_Nominar int 
declare @par_Id_Comex_Nominacion_Enviar_LineUp int 
declare @par_Id_Comex_Nominacion_Guardar int 

 select @par_Id_Rol_Moc = Id from ADPuertoRoles where NombreRol = 'Moc'
 select @par_Id_Permiso_Moc_Nominacion = Id from ADPuertoPermisos where NombrePermiso = 'Moc_Nominacion_Ver'
 select @par_Id_Documento_Visualizar = Id from ADPuertoPermisos where NombrePermiso = 'Documentos_Visualizar'
 
 select @par_Id_Vapor_Visualizar = Id from ADPuertoPermisos where NombrePermiso = 'Vapor_Visualizar'
 select @par_Id_Vapor_Editar = Id from ADPuertoPermisos where NombrePermiso = 'Vapor_Editar'
 select @par_Id_Vapor_Crear = Id from ADPuertoPermisos where NombrePermiso = 'Vapor_Crear'
 select @par_Id_Vapor_Eliminar = Id from ADPuertoPermisos where NombrePermiso = 'Vapor_Eliminar'

 
 select @par_Id_Comex_Nominacion_Modificar = Id from ADPuertoPermisos where NombrePermiso = 'Comex_Nominacion_Modificar'
 select @par_Id_Comex_Nominacion_Eliminar = Id from ADPuertoPermisos where NombrePermiso = 'Comex_Nominacion_Eliminar'
 select @par_IdComex_Nominacion_Nominar = Id from ADPuertoPermisos where NombrePermiso = 'Comex_Nominacion_Nominar'
 select @par_Id_Comex_Nominacion_Enviar_LineUp = Id from ADPuertoPermisos where NombrePermiso = 'Comex_Nominacion_Enviar_LineUp'
 select @par_Id_Comex_Nominacion_Guardar = Id from ADPuertoPermisos where NombrePermiso = 'Comex_Nominacion_Guardar'


if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @par_Id_Rol_Moc and Id_Permiso = @par_Id_Permiso_Moc_Nominacion) begin insert into ADPuertoRolesPermisos(Id_Rol,Id_Permiso)values(@par_Id_Rol_Moc,@par_Id_Permiso_Moc_Nominacion); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @par_Id_Rol_Moc and Id_Permiso = @par_Id_Documento_Visualizar) begin 	insert into ADPuertoRolesPermisos(Id_Rol,Id_Permiso)values(@par_Id_Rol_Moc,@par_Id_Documento_Visualizar); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @par_Id_Rol_Moc and Id_Permiso = @par_Id_Vapor_Visualizar) begin	insert into ADPuertoRolesPermisos(Id_Rol,Id_Permiso)values(@par_Id_Rol_Moc,@par_Id_Vapor_Visualizar); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @par_Id_Rol_Moc and Id_Permiso = @par_Id_Vapor_Editar) begin	insert into ADPuertoRolesPermisos(Id_Rol,Id_Permiso)values(@par_Id_Rol_Moc,@par_Id_Vapor_Editar); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @par_Id_Rol_Moc and Id_Permiso = @par_Id_Vapor_Crear) begin	insert into ADPuertoRolesPermisos(Id_Rol,Id_Permiso)values(@par_Id_Rol_Moc,@par_Id_Vapor_Crear); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @par_Id_Rol_Moc and Id_Permiso = @par_Id_Vapor_Eliminar) begin	insert into ADPuertoRolesPermisos(Id_Rol,Id_Permiso)values(@par_Id_Rol_Moc,@par_Id_Vapor_Eliminar); end

--Permisos MOC - Acciones Programa Embarque - Comparte permisos con COMEX
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @par_Id_Rol_Moc and Id_Permiso = @par_Id_Comex_Nominacion_Modificar) begin	insert into ADPuertoRolesPermisos(Id_Rol,Id_Permiso)values(@par_Id_Rol_Moc,@par_Id_Comex_Nominacion_Modificar); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @par_Id_Rol_Moc and Id_Permiso = @par_Id_Comex_Nominacion_Eliminar) begin	insert into ADPuertoRolesPermisos(Id_Rol,Id_Permiso)values(@par_Id_Rol_Moc,@par_Id_Comex_Nominacion_Eliminar); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @par_Id_Rol_Moc and Id_Permiso = @par_IdComex_Nominacion_Nominar) begin	insert into ADPuertoRolesPermisos(Id_Rol,Id_Permiso)values(@par_Id_Rol_Moc,@par_IdComex_Nominacion_Nominar); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @par_Id_Rol_Moc and Id_Permiso = @par_Id_Comex_Nominacion_Enviar_LineUp) begin	insert into ADPuertoRolesPermisos(Id_Rol,Id_Permiso)values(@par_Id_Rol_Moc,@par_Id_Comex_Nominacion_Enviar_LineUp); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol = @par_Id_Rol_Moc and Id_Permiso = @par_Id_Comex_Nominacion_Guardar) begin	insert into ADPuertoRolesPermisos(Id_Rol,Id_Permiso)values(@par_Id_Rol_Moc,@par_Id_Comex_Nominacion_Guardar); end

GO

IF EXISTS (SELECT 1 FROM SiloCelda WHERE nombre = 'SILO 31' AND orden IS NULL) BEGIN UPDATE SiloCelda SET orden = 1 WHERE nombre = 'SILO 31'; END
IF EXISTS (SELECT 1 FROM SiloCelda WHERE nombre = 'SILO 32' AND orden IS NULL) BEGIN UPDATE SiloCelda SET orden = 2 WHERE nombre = 'SILO 32'; END
IF EXISTS (SELECT 1 FROM SiloCelda WHERE nombre = 'CELDA 7' AND orden IS NULL) BEGIN UPDATE SiloCelda SET orden = 3 WHERE nombre = 'CELDA 7'; END
IF EXISTS (SELECT 1 FROM SiloCelda WHERE nombre = 'Silos Logística / Celda 29' AND orden IS NULL) BEGIN UPDATE SiloCelda SET orden = 4 WHERE nombre = 'Silos Logística / Celda 29'; END
IF EXISTS (SELECT 1 FROM SiloCelda WHERE nombre = 'Camiones' AND orden IS NULL) BEGIN UPDATE SiloCelda SET orden = 5 WHERE nombre = 'Camiones'; END
IF EXISTS (SELECT 1 FROM SiloCelda WHERE nombre = 'CELDA 20' AND orden IS NULL) BEGIN UPDATE SiloCelda SET orden = 6 WHERE nombre = 'CELDA 20'; END
IF EXISTS (SELECT 1 FROM SiloCelda WHERE nombre = 'CELDA 23' AND orden IS NULL) BEGIN UPDATE SiloCelda SET orden = 7 WHERE nombre = 'CELDA 23'; END
IF EXISTS (SELECT 1 FROM SiloCelda WHERE nombre = 'CELDA 30' AND orden IS NULL) BEGIN UPDATE SiloCelda SET orden = 8 WHERE nombre = 'CELDA 30'; END

-- Motivos de cortes y bajas cargas para Líquidos y Sólidos
UPDATE [dbo].[MotivosFallasBalanza]
SET 
    BajaCargaLiquido = CASE WHEN Siglas IN ('BCB', 'BCP') THEN 1 ELSE 0 END,
    BajaCargaSolido  = CASE WHEN Siglas IN ('BCB', 'BCP', 'F') THEN 1 ELSE 0 END,
    CortesLiquido    = CASE WHEN Siglas IN ('C', 'E', 'H', 'M', 'OP', 'OC', 'OB', '3ro', 'T') THEN 1 ELSE 0 END,
    CortesSolido     = CASE WHEN Siglas IN ('C', 'E', 'H', 'M', 'OP', 'OC', 'OB', 'P', '3ro', 'T') THEN 1 ELSE 0 END;
GO

--Nuevo Rol Administracion Para Facturaciones
if not exists(select 1 from ADPuertoRoles where Id=(select Id from ADPuertoRoles where NombreRol='AdmFacturacion')) 
begin insert into ADPuertoRoles(NombreRol) values('AdmFacturacion') end

--Nuevo grupo LAD_MOAAPP_PUERTO_ADMF
if not exists(select 1 from ADPuertoGruposAd where Id=(select Id from ADPuertoGruposAd where NombreGrupoAD='LAD_MOAAPP_PUERTO_ADMF')) 
begin insert into ADPuertoGruposAd(NombreGrupoAD) values('LAD_MOAAPP_PUERTO_ADMF') end

--Asociacion Grupo LAD_MOAAPP_PUERTO_ADM con Rol Administracion Para Facturaciones
if not exists(select 1 from ADPuertoGruposRoles where Id_Grupo=(select Id from ADPuertoGruposAd where NombreGrupoAD='LAD_MOAAPP_PUERTO_ADMF') 
and Id_Rol=(select Id from ADPuertoRoles where NombreRol='AdmFacturacion')) 
begin insert into ADPuertoGruposRoles(Id_Grupo, Id_Rol) values ((select Id from ADPuertoGruposAd where NombreGrupoAD='LAD_MOAAPP_PUERTO_ADMF'), 
(select Id from ADPuertoRoles where NombreRol='AdmFacturacion')); end

--Administracion_Visualizar
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Administracion_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Administracion_Visualizar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Administracion_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Administracion_Visualizar')); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='AdmFacturacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Administracion_Visualizar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='AdmFacturacion'), (select Id from ADPuertoPermisos where NombrePermiso='Administracion_Visualizar')); end

--Administracion_Facturar
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Administracion_Facturar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Administracion_Facturar'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='AdmFacturacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Administracion_Facturar')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='AdmFacturacion'), (select Id from ADPuertoPermisos where NombrePermiso='Administracion_Facturar')); end

--Estados embarques
IF (SELECT COUNT(*) FROM EstadoEmbarque) = 0 
BEGIN
    INSERT INTO EstadoEmbarque(Descripcion) 
	VALUES('LineUp'),
    ('Operaciones'),
	('Calidad'),
	('A Facturar'),
	('Facturado')
END

--Configuracion correos envio alerta administracion
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'AlertaAdministracion') 
BEGIN 
	insert into ConfiguracionMail(TemplateMail, Direcciones) 
	values ('AlertaAdministracion',''); 
END

IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'AlertaAdministracionCopia') 
BEGIN 
	insert into ConfiguracionMail(TemplateMail, Direcciones) 
	values ('AlertaAdministracionCopia',''); 
END

--Nuevo Rol Administracion Para Configurar Tarifas
if not exists(select 1 from ADPuertoRoles where Id=(select Id from ADPuertoRoles where NombreRol='Tarificador')) 
begin insert into ADPuertoRoles(NombreRol) values('Tarificador') end


--Nuevo grupo LAD_MOAAPP_PUERTO_TARIFICADOR
if not exists(select 1 from ADPuertoGruposAd where Id=(select Id from ADPuertoGruposAd where NombreGrupoAD='LAD_MOAAPP_PUERTO_TARIFICADOR')) 
begin insert into ADPuertoGruposAd(NombreGrupoAD) values('LAD_MOAAPP_PUERTO_TARIFICADOR') end

--Asociacion Grupo LAD_MOAAPP_PUERTO_TARIFICADOR con Rol Tarificador
if not exists(select 1 from ADPuertoGruposRoles where Id_Grupo=(select Id from ADPuertoGruposAd where NombreGrupoAD='LAD_MOAAPP_PUERTO_TARIFICADOR') 
and Id_Rol=(select Id from ADPuertoRoles where NombreRol='Tarificador')) 
begin insert into ADPuertoGruposRoles(Id_Grupo, Id_Rol) values ((select Id from ADPuertoGruposAd where NombreGrupoAD='LAD_MOAAPP_PUERTO_TARIFICADOR'), 
(select Id from ADPuertoRoles where NombreRol='Tarificador')); end

--Tarifario_Visualizar - Se otorga permiso a roles: Tarificador, AdmFacturacion, MOC, Comex, Coordinacion.
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Tarifario_Visualizar') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Tarifario_Visualizar'); end

if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='AdmFacturacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Tarifario_Visualizar')) 
BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='AdmFacturacion'), (select Id from ADPuertoPermisos where NombrePermiso='Tarifario_Visualizar')); 
END

if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Tarificador') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Tarifario_Visualizar')) 
BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Tarificador'), (select Id from ADPuertoPermisos where NombrePermiso='Tarifario_Visualizar')); 
END

if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Comex') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Tarifario_Visualizar')) 
BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Comex'), (select Id from ADPuertoPermisos where NombrePermiso='Tarifario_Visualizar')); 
END

if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Moc') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Tarifario_Visualizar')) 
BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Moc'), (select Id from ADPuertoPermisos where NombrePermiso='Tarifario_Visualizar')); 
END

if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='Coordinacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Tarifario_Visualizar')) 
BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='Coordinacion'), (select Id from ADPuertoPermisos where NombrePermiso='Tarifario_Visualizar')); 
END

--Carga de datos iniciales para Tarifas, Provisiones y Gastos
IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoConcepto])
BEGIN
    INSERT INTO [dbo].[TipoConcepto] ([Descripcion])
    VALUES ('Ingreso'), ('Gasto');
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[Moneda])
BEGIN
    INSERT INTO [dbo].[Moneda] ([Descripcion])
    VALUES ('Pesos'), ('Dolares');
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoTarifa])
BEGIN
    INSERT INTO [dbo].[TipoTarifa] ([Descripcion])
    VALUES ('Por tonelada'), ('Por tiempo de carga'), ('Por cantidad de turnos');
END
GO

DECLARE 
    @TipoConceptoIngresoId INT = (SELECT Id FROM [dbo].[TipoConcepto] WHERE [Descripcion] = 'Ingreso'),
    @TipoConceptoGastoId INT = (SELECT Id FROM [dbo].[TipoConcepto] WHERE [Descripcion] = 'Gasto'),
    @MonedaPesosId INT = (SELECT Id FROM [dbo].[Moneda] WHERE [Descripcion] = 'Pesos'),
    @MonedaDolaresId INT = (SELECT Id FROM [dbo].[Moneda] WHERE [Descripcion] = 'Dolares'),
    @TipoTarifaToneladaId INT = (SELECT Id FROM [dbo].[TipoTarifa] WHERE [Descripcion] = 'Por tonelada'),
    @TipoTarifaTiempoCargaId INT = (SELECT Id FROM [dbo].[TipoTarifa] WHERE [Descripcion] = 'Por tiempo de carga'),
    @TipoTarifaTurnosId INT = (SELECT Id FROM [dbo].[TipoTarifa] WHERE [Descripcion] = 'Por cantidad de turnos');

IF NOT EXISTS (SELECT 1 FROM [dbo].[Concepto])
BEGIN

    INSERT INTO [dbo].[Concepto] ([Descripcion], [TipoConcepto_Id], [Moneda_Id], [TipoTarifa_Id], [PresentaAjuste], [PorProducto], [PorEmbarque])
        VALUES ('Tarifa de elevación', @TipoConceptoIngresoId, @MonedaDolaresId, @TipoTarifaToneladaId, 0, 1, 0), 
         ('Uso de muelle', @TipoConceptoIngresoId, @MonedaDolaresId, @TipoTarifaTiempoCargaId, 0, 0, 1), 
         ('Habilitación "Inhabil"', @TipoConceptoIngresoId, @MonedaDolaresId, @TipoTarifaTurnosId, 0, 0, 1), 
         ('Estiba (Cooperativa Portuaria)', @TipoConceptoGastoId, @MonedaPesosId, @TipoTarifaToneladaId, 1, 1, 0), 
         ('Despachante', @TipoConceptoGastoId, @MonedaPesosId, @TipoTarifaToneladaId, 1, 0, 1), 
         ('Control', @TipoConceptoGastoId, @MonedaDolaresId, @TipoTarifaToneladaId, 1, 1, 0), 
         ('Aduana', @TipoConceptoGastoId, @MonedaPesosId, @TipoTarifaToneladaId, 1, 0, 1), 
         ('Agencia Marítima', @TipoConceptoGastoId, @MonedaPesosId, @TipoTarifaToneladaId, 1, 0, 1), 
         ('Clean Sea', @TipoConceptoGastoId, @MonedaPesosId, @TipoTarifaTurnosId, 0, 1, 0), 
         ('SENASA', @TipoConceptoGastoId, @MonedaPesosId, @TipoTarifaToneladaId, 1, 1, 0), 
         ('Fumigación Buque', @TipoConceptoGastoId, @MonedaDolaresId, @TipoTarifaToneladaId, 1, 1, 0), 
         ('Fumigación Curativa', @TipoConceptoGastoId, @MonedaDolaresId, @TipoTarifaToneladaId, 1, 1, 0);
END

IF NOT EXISTS (SELECT 1 FROM Concepto WHERE Descripcion = 'Estiba adic.') BEGIN 
    INSERT INTO Concepto (Descripcion, TipoConcepto_Id, Moneda_Id, TipoTarifa_Id, PresentaAjuste, PorProducto, PorEmbarque) 
    VALUES ('Estiba adic.', @TipoConceptoGastoId, @MonedaPesosId, @TipoTarifaToneladaId, 0, 0, 0); 
END

IF NOT EXISTS (SELECT 1 FROM Concepto WHERE Descripcion = 'Costo Recibidor') BEGIN 
    INSERT INTO Concepto (Descripcion, TipoConcepto_Id, Moneda_Id, TipoTarifa_Id, PresentaAjuste, PorProducto, PorEmbarque) 
    VALUES ('Costo Recibidor', @TipoConceptoGastoId, @MonedaDolaresId, @TipoTarifaToneladaId, 0, 0, 0); 
END
GO

IF NOT EXISTS (SELECT 1 FROM [dbo].[TipoContratoTarifa])
BEGIN
    INSERT INTO [dbo].[TipoContratoTarifa] ([Descripcion])
    VALUES ('De tipo ELEVACIÓN'), ('FASÓN'), ('Préstamo y Devolución');
END
GO

IF EXISTS (
    SELECT 1 FROM Concepto
    WHERE Descripcion IN ('Agencia Marítima', 'Aduana', 'Despachante')
      AND (PorEmbarque <> 0 OR PorProducto <> 1)
)
BEGIN
    UPDATE Concepto
    SET PorEmbarque = 0,
        PorProducto = 1
    WHERE Descripcion IN ('Agencia Marítima', 'Aduana', 'Despachante');
END
GO

--Administracion VerHistorialDeBuques
if not exists(select 1 from ADPuertoPermisos where NombrePermiso='Administracion_VerHistorialDeBuques') BEGIN insert into ADPuertoPermisos(NombrePermiso) values ('Administracion_VerHistorialDeBuques'); end
if not exists(select 1 from ADPuertoRolesPermisos where Id_Rol=(select Id from ADPuertoRoles where NombreRol='AdmFacturacion') and Id_Permiso=(select Id from ADPuertoPermisos where NombrePermiso='Administracion_VerHistorialDeBuques')) BEGIN insert into ADPuertoRolesPermisos(Id_Rol, Id_Permiso) values ((select Id from ADPuertoRoles where NombreRol='AdmFacturacion'), (select Id from ADPuertoPermisos where NombrePermiso='Administracion_VerHistorialDeBuques')); end

--Tipos de Comprobantes de Embarque
IF NOT EXISTS(SELECT 1 FROM TipoComprobante WHERE Descripcion = 'Romaneo') BEGIN INSERT INTO TipoComprobante (Descripcion) VALUES ('Romaneo') END
IF NOT EXISTS(SELECT 1 FROM TipoComprobante WHERE Descripcion = 'Secuencia Real') BEGIN INSERT INTO TipoComprobante (Descripcion) VALUES ('Secuencia Real') END

--Acuerdos
IF NOT EXISTS(SELECT 1 FROM AcuerdoTipo) BEGIN
    INSERT INTO AcuerdoTipo (Descripcion) 
    VALUES ('Elevación'), ('Fasón'), ('Préstamo y Devolución');
END

DECLARE 
    @AcuerdoTipoElevacion INT = (SELECT Id FROM AcuerdoTipo WHERE Descripcion = 'Elevación'),
    @AcuerdoTipoFason INT = (SELECT Id FROM AcuerdoTipo WHERE Descripcion = 'Fasón'),
    @AcuerdoTipoPrestamo INT = (SELECT Id FROM AcuerdoTipo WHERE Descripcion = 'Préstamo y Devolución');

IF NOT EXISTS (SELECT 1 FROM AcuerdoTipoConfiguracion)
BEGIN
    INSERT INTO AcuerdoTipoConfiguracion (AcuerdoTipo_Id, EsSanBenito, EsMOA)
    VALUES (@AcuerdoTipoElevacion, 1, 0), -- Elevación - San Benito - No MOA
           (@AcuerdoTipoElevacion, 0, 1), -- Elevación - Otro muelle - MOA
           (@AcuerdoTipoFason, 1, 0),     -- Fasón - San Benito - No MOA
           (@AcuerdoTipoFason, 0, 1),     -- Fasón - Otro muelle - MOA
           (@AcuerdoTipoPrestamo, 1, 0),  -- Préstamo y Devolución - San Benito - No MOA
           (@AcuerdoTipoPrestamo, 0, 1);  -- Préstamo y Devolución - Otro muelle - MOA
END

DECLARE
    @Cfg_Elev_SB_NoMOA INT  = (SELECT Id FROM AcuerdoTipoConfiguracion WHERE AcuerdoTipo_Id = @AcuerdoTipoElevacion AND EsSanBenito = 1 AND EsMOA = 0),
    @Cfg_Elev_Otro_MOA INT  = (SELECT Id FROM AcuerdoTipoConfiguracion WHERE AcuerdoTipo_Id = @AcuerdoTipoElevacion AND EsSanBenito = 0 AND EsMOA = 1),
    @Cfg_Fason_SB_NoMOA INT = (SELECT Id FROM AcuerdoTipoConfiguracion WHERE AcuerdoTipo_Id = @AcuerdoTipoFason AND EsSanBenito = 1 AND EsMOA = 0),
    @Cfg_Fason_Otro_MOA INT = (SELECT Id FROM AcuerdoTipoConfiguracion WHERE AcuerdoTipo_Id = @AcuerdoTipoFason AND EsSanBenito = 0 AND EsMOA = 1),
    @Cfg_Prest_SB_NoMOA INT = (SELECT Id FROM AcuerdoTipoConfiguracion WHERE AcuerdoTipo_Id = @AcuerdoTipoPrestamo AND EsSanBenito = 1 AND EsMOA = 0),
    @Cfg_Prest_Otro_MOA INT = (SELECT Id FROM AcuerdoTipoConfiguracion WHERE AcuerdoTipo_Id = @AcuerdoTipoPrestamo AND EsSanBenito = 0 AND EsMOA = 1);

DECLARE
    @TarifaElevacion INT = (SELECT Id FROM Concepto WHERE Descripcion = 'Tarifa de elevación'),
    @UsoMuelle INT       = (SELECT Id FROM Concepto WHERE Descripcion = 'Uso de muelle'),
    @Estiba INT          = (SELECT Id FROM Concepto WHERE Descripcion = 'Estiba (Cooperativa Portuaria)'),
    @EstibaAdic INT      = (SELECT Id FROM Concepto WHERE Descripcion = 'Estiba adic.'),
    @Despachante INT     = (SELECT Id FROM Concepto WHERE Descripcion = 'Despachante'),
    @Control INT         = (SELECT Id FROM Concepto WHERE Descripcion = 'Control'),
    @Aduana INT          = (SELECT Id FROM Concepto WHERE Descripcion = 'Aduana'),
    @AgenciaMaritima INT = (SELECT Id FROM Concepto WHERE Descripcion = 'Agencia Marítima'),
    @CleanSea INT        = (SELECT Id FROM Concepto WHERE Descripcion = 'Clean Sea'),
    @Senasa INT          = (SELECT Id FROM Concepto WHERE Descripcion = 'SENASA'),
    @FumigacionBuque INT = (SELECT Id FROM Concepto WHERE Descripcion = 'Fumigación Buque'),
    @CostoRecibidor INT  = (SELECT Id FROM Concepto WHERE Descripcion = 'Costo Recibidor');

IF NOT EXISTS (SELECT 1 FROM Concepto WHERE Orden IS NOT NULL) BEGIN
    UPDATE Concepto SET Orden = 1 WHERE Id = @TarifaElevacion;
    UPDATE Concepto SET Orden = 2 WHERE Id = @UsoMuelle;
    UPDATE Concepto SET Orden = 3 WHERE Id = @Estiba;
    UPDATE Concepto SET Orden = 4 WHERE Id = @AgenciaMaritima;
    UPDATE Concepto SET Orden = 5 WHERE Id = @EstibaAdic;
    UPDATE Concepto SET Orden = 6 WHERE Id = @CleanSea;
    UPDATE Concepto SET Orden = 7 WHERE Id = @Despachante;
    UPDATE Concepto SET Orden = 8 WHERE Id = @Senasa;
    UPDATE Concepto SET Orden = 9 WHERE Id = @Control;
    UPDATE Concepto SET Orden = 10 WHERE Id = @FumigacionBuque;
    UPDATE Concepto SET Orden = 11 WHERE Id = @Aduana;
    UPDATE Concepto SET Orden = 12 WHERE Id = @CostoRecibidor;
END

IF NOT EXISTS (SELECT 1 FROM AcuerdoTipoConfiguracionConcepto)
BEGIN
    INSERT INTO AcuerdoTipoConfiguracionConcepto
        (AcuerdoTipoConfiguracion_Id, Concepto_Id, Obligatorio)
    VALUES
    -- Elevación - San Benito - No MOA
    (@Cfg_Elev_SB_NoMOA, @TarifaElevacion,  0),
    (@Cfg_Elev_SB_NoMOA, @UsoMuelle,        1),
    (@Cfg_Elev_SB_NoMOA, @Estiba,           0),
    (@Cfg_Elev_SB_NoMOA, @EstibaAdic,       0),
    (@Cfg_Elev_SB_NoMOA, @Despachante,      0),
    (@Cfg_Elev_SB_NoMOA, @Control,          0),
    (@Cfg_Elev_SB_NoMOA, @Aduana,           0),
    (@Cfg_Elev_SB_NoMOA, @AgenciaMaritima,  0),
    (@Cfg_Elev_SB_NoMOA, @CleanSea,         0),
    (@Cfg_Elev_SB_NoMOA, @Senasa,           0),
    (@Cfg_Elev_SB_NoMOA, @FumigacionBuque,  0),

    -- Elevación - Otro muelle - MOA
    (@Cfg_Elev_Otro_MOA, @Estiba,           0),
    (@Cfg_Elev_Otro_MOA, @EstibaAdic,       0),
    (@Cfg_Elev_Otro_MOA, @Despachante,      0),
    (@Cfg_Elev_Otro_MOA, @Control,          0),
    (@Cfg_Elev_Otro_MOA, @Aduana,           0),
    (@Cfg_Elev_Otro_MOA, @AgenciaMaritima,  0),
    (@Cfg_Elev_Otro_MOA, @CleanSea,         0),
    (@Cfg_Elev_Otro_MOA, @Senasa,           0),
    (@Cfg_Elev_Otro_MOA, @FumigacionBuque,  0),

    -- Fasón - San Benito - No MOA
    (@Cfg_Fason_SB_NoMOA, @TarifaElevacion,  0),
    (@Cfg_Fason_SB_NoMOA, @UsoMuelle,        1),
    (@Cfg_Fason_SB_NoMOA, @Estiba,           0),
    (@Cfg_Fason_SB_NoMOA, @EstibaAdic,       0),
    (@Cfg_Fason_SB_NoMOA, @Despachante,      0),
    (@Cfg_Fason_SB_NoMOA, @Control,          0),
    (@Cfg_Fason_SB_NoMOA, @Aduana,           0),
    (@Cfg_Fason_SB_NoMOA, @AgenciaMaritima,  0),
    (@Cfg_Fason_SB_NoMOA, @CleanSea,         0),
    (@Cfg_Fason_SB_NoMOA, @Senasa,           0),
    (@Cfg_Fason_SB_NoMOA, @FumigacionBuque,  0),

    -- Fasón - Otro muelle - MOA
    (@Cfg_Fason_Otro_MOA, @Estiba,           0),
    (@Cfg_Fason_Otro_MOA, @EstibaAdic,       0),
    (@Cfg_Fason_Otro_MOA, @Despachante,      0),
    (@Cfg_Fason_Otro_MOA, @Control,          0),
    (@Cfg_Fason_Otro_MOA, @Aduana,           0),
    (@Cfg_Fason_Otro_MOA, @AgenciaMaritima,  0),
    (@Cfg_Fason_Otro_MOA, @CleanSea,         0),
    (@Cfg_Fason_Otro_MOA, @Senasa,           0),
    (@Cfg_Fason_Otro_MOA, @FumigacionBuque,  0),

    -- Préstamo y Devolución - San Benito - No MOA
    (@Cfg_Prest_SB_NoMOA, @UsoMuelle,        1),
    (@Cfg_Prest_SB_NoMOA, @Estiba,           0),
    (@Cfg_Prest_SB_NoMOA, @EstibaAdic,       0),
    (@Cfg_Prest_SB_NoMOA, @Despachante,      0),
    (@Cfg_Prest_SB_NoMOA, @Control,          0),
    (@Cfg_Prest_SB_NoMOA, @Aduana,           0),
    (@Cfg_Prest_SB_NoMOA, @AgenciaMaritima,  0),
    (@Cfg_Prest_SB_NoMOA, @CleanSea,         0),
    (@Cfg_Prest_SB_NoMOA, @Senasa,           0),
    (@Cfg_Prest_SB_NoMOA, @FumigacionBuque,  0),

    -- Préstamo y Devolución - Otro muelle - MOA
    (@Cfg_Prest_Otro_MOA, @CostoRecibidor,   1);
END
