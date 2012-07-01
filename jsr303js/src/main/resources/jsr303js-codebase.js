/*
 * Copyright 2004-2005 the original author or authors.
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
 *
 * @author Sam Douglass
 */
var globalErrorsId = (typeof tlGlobalErrorsId != 'undefined') ? tlGlobalErrorsId : 'global_errors';

var fieldErrorIdSuffix = (typeof tlFieldErrorIdSuffix != 'undefined') ? tlFieldErrorIdSuffix : '_error';

if (!Array.prototype.push) {
    // Based on code from http://prototype.conio.net/
    Array.prototype.push = function() {
        var startLength = this.length
        for (var i = 0; i < arguments.length; i++) {
            this[startLength + i] = arguments[i]
        }
        return this.length
    }
}
if (!Function.prototype.apply) {
    // Based on code from http://prototype.conio.net/
    Function.prototype.apply = function(object, parameters) {
        var parameterStrings = new Array()
        if (!object) {
            object = window
        }
        if (!parameters) {
            parameters = new Array()
        }
        for (var i = 0; i < parameters.length; i++) {
            parameterStrings[i] = 'parameters[' + i + ']'
        }
        object.__apply__ = this
        var result = eval('object.__apply__(' + parameterStrings.join(', ') + ')')
        object.__apply__ = null
        return result
    }
}

/*
 * Core validation object.
 */
