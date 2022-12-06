create table TasaDeCarga(
Id int IDENTITY (1, 1) NOT NULL,
Descripcion varchar(250) NOT NULL,
CONSTRAINT [PK_dbo.TasaDeCarga] PRIMARY KEY CLUSTERED ([Id] ASC),
)