const isParentTarget = function(target, attr) {
  var isOurField = (target.getAttribute('class') || '').indexOf('emr-field') > -1;
  var emrplugin = target.getAttribute(attr);

  if (isOurField) {
    if (emrplugin) {
      return target;
    } else {
      while( target.parentNode && (target.getAttribute('class') || '').indexOf('emr-field') > -1) {
        target = target.parentNode;
        if (target.getAttribute(attr)) {
          return target;
        }
      }
    }
  } else {
    return false;
  }
}

export { isParentTarget };