create table Nominacion(
Id int,
EnviadoFumigador datetime NULL ,
EnviadoSurveyor datetime NULL ,
FechaCreacion datetime NULL ,
FechaEnvioLineUp datetime NULL, 
FechaEliminacion datetime NULL, 
Embarque_Id int null,
CONSTRAINT [PK_dbo.Nominacion] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.Nominacion_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
)
