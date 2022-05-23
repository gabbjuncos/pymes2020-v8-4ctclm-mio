import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Contacto } from '../../models/contacto';
import { ModalDialogService } from '../../services/modal-dialog.service';
import { ContactosService } from '../../services/contactos.service';

@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.component.html',
  styleUrls: ['./contactos.component.css'],
})
export class ContactosComponent implements OnInit {
  titulo = 'Contactos';
  TituloAccionABMC = {
    A: '(Agregar)',
    B: '(Eliminar)',
    M: '(Modificar)',
    C: '(Consultar)',
    L: '(Listado)',
  };
  AccionABMC = 'L';
  Items: Contacto[] = null;
  submitted: boolean = false;
  FormRegistro: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private contactosService: ContactosService,
    private modalDialogService: ModalDialogService
  ) {}

  ngOnInit() {
    this.FormRegistro = this.formBuilder.group({
      Nombre: [
        null,
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      FechaNacimiento: [
        null,
        [
          Validators.required,
          Validators.pattern(
            '(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}'
          ),
        ],
      ],
      Telefono: [null, [Validators.required, Validators.pattern('^\\d{1,9}$')]],
    });
  }

  BuscarPorId(Dto, AccionABMC) {
    window.scroll(0, 0); // ir al incio del scroll

    this.contactosService.getById(Dto.IdContacto).subscribe((res: any) => {
      this.FormRegistro.patchValue(res);

      //formatear fecha de  ISO 8061 a string dd/MM/yyyy
      var arrFecha = res.FechaNacimiento.substr(0, 10).split('-');
      this.FormRegistro.controls.FechaNacimiento.patchValue(
        arrFecha[2] + '/' + arrFecha[1] + '/' + arrFecha[0]
      );

      this.AccionABMC = AccionABMC;
    });
  }

  Consultar(Dto) {
    this.BuscarPorId(Dto, 'C');
  }

  Agregar() {
    this.AccionABMC = 'A';
    this.FormRegistro.reset({ Activo: true });
    this.submitted = false;
    this.FormRegistro.markAsUntouched();
  }

  Buscar() {
    this.contactosService.get().subscribe((res: any) => {
      this.Items = res;
    });
  }

  Grabar() {
    this.submitted = true;
    if (this.FormRegistro.invalid) {
      return;
    }

    const itemCopy = { ...this.FormRegistro.value };

    var arrFecha = itemCopy.FechaNacimiento.substr(0, 10).split('/');
    if (arrFecha.length == 3)
      itemCopy.FechaNacimiento = new Date(
        arrFecha[2],
        arrFecha[1] - 1,
        arrFecha[0]
      ).toISOString();

    if (this.AccionABMC == 'A') {
      this.contactosService.post(itemCopy).subscribe((res: any) => {
        this.Volver();
        this.modalDialogService.Alert('Contacto agregado correctamente.');
        this.Buscar();
      });
    }
  }

  Volver() {
    this.AccionABMC = 'L';
  }
}
