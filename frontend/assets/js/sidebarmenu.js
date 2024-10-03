$(function () {
  "use strict";

  var url = window.location + "";
  var path = url.replace(
    window.location.protocol + "//" + window.location.host + "/",
    ""
  );

  var element = $("ul#sidebarnav a").filter(function () {
    return this.id === path;
  });

  /*
  element.parentsUntil(".sidebar-item").each(function (index) {
    if ($(this).is("li") && $(this).children("a").length !== 0) {
      $(this).children("a").addClass("active");
      $(this).parent("ul#sidebarnav").length === 0
        ? $(this).addClass("active")
        : $(this).addClass("selected");
    } else if (!$(this).is("ul") && $(this).children("a").length === 0) {
      $(this).addClass("selected");
    } else if ($(this).is("ul")) {
      $(this).addClass("in");
    }
  });
  */

  // Activar manualmente el Dashboard por defecto
  if (element.length === 0) {
    $("ul#sidebarnav a#0").addClass("active");
  } else {
    element.addClass("active");
  }

  $("#sidebarnav a").on("click", function (e) {
    if (!$(this).hasClass("active")) {
      // Ocultar cualquier menú abierto y quitar todas las demás clases
      $("ul", $(this).parents("ul:first")).removeClass("in");
      $("a", $(this).parents("ul:first")).removeClass("active");

      // Abrir nuestro nuevo menú y agregar la clase "active"
      $(this).next("ul").addClass("in");
      $(this).addClass("active");
    }
  });

  /*
  $("#sidebarnav >li >a.has-arrow").on("click", function (e) {
    e.preventDefault();
  });
  */
});
