package org.lanark.jsr303js;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

public class TestBean {

	  @Max(value = 10, message = "max must not be greater than 10")
	  private int max = 15;

	  @Min(value = 5, message = "min must not be less than 5")
	  private int min;

	  @NotNull(message = "notNull must not be null")
	  private String notNull;

	/**
	 * maxを取得します。
	 * @return max
	 */
	public int getMax() {
	    return max;
	}

	/**
	 * maxを設定します。
	 * @param max max
	 */
	public void setMax(int max) {
	    this.max = max;
	}

	/**
	 * minを取得します。
	 * @return min
	 */
	public int getMin() {
	    return min;
	}

	/**
	 * minを設定します。
	 * @param min min
	 */
	public void setMin(int min) {
	    this.min = min;
	}

	/**
	 * notNullを取得します。
	 * @return notNull
	 */
	public String getNotNull() {
	    return notNull;
	}

	/**
	 * notNullを設定します。
	 * @param notNull notNull
	 */
	public void setNotNull(String notNull) {
	    this.notNull = notNull;
	}

}
