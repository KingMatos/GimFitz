import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateTasksAdminsComponent } from './private-tasks-admins.component';

describe('PrivateTasksAdminsComponent', () => {
  let component: PrivateTasksAdminsComponent;
  let fixture: ComponentFixture<PrivateTasksAdminsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrivateTasksAdminsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivateTasksAdminsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