var JSR303JSValidator = function(name, installSelfWithForm, config, rules) {
    this.name = name;
    this.config = config;
    this.rules = rules;
    this.form = this._findForm(name);
    if (installSelfWithForm) {
        this._installSelfWithForm();
    }
};
JSR303JSValidator.prototype = {
    validate: function() {
        return this._validateAndReturnFailedRules().length > 0
    },
    validateAndShowFeedback: function() {
        var failedRules = this._validateAndReturnFailedRules()
        if (failedRules.length > 0) {
            this.showValidationFeedback(failedRules)
        }
        return failedRules.length === 0
    },
    showValidationFeedback: function(failedRules) {

        // first putting all the validation error in field proprietary error place
        // holders, basically elements with id <filed_name>_error.
        var globalRules = new Array();
        for (var i = 0; i < failedRules.length; i++) {
            var errorBoxId = failedRules[i].field + fieldErrorIdSuffix;
            var errorBox = document.getElementById(errorBoxId);
            if (errorBox != null) {
                errorBox.innerHTML = failedRules[i].getErrorMessage();
            } else {
                globalRules.push(failedRules[i]);
            }
        }

        // all those errors that weren't put in a field proprietary error place holders
        // will be grouped together as global errors, either in a global error place holder
        // (element with id 'global_errors') or will be shown in an alert.
      if (globalRules != null && globalRules.length != 0) {
        var globalErrorsBox = document.getElementById(globalErrorsId);
        if (globalErrorsBox != null) {
            var ul = document.createElement('ul');
            for (var i = 0; i < globalRules.length; i++) {
                var li = document.createElement('li');
                li.innerHTML = globalRules[i].getErrorMessage();
                ul.appendChild(li);
            }
            globalErrorsBox.appendChild(ul);
        } else {
            var errors = ''
            for (var i = 0; i < globalRules.length; i++) {
                errors = errors + globalRules[i].getErrorMessage() + '\n'
            }
            // The following line is sometimes effected by Firefox Bug 236791. Please just ignore
            // the error or tell me how to fix it?
            // https://bugzilla.mozilla.org/show_bug.cgi?id=236791
            alert(errors)
        }
      }

        var fields = this.form.getFieldsWithName(failedRules[0].field)
        if (fields.length > 0) {
            fields[0].activate()
        }
    },
    _findForm: function(name) {
        var element = document.getElementById(name)
        if (!element || element.tagName.toLowerCase() != 'form') {
          element = document.getElementById(name + 'JSR303JSValidator')
          if (!element || element.tagName.toLowerCase() != 'script') {
              throw 'unable to find form with ID \'' + name + '\' or script element with ID \'' + name + 'JSR303JSValidator\''
          }
        }
        var foundElement = element
        while (element && element.tagName.toLowerCase() != 'form') {
            element = element.parentNode
        }
        if (!element) {
            throw 'unable to find FORM element enclosing element with ID \'' + foundElement.id + '\''
        }
        return new JSR303JSValidator.Form(element)
    },
    _installSelfWithForm: function() {
        var oldOnload = window.onload
        var oldOnsubmit = this.form.formElement.onsubmit
        var thisValidator = this
        // delay install until the page is
        // fully loaded so that we can be
        // (fairly) sure of being the last
        // thing that tries to handle the
        // onload event
        window.onload = function() {
            JSR303JSValidator.Logger.log('Installing JSR303JSValidator \'' + thisValidator.name + '\' as onsubmit handler')
            try {
                if (oldOnload) {
                    oldOnload()
                }
            } catch (ex) {
              alert(ex);
            } finally {
                thisValidator.form.formElement.onsubmit = function() {
                    if (!oldOnsubmit || oldOnsubmit()) {
                        return thisValidator.validateAndShowFeedback()
                    }
                }
            }
        }
    },
    _validateAndReturnFailedRules: function() {
        this._clearGlobalErrors();
        JSR303JSValidator.Logger.push('Starting validation')
        var failedRules = new Array()
        for (var i = 0; i < this.rules.length; i++) {
            var rule = this.rules[i]
            this._clearErrorIfExists(rule.field);
            //try {
            JSR303JSValidator.Logger.push('Evaluating rule for field [' + rule.field + ']')
            rule.form = this.form
            if (!rule.validate(this)) {
                JSR303JSValidator.Logger.pop('Failed')
                failedRules.push(rule)
            } else {
                JSR303JSValidator.Logger.pop('Passed')
            }
            //} catch(ex) {
            //    JSR303JSValidator.Logger.pop('Exception evaluating rule [' + ex + ']')
            //}
        }

        JSR303JSValidator.Logger.pop('Finshed - ' + failedRules.length + ' failed rules')
        return this._giveRulesSameOrderAsFormFields(failedRules)
    },
    _clearErrorIfExists: function(field) {
        var errorBox = document.getElementById(field + fieldErrorIdSuffix);
        if (errorBox != null) {
            errorBox.innerHTML = '';
        }
    },
    _clearGlobalErrors: function() {
        var errorBox = document.getElementById(globalErrorsId);
        if (errorBox != null) {
            errorBox.innerHTML = '';
        }
    },
    _giveRulesSameOrderAsFormFields: function(failedRules) {
        var sortedFailedRules = new Array()
        var fields = this.form.getFields()
        for (var i = 0; i < fields.length; i++) {
            var fieldName = fields[i].name
            for (var j = 0; j < failedRules.length; j++) {
                if (failedRules[j] && failedRules[j].field == fieldName) {
                    sortedFailedRules.push(failedRules[j])
                    failedRules[j] = null
                }
            }
        }
        for (var i = 0; i < failedRules.length; i++) {
            if (failedRules[i]) {
                sortedFailedRules.push(failedRules[i])
            }
        }
        return sortedFailedRules
    }
}

/*
 * Simple static logger implementation; by default attempts to log output
 * into a div with ID = 'jsr303jsLogDiv'.
 * If you wish to provide an alternative location for the log output you
 * must override the JSR303JSValidator.Logger.log function.
 */
JSR303JSValidator.Logger = {
    log: function(msg) {
        var logDiv = document.getElementById('jsr303jsLogDiv')
        if (logDiv) {
            var oldHtml = logDiv.innerHTML
            logDiv.innerHTML = this._indentString('&nbsp;') + msg + (oldHtml.length > 0 ? '<br>' + oldHtml : '')
        }
    },
    push: function(msg) {
        this.log(msg)
        this._indent++
    },
    pop: function(msg) {
        this._indent--
        this.log(msg)
    },
    logFunctionCalls: function(object) {
        for (var elementName in object) {
            var theElement = object[elementName]
            if (typeof theElement == 'function') {
                object[elementName] = this._wrapFunctionCallWithLog(elementName, theElement)
            }
        }
    },
    _indent: 0,
    _indentString: function(filler) {
        var result = ''
        for (var i = 0; i < this._indent * 5; i++) {
            result += filler
        }
        return result
    },
    _wrapFunctionCallWithLog: function(functionName, theFunction) {
        return function() {
            JSR303JSValidator.Logger.push('calling ' + functionName + '(' + arguments[0] + ', ' + arguments[1] + ')')
            try {
                var result = theFunction.apply(this, arguments)
            } catch(ex) {
                JSR303JSValidator.Logger.pop('threw ' + ex)
                throw ex
            }
            JSR303JSValidator.Logger.pop('result = ' + result)
            return result
        }
    }
}

