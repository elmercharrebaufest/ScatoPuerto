create table Nominacion(
Id int,
EnviadoFumigador datetime null,
EnviadoSurveyor datetime null,
FechaCreacion datetime ,
FechaEnvioLineUp datetime, 
FechaEliminacion datetime, 
Embarque_Id int null,
CONSTRAINT [PK_dbo.Nominacion] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.Nominacion_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
)
