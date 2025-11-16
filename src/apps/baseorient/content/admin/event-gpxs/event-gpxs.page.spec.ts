import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventGpxPage } from './event-gpx.page';

describe('EventGpxPage', () => {
  let component: EventGpxPage;
  let fixture: ComponentFixture<EventGpxPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EventGpxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
