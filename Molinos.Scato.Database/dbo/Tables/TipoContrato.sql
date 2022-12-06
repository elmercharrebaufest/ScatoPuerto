create table TipoContrato(
Id int IDENTITY (1, 1) NOT NULL,
Descripcion varchar(250) NOT NULL,
CONSTRAINT [PK_dbo.TipoContrato] PRIMARY KEY CLUSTERED ([Id] ASC),
)