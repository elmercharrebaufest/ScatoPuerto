CREATE TABLE [dbo].[TipoContratoTarifa]
(
Id int IDENTITY (1, 1) NOT NULL,
Descripcion varchar(250) NOT NULL,
CONSTRAINT [PK_dbo.TipoContratoTarifa] PRIMARY KEY CLUSTERED ([Id] ASC),
)
