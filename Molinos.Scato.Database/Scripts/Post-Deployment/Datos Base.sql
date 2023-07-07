

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
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Normal') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Normal', 'N'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Operativas de Puerto MOA') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Operativas de Puerto MOA', 'OP'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Operativas de MOA Comercial') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Operativas de MOA Comercial', 'OC'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Operativas del Buque') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Operativas del Buque', 'OB'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Pala/Paleo') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Pala/Paleo', 'P'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Terceros') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Terceros', '3ro'); END
IF NOT EXISTS (select 1 from MotivosFallasBalanza where Nombre = 'Otros') BEGIN insert into MotivosFallasBalanza(Nombre, Siglas) values ('Otros', 'T'); END
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
GO

--Correo Planilla de Turnos
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'PlanillaDeTurnos') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('PlanillaDeTurnos','SupervisoresPuertosanLorenzo@molinosagro.com.ar;sebastian.bolger@molinosagro.com.ar,fabricio.herrera@molinosagro.com.ar;jose.luis.gomez@molinosagro.com.ar;marcelo.gustavo.lopez@molinosagro.com.ar;sebastian.muniz@molinosagro.com.ar;german.turcutto@molinosagro.com.ar;Pablo.Yturres@molinosagro.com.ar;mauro.mir@molinosagro.com.ar;nestor.abalos@molinosagro.com.ar'); END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'PlanillaDeTurnosSolido') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('PlanillaDeTurnosSolido','mauro.mir@molinosagro.com.ar; cristian.leonori@molinosagro.com.ar; martin.amado@molinosagro.com.ar;rodolfo.benegas@mocommodities.com; German.Castagnani@molinosagro.com.ar;juan.catala@molinosagro.com.ar; gabriel.conde@mocommodities.com;romina.escudero@molinosagro.com.ar; gustavo.fridrich@molinosagro.com.ar;guido.gallo@mocommodities.com; GrupoPeritosDeEmbarque@molinosagro.com.ar;Antonela.Labonia@molinosagro.com.ar; Ariel.Lascano@molinosagro.com.ar;macarena.asqueri@molinosagro.com.ar;paulino.martinez@Molinosagro.com.ar;omar.mazany@molinosagro.com.ar; ariel.pedrozo@molinosagro.com.ar;liz.pereira@molinosagro.com.ar; pablo.piras@mocommodities.com;jimena.rodriguez@molinosagro.com.ar; federico.romano@molinosagro.com.ar;SupervisoresPuertosanLorenzo@molinosagro.com.ar; joaquin.sarachaga@mocommodities.com;Grupo-Turnosyfinalizacindeembarques@molinosagro.onmicrosoft.com;paulino.martinez@Molinosagro.com.ar'); END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'PlanillaDeTurnosLiquido') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('PlanillaDeTurnosLiquido','mauro.mir@molinosagro.com.ar; cristian.leonori@molinosagro.com.ar; martin.amado@molinosagro.com.ar;rodolfo.benegas@mocommodities.com; German.Castagnani@molinosagro.com.ar;juan.catala@molinosagro.com.ar; gabriel.conde@mocommodities.com;romina.escudero@molinosagro.com.ar; gustavo.fridrich@molinosagro.com.ar;guido.gallo@mocommodities.com; GrupoPeritosDeEmbarque@molinosagro.com.ar;Antonela.Labonia@molinosagro.com.ar; Ariel.Lascano@molinosagro.com.ar;macarena.asqueri@molinosagro.com.ar;paulino.martinez@Molinosagro.com.ar;omar.mazany@molinosagro.com.ar; ariel.pedrozo@molinosagro.com.ar;liz.pereira@molinosagro.com.ar; pablo.piras@mocommodities.com;jimena.rodriguez@molinosagro.com.ar; federico.romano@molinosagro.com.ar;SupervisoresPuertosanLorenzo@molinosagro.com.ar; joaquin.sarachaga@mocommodities.com;Grupo-Turnosyfinalizacindeembarques@molinosagro.onmicrosoft.com;paulino.martinez@Molinosagro.com.ar'); END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'PlanillaProgramaEmbarque') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('PlanillaProgramaEmbarque', 'supervisorespuertosanlorenzo@molinosagro.com.ar; macarena.asqueri@molinosagro.com.ar; leandro.bolzan@molinosagro.com.ar; romina.escudero@molinosagro.com.ar; gustavo.fridrich@molinosagro.com.ar; candela.kremzky@molinosagro.com.ar; antonela.labonia@molinosagro.com.ar; ariel.pedrozo@molinosagro.com.ar; liz.pereira@molinosagro.com.ar; federico.romano@molinosagro.com.ar'); END
GO
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'PlanillaProgramaEmbarqueCopia') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('PlanillaProgramaEmbarqueCopia', 'scatoprodMOA@molinosagro.com.ar'); END
GO
IF NOT EXISTs (select 1 from ConfiguracionMail where TemplateMail = 'NominacionesExcel') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('NominacionesExcel', 'macarena.asqueri@molinosagro.com.ar; gustavo.fridrich@molinosagro.com.ar; cintia.maltoni@molinosagro.com.ar; alejandra.sarquis@molinosagro.com.ar; hugo.baratto@molinosagro.com.ar; omar.mazany@molinosagro.com.ar; diego.mazettelle@molinosagro.com.ar; mauricio.mezzavilla@molinosagro.com.ar; nestor.kantt@molinosagro.com.ar; pablo.noceda@molinosagro.com.ar; edgardo.ponce@molinosagro.com.ar; sergio.mossin@molinosagro.com.ar; pablo.kieffer@molinosagro.com.ar; mauro.ortega@molinosagro.com.ar; cristian.frank@molinosagro.com.ar; rodrigo.gonzalez@molinosagro.com.ar; adrian.mauri@molinosagro.com.ar; martin.amado@molinosagro.com.ar; federico.romano@molinosagro.com.ar; damian.calvet@molinosagro.com.ar; daniel.santos@molinosagro.com.ar; sebastian.bertazzo@molinosagro.com.ar; ruben.bisson@molinosagro.com.ar; fabricio.herrera@molinosagro.com.ar; sebastian.muniz@molinosagro.com.ar; marcelo.gustavo.lopez@molinosagro.com.ar; jose.luis.gomez@molinosagro.com.ar; cristian.leonori@molinosagro.com.ar; nestor.sosaguerci@Molinosagro.com.ar; norberto.moriconi@molinosagro.com.ar; sebastian.bolger@molinosagro.com.ar; matias.abramor@molinosagro.com.ar; martin.manoni@molinosagro.com.ar; mauro.mir@molinosagro.com.ar; leandro.armendari@molinosagro.com.ar; lucioano.arario@molinosagro.com.ar; Antonela.Labonia@molinosagro.com.ar; ariel.pedrozo@molinosagro.com.ar; melina.corio@mocommodities.com; ileana.rodriguez@mocommodities.com; rosario.viana@mocommodities.com; liz.pereira@molinosagro.com.ar; Trading@mocommodities.com; leandro.varela@molinosagro.com.ar; german.turcutto@molinosagro.com.ar; GrupoPeritosDeEmbarque@molinosagro.com.ar; Ariel.Lascano@molinosagro.com.ar; joaquin.sarachaga@mocommodities.com; German.Castagnani@molinosagro.com.ar; jimena.rodriguez@molinosagro.com.ar; emanuel.venica@molinosagro.com.ar; Candela.Kremzky@molinosagro.com.ar; juan.lapissonde@molinosagro.com.ar; hernan.ferreira@mocommodities.com') END
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
                    values ('Aceite de soja refinado', 'RSBO'         ,''       ,null      ,0        ,'#AB3C05','RSBO')
