<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="jsr303js" uri="http://kenai.com/projects/jsr303js/" %>
<html>
  <head>
    <title>Test Page</title>
    <script type="text/javascript" src="<c:url value="/do/jsr303js-codebase.js"/>"></script>
    <%--<jsr303js:codebase/>--%>
    <link rel="stylesheet" type="text/css" href="<c:url value="/css/form.css"/>">
  </head>
  <body>

  <form:form id="testModelBean" name="testModelBean" commandName="testModelBean" cssClass="cmxform">

  <div id="global_errors">
    <form:errors path="*" cssClass="formErrorAlert" element="div"/>
  </div>

  <jsr303js:validate commandName="testModelBean">
    {
      future : { dateFormat : 'y/M/d' },
      past : { dateFormat : 'y/M/d' }
    }
  </jsr303js:validate>

  <fieldset>
    <legend>Test Model Bean Form</legend>
    <ol>
      <li>
        <label for="assertFalse">assertFalse:</label>
        <form:input path="assertFalse" id="assertFalse" />
      </li>
      <li>
        <label for="assertTrue">assertTrue:</label>
        <form:input path="assertTrue" id="assertTrue" />
      </li>
      <li>
        <label for="decimalMax">decimalMax (max = 10):</label>
        <form:input path="decimalMax" id="decimalMax" />
      </li>
      <li>
        <label for="decimalMin">decimalMin (min = 5):</label>
        <form:input path="decimalMin" id="decimalMin" />
      </li>
      <li>
        <label for="digits">digits (integer = 3, fraction = 3):</label>
        <form:input path="digits" id="digits" />
      </li>
      <li>
        <label for="email">email:</label>
        <form:input path="email" id="email" />
      </li>
      <li>
        <label for="future">future (date format = y/M/d):</label>
        <form:input path="future" id="future" />
      </li>
      <li>
        <label for="past">past (date format = y/M/d):</label>
        <form:input path="past" id="past" />
      </li>
      <li>
        <label for="length">length (min = 5, max = 10):</label>
        <form:input path="length" id="length" />
      </li>
      <li>
        <label for="max">max (max = 10):</label>
        <form:input path="max" id="max" />
      </li>
      <li>
        <label for="min">min (min = 5):</label>
        <form:input path="min" id="min" />
      </li>
      <li>
        <label for="notNull">notNull:</label>
        <form:input path="notNull" id="notNull" />
      </li>
      <li>
        <label for="notEmpty">notEmpty:</label>
        <form:input path="notEmpty" id="notEmpty" />
      </li>
      <li>
        <label for="null">null:</label>
        <form:input path="nullString" id="null" />
      </li>
      <li>
        <label for="pattern">pattern (pattern = [0-9a-z]{4,6}):</label>
        <form:input path="pattern" id="pattern" />
      </li>
      <li>
        <label for="range">range (min = 5, max = 10):</label>
        <form:input path="range" id="range" />
      </li>
      <li>
        <label for="size">size (min = 5, max = 10):</label>
        <form:input path="size" id="size" />
      </li>
      <li>
        <label for="submitBtn" style="font-size:80%;">Test!</label>
        <!--<br>-->
        <input type="submit" id="submitBtn" name="submitBtn" class="submitBtn" value="Test">
    </ol>
    </fieldset>
  </form:form>

  <div id="jsr303jsLogDiv"></div>

  </body>
</html>