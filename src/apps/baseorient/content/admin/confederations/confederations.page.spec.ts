import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfederationPage } from './confederation.page';

describe('ConfederationPage', () => {
  let component: ConfederationPage;
  let fixture: ComponentFixture<ConfederationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ConfederationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
