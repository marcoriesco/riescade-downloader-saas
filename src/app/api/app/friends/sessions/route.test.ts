import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { AppApiError } from '@/lib/server/app-errors';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), snapshot: vi.fn(), heartbeat: vi.fn(), presence: vi.fn(), invite: vi.fn(), respond: vi.fn(), close: vi.fn(), dismiss: vi.fn(),room:vi.fn(),preferences:vi.fn(),progress:vi.fn(),hosted:vi.fn(),hostedConnection:vi.fn() }));
vi.mock('@/lib/server/private-rooms',()=>({roomStep:mocks.room}));
vi.mock('@/lib/server/app-auth', async original => ({ ...await original<typeof import('@/lib/server/app-auth')>(), authenticateAppRequest: mocks.auth }));
vi.mock('@/lib/server/supabase-admin', () => ({ getSupabaseAdmin: () => ({}) }));
vi.mock('@/lib/server/social-sessions', () => ({ socialSnapshot: mocks.snapshot, heartbeat: mocks.heartbeat, setPresenceMode: mocks.presence, createInvitation: mocks.invite, respondInvitation: mocks.respond, closeRoom: mocks.close, dismissInvitation: mocks.dismiss,invitationPreferences:mocks.preferences,invitationProgress:mocks.progress,hostedSession:mocks.hosted,hostedConnection:mocks.hostedConnection }));
import { GET, POST } from './route';
const flag = process.env.RIESCADE_FRIENDS_ENABLED;
const request = (body: unknown) => new Request('https://test/api/app/friends/sessions', { method: 'POST', body: JSON.stringify(body) });
beforeEach(() => { vi.resetAllMocks(); process.env.RIESCADE_FRIENDS_ENABLED = 'true'; mocks.auth.mockResolvedValue({ id: 'real-actor' }); });
afterEach(() => { if (flag === undefined) delete process.env.RIESCADE_FRIENDS_ENABLED; else process.env.RIESCADE_FRIENDS_ENABLED = flag; });
it.each(['heartbeat', 'invite', 'respond', 'dismiss', 'close','room','preferences','progress','hosted'])('authenticates %s independently of body actor', async action => {
  const body = { action, actorId: 'victim' };
  const mock = mocks[action as 'heartbeat' | 'invite' | 'respond' | 'dismiss' | 'close' | 'room' | 'preferences' | 'progress' | 'hosted'];
  mock.mockResolvedValue({ ok: true });
  expect((await POST(request(body))).status).toBe(200);
  expect(mock).toHaveBeenCalledWith({}, 'real-actor', body);
});
it('rejects expired login before session writes', async () => {
  mocks.auth.mockRejectedValue(new AppApiError(401, 'Expirada'));
  expect((await POST(request({ action: 'invite' }))).status).toBe(401);
  expect(mocks.invite).not.toHaveBeenCalled();
});
it('gates snapshots and sends no-store', async () => {
  mocks.snapshot.mockResolvedValue({ invitations: [] });
  const response = await GET(new Request('https://test'));
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(mocks.snapshot).toHaveBeenCalledWith({}, 'real-actor');
  process.env.RIESCADE_FRIENDS_ENABLED = 'false';
  expect((await GET(new Request('https://test'))).status).toBe(404);
});
it('rejects malformed or oversized actions', async () => {
  expect((await POST(request({ action: 'launch' }))).status).toBe(400);
  expect((await POST(request({ action: 'invite', extra: 'x'.repeat(4096) }))).status).toBe(413);
});
it('does not expose internal session errors', async () => {
  mocks.respond.mockRejectedValue(new Error('private credentials'));
  const response = await POST(request({ action: 'respond' }));
  expect(response.status).toBe(500);
  expect(JSON.stringify(await response.json())).not.toContain('credentials');
});

it('existing-host credentials use the authenticated recipient and are never cached',async()=>{
 mocks.hostedConnection.mockResolvedValue({host:'relay.example',port:55435,session:'abcdefghijklmnop',password:'secret'});
 const body={action:'hosted-connection',invitationId:'id',actorId:'victim'};const response=await POST(request(body));
 expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('no-store');expect(mocks.hostedConnection).toHaveBeenCalledWith({},'real-actor',body);
});
