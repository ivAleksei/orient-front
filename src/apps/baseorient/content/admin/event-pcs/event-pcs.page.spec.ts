import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventPcPage } from './event-pc.page';

describe('EventPcPage', () => {
  let component: EventPcPage;
  let fixture: ComponentFixture<EventPcPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EventPcPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
