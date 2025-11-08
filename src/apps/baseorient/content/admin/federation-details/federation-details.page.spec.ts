import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FederationDetailPage } from './federation-detail.page';

describe('FederationDetailPage', () => {
  let component: FederationDetailPage;
  let fixture: ComponentFixture<FederationDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FederationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
