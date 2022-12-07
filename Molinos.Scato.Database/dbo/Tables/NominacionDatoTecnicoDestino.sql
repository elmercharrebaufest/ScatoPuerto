create table NominacionDatoTecnicoDestino(
Id int  IDENTITY (1, 1) NOT NULL,
Destino_Id int  not null,
Cantidad int ,
NominacionDatoTecnico_Id int not null,
CONSTRAINT [PK_dbo.NominacionDatoTecnicoDestino] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoDestino_dbo.Destino_Destino_Id] FOREIGN KEY ([Destino_Id]) REFERENCES [dbo].[Destino] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoDestino_dbo.NominacionDatoTecnico_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
)

