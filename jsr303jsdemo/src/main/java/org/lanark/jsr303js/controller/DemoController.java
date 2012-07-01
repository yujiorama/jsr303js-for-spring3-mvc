package org.lanark.jsr303js.controller;

import org.lanark.jsr303js.model.TestModelBean;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.validation.Valid;

/**
 * Class javadoc comment here...
 *
 * @author sam
 * @version $Id$
 */
@Controller
public class DemoController {

  @RequestMapping(value = {"/", "/index"}, method = RequestMethod.GET)
  public String getHandler(@ModelAttribute("testModelBean") TestModelBean testModelBean,
                           BindingResult result) {
    return "index";

  }

  @RequestMapping(value = {"/", "/index"}, method = RequestMethod.POST)
  public String postHandler(@ModelAttribute("testModelBean") @Valid TestModelBean testModelBean,
                           BindingResult result) {
    return "index";

  }

  @RequestMapping("/jsr303js-codebase")
  public String scriptHandler() {
    return "jsr303js-codebase";
  }
}
