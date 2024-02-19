using Molinos.Scato.Utils;
using NUnit.Framework;

namespace Molinos.Scato.Test.Utils
{
	[TestFixture]
	public class JsonConverterTests
	{
		[Test]
		public void Serialize_ObjectToJsonString_ReturnsValidJson()
		{
			// Arrange
			var person = new Person { Name = "John Doe", Age = 30 };
			var expectedJsonSubstring = "\"Name\":\"John Doe\",\"Age\":30";

			// Act
			var jsonString = JsonConverter<Person>.Serialize(person);

			// Assert
			StringAssert.Contains(expectedJsonSubstring, jsonString);
		}

		[Test]
		public void Serialize_NullObject_ReturnsNullJson()
		{
			// Arrange
			Person person = null;

			// Act
			var jsonString = JsonConverter<Person>.Serialize(person);

			// Assert
			Assert.That(jsonString, Is.EqualTo("null"));
		}

		[Test]
		public void Deserialize_ValidJsonString_ReturnsObject()
		{
			// Arrange
			var jsonString = "{\"Name\":\"John Doe\",\"Age\":30}";
			var expectedName = "John Doe";
			var expectedAge = 30;

			// Act
			var person = JsonConverter<Person>.Deserialize(jsonString);

			// Assert
			Assert.NotNull(person);
			Assert.That(person.Name, Is.EqualTo(expectedName));
			Assert.That(person.Age, Is.EqualTo(expectedAge));
		}

		[Test]
		public void Deserialize_NullOrEmptyString_ReturnsDefault()
		{
			// Arrange
			var jsonString = "null";

			// Act
			var result = JsonConverter<Person>.Deserialize(jsonString);

			// Assert
			Assert.That(result, Is.EqualTo(default(Person)));

			// Testing with empty string
			jsonString = string.Empty;
			result = JsonConverter<Person>.Deserialize(jsonString);

			// Since JsonConvert.DeserializeObject returns null for empty string,
			// the assertion should be the same as for "null" jsonString.
			Assert.That(result, Is.EqualTo(default(Person)));
		}
	}
}
