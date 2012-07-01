package org.lanark.jsr303js;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.junit.matchers.JUnitMatchers.hasItems;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import javax.validation.metadata.BeanDescriptor;
import javax.validation.metadata.PropertyDescriptor;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.internal.matchers.TypeSafeMatcher;

public class NestedObjectTest {

	private static Validator validator;

	@BeforeClass
	public static void setUp() {
		ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
		validator = factory.getValidator();
	}

	@Test
	public void Descriptorから辿れる情報を確認() throws Exception {
		ValidationTestBean testModelBean = new ValidationTestBean();
		BeanDescriptor beanDescriptor = validator
				.getConstraintsForClass(testModelBean.getClass());
		assertThat(beanDescriptor, is(notNullValue()));
		Set<PropertyDescriptor> constrainedProperties = beanDescriptor
				.getConstrainedProperties();
		assertThat(constrainedProperties, is(notNullValue()));
		for (PropertyDescriptor propertyDescriptor : constrainedProperties) {
			if (propertyDescriptor.isCascaded()) {
				assertThat(propertyDescriptor.getPropertyName(),
						propertyDescriptor.hasConstraints(), is(false));
				Field declaredField = testModelBean.getClass()
						.getDeclaredField(propertyDescriptor.getPropertyName());
				assertThat(declaredField, is(notNullValue()));
				assertThat(TestBean.class.getSimpleName(), is(declaredField
						.getType().getSimpleName()));
			} else {
				assertThat(propertyDescriptor.getPropertyName(),
						propertyDescriptor.hasConstraints(), is(true));
			}
		}
	}

	@Test
	public void ネストしたオブジェクトのフィールド名がピリオド区切りで取得できる() throws Exception {
		ValidationTestBean testModelBean = new ValidationTestBean();
		ValidationMetaDataParser parser = new ValidationMetaDataParser();
		List<ValidationMetaData> rules = parser.parseMetaData(
				testModelBean.getClass(), validator);

		assertTrue(!rules.isEmpty());

		Field declaredField = ValidationTestBean.class
				.getDeclaredField("nestedField");
		assertThat(declaredField.getName(), is("nestedField"));
		assertThat(rules, hasNestedProperty("nestedField"));
	}

	public static Matcher<Iterable<ValidationMetaData>> hasNestedProperty(
			String rootName) {
		return new ValidationMetaDataPropertyNameMatcher(rootName);
	}

	public static class ValidationMetaDataPropertyNameMatcher extends
			TypeSafeMatcher<Iterable<ValidationMetaData>> {
		private final String rootName;
		private List<String> collect = new ArrayList<String>();

		public ValidationMetaDataPropertyNameMatcher(String rootName) {
			this.rootName = rootName;
		}

		public void describeTo(Description description) {
			description
					.appendText("must contains nested property, start with ["
							+ rootName + "]");
		}

		@Override
		public boolean matchesSafely(Iterable<ValidationMetaData> item) {
			Iterator<ValidationMetaData> it = item.iterator();
			while (it.hasNext()) {
				ValidationMetaData a = it.next();
				if (a.getField().startsWith(rootName + ".")) {
					collect.add(rootName + "." + a.getField());
				}
			}

			return ! collect.isEmpty();
		}
	}
}
