import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ModalDialogService } from '../../services/modal-dialog.service';

import { Empresa } from '../../models/empresa';
import { EmpresasService } from '../../services/empresas.service';

@Component({
  selector: 'app-empresas',
  templateUrl: './empresas.component.html',
  styleUrls: ['./empresas.component.css'],
})
export class EmpresasComponent implements OnInit {
  titulo = 'Empresas';
  TituloAccionABMC = {
    A: '(Agregar)',
    B: '(Eliminar)',
    M: '(Modificar)',
    C: '(Consultar)',
    L: '(Listado)',
  };
  AccionABMC = 'L';
  Items: Empresa[] = null;
  submitted: boolean = false;
  FormRegistro: FormGroup;

  constructor(
    public formBuilder: FormBuilder,
    private empresasService: EmpresasService,
    private modalDialogService: ModalDialogService
  ) {}

  ngOnInit() {
    this.FormRegistro = this.formBuilder.group({
      RazonSocial: [
        null,
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],

      CantidadEmpleados: [
        null,
        [Validators.required, Validators.pattern('^\\d{1,9}$')],
      ],

      FechaFundacion: [
        null,
        [
          Validators.required,
          Validators.pattern(
            '(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}'
          ),
        ],
      ],
    });
  }

  BuscarPorId(Dto, AccionABMC) {
    window.scroll(0, 0); // ir al incio del scroll

    this.empresasService.getById(Dto.IdEmpresa).subscribe((res: any) => {
      this.FormRegistro.patchValue(res);

      //formatear fecha de  ISO 8061 a string dd/MM/yyyy
      var arrFecha = res.FechaFundacion.substr(0, 10).split('-');
      this.FormRegistro.controls.FechaFundacion.patchValue(
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
    this.empresasService.get().subscribe((res: any) => {
      this.Items = res;
    });
  }

  Grabar() {
    this.submitted = true;
    if (this.FormRegistro.invalid) {
      return;
    }

    const itemCopy = { ...this.FormRegistro.value };

    var arrFecha = itemCopy.FechaFundacion.substr(0, 10).split('/');
    if (arrFecha.length == 3)
      itemCopy.FechaFundacion = new Date(
        arrFecha[2],
        arrFecha[1] - 1,
        arrFecha[0]
      ).toISOString();

    if (this.AccionABMC == 'A') {
      this.empresasService.post(itemCopy).subscribe((res: any) => {
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
