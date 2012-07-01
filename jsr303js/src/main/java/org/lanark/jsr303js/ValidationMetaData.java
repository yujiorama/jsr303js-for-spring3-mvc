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
import java.util.Map;

/**
 * The data needed to generate the JavaScript validation code.
 * The field name will be used to find the corresponding form
 * input value. The short class name of the Annotation will be
 * used as the name of the validation function to invoke. The
 * attributes map will be converted to a JSON object that will
 * be passed as an argument to the validation function.
 *
 * @author sdouglass
 * @version $Id$
 */
public class ValidationMetaData {

  private String field;

  private Annotation constraint;

  private Map<String, Object> attributes;

/*
  private String errorKey;

  private List<String> errorArgs;

  private String errorMessage;
*/

  public ValidationMetaData(String field, Annotation constraint, Map<String, Object> attributes) {
    this.field = field;
    this.constraint = constraint;
    this.attributes = attributes;
  }

  public String getField() {
    return field;
  }

  public Annotation getConstraint() {
    return constraint;
  }

  public Map<String, Object> getAttributes() {
    return attributes;
  }

/*
  public String getErrorKey() {
    return errorKey;
  }

  public List<String> getErrorArgs() {
    return errorArgs;
  }

  public String getErrorMessage() {
    return errorMessage;
  }
*/
}
