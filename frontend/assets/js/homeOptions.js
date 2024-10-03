document.addEventListener("DOMContentLoaded", function() {
  // Agregar un controlador de eventos para cada enlace con la clase "nav-link"
  document.querySelectorAll('a.nav-link, a#LoginButton').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      // Obtener el destino del enlace (id del elemento a desplazar)
      const targetId = this.getAttribute('href');
      
      if (targetId) {
        const targetElement = document.getElementById(targetId.substring(1));

        if (targetElement) {
          // Utilizar scrollIntoView para desplazar suavemente hacia el elemento objetivo
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
