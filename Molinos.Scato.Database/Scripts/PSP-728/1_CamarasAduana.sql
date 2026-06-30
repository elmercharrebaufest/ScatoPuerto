-- PSP-728: Crear tabla CamarasAduana e insertar cámaras del módulo Aduana

CREATE TABLE [dbo].[CamarasAduana] (
    [Id]       INT            IDENTITY (1, 1) NOT NULL,
    [Nombre]   NVARCHAR (100) NOT NULL,
    [Url]      NVARCHAR (200) NOT NULL,
    [Posicion] INT            NOT NULL,
    CONSTRAINT [PK_dbo.CamarasAduana] PRIMARY KEY CLUSTERED ([Id] ASC)
);
GO