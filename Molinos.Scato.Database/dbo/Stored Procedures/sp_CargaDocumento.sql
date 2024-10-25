CREATE PROCEDURE [dbo].[sp_CargaDocumento]   
AS 
SET NOCOUNT ON 

declare @tbl_documentos table( 
	Id int,
	Documento varchar(500),
	Documento_Id int
)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(1,'Aflatoxin cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(2,'B/L',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(3,'Cargo Manifest',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(4,'Conformity certificate',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(5,'Declaration Statement from shipper',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(6,'Draft Survey',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(7,'Export Certificate for Plant Processed Products ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(8,'Export declaration',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(9,'Free Sale ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(10,'Fumigation',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(11,'GMO certificate (surveyor) ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(12,'GMO Official',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(13,'GMP +',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(14,'Health',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(15,'Hold Cleanliness',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(16,'Hold Inspection',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(17,'Hold Sealing',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(18,'Human Consumption',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(19,'ISCC EU',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(20,'ISCC EU cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(21,'Isotopic analysis cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(22,'Labelling statement from shipper',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(23,'M/R',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(24,'Melamine Free Certificate',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(25,'MSDS',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(26,'Non Radiation cert',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(27,'Origin',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(28,'OrigIn SACU',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(29,'Packing List',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(30,'Phyto',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(31,'PNF',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(32,'PoS',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(33,'Producer declaration',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(34,'Quality',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(35,'Quality / Condition',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(36,'Quantity',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(37,'Readiness',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(38,'Safety certificate ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(39,'Sanitary',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(40,'Sanitary certificate including Annex note ',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(41,'Tank Cleanliness',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(42,'Veterinary',0)
insert into @tbl_documentos(Id, Documento, Documento_Id)values(43,'Weight ',0)
  
   insert into Documento(DocumentoTipo_Id, Nombre)
   select (select top 1 Id from DocumentoTipo where Nombre = 'A solicitar en la nominación'), 
          Documento 
     from @tbl_documentos doc 
    where not exists(select 1 from Documento where Nombre = doc.Documento)
	
	
      update doc_temp
         set doc_temp.Documento_Id = doc.Id 
        from @tbl_documentos doc_temp 
  inner join Documento doc on doc.Nombre = doc_temp.Documento

SET NOCOUNT OFF
RETURN 0
