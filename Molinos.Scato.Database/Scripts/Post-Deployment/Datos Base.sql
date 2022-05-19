

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


--Estados del buque
IF NOT EXISTS (select 1 from ConfiguracionMail where TemplateMail = 'PlanillaDeTurnos') BEGIN insert into ConfiguracionMail(TemplateMail, Direcciones) values ('PlanillaDeTurnos','SupervisoresPuertosanLorenzo@molinosagro.com.ar;sebastian.bolger@molinosagro.com.ar,fabricio.herrera@molinosagro.com.ar;jose.luis.gomez@molinosagro.com.ar;marcelo.gustavo.lopez@molinosagro.com.ar;sebastian.muniz@molinosagro.com.ar;german.turcutto@molinosagro.com.ar;Pablo.Yturres@molinosagro.com.ar;mauro.mir@molinosagro.com.ar;nestor.abalos@molinosagro.com.ar'); END
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