/*
 * Encapsulates a HTML form
 *
 * Based on code from http://prototype.conio.net/
 */
JSR303JSValidator.Form = function(formElement) {
    this.formElement = formElement
}
JSR303JSValidator.Form.prototype = {
    getValue: function(fieldName) {
        var fields = this.getFieldsWithName(fieldName)
        var value = new Array()
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].getValue()) {
                value.push(fields[i].getValue())
            }
        }
        if (value.length == 1) {
            return value[0]
        } else if (value.length > 1) {
            return value
        }
    },
    getFieldsWithName: function(fieldName) {
        var matchingFields = new Array()
        var fields = this.getFields()
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i]
            if (field.name == fieldName) {
                matchingFields.push(field)
            }
        }
        return matchingFields
    },
    getFields: function() {
        var fields = new Array()
        var tagElements = this.formElement.elements
        for (var i = 0; i < tagElements.length; i++) {
          if (tagElements[i].tagName.toLowerCase() != 'fieldset') {
            fields.push(new JSR303JSValidator.Field(tagElements[i]))
          }
        }
        return fields
    },
    disable: function() {
        var fields = this.getFields()
        for (var i = 0; i < fields.length; i++) {
            fields[i].disable()
        }
    },
    enable: function() {
        var fields = this.getFields()
        for (var i = 0; i < fields.length; i++) {
            fields[i].enable()
        }
    },
    focusFirstElement: function(form) {
        var fields = this.getFields()
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i]
            if (field.type != 'hidden' && !field.isDisabled()) {
                field.activate()
                break;
            }
        }
    }
}

/*
 * Encapsulates a HTML form field
 *
 * Based on code from http://prototype.conio.net/
 */
JSR303JSValidator.Field = function(fieldElement) {
    this.id = fieldElement.id
    this.name = fieldElement.name
    this.type = fieldElement.type.toLowerCase()
    this.tagName = fieldElement.tagName.toLowerCase()
    this.fieldElement = fieldElement
    if (JSR303JSValidator.Field.ValueGetters[this.tagName]) {
        this.getValue = JSR303JSValidator.Field.ValueGetters[this.tagName]
    } else if (this.tagName == 'input') {
        switch (this.type) {
            case 'submit':
            case 'hidden':
            case 'password':
            case 'text':
                this.getValue = JSR303JSValidator.Field.ValueGetters['textarea']
                break
            case 'checkbox':
            case 'radio':
                this.getValue = JSR303JSValidator.Field.ValueGetters['inputSelector']
                break
            default:
                throw 'unexpected input field type \'' + this.type + '\''
        }
    } else {
        throw 'unexpected form field tag name \'' + this.tagName + '\''
    }
}
JSR303JSValidator.Field.prototype = {
    clear: function() {
        this.fieldElement.value = ''
    },
    focus: function() {
        // The following line is sometimes effected by Firefox Bug 236791. Please just ignore
        // the error or tell me how to fix it?
        // https://bugzilla.mozilla.org/show_bug.cgi?id=236791
        this.fieldElement.focus()
    },
    select: function() {
        if (this.fieldElement.select) {
            this.fieldElement.select()
        }
    },
    activate: function() {
        this.focus()
        this.select()
    },
    isDisabled : function() {
        return element.disabled
    },
    disable: function() {
        element.blur()
        element.disabled = 'true'
    },
    enable: function() {
        element.disabled = ''
    }
}

JSR303JSValidator.Field.ValueGetters = {
    inputSelector: function() {
        if (this.fieldElement.checked) {
            return this.fieldElement.value
        }
    },
    textarea: function() {
        return this.fieldElement.value
    },
    select: function() {
        var value = ''
        if (this.fieldElement.type == 'select-one') {
            var index = this.fieldElement.selectedIndex
            if (index >= 0) {
                value = this.fieldElement.options[index].value
            }
        } else {
            value = new Array()
            for (var i = 0; i < element.length; i++) {
                var option = this.fieldElement.options[i]
                if (option.selected) {
                    value.push(option.value)
                }
            }
        }
        return value
    }
}

