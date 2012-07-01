/*
 * Copyright 2002-2005 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.lanark.jsr303js;

import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.validation.Validator;
import javax.validation.metadata.BeanDescriptor;
import javax.validation.metadata.ConstraintDescriptor;
import javax.validation.metadata.PropertyDescriptor;

/**
 * Given a Class and a Validator parses out the validation related meta data for
 * the class, specifically a list of fields with validation Annotations on them,
 * the Annotations applied to the fields, and the attributes of the Annotations.
 * 
 * @author sam
 * @version $Id$
 */
public class ValidationMetaDataParser {

	public List<ValidationMetaData> parseMetaData(Class<?> clazz,
			Validator validator) {

		BeanDescriptor beanDescriptor = validator.getConstraintsForClass(clazz);

		if (!beanDescriptor.isBeanConstrained()) {
			throw new RuntimeException(
					"Class for command object does not have any validation constraints");
		}

		List<ValidationMetaData> rules = parseBeanDescriptor(clazz, validator,
				beanDescriptor, "");
		return rules;
	}

	/**
	 * @param clazz
	 *            TODO
	 * @param validator
	 *            TODO
	 * @param beanDescriptor
	 * @param parentFieldName
	 *            TODO
	 */
	private List<ValidationMetaData> parseBeanDescriptor(Class<?> clazz,
			Validator validator, BeanDescriptor beanDescriptor,
			String parentFieldName) {
		List<ValidationMetaData> rules = new ArrayList<ValidationMetaData>();
		Set<PropertyDescriptor> constrainedProperties = beanDescriptor
				.getConstrainedProperties();

		for (PropertyDescriptor constrainedProperty : constrainedProperties) {
			List<ValidationMetaData> parsePropertyDescriptor;
			try {
				parsePropertyDescriptor = parsePropertyDescriptor(clazz,
						validator, constrainedProperty, parentFieldName);
				rules.addAll(parsePropertyDescriptor);
			} catch (NoSuchFieldException e) {
				e.printStackTrace();
			}
		}

		return rules;
	}

	/**
	 * @param clazz
	 *            TODO
	 * @param validator
	 *            TODO
	 * @param constrainedProperty
	 * @param parentFieldName
	 *            TODO
	 * @throws SecurityException 
	 * @throws NoSuchFieldException 
	 * @throws Exception
	 */
	private List<ValidationMetaData> parsePropertyDescriptor(Class<?> clazz,
			Validator validator, PropertyDescriptor constrainedProperty,
			String parentFieldName) throws NoSuchFieldException, SecurityException {
		Set<ConstraintDescriptor<?>> constraintDescriptors = constrainedProperty
				.getConstraintDescriptors();
		String propertyName = constrainedProperty.getPropertyName();

		if (constrainedProperty.isCascaded()) {
			Field cascadeField = clazz.getDeclaredField(propertyName);
			BeanDescriptor beanDescriptor = validator
					.getConstraintsForClass(cascadeField.getType());
			return parseBeanDescriptor(cascadeField.getType(),
					validator, beanDescriptor, propertyName);
		}

		if (!"".equals(parentFieldName)) {
			propertyName = parentFieldName + "." + propertyName;
		}
		return parseConstraintDescriptor(constraintDescriptors, propertyName);
	}

	/**
	 * @param constraintDescriptors
	 * @param propertyName
	 */
	private List<ValidationMetaData> parseConstraintDescriptor(
			Set<ConstraintDescriptor<?>> constraintDescriptors,
			String propertyName) {
		List<ValidationMetaData> rules = new ArrayList<ValidationMetaData>();
		for (ConstraintDescriptor<?> constraintDescriptor : constraintDescriptors) {
			Annotation annotation = constraintDescriptor.getAnnotation();
			Map<String, Object> attributes = constraintDescriptor
					.getAttributes();

			ValidationMetaData rule = new ValidationMetaData(propertyName,
					annotation, attributes);

			rules.add(rule);
		}

		return rules;
	}

}
