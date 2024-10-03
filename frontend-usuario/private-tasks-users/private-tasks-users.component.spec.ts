import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateTasksUsersComponent } from './private-tasks-users.component';

describe('PrivateTasksUsersComponent', () => {
  let component: PrivateTasksUsersComponent;
  let fixture: ComponentFixture<PrivateTasksUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrivateTasksUsersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivateTasksUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
