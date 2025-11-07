import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FederationPage } from './federation.page';

describe('FederationPage', () => {
  let component: FederationPage;
  let fixture: ComponentFixture<FederationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FederationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
