import { Component, Renderer2 } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TasksService } from '../../services/tasks.service';
import { TasksUserService } from '../../services/tasks-users.service';

declare var $: any; // variable $ para que TypeScript no dé error

@Component({
  selector: 'app-private-tasks-users',
  templateUrl: './private-tasks-users.component.html',
  styleUrls: ['../../../assets/scss/styles.scss']
})
export class PrivateTasksUsersComponent {
  constructor(private authService: AuthService, private tasksService: TasksService, private tasksUsersService: TasksUserService, private renderer: Renderer2) {    
    this.toggleDashboardSection();
  }

  // Inicializa la propiedad
  UsernameBox: String = '';
  dniUsuario: String = '';
  nombresUsuario: String = '';
  apellidosUsuario: String = '';
  emailUsuario: String = '';
  expirationDate: Date = new Date();

  showDashboardSection = false;
  showMyProfileSection = false;
  showMyRutinesSection = false;

  FinalizoMes = false;
  MesEnOrden = true;
  countdownElement!: HTMLElement;

  //Paso de pagina de rutinas
  rutinas: any[] = [];
  totalRutinasForThisUser: any;
  currentPageRoutines = 1;
  pageSizeRoutines = 5;
  totalPagesRoutines = 0;

  currentPage = 1;
  pageSize = 5;
  totalPages = 0;

  rutinasUsuario: any[] = []; // Arreglo para almacenar las rutinas del usuario

  ngAfterViewInit() {
    this.loadScripts();

    this.tasksUsersService.getCurrentUser().subscribe((usuario) => {
      if (usuario) {
        this.UsernameBox = usuario.nombres.split(' ')[0];
        this.dniUsuario = usuario.dni || '';
        this.nombresUsuario = usuario.nombres || '';
        this.apellidosUsuario = usuario.apellidos || '';
        this.emailUsuario = usuario.email || '';
    
        // Calcula la fecha de vencimiento a partir del initialDate del usuario
        const initialDate = new Date(usuario.initial_date as string);
        this.expirationDate = new Date(initialDate.getFullYear(), initialDate.getMonth() + 1, initialDate.getDate());

        // Obtén el elemento por ID
        this.countdownElement = document.getElementById('countdown')!;

        // Llama a la función para iniciar el contador después de haber obtenido la fecha de vencimiento
        this.initCountdown();

      }
    });
    
    

  }

  private initCountdown() {
    // Función para actualizar el contador de tiempo
    const updateCountdown = () => {
      const now = new Date();
      const timeRemaining = this.expirationDate.getTime() - now.getTime();
  
      // Calcula días, horas, minutos y segundos restantes
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  
      // Verifica si el elemento se ha encontrado
      if (this.countdownElement) {
        if (timeRemaining <= 0) {
          this.FinalizoMes = true;
          this.MesEnOrden = false;
          // Si el tiempo restante es menor o igual a cero, muestra el mensaje y oculta los contadores
        } else {
          // Actualiza los elementos HTML con los valores calculados
          const daysElement = document.querySelector('.days-text');
          const hoursElement = document.querySelector('.hours-text');
          const minutesElement = document.querySelector('.minutes-text');
          const secondsElement = document.querySelector('.seconds-text');
  
          const dayslabelElement = document.querySelector('.days-label');
          const hourslabelElement = document.querySelector('.hours-label');
          const minuteslabelElement = document.querySelector('.minutes-label');
          const secondslabelElement = document.querySelector('.seconds-label');
  
          if (daysElement && hoursElement && minutesElement && secondsElement && dayslabelElement && hourslabelElement && minuteslabelElement && secondslabelElement) {
            daysElement.textContent = `${days}`;
            hoursElement.textContent = `${hours}`;
            minutesElement.textContent = `${minutes}`;
            secondsElement.textContent = `${seconds}`;
  
            dayslabelElement.textContent = 'días';
            hourslabelElement.textContent = 'horas';
            minuteslabelElement.textContent = 'minutos';
            secondslabelElement.textContent = 'segundos';
  
          }
  
          requestAnimationFrame(updateCountdown); // Utiliza requestAnimationFrame para una actualización eficiente
        }
      }
    }
  
    // Inicia el contador al cargar la página
    requestAnimationFrame(updateCountdown);
  }
  

  onLogout() {
    this.authService.logout();
  }

  private loadScripts() {
    this.loadScript('assets/js/app.min.js');
    this.loadScript('assets/js/sidebarmenu.js');
    //this.loadScript('assets/js/countdownScript.js');
    //this.loadScript('assets/libs/apexcharts/dist/apexcharts.min.js');
    //this.loadScript('assets/js/dashboard.js');
    //this.loadScript('assets/js/dashboard.js');
  }
  
  private loadScript(scriptSrc: string) {
    if (typeof document !== 'undefined') {
      const script = this.renderer.createElement('script');
      script.src = scriptSrc;
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
  
      script.onerror = (error: any) => {
        console.error(`Error loading script: ${scriptSrc}`, error);
      };
  
      this.renderer.appendChild(document.body, script);
    }
  }

  toggleDashboardSection() {
    this.showDashboardSection = true;
    this.showMyProfileSection = false;
    this.showMyRutinesSection = false;
  }

  toggleMyProfileSection() {
    this.showMyProfileSection = true;
    this.showDashboardSection = false;
    this.showMyRutinesSection = false;
  }

  toggleRutinesSection() {
    this.showDashboardSection = false;
    this.showMyProfileSection = false;
    this.showMyRutinesSection = true;
  }

  //Cosas esas de la pagina
  getRutinasForThisUser() {
    const startIndex = (this.currentPageRoutines - 1) * this.pageSizeRoutines;
    const endIndex = startIndex + this.pageSizeRoutines;
    return this.rutinasUsuario.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  getPages() {
    const maxPagesToShow = 3;
    //const totalPages = Math.ceil(this.totalUsers / this.pageSize);
  
    //Calculo.
    this.totalPages = Math.ceil(this.totalRutinasForThisUser / this.pageSizeRoutines);

    // Calcula el rango de páginas a mostrar
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
  
    // Ajusta el rango si está demasiado cerca del principio o final
    const adjustment = maxPagesToShow - (endPage - startPage + 1);
    startPage = Math.max(1, startPage - adjustment);
    endPage = Math.min(this.totalPages, endPage + adjustment);
  
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }

  TraerRutinasDelUsuario() {
    if (this.dniUsuario) {
      // Llamar al servicio para obtener las rutinas del usuario
      this.tasksService.getUserRoutines(this.dniUsuario as string).subscribe(
        (rutinas: any[]) => {
          // Verificar si el usuario tiene rutinas existentes
          if (rutinas && rutinas.length > 0) {
            // Asignar las rutinas del usuario al arreglo
            this.rutinasUsuario = rutinas;
            this.totalRutinasForThisUser = rutinas.length;
          } else {
            // No hay rutinas para este usuario
            //console.log(`El usuario ${this.nombresUsuario} no tiene rutinas asignadas.`);
          }
        },
        (error) => {
          // Manejo de errores al obtener las rutinas del usuario
          console.error('Error al obtener las rutinas del usuario:', error);
        }
      );
    } else {
      console.error('No se puede obtener las rutinas del usuario porque falta el DNI.');
    }
  }
  
  encodeURIComponent(value: string): string {
    return encodeURIComponent(value);
  }

}
