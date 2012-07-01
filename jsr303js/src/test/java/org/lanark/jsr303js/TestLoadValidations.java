package org.lanark.jsr303js;

import org.junit.BeforeClass;
import org.junit.Test;

import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import javax.validation.constraints.AssertFalse;
import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.DecimalMax;
import javax.validation.metadata.BeanDescriptor;
import javax.validation.metadata.ConstraintDescriptor;
import javax.validation.metadata.PropertyDescriptor;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.lang.annotation.Annotation;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.*;

/**
 * @version $Id$
 */
public class TestLoadValidations {

  private static Validator validator;
  
  @BeforeClass
   public static void setUp() {
     ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
     validator = factory.getValidator();
   }

  @Test
  public void testLoadValidations() {
    ValidationTestBean testModelBean = new ValidationTestBean();

    BeanDescriptor beanDescriptor = validator.getConstraintsForClass(testModelBean.getClass());

    assertTrue(beanDescriptor.isBeanConstrained());

    Set<PropertyDescriptor> constrainedProperties = beanDescriptor.getConstrainedProperties();

    assertTrue(!constrainedProperties.isEmpty());

    for (PropertyDescriptor constrainedProperty : constrainedProperties) {
      Set<ConstraintDescriptor<?>> constraintDescriptors = constrainedProperty.getConstraintDescriptors();
      String propertyName = constrainedProperty.getPropertyName();

      for (ConstraintDescriptor constraintDescriptor : constraintDescriptors) {
        Annotation annotation = constraintDescriptor.getAnnotation();
        Map<String, Object> attributes = constraintDescriptor.getAttributes();

        String annotationInfo = annotationInfo(annotation, attributes);

        System.err.println(propertyName + " " + annotationInfo);
      }
    }

  }

  @Test
  public void testTranslate() {
    ValidationTestBean testModelBean = new ValidationTestBean();

    ValidationMetaDataParser parser = new ValidationMetaDataParser();
    ValidationJavaScriptGenerator generator = new ValidationJavaScriptGenerator();

    List<ValidationMetaData> rules = parser.parseMetaData(testModelBean.getClass(), validator);

    assertTrue(!rules.isEmpty());

    Writer writer = new StringWriter();
    try {
      generator.generateJavaScript(writer, "field", true, "", rules, null);

      System.err.println(writer.toString());
      
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  public String annotationInfo(Annotation annotation, Map<String, Object> attributes) {
    StringBuilder sb = new StringBuilder();
    if (annotation instanceof AssertFalse) {
      sb.append("@AssertFalse");
    } else if (annotation instanceof AssertTrue) {
      sb.append("@AssertTrue");
    } else if (annotation instanceof DecimalMax) {
      sb.append("@DecimalMax(\"");
      sb.append(attributes.get("value"));
      sb.append("\")");
    } else {
      sb.append("unknown");
    }
    return sb.toString();
  }
}
