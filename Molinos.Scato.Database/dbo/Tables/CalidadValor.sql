create table CalidadValor(
Id int IDENTITY (1, 1) NOT NULL,	
Valor varchar(250) not null,
TipoDeCalidad_Id int not null,
Parametro varchar(250) not null,
CONSTRAINT [PK_dbo.CalidadValor] PRIMARY KEY CLUSTERED ([Id] ASC),
CONSTRAINT [FK_dbo.CalidadValor_dbo.CalidadValor_TipoDeCalidad_Id] FOREIGN KEY ([TipoDeCalidad_Id]) REFERENCES [dbo].[TipoDeCalidad] ([Id]),
)
