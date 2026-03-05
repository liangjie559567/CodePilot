import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createSession,
  getSession,
  updateSession,
  deleteSession,
  addMessage,
  getMessages
} from '@/lib/db';
import * as fs from 'fs';

describe('database operations', () => {
  const testDbPath = './test-db.sqlite';

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('session operations', () => {
    it('should create a session', async () => {
      const session = await createSession({
        workingDir: '/test',
        model: 'claude-3-5-sonnet-20241022'
      });

      expect(session.id).toBeDefined();
      expect(session.workingDir).toBe('/test');
    });

    it('should get a session by id', async () => {
      const created = await createSession({
        workingDir: '/test',
        model: 'claude-3-5-sonnet-20241022'
      });

      const retrieved = await getSession(created.id);
      expect(retrieved?.id).toBe(created.id);
    });

    it('should update session title', async () => {
      const session = await createSession({
        workingDir: '/test',
        model: 'claude-3-5-sonnet-20241022'
      });

      await updateSession(session.id, { title: 'Updated' });
      const updated = await getSession(session.id);

      expect(updated?.title).toBe('Updated');
    });

    it('should delete a session', async () => {
      const session = await createSession({
        workingDir: '/test',
        model: 'claude-3-5-sonnet-20241022'
      });

      await deleteSession(session.id);
      const deleted = await getSession(session.id);

      expect(deleted).toBeNull();
    });
  });

  describe('message operations', () => {
    it('should add a message', async () => {
      const session = await createSession({
        workingDir: '/test',
        model: 'claude-3-5-sonnet-20241022'
      });

      const message = await addMessage({
        sessionId: session.id,
        role: 'user',
        content: 'Hello'
      });

      expect(message.id).toBeDefined();
      expect(message.content).toBe('Hello');
    });

    it('should get messages for session', async () => {
      const session = await createSession({
        workingDir: '/test',
        model: 'claude-3-5-sonnet-20241022'
      });

      await addMessage({
        sessionId: session.id,
        role: 'user',
        content: 'Hello'
      });

      await addMessage({
        sessionId: session.id,
        role: 'assistant',
        content: 'Hi'
      });

      const messages = await getMessages(session.id);
      expect(messages).toHaveLength(2);
    });
  });
});
