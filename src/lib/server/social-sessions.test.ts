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
});
