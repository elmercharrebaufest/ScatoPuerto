create table TipoDeContrato(
Id int IDENTITY (1, 1) NOT NULL,
Descripcion varchar(250) NOT NULL,
CONSTRAINT [PK_dbo.TipoDeContrato] PRIMARY KEY CLUSTERED ([Id] ASC),
)