CREATE TABLE [dbo].[TipoLineaEmbarque] (
    [Id]           INT           IDENTITY (1, 1) NOT NULL,
    [Linea]        NVARCHAR (40) NOT NULL,

    CONSTRAINT [PK_dbo.TipoLineaEmbarque] PRIMARY KEY CLUSTERED ([Id] ASC)
);