END
GO
IF NOT EXISTS (select 1 from MaterialPuerto where Descripcion = 'Aceite de girasol refinado')
BEGIN 
insert into MaterialPuerto (Descripcion        , DescripcionCorta,CodigoSap,Almacen_Id,EsLiquido,Color    ,DescripcionCortaIngles) 
                    values ('Aceite de girasol refinado', 'RSFO'         ,''       ,null      ,0        ,'#CDAD0D','RSFO')
END
GO
IF NOT EXISTS (select 1 from MaterialPuerto where CodigoSap = '99056') 
BEGIN
    insert into MaterialPuerto(Descripcion, DescripcionCorta, CodigoSap, EsLiquido, Color) 
    values ('LECITINA DE SOJA','LEC','99056', 0, '#FFFFFF') 
END
GO
IF NOT EXISTS (select 1 from MaterialPuerto where CodigoSap = '98855') 
BEGIN
    insert into MaterialPuerto(Descripcion, DescripcionCorta, CodigoSap, EsLiquido, Color) 
    values ('ACEITE DE SOJA NEUTRALIZADO','SBO NEU','98855', 1, '#FFFFFF')
END
GO

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

END


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
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'FUGRAN BAHIA BLANCA') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('FUGRAN BAHIA BLANCA','bblanca@fugran.com') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'PROFUM') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('PROFUM','fumigaciones@profum.com.ar; sanlorenzo@profum.com.ar') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'AGROFUM') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('AGROFUM','agrofum@agrofum.com') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'PEST CONTROL') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('PEST CONTROL','administracion@pestcontrolarg.com.ar; comercial@pestcontrolarg.com.ar') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'ECOTEC') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('ECOTEC','opsar@ecotecfumigation.com; argentina@ecotecfumigation.com') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'Tecnophos Services S.A.') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('Tecnophos Services S.A.','info@tecnophos.com.ar') end
if not exists(select 1 from CompaniaDeFumigacion where Descripcion = 'ADC S.R.L.') begin insert into CompaniaDeFumigacion (Descripcion,Mail) values ('ADC S.R.L.','info@adc.com.ar') end

--Scripts TipoContrato
if not exists(select 1 from TipoDeContrato where Descripcion = 'FOB') begin insert into TipoDeContrato (Descripcion) values ('FOB') end
if not exists(select 1 from TipoDeContrato where Descripcion = 'CIF') begin insert into TipoDeContrato (Descripcion) values ('CIF') end

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
if not exists (select 1 from Pais where Descripcion = 'Georgia') begin insert into Pais (Descripcion) values ('Georgia'); end
if not exists (select 1 from Pais where Descripcion = 'Liberia') begin insert into Pais (Descripcion) values ('Liberia'); end

-- Nuevos Coordinadores
if not exists (select 1 from CoordinadorPuerto where Nombre = 'Agrocorp') begin insert into CoordinadorPuerto (Nombre) values ('Agrocorp'); end
if not exists (select 1 from CoordinadorPuerto where Nombre = 'Invictus') begin insert into CoordinadorPuerto (Nombre) values ('Invictus'); end
if not exists (select 1 from CoordinadorPuerto where Nombre = 'The Andersons') begin insert into CoordinadorPuerto (Nombre) values ('The Andersons'); end
if not exists (select 1 from CoordinadorPuerto where Nombre = 'Panocean') begin insert into CoordinadorPuerto (Nombre) values ('Panocean'); end
if not exists (select 1 from CoordinadorPuerto where Nombre = 'Sierentz') begin insert into CoordinadorPuerto (Nombre) values ('Sierentz'); end