import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventRacePage } from './event-race.page';

describe('EventRacePage', () => {
  let component: EventRacePage;
  let fixture: ComponentFixture<EventRacePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EventRacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