/*
 * Represents a single JSR-303 validation constraint and the functions needed
 * to evaluate that constraint.
 */
JSR303JSValidator.Rule = function(field, validationFunction, params) {
    this.field = field
    this.params = params
//    this.errorMessage = errorMessage
    this.validationFunction = validationFunction
}
JSR303JSValidator.Rule.prototype = {
    validate: function(validator) {
      var f = this[this.validationFunction];
      if (!f || typeof f != 'function') {
        return false;
//        this._throwError('invalid validation function: ' + this.validateFunction);
      }
      return f(this.getPropertyValue(this.field), this.params, this.field, validator.config);
    },
    getErrorMessage: function() {
        return (this.params.message || 'Invalid value for ' + this.field);
    },

// Property Accessor
    getPropertyValue: function(propertyName, expectedType) {
        return this.form.getValue(propertyName)
    },

// Assertions
    _assertHasLength: function(value) {
        if (!value.length) {
            throw 'value \'' + value + '\' does not have length'
        }
    },
    _assertLength: function(value, length) {
        this._assertHasLength(value)
        if (value.length != length) {
            throw 'value\'s length != \'' + length + '\''
        }
    },
    _throwError: function(msg) {
        throw msg
    },

// Type safety checks

// This function tries to convert the lhs into a type
// that are compatible with the rhs for the various
// JS compare operations. When there is a choice between
// converting to a string or a number; number is always
// favoured.
    _makeCompatible: function(lhs, rhs) {
        try {
            this._forceNumber(rhs)
            return this._forceNumber(lhs)
        } catch(ex) {
        }
        var lhsType = typeof lhs
        var rhsType = typeof rhs
        if (lhsType == rhsType) {
            return lhs
        } else if (lhsType == 'number' || rhsType == 'number') {
            return this._forceNumber(lhs)
        } else {
            throw 'unable to convert [' + lhs + '] and [' + rhs + '] to compatible types'
        }
    },
    _forceNumber: function(value) {
        if (typeof value != 'number') {
            try {
                var newValue = eval(value.toString())
            } catch(ex) {
            }
            if (newValue && typeof newValue == 'number') {
                return newValue
            }
            throw 'unable to convert value [' + value + '] to number'
        }
        return value
    },
  // JSR-303 validations
  AssertFalse: function(value, params) {
    return (value == 'false');
  },
  AssertTrue: function(value, params) {
    return (value == 'true');
  },
  DecimalMax: function(value, params) {
    var valid = true;
    if (value) {
      var valueNumber = new Number(value).valueOf();
      if (isNaN(valueNumber)) {
        valid = false;
      } else {
        valid = valueNumber <= new Number(params.value).valueOf();
      }
    }
    return valid;
  },
  DecimalMin: function(value, params) {
    var valid = true;
    if (value) {
      var valueNumber = new Number(value).valueOf();
      if (isNaN(valueNumber)) {
        valid = false;
      } else {
        valid = valueNumber >= new Number(params.value).valueOf();
      }
    }
    return valid;
  },
  Digits: function(value, params) {
    var valid = true;
    if (value) {
      var valueNumber = new Number(value).valueOf();
      if (isNaN(valueNumber)) {
        valid = false;
      } else {
        var valueNumberString = valueNumber.toString();
        var numberParts = valueNumberString.split('.');
        if (params.integer && numberParts[0].length > params.integer) {
          valid = false;
        }
        if (valid && params.fraction && numberParts.length > 1 && numberParts[1].length > params.fraction) {
          valid = false;
        }
      }
    }
    return valid;
  },
  Max: function(value, params) {
    var valid = true;
    if (value) {
      var valueNumber = new Number(value).valueOf();
      if (isNaN(valueNumber)) {
        valid = false;
      } else {
        valid = valueNumber <= new Number(params.value).valueOf();
      }
    }
    return valid;
  },
  Min: function(value, params) {
    var valid = true;
    if (value) {
      var valueNumber = new Number(value).valueOf();
      if (isNaN(valueNumber)) {
        valid = false;
      } else {
        valid = valueNumber >= new Number(params.value).valueOf();
      }
    }
    return valid;
  },
  NotNull: function(value, params) {
    return (value && value.toString().length > 0);
  },
  Null: function(value, params) {
    return (!value || value.toString().length == 0);
  },
  Pattern: function(value, params) {
    var valid = true;
    if (value) {
      var caseInsensitive = false;
      if (params.flag && params.flag.length > 0) {
        for (var flagIndex = 0; flagIndex < params.flag.length; flagIndex++) {
          if (params.flag[flagIndex] == 'CASE_INSENSITIVE') {
            caseInsensitive = true;
            break;
          }
        }
      }
      var regularExpression = caseInsensitive ? new RegExp(params.regexp, 'i') : new RegExp(params.regexp);
      valid = value.search(regularExpression) > -1;
    }
    return valid;
  },
  Size: function(value, params) {
    var valid = true;
    if (value) {
      var valueLength = value.toString().length;
      if (params.min && valueLength < params.min) {
        valid = false;
      }
      if (valid && params.max && valueLength > params.max) {
        valid = false;
      }
    }
    return valid;
  },
  Future: function(value, params, fieldName, config) {
    var valid = true;
    if (value) {
      var dateFormat = (config[fieldName] && config[fieldName].dateFormat ? config[fieldName].dateFormat : JSR303JSValidator.DateParser.defaultFormat);
      try {
        var dateValue = JSR303JSValidator.DateParser.parseDate(dateFormat, value);
        valid = dateValue && dateValue.getTime() > new Date().getTime();
      } catch(e) {
        JSR303JSValidator.Logger.log(e);
      }
    }
    return valid;
  },
  Past: function(value, params, fieldName, config) {
    var valid = true;
    if (value) {
      var dateFormat = (config[fieldName] && config[fieldName].dateFormat ? config[fieldName].dateFormat : JSR303JSValidator.DateParser.defaultFormat);
      try {
        var dateValue = JSR303JSValidator.DateParser.parseDate(dateFormat, value);
        valid = dateValue && dateValue.getTime() < new Date().getTime();
      } catch(e) {
        JSR303JSValidator.Logger.log(e);
      }
    }
    return valid;
  },
  // Hibernate Validator validations
  Email: function(value, params) {
    return (!value || value.search(JSR303JSValidator.Rule.emailPattern) > -1);
  },
  Length: function(value, params) {
    var valid = true;
    if (value) {
      var valueLength = value.toString().length;
      if (params.min && valueLength < params.min) {
        valid = false;
      }
      if (valid && params.max && valueLength > params.max) {
        valid = false;
      }
    }
    return valid;
  },
  NotEmpty: function(value, params) {
    return (value && value.toString().search(/\w+/) > -1);
  },
  Range: function(value, params) {
    var valid = true;
    if (value) {
      var valueNumber = new Number(value).valueOf();
      if (isNaN(valueNumber)) {
        valid = false;
      } else {
        if (params.min && valueNumber < params.min) {
          valid = false;
        }
        if (valid && params.max && valueNumber > params.max) {
          valid = false;
        }
      }
    }
    return valid;
  }
}
// email validation regular expressions, from Hibernate Validator EmailValidator
JSR303JSValidator.Rule.emailPatternAtom = '[^\x00-\x1F^\\(^\\)^\\<^\\>^\\@^\\,^\\;^\\:^\\^\"^\\.^\\[^\\]^\\s]';
JSR303JSValidator.Rule.emailPatternDomain = JSR303JSValidator.Rule.emailPatternAtom + '+(\\.' + JSR303JSValidator.Rule.emailPatternAtom + '+)*';
JSR303JSValidator.Rule.emailPatternIPDomain = '\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\]';
JSR303JSValidator.Rule.emailPattern = new RegExp(
    "^" + JSR303JSValidator.Rule.emailPatternAtom + "+(\\." + JSR303JSValidator.Rule.emailPatternAtom + "+)*@("
					+ JSR303JSValidator.Rule.emailPatternDomain
					+ "|"
					+ JSR303JSValidator.Rule.emailPatternIPDomain
					+ ")$", 'i');
