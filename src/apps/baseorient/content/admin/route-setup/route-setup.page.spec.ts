import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouteSetupPage } from './route-setup.page';

describe('RouteSetupPage', () => {
  let component: RouteSetupPage;
  let fixture: ComponentFixture<RouteSetupPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RouteSetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
