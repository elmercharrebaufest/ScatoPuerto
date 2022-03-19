CREATE TABLE [dbo].[EmbarquePosicionHistorico]
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
    CONSTRAINT [PK_dbo.EmbarquePosicionHistorico] PRIMARY KEY ([Id] ASC)
)