/**
 * Very simple Date parsing utility, for @Future/@Past validation.
 * Provide a date format in the tag body in a JSON object, keyed on
 * field name, e.g.:
 *
 * { fieldName : { dateFormat : 'y/M/d' } }
 *
 * Only supports numerical values for days and months. At most one
 * occurrence of each character is allowed (e.g. 'y' but not 'yy'
 * or 'yyyy' or 'y   y').
 *
 * The 'y' year format character is required, other characters are
 * optional, and dates parsed will get default values for fields not
 * represented in the format string.
 *
 * If fewer than four numbers are used for the year then the year
 * will be set according to the browser defaults.
 */
JSR303JSValidator.DateParser = {
  defaultFormat : 'M/d/y',
  formatChars : {
    // this order avoids errors with regex replace calls later on
    'd' : { regexp : '\\d{1,2}' }, // day of month
    'm' : { regexp : '\\d{1,2}' }, // minute of hour
    'M' : { regexp : '\\d{1,2}' }, // month of year
    'a' : { regexp : '[aApP][mM]+' }, // AM/PM, required for 12-hour time
    'y' : { regexp : '\\d{1,4}' }, // year, required
    'h' : { regexp : '\\d{1,2}' }, // 12-hour hour, requires 'a'
    'H' : { regexp : '\\d{1,2}' }, // 24-hour hour, cannot be used with 'a'
    's' : { regexp : '\\d{1,2}' } // second of minute
  },
  parseDate : function(dateFormat, dateValue) {
    var parsedDate = null;
    if (!dateFormat || dateFormat.search(/\w/) < 0) {
      throw('date format must not be blank');
    }
    if (dateFormat.search(/y/) < 0) {
      throw('date format must at least contain year character ("y")');
    }
    if (dateFormat.indexOf('h') > -1 && dateFormat.indexOf('a') < 0) {
      throw('date format must contain AM/PM ("a") if using 12-hour hours ("h")');
    }
    if (dateFormat.indexOf('H') > -1 && dateFormat.indexOf('a') > -1) {
      throw('date format must not contain AM/PM ("a") if using 24-hour hours ("H")');
    }
    if (!dateValue || dateValue.search(/\w/) < 0) {
      throw('date value must not be blank');
    }

    // create map of date piece name to index of capturing group
    var formatChar;
    var partOrderMap = {};
    var partOrder = 1;
    for (var i = 0; i < dateFormat.length; i++) {
      var userFormatChar = dateFormat.charAt(i);
      for (formatChar in this.formatChars) {
        if (userFormatChar == formatChar) {
          if (partOrderMap[formatChar]) {
            throw('date format must not contain more than one of the same format character');
//              } else if ((userFormatChar == 'h' && partOrderMap['H']) || (userFormatChar == 'H' && partOrderMap['h'])) {
//                alert('date format must contain either \'h\' or \'H\', but not both');
          }
          partOrderMap[formatChar] = partOrder++;
        }
      }
    }
    // create regexp from date format
    var dateRegExp = dateFormat;
    for (formatChar in this.formatChars) {
      dateRegExp = dateRegExp.replace(formatChar, '(' + this.formatChars[formatChar].regexp + ')');
    }
    dateRegExp = new RegExp(dateRegExp);

    // run regexp
    var matches = dateValue.match(dateRegExp);

    if (!matches) {
//      throw('date value does not match date format');
      return null;
    }

    // create date pulling values from match array using map of piece name to capturing group indexes
    var yearValue = Math.max(0, matches[partOrderMap['y']] || 0);
    var monthValue = Math.max(0, (matches[partOrderMap['M']] || 0) - 1);
    var dayValue = Math.max(1, matches[partOrderMap['d']] || 0);
    var twelveHourValue = matches[partOrderMap['h']];
    var ampmValue = matches[partOrderMap['a']];
    var twentyFourHourValue = matches[partOrderMap['H']];
    var hourValue;
    if (twelveHourValue) {
      hourValue = twelveHourValue % 12;
      if (ampmValue.toLowerCase().indexOf('p') > -1) {
        hourValue += 12;
      }
    } else {
      hourValue = twentyFourHourValue || 0;
    }
    hourValue = Math.max(0, hourValue);
    var minuteValue = Math.max(0, matches[partOrderMap['m']] || 0);
    var secondValue = Math.max(0, matches[partOrderMap['s']] || 0);

    parsedDate = new Date(yearValue, monthValue, dayValue, hourValue, minuteValue, secondValue);

    return parsedDate;
  }
};
