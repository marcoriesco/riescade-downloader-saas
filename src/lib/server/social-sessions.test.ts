import { describe, expect, it } from 'vitest';
import { validateUuid, validateInvitationGame } from './social-sessions';
describe('social session input projection', () => {
  it('strips paths, arguments and URLs from game descriptors', () => {
    const game = validateInvitationGame({title:' Game ',system:'nes',core:'fceumm',content_hash:'A'.repeat(64),core_hash:'B'.repeat(64),emulator_hash:'C'.repeat(64),path:'C:/private/rom.nes',args:'--host',url:'https://private.example'});
    expect(game.title).toBe('Game');
    expect(Object.keys(game)).toEqual(['title','system','core','content_hash','core_hash','emulator_hash']);
    expect(game.content_hash).toBe('a'.repeat(64));
  });
  it('rejects malformed identifiers and missing game fingerprints', () => {
    expect(()=>validateUuid('not-an-id')).toThrow('Identificador');
    expect(()=>validateInvitationGame({title:'Game',system:'nes',core:'fceumm'})).toThrow('Identificação');
    expect(()=>validateInvitationGame(null)).toThrow('Jogo');
  });
  it('projects catalog identities and existing-host references without exposing connection credentials',()=>{
    const game=validateInvitationGame({title:'Test',system:'snes',core:'snes9x',content_hash:'a'.repeat(64),core_hash:'b'.repeat(64),emulator_hash:'c'.repeat(64),asset_id:'D'.repeat(64),hosted_session_id:'00000000-0000-4000-8000-000000000001',password:'secret',connection:{host:'localhost'}});
    expect(game.asset_id).toBe('d'.repeat(64));expect(game.hosted_session_id).toBe('00000000-0000-4000-8000-000000000001');expect(game).not.toHaveProperty('password');expect(game).not.toHaveProperty('connection');
  });
});
