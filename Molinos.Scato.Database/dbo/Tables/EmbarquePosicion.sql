CREATE TABLE [dbo].[EmbarquePosicion]
(
    [Id]                  INT IDENTITY (1, 1) NOT NULL,
	[Embarque_Id]         INT                 NOT NULL,
    [HoraUTCPosicionRecibida]    datetime     NOT NULL,
    [HoraLocalBarco]      datetime            NOT NULL,
    [Area]                NVARCHAR (40)       NULL,
    [PuertoActual]        NVARCHAR (50)       NULL,
    [Latitud]             NVARCHAR (50)       NULL,
	[Longitud]            NVARCHAR (50)       NULL,
    [Estado]              NVARCHAR (100)      NULL,
	[VelocidadCurso]      NVARCHAR (50)       NULL,
    [FechaRegistro] datetime            NULL,
    CONSTRAINT [FK_dbo.EmbarquePosicion_dbo.Embarque_Embarque_Id] FOREIGN KEY ([Embarque_Id]) REFERENCES [dbo].[Embarque] ([Id]),
    CONSTRAINT [PK_dbo.EmbarquePosicion] PRIMARY KEY ([Id] ASC)
)
