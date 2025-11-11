import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultDetailPage } from './result-detail.page';

describe('ResultDetailPage', () => {
  let component: ResultDetailPage;
  let fixture: ComponentFixture<ResultDetailPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ResultDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
