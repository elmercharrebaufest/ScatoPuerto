create table TipoDeFumigacion(
Id int IDENTITY (1, 1) NOT NULL,
Descripcion varchar(250) NOT NULL,
CONSTRAINT [PK_dbo.TipoDeFumigacion] PRIMARY KEY CLUSTERED ([Id] ASC),
)