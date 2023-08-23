create table Surveyor(
Id int IDENTITY (1, 1) NOT NULL,
Descripcion varchar(250) NOT NULL,
Mail varchar(500),
CONSTRAINT [PK_dbo.Surveyor] PRIMARY KEY CLUSTERED ([Id] ASC),
)