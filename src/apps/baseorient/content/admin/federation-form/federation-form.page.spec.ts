import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FederationFormPage } from './federation-form.page';

describe('FederationFormPage', () => {
  let component: FederationFormPage;
  let fixture: ComponentFixture<FederationFormPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FederationFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
