import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfederationDetailPage } from './federation-detail.page';

describe('ConfederationDetailPage', () => {
  let component: ConfederationDetailPage;
  let fixture: ComponentFixture<ConfederationDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ConfederationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
