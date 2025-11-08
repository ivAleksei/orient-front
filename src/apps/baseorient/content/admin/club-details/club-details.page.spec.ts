import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubDetailPage } from './club-detail.page';

describe('ClubDetailPage', () => {
  let component: ClubDetailPage;
  let fixture: ComponentFixture<ClubDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ClubDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
