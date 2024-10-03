import { Component, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { TasksService } from '../../services/tasks.service';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexMarkers,
  ApexFill,
  ApexStroke,
  ApexPlotOptions,
  ApexLegend,
  ApexDataLabels,
  ApexGrid,
  ApexTooltip,
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  markers: ApexMarkers;
  fill: ApexFill;
  stroke: ApexStroke;
  plotOptions: ApexPlotOptions,
  borderRadius: number[],
  legend: ApexLegend,
  dataLabels: ApexDataLabels,
  colors: string[],
  labels: string[];
  grid: ApexGrid,
  tooltip: ApexTooltip,
};

declare var $: any; // variable $ para que TypeScript no dé error

@Component({
  selector: 'app-private-tasks-admins',
  templateUrl: './private-tasks-admins.component.html',
  styleUrls: ['../../../assets/scss/styles.scss']
})
export class PrivateTasksAdminsComponent {
  @ViewChild('editProfileImageInput') editProfileImageInput!: ElementRef;
  @ViewChild('SuccessSound') SuccessSound!: ElementRef;
  @ViewChild('moneyInput') moneyInput!: ElementRef;
  @ViewChild("chart") chart!: ChartComponent;
  public chartData!: Partial<ChartOptions>;
  public radarData!: Partial<ChartOptions>;
  public areaData!: Partial<ChartOptions>;
  public lineData!: Partial<ChartOptions>;
  //chartData: any; // Declarar la propiedad chartData aquí

  newUser = {
    dni: '',
    nombres: '',
    apellidos: '',
    email: '',
    initial_date: '',
    final_date: '',
    password: '',
    role: '',
  };

  newRoutine = {
    nombre: '',
    tipo_rutina: '',
    repeticiones: '',
    descripcion: '',
  };

  users: any[] = []; // Lista de componentes
  totalUsers: any;
  userToDelete: any;
  editedUser: any = {};
  isEditing: boolean = false;
  isApplying: boolean = false;
  yearlyTotal: number | undefined;  // Declaración de la propiedad yearlyTotal
  currentYear: number | undefined;
  currentMonthName: string | undefined;
  monthlyTotal: number | undefined;
  montoDiario: number = 3500; // monto predeterminado
  dailyProfitsCollected: number = 0; // Variable para almacenar la suma de los montos diarios

  // Inicializa la propiedad para el perfil de la persona.
  UsernameBox: String = '';
  userId: String = '';
  dniUsuario: String = '';
  nombresUsuario: String = '';
  apellidosUsuario: String = '';
  edadUsuario: String = '';
  pesoUsuario: String = '';
  estaturaUsuario: String = '';
  emailUsuario: String = '';
  telefonoUsuario: String = '';
  fotoPerfilUsuario: String = '';
  fotoPerfilBuffer: String = '';

  // Inicializa la propiedad para la busqueda de una persona
  SearchDni: String = '';
  SearchNombres: String = '';
  SearchApellidos: String = '';
  SearchEmail: String = '';
  SearchFechaInicial: String = '';
  SearchFechaFinal: String = '';
  SearchEstadoMensualidad: String = '';
  SearchEstadoMensualidadIcon: String = '';
  SearchEstadoMensualidadColor: String = '';

  showAddUserSection = false;
  showDashboardSection = false;
  showMyProfileSection = false;
  showSearchSection = false;
  showSearchSectionRoutine = false;
  showRenewSection = false;
  //nuevo
  showAddRoutineSection = false;
  showApplyRoutine = false;
  showSearchUserRoutine = false;

  ///
  rutinas: any[] = [];
  rutinasSearch: any[] = [];
  totalRutinas: any;
  totalRutinasSearch: any;
  totalRutinasSearchandUser: any;
  currentPageRoutines = 1;
  pageSizeRoutines = 5;
  totalPagesRoutines = 0;

  /////RUTINAS BUSCADAS
  currentPageRoutinesForSearch = 1;
  pageSizeRoutinesForSearch = 5;
  totalPagesRoutinesForSearch = 0;
  //////

  routineToDelete: any;
  editedRoutine: any = {};
  ApplyRoutine: any = {};
  ApplyPerson: any = {};

  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  
  //Variable para obtener o donde se guardan los usuarios vencidos.
  expiredUsers: any[] = [];
  rutinasUsuario: any[] = []; // Arreglo para almacenar las rutinas del usuario
  
  constructor(private authService: AuthService, private tasksService: TasksService, private renderer: Renderer2) {    
      this.showDashboardSection = true; // Inicializa en true para que aparezca por defecto.
      this.loadUsers();
      this.loadRoutines();
      this.getExpiredUsers();
      this.loadScripts();
      this.loadEarningsData();
      this.loadYearlyData();
      this.loadMonthlyData();
      this.loadDailyData();
  }

