create table Nominacion(
Id int  IDENTITY (1, 1) NOT NULL,
NominacionDatoTecnico_Id  int NULL,
NominacionDetalleIntervencion_Id int NULL,
EnviadoFumigador bit NULL ,
EnviadoSurveyor bit NULL ,
EnviadoOtros  bit NULL ,
FechaCreacion datetime NOT NULL ,
FechaEnvioLineUp datetime NULL, 
FechaEliminacion datetime NULL, 
Embarque_Id int null,
CONSTRAINT [PK_dbo.Nominacion] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.Nominacion_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
CONSTRAINT [FK_dbo.Nominacion_dbo.NominacionDatoTecnico_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
CONSTRAINT [FK_dbo.Nominacion_dbo.NominacionDetalleIntervencion_NominacionDetalleIntervencion_Id] FOREIGN KEY ([NominacionDetalleIntervencion_Id]) REFERENCES [dbo].[NominacionDetalleIntervencion] ([Id]),

)
