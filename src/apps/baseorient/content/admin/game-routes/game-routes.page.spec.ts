import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameRoutePage } from './game-route.page';

describe('GameRoutePage', () => {
  let component: GameRoutePage;
  let fixture: ComponentFixture<GameRoutePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(GameRoutePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
