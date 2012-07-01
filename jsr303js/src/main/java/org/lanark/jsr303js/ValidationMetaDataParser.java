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

import javax.validation.Validator;
import javax.validation.metadata.BeanDescriptor;
import javax.validation.metadata.ConstraintDescriptor;
import javax.validation.metadata.PropertyDescriptor;
import java.lang.annotation.Annotation;
import java.util.*;

/**
 * Given a Class and a Validator parses out the validation related meta data
 * for the class, specifically a list of fields with validation Annotations
 * on them, the Annotations applied to the fields, and the attributes of the
 * Annotations.
 *
 * @author sam
 * @version $Id$
 */
public class ValidationMetaDataParser {

  public List<ValidationMetaData> parseMetaData(Class clazz, Validator validator) {
    List<ValidationMetaData> rules = new ArrayList<ValidationMetaData>();

    BeanDescriptor beanDescriptor = validator.getConstraintsForClass(clazz);

    if (!beanDescriptor.isBeanConstrained()) {
      throw new RuntimeException("Class for command object does not have any validation constraints");
    }

    Set<PropertyDescriptor> constrainedProperties = beanDescriptor.getConstrainedProperties();

    for (PropertyDescriptor constrainedProperty : constrainedProperties) {
      Set<ConstraintDescriptor<?>> constraintDescriptors = constrainedProperty.getConstraintDescriptors();
      String propertyName = constrainedProperty.getPropertyName();

      for (ConstraintDescriptor constraintDescriptor : constraintDescriptors) {
        Annotation annotation = constraintDescriptor.getAnnotation();
        Map<String, Object> attributes = constraintDescriptor.getAttributes();

        ValidationMetaData rule = new ValidationMetaData(propertyName, annotation, attributes);

        rules.add(rule);
      }
    }

      return rules;    
  }


}
