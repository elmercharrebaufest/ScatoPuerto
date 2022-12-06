create table NominacionDatoTecnicoExportador(
Id int IDENTITY (1, 1) NOT NULL,
Exportador_Id int not null,
Cantidad int,
NominacionDatoTecnico_Id  int not null,
CONSTRAINT [PK_dbo.NominacionDatoTecnicoExportador] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoExportador_dbo.Exportador_Exportador_Id] FOREIGN KEY ([Exportador_Id]) REFERENCES [dbo].[Exportador] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoExportador_dbo.NominacionDatoTecnico_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
)
