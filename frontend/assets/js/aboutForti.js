    // Obtener el carousel y las diapositivas
    var myCarousel = new bootstrap.Carousel(document.getElementById('carouselIndicators_SecondSection'));
    var slides = document.querySelectorAll('.carousel-secondsection .item-class');
    var indicators = document.querySelectorAll('#carouselIndicators_SecondSection .carousel-indicators_SecondSection button');
    
    // Función para manejar el cambio en el tamaño de la ventana
    function handleWindowSizeChange() {
        // Actualizar el ancho de la ventana al cambiar su tamaño
        var windowWidth = window.innerWidth;
        var visibleSlides;
        // Mostrar u ocultar las diapositivas según sea necesario
        for (var i = 0; i < slides.length; i++) {
            if (i < visibleSlides) {
                slides[i].style.display = 'block';
            } else {
                slides[i].style.display = 'none';
            }
        }

        // Obtener el índice del indicador activo
        var activeIndex = 0;
        for (var j = 0; j < indicators.length; j++) {
            if (indicators[j].classList.contains('active')) {
                activeIndex = j;
                break;
            }
        }

        // Mostrar el número correcto de diapositivas según el indicador activo
        switch (activeIndex) {
            case 0:
                if (windowWidth <= 600){
                    slides[0].style.display = 'block';
                }else{
                    slides[0].style.display = 'block';
                    slides[1].style.display = 'block';
                }
                break;
            case 1:
                if (windowWidth <= 600){
                    slides[1].style.display = 'block';
                }else{
                    slides[0].style.display = 'block';
                    slides[1].style.display = 'block';
                    slides[2].style.display = 'block';
                }
                break;
            case 2:
                if (windowWidth <= 600){
                    slides[2].style.display = 'block';
                }else{
                    slides[0].style.display = 'none';
                    slides[1].style.display = 'block';
                    slides[2].style.display = 'block';
                    slides[3].style.display = 'block';
                }
                break;
            case 3:
                if (windowWidth <= 600){
                    slides[3].style.display = 'block';
                }else{
                    slides[0].style.display = 'none';
                    slides[1].style.display = 'none';
                    slides[2].style.display = 'block';
                    slides[3].style.display = 'block';
                }
                break;
            default:
                slides[0].style.display = 'block';
                slides[1].style.display = 'block';
        }


        // Si hay más de una diapositiva visible, ajustar el carousel al indicador activo
      /*  if (visibleSlides > 1) {
            // Obtener el índice del indicador activo
            var activeIndex = 0;
            for (var j = 0; j < indicators.length; j++) {
                if (indicators[j].classList.contains('active')) {
                    activeIndex = j;
                    break;
                }
            }
            
            myCarousel.to(activeIndex);
        }
*/
        // Ajustar el margin-right según el tamaño de la ventana
        var marginValue = (windowWidth <= 600) ? '0px' : '10px';
        for (var k = 0; k < slides.length; k++) {
            slides[k].style.marginRight = marginValue;
        }
        
        if (windowWidth <= 600) {
            // Resto del código (manejo de eventos del carousel y de los indicadores)...
            // Maneja el evento de cambio de slide
            myCarousel._element.addEventListener('slide.bs.carousel', function(event) {
                var currentIndex = event.to;
                for (var i = 0; i < slides.length; i++) {
                    if (i <= currentIndex) {
                        slides[i].style.display = 'block';
                    } else {
                        slides[i].style.display = 'none';
                    }
                }
            });

            // Maneja el clic en los indicadores
            for (var i = 0; i < indicators.length; i++) {
                indicators[i].addEventListener('click', function() {
                    // Obtiene el índice del indicador clicado
                    var targetIndex = parseInt(this.getAttribute('data-bs-slide-to'));

                    // Muestra las diapositivas hasta el índice seleccionado
                    for (var j = 0; j < slides.length; j++) {
                        if (j === targetIndex) {
                            slides[j].style.display = 'block';
                        } else {
                            slides[j].style.display = 'none';
                        }
                    }

                    // Quita la clase 'active' de todos los indicadores
                    for (var k = 0; k < indicators.length; k++) {
                        indicators[k].classList.remove('active');
                    }

                    // Agrega la clase 'active' al indicador clicado
                    this.classList.add('active');
                });
            }
        }else{
            // Maneja el evento de cambio de slide
            myCarousel._element.addEventListener('slide.bs.carousel', function(event) {
                var currentIndex = event.to;
                for (var i = 0; i < slides.length; i++) {
                    if (i <= currentIndex) {
                        slides[i].style.display = 'block';
                    } else {
                        slides[i].style.display = 'none';
                    }
                }
            });

            // Maneja el clic en los indicadores
            for (var i = 0; i < indicators.length; i++) {
                // Agrega un evento al pasar el ratón sobre el indicador
                indicators[i].addEventListener('mouseover', function() {
                    this.style.backgroundColor = '#999';  // Cambia el color de fondo al pasar el ratón
                });

                // Agrega un evento al salir el ratón del indicador
                indicators[i].addEventListener('mouseout', function() {
                    this.style.backgroundColor = '';  // Restaura el color de fondo al salir el ratón
                });

                indicators[i].addEventListener('click', function() {
                    // Obtiene el índice del indicador clicado
                    var targetIndex = parseInt(this.getAttribute('data-bs-slide-to'));

                    // Muestra las diapositivas hasta el índice seleccionado
                    for (var j = 0; j < slides.length; j++) {
                        if (j <= targetIndex) {
                            slides[j].style.display = 'block';
                        } else {
                            slides[j].style.display = 'none';
                        }
                    }

                    // Oculta la primera imagen si se hace clic en el indicador #4
                    if (targetIndex === 3) {
                        slides[0].style.display = 'none';
                    }

                    // Muestra las dos primeras imágenes si se hace clic en el indicador #1
                    if (targetIndex === 0) {
                        slides[0].style.display = 'block';
                        slides[1].style.display = 'block';
                    }

                    // Muestra las tres primeras imágenes si se hace clic en el indicador #2
                    if (targetIndex === 1) {
                        slides[0].style.display = 'block';
                        slides[1].style.display = 'block';
                        slides[2].style.display = 'block';
                    }

                    // Muestra todas las imágenes excepto la primera si se hace clic en el indicador #3
                    if (targetIndex === 2) {
                        slides[0].style.display = 'none';
                        slides[1].style.display = 'block';
                        slides[2].style.display = 'block';
                        slides[3].style.display = 'block';
                    }

                    // Muestra las dos últimas imágenes si se hace clic en el indicador #4
                    if (targetIndex === 3) {
                        slides[0].style.display = 'none';
                        slides[1].style.display = 'none';
                        slides[2].style.display = 'block';
                        slides[3].style.display = 'block';
                    }

                    // Quita la clase 'active' de todos los indicadores
                    for (var k = 0; k < indicators.length; k++) {
                        indicators[k].classList.remove('active');
                    }

                    // Agrega la clase 'active' al indicador clicado
                    this.classList.add('active');
                });
            }
        }
    }

    // Manejar el cambio en el tamaño de la ventana
    window.addEventListener('resize', handleWindowSizeChange);

    // Llamar a la función inicialmente al cargar la página
    handleWindowSizeChange();