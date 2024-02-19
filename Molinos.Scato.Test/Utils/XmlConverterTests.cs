using Molinos.Scato.Utils;
using NUnit.Framework;

namespace Molinos.Scato.Test.Utils
{
	[TestFixture]
	public class XmlConverterTests
	{
		[Test]
		public void Serialize_ObjectToXmlString_ReturnsValidXml()
		{
			// Arrange
			var person = new Person { Name = "John Doe", Age = 30 };
			var expectedXmlContains = "<Name>John Doe</Name>\r\n  <Age>30</Age>";

			// Act
			var xml = XmlConverter<Person>.Serialize(person);

			// Assert
			StringAssert.Contains(expectedXmlContains, xml);
		}

		[Test]
		public void Serialize_NullObject_ReturnsEmptyString()
		{
			// Arrange
			Person person = null;

			// Act
			var xml = XmlConverter<Person>.Serialize(person);

			// Assert
			Assert.That(xml, Is.EqualTo(string.Empty));
		}

		[Test]
		public void Deserialize_ValidXmlString_ReturnsObject()
		{
			// Arrange
			var xmlString = @"<?xml version=""1.0""?><Person xmlns:xsi=""http://www.w3.org/2001/XMLSchema-instance"" xmlns:xsd=""http://www.w3.org/2001/XMLSchema""><Name>John Doe</Name><Age>30</Age></Person>";
			var expectedName = "John Doe";
			var expectedAge = 30;

			// Act
			var person = XmlConverter<Person>.Deserialize(xmlString);

			// Assert
			Assert.NotNull(person);
			Assert.That(person.Name, Is.EqualTo(expectedName));
			Assert.That(person.Age, Is.EqualTo(expectedAge));
		}

		[Test]
		public void Deserialize_EmptyString_ReturnsDefault()
		{
			// Arrange
			var xmlString = string.Empty;

			// Act
			var result = XmlConverter<Person>.Deserialize(xmlString);

			// Assert
			Assert.That(result, Is.EqualTo(default(Person)));
		}
	}

	// Clase de prueba simple
	public class Person
	{
		public string Name { get; set; }
		public int Age { get; set; }
	}
}
