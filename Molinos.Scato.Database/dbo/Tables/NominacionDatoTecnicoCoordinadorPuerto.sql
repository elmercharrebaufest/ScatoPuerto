create table NominacionDatoTecnicoCoordinadorPuerto(
Id int not null,
CoordinadorPuerto_Id int not null,
Cantidad int ,
NominacionDatoTecnico_Id int not null,
CONSTRAINT [PK_dbo.NominacionDatoTecnicoCoordinadorPuerto] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoCoordinadorPuerto_dbo.NominacionDatoTecnico_NominacionDatoTecnico_Id] FOREIGN KEY ([NominacionDatoTecnico_Id]) REFERENCES [dbo].[NominacionDatoTecnico] ([Id]),
CONSTRAINT [FK_dbo.NominacionDatoTecnicoCoordinadorPuerto_dbo.CoordinadorPuerto_CoordinadorPuerto_Id] FOREIGN KEY ([CoordinadorPuerto_Id]) REFERENCES [dbo].[CoordinadorPuerto] ([Id]),

)