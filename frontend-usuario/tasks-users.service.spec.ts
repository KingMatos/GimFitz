import { TestBed } from '@angular/core/testing';

import { TasksUsersService } from './tasks-users.service';

describe('TasksUsersService', () => {
  let service: TasksUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasksUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
