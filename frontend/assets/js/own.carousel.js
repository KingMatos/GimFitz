$(document).ready(function () {
  var carouselSpeed = 8000; // 6 segundos
  var intervalId;

  function iniciarIntervalo() {
    intervalId = setInterval(function () {
      $('#carouselExampleIndicators').carousel('next');
    }, carouselSpeed);
  }

  function reiniciarIntervalo() {
    clearInterval(intervalId);
    iniciarIntervalo();
  }

  // Inicia el carrusel automático
  iniciarIntervalo();

  // Manejador de eventos para el botón de siguiente si existe
  var nextButton = $('.carousel-control-next');
  if (nextButton.length) {
    nextButton.click(function () {
      $('#carouselExampleIndicators').carousel('next');
      reiniciarIntervalo();
    });
  } else {
    console.warn('Warning: El elemento carousel-control-next no existe.');
  }

  // Manejador de eventos para el botón de anterior si existe
  var prevButton = $('.carousel-control-prev');
  if (prevButton.length) {
    prevButton.click(function () {
      $('#carouselExampleIndicators').carousel('prev');
      reiniciarIntervalo();
    });
  } else {
    console.warn('Warning: El elemento carousel-control-prev no existe.');
  }


  // Agregar efecto de transición fade al cambiar de diapositiva
  $('#carouselExampleIndicators').on('slide.bs.carousel', function () {
    $('#carouselExampleIndicators .carousel-inner').addClass('carousel-fade');
  });

  $('#carouselExampleIndicators').on('slid.bs.carousel', function () {
    $('#carouselExampleIndicators .carousel-inner').removeClass('carousel-fade');
  });

});