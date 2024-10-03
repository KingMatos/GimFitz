import { Component, Renderer2 } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'

declare var $: any; // variable $ para que TypeScript no dé error

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  user = {
    dni: '',
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    role: ''
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2
  ) { }

  ngAfterViewInit() {
    this.loadScripts();
  }

  signIn() {

    // Verificar si los campos son válidos
    if (!this.validateFields()) {
      // Campos no válidos, muestra algún mensaje de error o lógica aquí si es necesario
      $('#liveToast').toast('show');
      return;
    }

    this.authService.signInUser(this.user)
      .subscribe(
        res => {
          //console.log('Token:', res);
          // Verificar el rol y redirigir en consecuencia
          if (res.role === 'user') {
            localStorage.setItem('token', res.token)
            this.router.navigate(['/private-users']);
          } else if (res.role === 'admin') {
            localStorage.setItem('token', res.token)
            this.router.navigate(['/private-admins']);
          }else{
            console.log('Unknown role');
          }
          
        },
        err => {
          console.log(err)
          if (err.error === 'Wrong Password') {
            // Muestra el modal aquí (puedes usar algún servicio de modal o implementar tu propia lógica)
            const opcion = "WrongPassword";
            this.showErrorModal(opcion);
          }else if(err.error === "The dni doesn't exists"){
            const opcion = "DniDoesntExists";
            this.showErrorModal(opcion);            
          }
        }
        
      )

      this.CloseModal();
  }

  validateFields(): boolean {
    // Verifica si los campos obligatorios están llenos
    return !!this.user.dni && !!this.user.password;
  }

  showErrorModal(opcion: String){
    if(opcion == "WrongPassword"){
      $('#messageTextError').html('Contraseña Incorrecta.');
      $('#messageErrorModal').modal('show');
    }else if(opcion == "DniDoesntExists"){
      $('#messageTextError').html('El Documento de Identidad no se encuentra registrado<br>en la base de datos.<br><br>Ingresa un Documento de Identidad válido.');
      $('#messageErrorModal').modal('show');      
    }
  }

  CloseModal(){
    $('#modalLoginForm').modal('hide'); // Cierra el modal
  }

  private loadScripts() {
    this.loadScript('assets/js/own.carousel.js');
    this.loadScript('assets/js/aboutForti.js');
  }
  
  private loadScript(scriptSrc: string) {
    if (typeof document !== 'undefined') {
      const script = this.renderer.createElement('script');
      script.src = scriptSrc;
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;
  
      this.renderer.appendChild(document.body, script);
    }
  }

  // Agregar el método onKeyPress para manejar los eventos keypress
  onKeyPress(event: any) {
    // Obtener el código de la tecla presionada
    const charCode = event.which ? event.which : event.keyCode;

    // Permitir solo números (códigos ASCII 48-57 son números)
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

}
