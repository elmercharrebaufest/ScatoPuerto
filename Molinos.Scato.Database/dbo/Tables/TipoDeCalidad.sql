create table TipoDeCalidad(
Id int not null,
Descripcion varchar(250) not null,
MaterialPuerto_Id  int not null,
CONSTRAINT [PK_dbo.TipoDeCalidad] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.TipoDeCalidad_dbo.MaterialPuerto_MaterialPuerto_Id] FOREIGN KEY ([MaterialPuerto_Id]) REFERENCES [dbo].[MaterialPuerto] ([Id]),
)
