import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapSetupPage } from './map-setup.page';

describe('MapSetupPage', () => {
  let component: MapSetupPage;
  let fixture: ComponentFixture<MapSetupPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(MapSetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
