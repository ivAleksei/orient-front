import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RunViewerPage } from './run-viewer.page';

describe('RunViewerPage', () => {
  let component: RunViewerPage;
  let fixture: ComponentFixture<RunViewerPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RunViewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
