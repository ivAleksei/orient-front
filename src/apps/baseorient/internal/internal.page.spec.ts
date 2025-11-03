import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InternalPage } from './internal.page';

describe('InternalPage', () => {
  let component: InternalPage;
  let fixture: ComponentFixture<InternalPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(InternalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
