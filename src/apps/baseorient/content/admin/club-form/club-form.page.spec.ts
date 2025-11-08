import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubFormPage } from './club-form.page';

describe('ClubFormPage', () => {
  let component: ClubFormPage;
  let fixture: ComponentFixture<ClubFormPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ClubFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
