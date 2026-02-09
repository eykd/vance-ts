import { SessionBuilder } from '../../test-utils/builders/SessionBuilder';
import { MockSessionRepository } from '../../test-utils/mocks/MockSessionRepository';

import { LogoutUseCase } from './LogoutUseCase';

describe('LogoutUseCase', () => {
  let sessionRepository: MockSessionRepository;
  let useCase: LogoutUseCase;

  beforeEach(() => {
    sessionRepository = new MockSessionRepository();
    useCase = new LogoutUseCase(sessionRepository);
  });

  it('deletes the session and returns ok for a valid session ID', async () => {
    const session = new SessionBuilder()
      .withSessionId('550e8400-e29b-41d4-a716-446655440000')
      .build();
    sessionRepository.addSession(session);

    const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440000');

    expect(result.success).toBe(true);
    expect(sessionRepository.getById('550e8400-e29b-41d4-a716-446655440000')).toBeUndefined();
  });

  it('returns ok for an invalid UUID without calling delete', async () => {
    const result = await useCase.execute('not-a-uuid');

    expect(result.success).toBe(true);
    expect(sessionRepository.deleteCalls).toHaveLength(0);
  });

  it('returns ok for a non-existent session', async () => {
    const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440000');

    expect(result.success).toBe(true);
  });

  it('records the delete call with the correct session ID', async () => {
    const session = new SessionBuilder()
      .withSessionId('660e8400-e29b-41d4-a716-446655440000')
      .build();
    sessionRepository.addSession(session);

    await useCase.execute('660e8400-e29b-41d4-a716-446655440000');

    expect(sessionRepository.deleteCalls).toEqual(['660e8400-e29b-41d4-a716-446655440000']);
  });
});
