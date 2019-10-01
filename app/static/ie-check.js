function isIE() {
  var ua = window.navigator.userAgent; //Check the userAgent property of the window.navigator object
  var msie = ua.indexOf("MSIE "); // IE 10 or older
  var trident = ua.indexOf("Trident/"); //IE 11

  return msie > 0 || trident > 0;
}

if (isIE()) {
  alert(
    "Diese Seite funktioniert nicht in Internet Explorer. Bitte verwenden Sie eine aktuelle Version von Chrome, Firefox, Safari oder Microsoft Edge."
  );
}
