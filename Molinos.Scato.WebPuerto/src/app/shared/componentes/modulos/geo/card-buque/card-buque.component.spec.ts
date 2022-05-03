import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardBuqueComponent } from './card-buque.component';

describe('CardBuqueComponent', () => {
  let component: CardBuqueComponent;
  let fixture: ComponentFixture<CardBuqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardBuqueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardBuqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
