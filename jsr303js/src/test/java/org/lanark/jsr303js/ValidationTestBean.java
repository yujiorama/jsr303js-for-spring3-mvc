package org.lanark.jsr303js;

import org.hibernate.validator.constraints.Email;
import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.NotEmpty;
import org.hibernate.validator.constraints.Range;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Date;

/**
 * @version $Id$
 */
public class ValidationTestBean {

  @AssertFalse(message = "assertFalse must be false!")
  private boolean assertFalse = true;

  @AssertTrue(message = "assertTrue must be true!")
  private boolean assertTrue;

//  @CreditCardNumber
//  private String creditCardNumber;

  @DecimalMax(value = "10", message = "decimalMax must not be greater than 10")
  private int decimalMax = 15;

  @DecimalMin(value = "5", message = "decimalMin must not be less than 5")
  private int decimalMin;

  @NotNull(message = "digits must not be null")
  @Digits(integer = 3, fraction = 3, message = "digits must have at most 3 integer digits and 3 fraction digits")
  private BigDecimal digits;

  @NotEmpty(message = "email is required")
  @Email(message = "email must be a valid email address")
  private String email;

  @NotNull(message = "future must not be blank")
  @Future(message = "future must be a date in the future")
  private Date future;

  @NotNull(message = "past must not be blank")
  @Past(message = "past must be a date in the past")
  private Date past;

  @NotNull(message = "length must not be null")
  @Length(min = 5, max = 10, message = "length must be 5 to 10 characters long")
  private String length;

  @Max(value = 10, message = "max must not be greater than 10")
  private int max = 15;

  @Min(value = 5, message = "min must not be less than 5")
  private int min;

  @NotNull(message = "notNull must not be null")
  private String notNull;

  @NotEmpty(message = "notEmpty must not be empty")
  private String notEmpty;

  @Null(message = "null must be null")
  private String nullString = "notnull";

  @NotEmpty(message = "pattern must not be blank")
  @Pattern(regexp = "[0-9a-z]{4,6}", flags = {Pattern.Flag.CASE_INSENSITIVE}, message = "pattern must be 4-6 characters, 0-9 or a-z")
  private String pattern;

  @Range(min = 5, max = 10, message = "range must be between 5 and 10")
  private int range;

  @NotEmpty(message = "size must not be blank")
  @Size(min = 5, max = 10, message = "size must be 5 to 10 characters long")
  private String size;

  // TODO @Valid, nested validation


  public boolean isAssertFalse() {
    return assertFalse;
  }

  public void setAssertFalse(boolean assertFalse) {
    this.assertFalse = assertFalse;
  }

  public boolean isAssertTrue() {
    return assertTrue;
  }

  public void setAssertTrue(boolean assertTrue) {
    this.assertTrue = assertTrue;
  }

  public int getDecimalMax() {
    return decimalMax;
  }

  public void setDecimalMax(int decimalMax) {
    this.decimalMax = decimalMax;
  }

  public int getDecimalMin() {
    return decimalMin;
  }

  public void setDecimalMin(int decimalMin) {
    this.decimalMin = decimalMin;
  }

  public BigDecimal getDigits() {
    return digits;
  }

  public void setDigits(BigDecimal digits) {
    this.digits = digits;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public Date getFuture() {
    return future;
  }

  public void setFuture(Date future) {
    this.future = future;
  }

  public String getLength() {
    return length;
  }

  public void setLength(String length) {
    this.length = length;
  }

  public int getMax() {
    return max;
  }

  public void setMax(int max) {
    this.max = max;
  }

  public int getMin() {
    return min;
  }

  public void setMin(int min) {
    this.min = min;
  }

  public String getNotNull() {
    return notNull;
  }

  public void setNotNull(String notNull) {
    this.notNull = notNull;
  }

  public String getNullString() {
    return nullString;
  }

  public void setNullString(String nullString) {
    this.nullString = nullString;
  }

  public Date getPast() {
    return past;
  }

  public void setPast(Date past) {
    this.past = past;
  }

  public String getPattern() {
    return pattern;
  }

  public void setPattern(String pattern) {
    this.pattern = pattern;
  }

  public int getRange() {
    return range;
  }

  public void setRange(int range) {
    this.range = range;
  }

  public String getSize() {
    return size;
  }

  public void setSize(String size) {
    this.size = size;
  }

  public String getNotEmpty() {
    return notEmpty;
  }

  public void setNotEmpty(String notEmpty) {
    this.notEmpty = notEmpty;
  }
}