  loadEarningsData() {
    // Suscribirse al servicio para obtener los datos
    this.tasksService.getEarningsData().subscribe(
      (earningsData: any[]) => {
        // Ordenar los datos por mes
        earningsData.sort((a, b) => this.getMonthIndex(a.month) - this.getMonthIndex(b.month));

        // Obtener arrays separados para meses y montos
        const months = earningsData.map(entry => entry.month);
        const amounts = earningsData.map(entry => parseFloat(entry.monthly_earnings)); // Convertir a números

        // Calcular la suma total de ingresos anuales
        const yearlyTotal = amounts.reduce((acc, curr) => acc + curr, 0);

        // Inicializar this.chartData antes de asignarle los valores
        this.chartData = {
          series: [
            {
              name: "Earnings this month",
              data: amounts
            }
          ],
          chart: {
            height: 350,
            type: "bar",
            foreColor: "#adb0bb",
            fontFamily: 'inherit',
          },

          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "35%",
              borderRadius: 6,
              borderRadiusApplication: 'end',
              borderRadiusWhenStacked: 'all',
            },
          },

          colors: ["#5D87FF"],

          grid: {
            borderColor: "rgba(0,0,0,0.1)",
            strokeDashArray: 3,
            xaxis: {
              lines: {
                show: false,
              },
            },
          },

          dataLabels: {
            enabled: false,
          },

          legend: {
            show: false,
          },

          xaxis: {
            categories: months,//["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],// Usar los meses como categorías
          }

        };

        // Actualizar la suma total en la variable que se utilizará en la plantilla HTML
        this.yearlyTotal = yearlyTotal;
      },
      error => {
        console.error('Error fetching earnings data:', error);
      }
    );
  }
  
  getMonthIndex(month: string): number {
    const monthsInOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return monthsInOrder.indexOf(month);
  }
  
  loadYearlyData() {
    // Suscribirse al servicio para obtener los datos
    this.tasksService.getEarningsData().subscribe(
      (earningsData: any[]) => {
        // Ordenar los datos por mes
        earningsData.sort((a, b) => this.getMonthIndex(a.month) - this.getMonthIndex(b.month));
        // Inicializa la propiedad currentYear con el año actual
        this.currentYear = new Date().getFullYear();

        // Obtener arrays separados para meses y montos
        const months = earningsData.map(entry => entry.month);
        const amounts = earningsData.map(entry => entry.monthly_earnings);

        // Inicializar this.radarData antes de asignarle los valores
        this.radarData = {
          series: [
            {
              name: "Earnings this month",
              data: amounts,
            }
          ],

          chart: {
            height: 180,
            type: "radar"
          },

          yaxis: { show: false },

          xaxis: {
            categories: months,
          },

          markers: {
            size: 4,
            colors: ["#6b6b6b"],
            strokeColors: ["#4a4a4a"],
            strokeWidth: 2,
          },
          fill: {
            opacity: 0.4,
            colors: ["#1a1818"],
          },
          stroke: {
            colors: ["#c78b00"],
          },

        };

      },
      error => {
        console.error('Error fetching earnings data:', error);
      }
    );
  }

  loadMonthlyData(){
    // Suscribirse al servicio para obtener los datos
    this.tasksService.getEarningsData().subscribe(
      (earningsData: any[]) => {
        // Ordenar los datos por mes
        earningsData.sort((a, b) => this.getMonthIndex(a.month) - this.getMonthIndex(b.month));
        // Obtén el nombre completo del mes actual en español
        this.currentMonthName = new Date().toLocaleString('es-ES', { month: 'long' });

        // Obtener arrays separados para meses y montos
        const amounts = earningsData.map(entry => entry.monthly_earnings);

        // Obtén el nombre del mes actual en formato corto (por ejemplo, "Jan")
        const currentMonth = new Date().toLocaleString('default', { month: 'short' });

        // Filtra los datos solo para el mes actual
        const currentMonthData = earningsData.find(entry => entry.month === currentMonth);
        if (currentMonthData) {
          // Si hay datos para el mes actual, utiliza esos datos
          this.monthlyTotal = currentMonthData.monthly_earnings;
        } else {
          // Si no hay datos para el mes actual, establece la suma total en 0
          this.monthlyTotal = 0;
        }

        // Inicializar this.radarData antes de asignarle los valores
        this.areaData = {
          series: [
            {
              name: "Earnings",
              color: "#49BEFF",
              data: amounts,
            }
          ],
          chart: {
            id: "sparkline3",
            type: "area",
            height: 30,
            sparkline: {
              enabled: true,
            },
            group: "sparklines",
            fontFamily: "Plus Jakarta Sans', sans-serif",
            foreColor: "#adb0bb",
          },

          stroke: {
            curve: "smooth",
            width: 2,
          },

          fill: {
            colors: ["#f3feff"],
            type: "solid",
            opacity: 0.05,
          },
      
          markers: {
            size: 0,
          },

          tooltip: {
            theme: "dark",
            fixed: {
              enabled: true,
              position: "right",
            },
            x: {
              show: false,
            },
          },
        };

      },
      error => {
        console.error('Error fetching earnings data:', error);
      }
    );
  }

  loadDailyData() {
    // Suscribirse al servicio para obtener los datos

    this.tasksService.getEarningsDailyData().subscribe(
      (dailyEarningsData: any) => {
        // Verificar que dailyEarningsData sea un array y tenga datos
        if (Array.isArray(dailyEarningsData.dailyEarnings) && dailyEarningsData.dailyEarnings.length > 0) {
          const dailyAmounts = dailyEarningsData.dailyEarnings[0]
          // Verificar que dailyAmounts sea un array antes de usar map
          if (Array.isArray(dailyAmounts)) {
          // Calcular la suma de los montos diarios
          this.dailyProfitsCollected = dailyAmounts.reduce((acc, curr) => acc + parseFloat(curr), 0);
            
            // Inicializar this.lineData antes de asignarle los valores
            this.lineData = {
              series: [
                {
                  name: "Daily Earnings",
                  data: dailyAmounts,
                }
              ],
              chart: {
                height: 350,
                type: "line",
                zoom: {
                  enabled: false
                },
              },
              dataLabels: {
                enabled: false
              },

              stroke: {
                curve: "straight"
              },

              markers: {
                size: 2,
                colors: ["#b8b6b6"],
                strokeColors: ["#4a4a4a"],
                strokeWidth: 2,
              },

              colors: ["#5D87FF"],

              grid: {
                row: {
                  colors: ["#f3f3f3", "transparent"],
                  opacity: 0.5
                },
                borderColor: "rgba(0,0,0,0.1)",
                strokeDashArray: 3,
                xaxis: {
                  lines: {
                    show: false,
                  },
                },
              },

              xaxis: {
                categories: dailyAmounts.map((_, index) => `Monto ${index + 1}`),
              }

            };
            
          } else {
            console.error('Daily amounts is not an array:', dailyAmounts);
          }
        } else {
          console.error('Invalid or empty daily earnings data:', dailyEarningsData);
        }
      },
      error => {
        console.error('Error fetching daily earnings data:', error);
      }
    );
  }
  
  

 // Método para manejar el clic del botón Add
 agregarMontoDiario() {
    // Aquí debes agregar la lógica para obtener el monto del input o usar el valor predeterminado
    const amountToAdd = parseFloat((<HTMLInputElement>document.querySelector('.dailyBox')).value) || this.montoDiario;
    // Puedes reiniciar el valor del input si es necesario
    (<HTMLInputElement>document.querySelector('.dailyBox')).value = '';

    // Hace la solicitud al servicio para agregar los ingresos diarios
    this.tasksService.addEarningsDaily(amountToAdd).subscribe(
      (response) => {
        console.log('Daily earnings added successfully:', response);
        // Actualiza los datos de ingresos diarios y la gráfica después de agregar
        this.loadDailyData();
      },
      (error) => {
        console.error('Error adding daily earnings:', error);
      }
    );
  }

  onLogout() {
    this.authService.logout();
  }


  ngAfterViewInit() {
    // Cargar scripts antes de obtener la información del usuario

    // Hacer la solicitud al servicio para obtener la información del usuario
    this.tasksService.getCurrentUser().subscribe((usuario: any) => {

      // Obtener el primer nombre del usuario
      this.UsernameBox = usuario.nombres.split(' ')[0];
      
      // Asignar los valores del usuario a las propiedades correspondientes
      //this.userId = usuario._id;
      this.dniUsuario = usuario.dni;
      this.nombresUsuario = usuario.nombres;
      this.apellidosUsuario = usuario.apellidos;
      this.emailUsuario = usuario.email;
    
      //this.datosUsuarioPerfil = [this.dniUsuario,this.nombresUsuario,this.apellidosUsuario,this.edadUsuario,this.pesoUsuario,this.estaturaUsuario,this.emailUsuario,this.telefonoUsuario,this.fotoPerfilUsuario] 
    });

    // Esperar a que el recurso de audio se cargue completamente
    this.SuccessSound.nativeElement.addEventListener('loadeddata', () => {
      console.log('Audio loaded successfully');
      // Puedes iniciar la reproducción aquí si lo deseas
    });

  }

  private loadScripts() {
    this.loadScript('assets/js/app.min.js');
    this.loadScript('assets/js/sidebarmenu.js');
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

   /*
    Logica para mostrar ventanas
   */

    toggleDashboardSection() {
      this.showDashboardSection = true;
      this.showAddUserSection = false;
      this.showMyProfileSection = false;
      this.showSearchSection = false;
      this.showRenewSection = false;
      this.showAddRoutineSection = false;
      this.showSearchSectionRoutine = false;
      this.showApplyRoutine = false;
      this.showSearchUserRoutine = false;
      
      this.VaciarDatosSearchRutinas();

      if(this.SearchDni){
        this.VaciarDatosSearch();
        this.VaciarRutinasSearchUser();
      }

    }
    
    toggleAddUserSection() {
      this.showAddUserSection = true;
      this.showDashboardSection = false;
      this.showMyProfileSection = false;
      this.showSearchSection = false;
      this.showRenewSection = false;
      this.showAddRoutineSection = false;
      this.showSearchSectionRoutine = false;
      this.showApplyRoutine = false;
      this.showSearchUserRoutine = false;

      if(this.SearchDni){
        this.VaciarDatosSearch();
        this.VaciarRutinasSearchUser();
      }

    }

    toggleMyProfileSection() {
      this.showMyProfileSection = true;
      this.showDashboardSection = false;
      this.showAddUserSection = false;
      this.showSearchSection = false;
      this.showRenewSection = false;
      this.showAddRoutineSection = false;
      this.showSearchSectionRoutine = false;
      this.showApplyRoutine = false;
      this.showSearchUserRoutine = false;
      this.VaciarDatosSearchRutinas();

      if(this.SearchDni){
        this.VaciarDatosSearch();
        this.VaciarRutinasSearchUser();
      }

    }

    toggleSearchSection() {
      this.showSearchSection = true;
      this.showDashboardSection = false;
      this.showAddUserSection = false;
      this.showMyProfileSection = false;
      this.showRenewSection = false;
      this.showAddRoutineSection = false;
      this.showSearchSectionRoutine = false;
      this.showApplyRoutine = false;
      this.showSearchUserRoutine = false;
      this.VaciarDatosSearch();
      this.VaciarDatosSearchRutinas();
      this.VaciarRutinasSearchUser();

      this.getExpiredUsers();

    }

    toggleSearchSectionRoutine() {
      this.showSearchSection = false;
      this.showDashboardSection = false;
      this.showAddUserSection = false;
      this.showMyProfileSection = false;
      this.showRenewSection = false;
      this.showAddRoutineSection = false;
      this.showSearchSectionRoutine = true;
      this.showApplyRoutine = false;
      this.showSearchUserRoutine = false;
      this.VaciarDatosSearch();
      this.VaciarDatosSearchRutinas();
      this.VaciarRutinasSearchUser();
    }

    toggleRenewSection() {
      this.showRenewSection = true;
      this.showDashboardSection = false;
      this.showAddUserSection = false;
      this.showMyProfileSection = false;
      this.showSearchSection = false;
      this.showAddRoutineSection = false;
      this.showSearchSectionRoutine = false;
      this.showApplyRoutine = false;
      this.showSearchUserRoutine = false;
      this.VaciarDatosSearchRutinas();
      
      this.getExpiredUsers();

      if(this.SearchDni){
        this.VaciarDatosSearch();
        this.VaciarRutinasSearchUser();
      }

    }

    toggleAddRoutineSection(){
      this.showDashboardSection = false;
      this.showAddUserSection = false;
      this.showMyProfileSection = false;
      this.showSearchSection = false;
      this.showRenewSection = false;
      this.showAddRoutineSection = true;
      this.showSearchSectionRoutine = false;
      this.showApplyRoutine = false;
      this.showSearchUserRoutine = false;
      this.VaciarDatosSearchRutinas();

      if(this.SearchDni){
        this.VaciarDatosSearch();
        this.VaciarRutinasSearchUser();
      }
    }

    toggleApplyRoutine(){
      this.showDashboardSection = false;
      this.showAddUserSection = false;
      this.showMyProfileSection = false;
      this.showSearchSection = false;
      this.showRenewSection = false;
      this.showAddRoutineSection = false;
      this.showSearchSectionRoutine = false;
      this.showApplyRoutine = true;
      this.showSearchUserRoutine = false;
      this.VaciarDatosSearchRutinas();

      if(this.SearchDni){
        this.VaciarDatosSearch();
        this.VaciarRutinasSearchUser();
      }
    }

    toggleSearchUserRoutine(){
      this.showDashboardSection = false;
      this.showAddUserSection = false;
      this.showMyProfileSection = false;
      this.showSearchSection = false;
      this.showRenewSection = false;
      this.showAddRoutineSection = false;
      this.showSearchSectionRoutine = false;
      this.showApplyRoutine = false;
      this.showSearchUserRoutine = true;
      this.VaciarDatosSearchRutinas();

      if(this.SearchDni){
        this.VaciarDatosSearch();
        this.VaciarRutinasSearchUser();
      }
    }

    addUser() {

      // Verificar si los campos son válidos
      if (!this.validateFields()) {
        // Campos no válidos, muestra algún mensaje de error o lógica aquí si es necesario
        $('#liveToast').toast('show');
        return;
      }

      this.tasksService.addUser(this.newUser).subscribe(
        (response) => {
          console.log('User added successfully:', response);

          // Resetea el objeto newUser después de agregar un usuario
          this.resetNewUser();
    
          // Actualiza la lista de usuarios después de la adición
          this.loadUsers();
    
          // Calcula la nueva cantidad de páginas después de la adición
          this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    
          // Determina la página que contiene el nuevo usuario
          const newPage = Math.ceil((this.totalUsers + 1) / this.pageSize);
    
          // Actualiza la página actual
          this.currentPage = newPage;

          // Éxito al agregar el usuario, ahora actualiza la gráfica
          this.loadEarningsData();
          
          // Cierra el modal después de la adición
          $('#addUserModal').modal('hide');
    
          // Muestra el mensaje de éxito después de la adición
          this.showAddSuccessMessage();
        },
        (error) => {
          console.error('Error adding user:', error);
        }
      );
    }
    
    validateFields(): boolean {
      // Verifica si los campos obligatorios están llenos
      return !!this.newUser.dni && !!this.newUser.nombres && !!this.newUser.apellidos && !!this.newUser.email && !!this.newUser.initial_date;
    }

    addRoutine() {
      // Verificar si los campos son válidos
      if (!this.validateFieldsRoutine()) {
        // Campos no válidos, muestra algún mensaje de error o lógica aquí si es necesario
        $('#liveToast').toast('show');
        return;
      }
    
      this.tasksService.addRoutine(this.newRoutine).subscribe(
        (response) => {
          console.log('Routine added successfully:', response);
    
          // Resetea el objeto newRoutine después de agregar una rutina
          this.resetNewRoutine();
    
          // Actualiza la lista de rutinas después de la adición
          this.loadRoutines();
    
          // Calcula la nueva cantidad de páginas después de la adición
          this.totalPagesRoutines = Math.ceil(this.totalRutinas / this.pageSizeRoutines);
    
          // Determina la página que contiene la nueva rutina
          const newPage = Math.ceil((this.totalRutinas + 1) / this.pageSizeRoutines);
    
          // Actualiza la página actual
          this.currentPageRoutines = newPage;
    
          // Cierra el modal después de la adición
          $('#addRoutineModal').modal('hide');
    
          // Muestra el mensaje de éxito después de la adición
          this.showAddSuccessMessageRoutines();
        },
        (error) => {
          console.error('Error adding routine:', error);
        }
      );
    }
    
    validateFieldsRoutine(): boolean {
      // Verifica si los campos obligatorios están llenos
      return !!this.newRoutine.nombre && !!this.newRoutine.tipo_rutina && !!this.newRoutine.repeticiones && !!this.newRoutine.descripcion;
    }
    

    deleteUser() {
      if (this.userToDelete) {
        const userDni = this.userToDelete.dni;
        //console.log(userId)

        this.tasksService.deleteUser(userDni).subscribe(
          (response) => {
            console.log('User deleted successfully:', response);
    
            // Elimina el usuario de la lista local antes de actualizar el número total de usuarios
            this.users = this.users.filter(user => user.dni !== userDni);
            // Actualiza el número total de usuarios después de la eliminación
            this.totalUsers = this.users.length;
            // Actualiza el número total de páginas después de la eliminación
            this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
    
            // Ajusta la página actual si es mayor que el nuevo número total de páginas
            if (this.currentPage > this.totalPages) {
              this.currentPage = this.totalPages;
            }
    
            // Cierra el modal después de la eliminación
            $('#deleteUser').modal('hide');
            // Muestra el mensaje de éxito después de la eliminación
            this.showDeleteSuccessMessage();
          },
          (error) => {
            console.error('Error deleting user:', error);
          }
        );

      }
    }
    
    deleteRoutine() {
      if (this.routineToDelete) {
        const routineId = this.routineToDelete.id;
        //console.log(userId)

        this.tasksService.deleteRoutine(routineId).subscribe(
          (response) => {
            console.log('Routine deleted successfully:', response);
    
            // Elimina el usuario de la lista local antes de actualizar el número total de usuarios
            this.rutinas = this.rutinas.filter(rutina => rutina.id !== routineId);
            // Actualiza el número total de usuarios después de la eliminación
            this.totalRutinas = this.rutinas.length;
            // Actualiza el número total de páginas después de la eliminación
            this.totalPagesRoutines = Math.ceil(this.totalRutinas / this.pageSizeRoutines);
    
            // Ajusta la página actual si es mayor que el nuevo número total de páginas
            if (this.currentPageRoutines > this.totalPagesRoutines) {
              this.currentPageRoutines = this.totalPagesRoutines;
            }
    
            // Cierra el modal después de la eliminación
            $('#deleteRoutine').modal('hide');
            // Muestra el mensaje de éxito después de la eliminación
            this.showDeleteSuccessMessageRoutines();
          },
          (error) => {
            console.error('Error deleting user:', error);
          }
        );

      }
    }

    // Lógica para eliminar todos los registros
    deleteUsers() {
      this.tasksService.deleteAllUsers().subscribe(
        (response) => {
          console.log('All users deleted successfully:', response);
          this.loadUsers(); // Actualiza la lista de componentes después de la eliminación
          $('#deleteUserModal').modal('hide'); // Cierra el modal
          this.showDeleteAllSuccessMessage(); // Muestra el mensaje de eliminación exitosa
        },
        (error) => {
          console.error('Error deleting components:', error);
        }
      );
    }

    deleteRoutines() {
      this.tasksService.deleteAllRoutines().subscribe(
        (response) => {
          console.log('All routines deleted successfully:', response);
          this.loadRoutines(); // Actualiza la lista de componentes después de la eliminación
          $('#deleteRoutineModal').modal('hide'); // Cierra el modal
          this.showDeleteAllSuccessMessageRoutines(); // Muestra el mensaje de eliminación exitosa
        },
        (error) => {
          console.error('Error deleting components:', error);
        }
      );
    }

    //Funcion para editar un usuario
    editUser() {
      const userDni = this.editedUser.dni;
      this.tasksService.updateUser(userDni, this.editedUser).subscribe(
        (response) => {
          console.log('User updated successfully:', response);
          this.resetEditUser();
          $('#editUserModal').modal('hide');
          this.loadUsers();
          this.showEditSuccessMessage();
        },
        (error) => {
          const object = 'editSection';
          this.showErrorMessage(object);
          console.error('Error updating user:', error);
        }
      );
    }

    editRoutine() {
      const routineId = this.editedRoutine.id;
      this.tasksService.updateRoutine(routineId, this.editedRoutine).subscribe(
        (response) => {
          console.log('Routine updated successfully:', response);
          this.resetEditRoutine();
          $('#editRoutineModal').modal('hide');
          this.loadRoutines();
          this.showEditSuccessMessageRoutine();
        },
        (error) => {
          const object = 'editSection';
          this.showErrorMessage(object);
          console.error('Error updating user:', error);
        }
      );
    }

    applyRoutine() {
      const IdPersona = this.ApplyPerson.dni;
      const IdRoutine = { IdRoutine: this.ApplyRoutine.id };

      // Verifica que se haya proporcionado un ID de usuario
      if (!IdPersona) {
        console.error('ID de persona no proporcionado.');
        return;
      }

      this.tasksService.applyRoutine(IdPersona, IdRoutine).subscribe(
        (response) => {
          console.log('Routine apply successfully:', response);
          this.resetApplyRoutine();
          $('#ApplyRoutineModal').modal('hide');
          this.showApplySuccessMessageRoutine();
        },
        (error) => {
          $('#ApplyRoutineModal').modal('hide');
          const object = 'applySection';
          this.showErrorMessage(object);
          console.error('Error apply routine to user:', error);
        }
      );
    }
    

    openEditUserModal(user: any) {
      this.editedUser = { ...user };
      this.isEditing = true;
    }

    openEditRoutineModal(routine: any) {
      this.editedRoutine = { ...routine };
      this.isEditing = true;
    }

    openApplyRoutineModal(routine: any) {
      this.ApplyRoutine = { ...routine };
      this.isApplying = true;
    }

    resetEditUser() {
      this.editedUser = {};
      this.isEditing = false;
    }

    resetEditRoutine() {
      this.editedRoutine = {};
      this.isEditing = false;
    }

    resetApplyRoutine() {
      this.ApplyRoutine = {};
      this.isApplying = false;
    }

    openDeleteUserModal(user: any) {
      this.userToDelete = user;
      //console.log('Component to delete:', this.userToDelete);
    }

    openDeleteRoutineModal(routine: any) {
      this.routineToDelete = routine;
      //console.log('Component to delete:', this.userToDelete);
    }

    //RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRutinas
    showAddSuccessMessageRoutines() {
      // Reproducir el sonido
      const audioElement: HTMLAudioElement = this.SuccessSound.nativeElement;
      audioElement.play();
      $('#messageText').html('Congratulations, <br><br>La rutina ha sido agregado satisfactoriamente <br>a la base de datos.');
      $('#messageModal').modal('show');
    }


    showAddSuccessMessage() {
      // Reproducir el sonido
      const audioElement: HTMLAudioElement = this.SuccessSound.nativeElement;
      audioElement.play();
      $('#messageText').html('Congratulations, <br><br>El usuario ha sido agregado satisfactoriamente <br>a la base de datos.');
      $('#messageModal').modal('show');
    }

    showDeleteAllSuccessMessage() {
      // Reproducir el sonido
      const audioElement: HTMLAudioElement = this.SuccessSound.nativeElement;
      audioElement.play();
      $('#messageText').html('Congratulations, <br><br>Todos los usuarios han sido eliminados satisfactoriamente <br>de la base de datos.');
      $('#messageModal').modal('show');
    }

    showDeleteAllSuccessMessageRoutines() {
      // Reproducir el sonido
      const audioElement: HTMLAudioElement = this.SuccessSound.nativeElement;
      audioElement.play();
      $('#messageText').html('Congratulations, <br><br>Todas las rutinas han sido eliminadas satisfactoriamente <br>de la base de datos.');
      $('#messageModal').modal('show');
    }

    showDeleteSuccessMessageRoutines() {
      // Reproducir el sonido
      const audioElement: HTMLAudioElement = this.SuccessSound.nativeElement;
      audioElement.play();
      $('#messageText').html('Congratulations, <br><br>La rutina ha sido eliminado satisfactoriamente <br>de la base de datos.');
      $('#messageModal').modal('show');
    }

    showDeleteSuccessMessage() {
      // Reproducir el sonido
      const audioElement: HTMLAudioElement = this.SuccessSound.nativeElement;
      audioElement.play();
      $('#messageText').html('Congratulations, <br><br>El usuario ha sido eliminado satisfactoriamente <br>de la base de datos.');
      $('#messageModal').modal('show');
    }

    showRenewSuccessMessage() {
      // Reproducir el sonido
      const audioElement: HTMLAudioElement = this.SuccessSound.nativeElement;
      audioElement.play();
      $('#messageText').html('Congratulations, <br><br>El usuario ha sido renovado satisfactoriamente <br>en la base de datos.');
      $('#messageModal').modal('show');
      this.getExpiredUsers();
    }

    showErrorMessage(objeto: string){
      if(objeto === 'SearchSection'){
        $('#messageTextError').html('Error, <br><br>El usuario no existe o no ha sido creado<br>en la base de datos.');
        $('#messageErrorModal').modal('show');
      }else if(objeto === 'editSection'){
        $('#messageText').html('Error, <br><br>Existe un error al intentar editar el usuario<br>en la base de datos.');
        $('#messageErrorModal').modal('show');        
      }else if(objeto === 'applySection'){
        $('#messageText').html('Error, <br><br>Existe un error al intentar asignar una rutina a un usuario<br>en la base de datos.');
        $('#messageErrorModal').modal('show');        
      }
    }

    showEditSuccessMessageRoutine() {
      // Reproducir el sonido
      const audioElement: HTMLAudioElement = this.SuccessSound.nativeElement;
      audioElement.play();
      $('#messageText').html('Congratulations, <br><br>La rutina se ha actualizado satisfactoriamente <br>en la base de datos.');
      $('#messageModal').modal('show');
    }

    showApplySuccessMessageRoutine() {
      // Reproducir el sonido
      const audioElement: HTMLAudioElement = this.SuccessSound.nativeElement;
      audioElement.play();
      $('#messageText').html('Congratulations, <br><br>La rutina se ha asignado correctamente al usuario <br>en la base de datos.');
      $('#messageModal').modal('show');
    }

    showEditSuccessMessage() {
      // Reproducir el sonido
      const audioElement: HTMLAudioElement = this.SuccessSound.nativeElement;
      audioElement.play();
      $('#messageText').html('Congratulations, <br><br>El usuario se ha actualizado satisfactoriamente <br>en la base de datos.');
      $('#messageModal').modal('show');
    }

    private resetNewUser() {
      // Reinicia el objeto newUser después de agregar un usuario
      this.newUser = {
        dni: '',
        nombres: '',
        apellidos: '',
        email: '',
        initial_date: '',
        final_date: '',
        password: '',
        role: '',
      };
    }

    private resetNewRoutine() {
      // Reinicia el objeto newUser después de agregar un usuario
      this.newRoutine = {
        nombre: '',
        tipo_rutina: '',
        repeticiones: '',
        descripcion: '',
      };
    }

    loadUsers() {
      this.tasksService.getUsers().subscribe(
        (response) => {
          //console.log('Response:', response);
          // Filtrar usuarios con el rol "user"
          //this.users = response.filter(user => user.role === 'user');
          this.users = response;
          this.totalUsers = this.users.length;
          this.totalPages = Math.ceil(this.totalUsers / this.pageSize);
          //this.getExpiredUsers();
          // Ajusta la página actual si es mayor que el nuevo número total de páginas
         // if (this.currentPage > this.totalPages) {
            //this.currentPage = this.totalPages;
          //}

        },
        (error) => {
          console.error('Error getting users:', error);
        }
      );
    }

    loadRoutines() {
      this.tasksService.getRoutines().subscribe(
        (response) => {
          //console.log('Response:', response);
          // Filtrar usuarios con el rol "user"
          //this.users = response.filter(user => user.role === 'user');
          this.rutinas = response;
          this.totalRutinas = this.rutinas.length;
          this.totalPagesRoutines = Math.ceil(this.totalRutinas / this.pageSizeRoutines);
          //this.getExpiredUsers();
          // Ajusta la página actual si es mayor que el nuevo número total de páginas
         // if (this.currentPage > this.totalPages) {
            //this.currentPage = this.totalPages;
          //}

        },
        (error) => {
          console.error('Error getting users:', error);
        }
      );
    }

    getUsersForPage() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.users.slice(startIndex, endIndex);
    }

    getRutinasForPage() {
      const startIndex = (this.currentPageRoutines - 1) * this.pageSizeRoutines;
      const endIndex = startIndex + this.pageSizeRoutines;
      return this.rutinas.slice(startIndex, endIndex);
    }

    getRutinasForPageSearch() {
      const startIndex = (this.currentPageRoutinesForSearch - 1) * this.pageSizeRoutinesForSearch;
      const endIndex = startIndex + this.pageSizeRoutinesForSearch;
      return this.rutinasSearch.slice(startIndex, endIndex);
    }

    getRutinasForPageSearchandUser() {
      const startIndex = (this.currentPageRoutines - 1) * this.pageSizeRoutines;
      const endIndex = startIndex + this.pageSizeRoutines;
      return this.rutinasUsuario.slice(startIndex, endIndex);
    }

    getExpiredUsers() {
      this.tasksService.getExpiredUsers().subscribe(
        (data) => {
          // Manejar los usuarios vencidos obtenidos del backend
          //console.log(data);
          this.expiredUsers = data;
        },
        (error) => {
          console.error(error);
          // Manejar el error
        }
      );
    }

    changePage(page: number) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }


    changePageRoutine(page: number) {
      if (page >= 1 && page <= this.totalPagesRoutines) {
        this.currentPageRoutines = page;
      }
    }

    changePageRoutinesForSearch(page: number) {
      if (page >= 1 && page <= this.totalPagesRoutinesForSearch) {
        this.currentPageRoutinesForSearch = page;
      }
    }

    getPages() {
      const maxPagesToShow = 3;
      //const totalPages = Math.ceil(this.totalUsers / this.pageSize);
    
      // Calcula el rango de páginas a mostrar
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
      // Ajusta el rango si está demasiado cerca del principio o final
      const adjustment = maxPagesToShow - (endPage - startPage + 1);
      startPage = Math.max(1, startPage - adjustment);
      endPage = Math.min(this.totalPages, endPage + adjustment);
    
      return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
    }

    getPagesRoutines() {
      const maxPagesToShow = 3;
      //const totalPages = Math.ceil(this.totalUsers / this.pageSize);

      // Calcula el rango de páginas a mostrar
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPagesRoutines, startPage + maxPagesToShow - 1);
    
      // Ajusta el rango si está demasiado cerca del principio o final
      const adjustment = maxPagesToShow - (endPage - startPage + 1);
      startPage = Math.max(1, startPage - adjustment);
      endPage = Math.min(this.totalPagesRoutines, endPage + adjustment);
    
      return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
    }

    getPagesRoutinesForSearch() {
      const maxPagesToShow = 3;
      //const totalPages = Math.ceil(this.totalUsers / this.pageSize);

      //Calculo.
      this.totalPagesRoutinesForSearch = Math.ceil(this.totalRutinasSearch / this.pageSizeRoutinesForSearch);

      // Calcula el rango de páginas a mostrar
      let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
      let endPage = Math.min(this.totalPagesRoutinesForSearch, startPage + maxPagesToShow - 1);
      // Ajusta el rango si está demasiado cerca del principio o final
      const adjustment = maxPagesToShow - (endPage - startPage + 1);
      startPage = Math.max(1, startPage - adjustment);
      endPage = Math.min(this.totalPagesRoutinesForSearch, endPage + adjustment);
    
      return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
    }

    searchUserByDni() {
      // Obtener el valor del campo de búsqueda
      const dniToSearch = (<HTMLInputElement>document.getElementById('search')).value;

      // Verificar si el campo de búsqueda está vacío
      if (!dniToSearch.trim()) {
        // Mostrar un toast indicando que el campo está vacío
        $('#liveToast').toast('show');
        return;
      }

      // Llamar al servicio para buscar el usuario por DNI
      this.tasksService.searchUserByDni(dniToSearch).subscribe(
        (user: any) => {
          // Verificar si se encontró el usuario
          if (user) {
            // Asignar los valores del usuario encontrado a las propiedades correspondientes
            this.SearchDni = user.dni;
            this.SearchNombres = user.nombres;
            this.SearchApellidos = user.apellidos;
            this.SearchEmail = user.email;
            this.SearchFechaInicial = user.initial_date;
            this.SearchFechaFinal = user.final_date;
    
            // Lógica para determinar el estado de la mensualidad
            const currentDate = new Date();
            const finalDate = new Date(user.final_date);

            // Crear nuevas fechas solo con año, mes y día
            const finalDateWithoutTime = new Date(finalDate.getFullYear(), finalDate.getMonth(), finalDate.getDate());
            const currentDateWithoutTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

            if (finalDateWithoutTime < currentDateWithoutTime) {
              this.SearchEstadoMensualidad = 'Mes Finalizado';
              this.SearchEstadoMensualidadIcon = 'ti-dashboard';
              this.SearchEstadoMensualidadColor = 'text-danger';
            } else if (finalDateWithoutTime.getTime() === currentDateWithoutTime.getTime()) {
              this.SearchEstadoMensualidad = 'Cobrar Hoy';
              this.SearchEstadoMensualidadIcon = 'ti-flag';
              this.SearchEstadoMensualidadColor = 'text-warning';
            } else {
              this.SearchEstadoMensualidad = 'En Orden';
              this.SearchEstadoMensualidadIcon = 'ti-check';
              this.SearchEstadoMensualidadColor = 'text-success';
            }

          }


        },
        (error) => {
          const object = 'SearchSection';
          this.showErrorMessage(object);
          console.error('Error searching user:', error);
        }
      );
    }

    searchUserByDniandRoutine() {
      // Obtener el valor del campo de búsqueda
      const dniToSearch = (<HTMLInputElement>document.getElementById('search')).value;

      // Verificar si el campo de búsqueda está vacío
      if (!dniToSearch.trim()) {
        // Mostrar un toast indicando que el campo está vacío
        $('#liveToast').toast('show');
        return;
      }

      // Llamar al servicio para buscar el usuario por DNI
      this.tasksService.searchUserByDni(dniToSearch).subscribe(
        (user: any) => {
          // Verificar si se encontró el usuario
          if (user) {
            // Asignar los valores del usuario encontrado a las propiedades correspondientes
            this.SearchDni = user.dni;
            this.SearchNombres = user.nombres;
            this.SearchApellidos = user.apellidos;
            this.SearchEmail = user.email;
            this.SearchFechaInicial = user.initial_date;
            this.SearchFechaFinal = user.final_date;
    
            // Lógica para determinar el estado de la mensualidad
            const currentDate = new Date();
            const finalDate = new Date(user.final_date);

            // Crear nuevas fechas solo con año, mes y día
            const finalDateWithoutTime = new Date(finalDate.getFullYear(), finalDate.getMonth(), finalDate.getDate());
            const currentDateWithoutTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

            if (finalDateWithoutTime < currentDateWithoutTime) {
              this.SearchEstadoMensualidad = 'Mes Finalizado';
              this.SearchEstadoMensualidadIcon = 'ti-dashboard';
              this.SearchEstadoMensualidadColor = 'text-danger';
            } else if (finalDateWithoutTime.getTime() === currentDateWithoutTime.getTime()) {
              this.SearchEstadoMensualidad = 'Cobrar Hoy';
              this.SearchEstadoMensualidadIcon = 'ti-flag';
              this.SearchEstadoMensualidadColor = 'text-warning';
            } else {
              this.SearchEstadoMensualidad = 'En Orden';
              this.SearchEstadoMensualidadIcon = 'ti-check';
              this.SearchEstadoMensualidadColor = 'text-success';
            }

          }

        // Llamar al servicio para obtener las rutinas del usuario
        this.tasksService.getUserRoutines(user.dni).subscribe(
          (rutinas: any[]) => {
            // Asignar las rutinas del usuario al arreglo
            this.rutinasUsuario = rutinas;
            this.totalRutinasSearchandUser = rutinas.length;
          },
          (error) => {
            // Manejo de errores al obtener las rutinas del usuario
          }
        );

        },
        (error) => {
          const object = 'SearchSection';
          this.showErrorMessage(object);
          console.error('Error searching user:', error);
        }
      );
    }

    searchRoutineByName() {
      // Obtener el valor del campo de búsqueda
      const nombreToSearch = (<HTMLInputElement>document.getElementById('search')).value;
    
      // Verificar si el campo de búsqueda está vacío
      if (!nombreToSearch.trim()) {
        // Mostrar un toast indicando que el campo está vacío
        $('#liveToast').toast('show');
        return;
      }
    
      // Llamar al servicio para buscar las rutinas por nombre
      this.tasksService.searchRoutineByName(nombreToSearch).subscribe(
        (rutinas: any[]) => {
          // Asignar los resultados de la búsqueda a la lista de rutinas
          this.rutinasSearch = rutinas;
          this.totalRutinasSearch = rutinas.length;
        },
        (error) => {
          console.error('Error searching routines:', error);
        }
      );
    }
    

    VaciarDatosSearch(){
      this.SearchDni = '';
      this.SearchNombres = '';
      this.SearchApellidos = '';
      this.SearchEmail = '';
      this.SearchFechaInicial = '';
      this.SearchFechaFinal = '';
      this.SearchEstadoMensualidad = '';
      this.SearchEstadoMensualidadIcon = '';
      this.SearchEstadoMensualidadColor = '';
    }

    VaciarRutinasSearchUser(){
      this.rutinasUsuario = [];
    }

    VaciarDatosSearchRutinas(){
      this.rutinasSearch = [];
      this.totalRutinasSearch = '';
    }

    renovarUsuario(userId: string) {
      this.tasksService.renewUser(userId).subscribe(
        (response) => {
          console.log('Usuario renovado:', response);
          this.showRenewSuccessMessage();
          // Actualizar la lista de usuarios o realizar otras acciones necesarias
        },
        (error) => {
          console.error('Error renovando usuario:', error);
        }
      );
    }

}
