create table Nominacion(
Id int,
NominacionDatoTecnico_Id  int IDENTITY (1, 1) NOT NULL,
NominacionRecibo_Id int null,
NominacionDetalleIntervencion_Id int null,
EnviadoFumigador datetime null,
EnviadoSurveyor datetime null,
FechaCreacion datetime ,
FechaEnvioLineUp datetime, 
FechaEliminacion datetime, 
Embarque_Id int null,
CONSTRAINT [PK_dbo.Nominacion] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.Nominacion_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
CONSTRAINT [FK_dbo.Nominacion_dbo.Embarque_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
CONSTRAINT [FK_dbo.Nominacion_dbo.Embarque_NominacionRecibo_Id] FOREIGN KEY ([NominacionRecibo_Id]) REFERENCES [dbo].[NominacionRecibo] ([Id]),
CONSTRAINT [FK_dbo.Nominacion_dbo.Embarque_NominacionDetalleIntervencion_Id] FOREIGN KEY ([NominacionDetalleIntervencion_Id]) REFERENCES [dbo].[NominacionDetalleIntervencion] ([Id]),


)
