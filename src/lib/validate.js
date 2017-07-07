

function ValidateError (fields) {
  this.fields = fields;
  this.message = "Validate Error";
}

ValidateError.prototype = Object.create(Error.prototype);

window.ValidateError = ValidateError;

$.fn.fieldValue = function (key) {
  var value = null;
  var target = !key ? this : this.formFields(key);
  target.each(function () {
    if (['SELECT', 'INPUT', 'TEXTAREA', 'DIV'].indexOf(this.nodeName) === -1) return;
    switch (this.nodeName) {
      case 'SELECT' || 'TEXTAREA':
        return value = this.value;
      case 'INPUT':

        switch (this.type) {
          case 'checkbox':
            return value = this.checked ? (this.value == 'on' || this.value == true ? true : false) : false
          case 'radio':
          //$('body').find("input[name=adverttype]:checked").val()
          //return value = this.checked ? (this.value == 'on' || this.value == true ? true : false) : false
          default:
            return value = this.value;
        }
      default:
        return value = $(this).val();
    }
  });
  return value;
};

$.fn.formFields = function (key){
  return $(this).find('[data-form-element' + (!key ? '' : '=\'' + key + '\'') + ']');
};

$.fn.validateFormAsync = function(rules) {
  return (function (target, rules) {

    return new Promise((resolve, reject) => {
      var formElements = {};
      $(target).find('[data-form-element]').each(function () {
        if(this.type != 'radio') formElements[$(this).attr('data-form-element')] = this;
        else
        if ($(this).is(':checked')) formElements[$(this).attr('data-form-element')] = this;
      });
      var formValues = {};
      var errorFields = [];
      Object.keys(formElements).forEach(name => {
        var value = formValues[name] = $(formElements[name]).fieldValue();
        if (!rules.hasOwnProperty(name)) return;

        var fieldRules = (typeof rules[name] == "function") ? [rules[name]] : rules[name];

        if (fieldRules.find(f => f.call(formElements[name], value, formElements, target) !== true)) {
          errorFields.push(formElements[name]);
          $(formElements[name]).addClass('required');
        } else {
          $(formElements[name]).removeClass('required');
        }
      });

      if (errorFields.length > 0) return reject(new ValidateError(errorFields));
      resolve(formValues)
    });

  })(this, rules || {});
};
